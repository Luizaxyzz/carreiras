import type { AnalysisResult, StructuredResume } from "./matchcv-types";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.5-flash";

const TRUTH_RULE = `REGRA ABSOLUTA: nunca invente empresas, experiências, projetos, cursos, certificações, tecnologias, formações, idiomas, resultados, números ou competências que não estejam no currículo do candidato. Você apenas reorganiza, reescreve e destaca o que é real. Se algo pedido pela vaga não existe no currículo, aponte como ausente.`;

export async function callAI(system: string, user: string): Promise<Record<string, unknown>> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("IA não configurada.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: `${system}\n\n${TRUTH_RULE}\nResponda SEMPRE apenas com JSON válido, sem markdown.` },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (res.status === 429) throw new Error("Muitas solicitações. Tente novamente em instantes.");
  if (res.status === 402) throw new Error("Créditos de IA esgotados no workspace.");
  if (!res.ok) throw new Error(`Falha na IA (${res.status}): ${await res.text()}`);

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as Record<string, unknown>;
    throw new Error("A IA retornou um formato inesperado.");
  }
}

const clamp = (n: unknown) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

/** Peso interno do ATS Score (normalizado para 0-100). */
export function computeAtsScore(s: Record<string, unknown>) {
  const w = [
    [clamp(s["hard_skills"]), 0.3],
    [clamp(s["experience"]), 0.2],
    [clamp(s["requirements"] ?? s["hard_skills"]), 0.15],
    [clamp(s["education"]), 0.1],
    [clamp(s["seniority"]), 0.1],
    [clamp(s["languages"]), 0.05],
    [clamp(s["formatting"]), 0.05],
    [clamp(s["differentials"]), 0.05],
  ] as [number, number][];
  return clamp(w.reduce((acc, [v, weight]) => acc + v * weight, 0));
}

export const ANALYSIS_SYSTEM = `Você é um especialista em recrutamento técnico e em sistemas ATS brasileiros. Compare um currículo com uma descrição de vaga e produza uma análise objetiva em português do Brasil.
Formato JSON obrigatório:
{
 "resume": {"personal_info":{"full_name":"","headline":"","email":"","phone":"","location":""},"professional_summary":"","experience":[{"role":"","company":"","location":"","start_date":"","end_date":"","bullets":[""]}],"education":[{"degree":"","institution":"","start_date":"","end_date":"","details":""}],"skills":[""],"certifications":[{"name":"","issuer":"","year":""}],"projects":[{"name":"","description":"","tech":[""]}],"languages":[{"name":"","level":""}],"links":[{"label":"","url":""}]},
 "job": {"job_title":"","company":"","seniority":"","location":"","required_skills":[""],"preferred_skills":[""],"responsibilities":[""],"education_requirements":[""],"experience_requirements":[""],"languages":[""],"keywords":[""],"soft_skills":[""]},
 "scores": {"compatibility":0,"experience":0,"hard_skills":0,"education":0,"keywords":0,"differentials":0,"seniority":0,"languages":0,"formatting":0,"requirements":0},
 "requirements": [{"requirement":"","status":"atendido|parcial|ausente","evidence":"","type":"obrigatorio|diferencial"}],
 "keywords_found": [""],
 "keywords_missing": [""],
 "strengths": [""],
 "attention_points": [""],
 "recommendations": [""]
}
Todos os scores são 0-100. Seja honesto: se o requisito não aparece no currículo, marque "ausente".`;

export const OPTIMIZE_SYSTEM = `Você é um especialista em otimização de currículos para ATS. Reescreva o currículo do candidato para maximizar a compatibilidade com a vaga, usando SOMENTE informações verdadeiras já presentes no currículo original.
Você pode: reorganizar seções, reescrever o resumo profissional, melhorar bullets (verbos de ação, clareza, contexto), priorizar experiências e habilidades relevantes, ajustar a ordem das skills, usar a terminologia da vaga quando descrever algo que o candidato realmente fez, remover conteúdo irrelevante.
Você NÃO pode: adicionar tecnologias, empresas, cursos, números ou resultados inexistentes.
Formato JSON obrigatório:
{"resume": {mesmo schema estruturado do currículo}, "after_scores": {"compatibility":0,"ats":0,"experience":0,"hard_skills":0,"education":0,"keywords":0,"differentials":0,"seniority":0,"languages":0,"formatting":0}, "changes": [""]}`;

export function resumeToText(resume: StructuredResume | null | undefined, fallback: string) {
  if (!resume) return fallback;
  return JSON.stringify(resume);
}

export function normalizeAnalysis(raw: Record<string, unknown>): AnalysisResult {
  const scores = (raw["scores"] ?? {}) as Record<string, unknown>;
  const ats = computeAtsScore(scores);
  return {
    scores: {
      compatibility: clamp(scores["compatibility"]),
      ats,
      experience: clamp(scores["experience"]),
      hard_skills: clamp(scores["hard_skills"]),
      education: clamp(scores["education"]),
      keywords: clamp(scores["keywords"]),
      differentials: clamp(scores["differentials"]),
      seniority: clamp(scores["seniority"]),
      languages: clamp(scores["languages"]),
      formatting: clamp(scores["formatting"]),
    },
    requirements: (raw["requirements"] as AnalysisResult["requirements"]) ?? [],
    keywords_found: (raw["keywords_found"] as string[]) ?? [],
    keywords_missing: (raw["keywords_missing"] as string[]) ?? [],
    strengths: (raw["strengths"] as string[]) ?? [],
    attention_points: (raw["attention_points"] as string[]) ?? [],
    recommendations: (raw["recommendations"] as string[]) ?? [],
    job: raw["job"] as AnalysisResult["job"],
    resume: raw["resume"] as AnalysisResult["resume"],
  };
}
