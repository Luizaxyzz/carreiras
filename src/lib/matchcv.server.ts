import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ANALYSIS_SYSTEM,
  OPTIMIZE_SYSTEM,
  callAI,
  computeAtsScore,
  normalizeAnalysis,
} from "./ai.server";
import type { AnalysisResult, InterviewPrep, LinkedinSuggestions, StructuredResume } from "./matchcv-types";

type Ctx = { supabase: SupabaseClient<any, any, any>; userId: string };

async function loadAnalysis(ctx: Ctx, analysisId: string) {
  const { data, error } = await ctx.supabase
    .from("analyses")
    .select("id, result, job_id, resume_id, jobs(title, company, description)")
    .eq("id", analysisId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Análise não encontrada.");
  const result = data.result as AnalysisResult;
  const job = Array.isArray(data.jobs) ? data.jobs[0] : data.jobs;
  return { row: data, result, jobDescription: (job?.description as string) ?? "" };
}

export async function runAnalysis(
  ctx: Ctx,
  input: { resumeText: string; resumeId?: string | undefined; jobDescription: string; jobUrl?: string | undefined },
) {
  const raw = await callAI(
    ANALYSIS_SYSTEM,
    `CURRÍCULO DO CANDIDATO:\n"""${input.resumeText.slice(0, 24000)}"""\n\nDESCRIÇÃO DA VAGA:\n"""${input.jobDescription.slice(0, 24000)}"""`,
  );
  const analysis = normalizeAnalysis(raw);

  let resumeId = input.resumeId ?? null;
  if (!resumeId) {
    const { data: resumeRow } = await ctx.supabase
      .from("resumes")
      .insert({
        user_id: ctx.userId,
        title: analysis.resume?.personal_info?.full_name
          ? `Currículo de ${analysis.resume.personal_info.full_name}`
          : "Meu currículo",
        raw_text: input.resumeText,
        structured: analysis.resume as unknown as Record<string, unknown>,
      })
      .select("id")
      .single();
    resumeId = resumeRow?.id ?? null;
  } else {
    await ctx.supabase
      .from("resumes")
      .update({ structured: analysis.resume as unknown as Record<string, unknown> })
      .eq("id", resumeId);
  }

  const { data: jobRow, error: jobError } = await ctx.supabase
    .from("jobs")
    .insert({
      user_id: ctx.userId,
      title: analysis.job?.job_title ?? "Vaga",
      company: analysis.job?.company ?? null,
      source_url: input.jobUrl ?? null,
      description: input.jobDescription,
      structured: analysis.job as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();
  if (jobError) throw new Error(jobError.message);

  const { data: analysisRow, error: analysisError } = await ctx.supabase
    .from("analyses")
    .insert({
      user_id: ctx.userId,
      resume_id: resumeId,
      job_id: jobRow.id,
      compatibility_score: analysis.scores.compatibility,
      ats_score: analysis.scores.ats,
      result: analysis as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();
  if (analysisError) throw new Error(analysisError.message);

  await ctx.supabase.from("applications").insert({
    user_id: ctx.userId,
    analysis_id: analysisRow.id,
    company: analysis.job?.company ?? null,
    role: analysis.job?.job_title ?? null,
    compatibility_score: analysis.scores.compatibility,
    ats_score: analysis.scores.ats,
  });

  return { analysisId: analysisRow.id as string, analysis };
}

export async function runOptimization(ctx: Ctx, analysisId: string) {
  const { result, jobDescription } = await loadAnalysis(ctx, analysisId);

  const raw = await callAI(
    OPTIMIZE_SYSTEM,
    `CURRÍCULO ESTRUTURADO ATUAL (JSON):\n${JSON.stringify(result.resume)}\n\nDESCRIÇÃO DA VAGA:\n"""${jobDescription.slice(0, 20000)}"""\n\nREQUISITOS AUSENTES (não invente nada sobre eles):\n${result.requirements
      ?.filter((r) => r.status !== "atendido")
      .map((r) => r.requirement)
      .join(", ")}`,
  );

  const optimized = raw["resume"] as StructuredResume;
  const rawAfter = (raw["after_scores"] ?? {}) as Record<string, unknown>;
  const after = {
    compatibility: Math.min(100, Math.max(result.scores.compatibility, Number(rawAfter["compatibility"]) || 0)),
    ats: Math.min(100, Math.max(result.scores.ats, computeAtsScore(rawAfter))),
  };

  const { data: row, error } = await ctx.supabase
    .from("generated_resumes")
    .insert({
      user_id: ctx.userId,
      analysis_id: analysisId,
      template: "minimal",
      content: optimized as unknown as Record<string, unknown>,
      before_scores: { compatibility: result.scores.compatibility, ats: result.scores.ats },
      after_scores: after,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  return {
    generatedResumeId: row.id as string,
    resume: optimized,
    before: { compatibility: result.scores.compatibility, ats: result.scores.ats },
    after,
    changes: (raw["changes"] as string[]) ?? [],
  };
}

async function saveGeneration(ctx: Ctx, analysisId: string, kind: string, content: unknown) {
  await ctx.supabase.from("ai_generations").insert({
    user_id: ctx.userId,
    analysis_id: analysisId,
    kind,
    content: content as Record<string, unknown>,
  });
}

export async function runCoverLetter(ctx: Ctx, analysisId: string) {
  const { result, jobDescription } = await loadAnalysis(ctx, analysisId);
  const raw = await callAI(
    `Você escreve cartas de apresentação em português do Brasil, objetivas (250-350 palavras), com tom profissional e humano. Use apenas experiências reais do currículo. Formato JSON: {"letter": "texto completo com quebras de linha"}`,
    `CURRÍCULO:\n${JSON.stringify(result.resume)}\n\nVAGA:\n"""${jobDescription.slice(0, 12000)}"""`,
  );
  const letter = String(raw["letter"] ?? "");
  await saveGeneration(ctx, analysisId, "cover_letter", { letter });
  return { letter };
}

export async function runInterviewPrep(ctx: Ctx, analysisId: string) {
  const { result, jobDescription } = await loadAnalysis(ctx, analysisId);
  const raw = await callAI(
    `Você prepara candidatos para entrevistas em português do Brasil. Formato JSON: {"technical_questions":[{"question":"","suggested_answer":""}],"behavioral_questions":[{"question":"","suggested_answer":""}],"resume_focus_points":[""],"topics_to_study":[""]}. Gere 6 perguntas técnicas e 5 comportamentais. As respostas sugeridas devem usar apenas a experiência real do candidato.`,
    `CURRÍCULO:\n${JSON.stringify(result.resume)}\n\nVAGA:\n"""${jobDescription.slice(0, 12000)}"""`,
  );
  const prep = raw as unknown as InterviewPrep;
  await saveGeneration(ctx, analysisId, "interview", prep);
  return prep;
}

export async function runLinkedin(ctx: Ctx, analysisId: string) {
  const { result, jobDescription } = await loadAnalysis(ctx, analysisId);
  const raw = await callAI(
    `Você otimiza perfis do LinkedIn em português do Brasil. Formato JSON: {"headline":["","",""],"about":"","experience_tips":[""],"skills":[""]}. Baseie-se somente no perfil real do candidato.`,
    `CURRÍCULO:\n${JSON.stringify(result.resume)}\n\nÁREA DE INTERESSE (vaga alvo):\n"""${jobDescription.slice(0, 8000)}"""`,
  );
  const suggestions = raw as unknown as LinkedinSuggestions;
  await saveGeneration(ctx, analysisId, "linkedin", suggestions);
  return suggestions;
}
