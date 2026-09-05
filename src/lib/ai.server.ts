import type { AnalysisResult, StructuredResume } from "./matchcv-types";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

const TRUTH_RULE = `REGRA ABSOLUTA: nunca invente empresas, experiências, projetos, cursos, certificações, tecnologias, formações, idiomas, resultados, números ou competências que não tenham sido informados pelo candidato. Você pode reorganizar, reescrever, valorizar competências transferíveis e adaptar a linguagem ao contexto profissional, mas não pode transformar interesse, contato superficial ou vontade de aprender em experiência comprovada. Se algo pedido pela vaga não existe no perfil, não afirme que existe.`;

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

const RESUME_SCHEMA = `{"personal_info":{"full_name":"","headline":"","email":"","phone":"","location":""},"objective":"","professional_summary":"","experience":[{"role":"","company":"","location":"","start_date":"","end_date":"","bullets":[""]}],"education":[{"degree":"","institution":"","start_date":"","end_date":"","details":""}],"skills":[""],"differentiators":[""],"certifications":[{"name":"","issuer":"","year":""}],"projects":[{"name":"","description":"","tech":[""]}],"languages":[{"name":"","level":""}],"links":[{"label":"","url":""}]}`;

export const ANALYSIS_SYSTEM = `Você é um especialista em recrutamento técnico e em sistemas ATS brasileiros. Compare um currículo com uma descrição de vaga e produza uma análise objetiva em português do Brasil.
Formato JSON obrigatório:
{
 "resume": ${RESUME_SCHEMA},
 "job": {"job_title":"","company":"","seniority":"","location":"","required_skills":[""],"preferred_skills":[""],"responsibilities":[""],"education_requirements":[""],"experience_requirements":[""],"languages":[""],"keywords":[""],"soft_skills":[""]},
 "scores": {"compatibility":0,"experience":0,"hard_skills":0,"education":0,"keywords":0,"differentials":0,"seniority":0,"languages":0,"formatting":0,"requirements":0},
 "requirements": [{"requirement":"","status":"atendido|parcial|ausente","evidence":"","type":"obrigatorio|diferencial"}],
 "keywords_found": [""], "keywords_missing": [""], "strengths": [""], "attention_points": [""], "recommendations": [""]
}
Todos os scores são 0-100. Seja honesto: se o requisito não aparece no currículo, marque "ausente".`;

export const OPTIMIZE_SYSTEM = `Você é um especialista sênior em recrutamento, copywriting profissional e otimização de currículos para ATS. Sua missão é criar a versão MAIS FORTE E PERSUASIVA POSSÍVEL do currículo para a vaga alvo, inclusive quando a pessoa está migrando de área ou tem pouca/nenhuma experiência direta no cargo.

O currículo final deve conter, sempre que houver informação suficiente: OBJETIVO, RESUMO PROFISSIONAL, EXPERIÊNCIA PROFISSIONAL, COMPETÊNCIAS TÉCNICAS, HABILIDADES E DIFERENCIAIS, FORMAÇÃO, CURSOS/CERTIFICAÇÕES, PROJETOS e IDIOMAS.

Estratégia obrigatória:
- crie um objetivo curto e específico para a vaga;
- escreva um resumo profissional de alto impacto, alinhado ao cargo e às palavras-chave reais do perfil;
- reescreva experiências com verbos de ação, contexto, escopo, responsabilidades e impacto verificável, sem inventar métricas;
- se a experiência direta for baixa, extraia competências transferíveis de estágio, trabalho, faculdade, projetos, voluntariado e cursos;
- monte COMPETÊNCIAS TÉCNICAS com ferramentas, tecnologias, métodos e conhecimentos efetivamente informados pelo candidato;
- monte HABILIDADES E DIFERENCIAIS com pontos fortes comprováveis, como comunicação, organização, liderança, análise, autonomia, trabalho em equipe, idiomas, prêmios, projetos e exposição internacional quando isso estiver no perfil;
- incorpore palavras-chave da vaga apenas quando forem verdadeiras ou claramente sustentadas pelo histórico do candidato;
- elimine conteúdo genérico, redundante e fraco;
- priorize as seções que mais aumentam chance de entrevista;
- para transição de carreira, conecte a trajetória anterior à área alvo e deixe clara a capacidade de aprendizado e transferência de competências.

Nunca prometa contratação ou entrevista. Não invente credenciais para aumentar compatibilidade.
Formato JSON obrigatório:
{"resume": ${RESUME_SCHEMA}, "after_scores": {"compatibility":0,"ats":0,"experience":0,"hard_skills":0,"education":0,"keywords":0,"differentials":0,"seniority":0,"languages":0,"formatting":0}, "changes": [""]}`;

export const BUILD_RESUME_SYSTEM = `Você é um especialista sênior em currículos ATS e recrutamento. Transforme todas as informações fornecidas pelo candidato — incluindo currículo antigo, dados novos e instruções de mudança — em um currículo profissional, convincente e fácil de escanear por ATS, sem depender de uma vaga específica.

O currículo final deve conter, sempre que houver informação suficiente: OBJETIVO, RESUMO PROFISSIONAL, EXPERIÊNCIA PROFISSIONAL, COMPETÊNCIAS TÉCNICAS, HABILIDADES E DIFERENCIAIS, FORMAÇÃO ACADÊMICA, CURSOS E CERTIFICAÇÕES, PROJETOS e IDIOMAS.

Regras:
- use o currículo antigo como fonte de fatos e aproveite o que ainda for relevante;
- respeite as instruções de mudança do candidato, como mudar foco, retirar itens, destacar cursos ou reposicionar a carreira;
- escreva objetivo e resumo fortes, específicos e profissionais;
- transforme experiências em bullets com verbos de ação, escopo, responsabilidades e impacto real;
- se o candidato estiver iniciando carreira, valorize formação, projetos, cursos, competências transferíveis e capacidade de aprendizado;
- se houver lacunas, não preencha com fatos inventados; use apresentação estratégica do que existe;
- remova repetições, linguagem informal e informações fracas;
- use termos claros e reconhecíveis por ATS;
- não invente informação para preencher campos vazios.

Formato JSON obrigatório:
{"resume":${RESUME_SCHEMA}}`;

export function resumeToText(resume: StructuredResume | null | undefined, fallback: string) {
  if (!resume) return fallback;
  return JSON.stringify(resume);
}

export function normalizeAnalysis(raw: Record<string, unknown>): AnalysisResult {
  const scores = (raw["scores"] ?? {}) as Record<string, unknown>;
  const ats = computeAtsScore(scores);
  return {
    scores: {
      compatibility: clamp(scores["compatibility"]), ats,
      experience: clamp(scores["experience"]), hard_skills: clamp(scores["hard_skills"]),
      education: clamp(scores["education"]), keywords: clamp(scores["keywords"]),
      differentials: clamp(scores["differentials"]), seniority: clamp(scores["seniority"]),
      languages: clamp(scores["languages"]), formatting: clamp(scores["formatting"]),
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
