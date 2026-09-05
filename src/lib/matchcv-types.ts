export type ResumeLink = { label: string; url: string };

export type ResumeExperience = {
  role: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  bullets: string[];
};

export type ResumeEducation = {
  degree: string;
  institution: string;
  start_date?: string;
  end_date?: string;
  details?: string;
};

export type ResumeProject = { name: string; description: string; tech?: string[] };
export type ResumeCertification = { name: string; issuer?: string; year?: string };
export type ResumeLanguage = { name: string; level?: string };

export type StructuredResume = {
  personal_info: {
    full_name: string;
    headline?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  professional_summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  certifications: ResumeCertification[];
  projects: ResumeProject[];
  languages: ResumeLanguage[];
  links: ResumeLink[];
};

export type StructuredJob = {
  job_title: string;
  company: string;
  seniority: string;
  location?: string;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  education_requirements: string[];
  experience_requirements: string[];
  languages: string[];
  keywords: string[];
  soft_skills: string[];
};

export type RequirementStatus = "atendido" | "parcial" | "ausente";

export type RequirementCheck = {
  requirement: string;
  status: RequirementStatus;
  evidence: string;
  type: "obrigatorio" | "diferencial";
};

export type AnalysisScores = {
  compatibility: number;
  ats: number;
  experience: number;
  hard_skills: number;
  education: number;
  keywords: number;
  differentials: number;
  seniority: number;
  languages: number;
  formatting: number;
};

export type AnalysisResult = {
  scores: AnalysisScores;
  requirements: RequirementCheck[];
  keywords_found: string[];
  keywords_missing: string[];
  strengths: string[];
  attention_points: string[];
  recommendations: string[];
  job: StructuredJob;
  resume: StructuredResume;
};

export type InterviewPrep = {
  technical_questions: { question: string; suggested_answer: string }[];
  behavioral_questions: { question: string; suggested_answer: string }[];
  resume_focus_points: string[];
  topics_to_study: string[];
};

export type LinkedinSuggestions = {
  headline: string[];
  about: string;
  experience_tips: string[];
  skills: string[];
};

export const SCORE_LABELS: { min: number; label: string }[] = [
  { min: 90, label: "Excelente compatibilidade" },
  { min: 80, label: "Alta compatibilidade" },
  { min: 60, label: "Boa compatibilidade" },
  { min: 40, label: "Compatibilidade moderada" },
  { min: 0, label: "Baixa compatibilidade" },
];

export function scoreLabel(score: number) {
  return SCORE_LABELS.find((s) => score >= s.min)?.label ?? "Baixa compatibilidade";
}

export const APPLICATION_STATUSES = [
  { value: "vou_me_candidatar", label: "Vou me candidatar" },
  { value: "candidatura_enviada", label: "Candidatura enviada" },
  { value: "entrevista", label: "Entrevista" },
  { value: "teste_tecnico", label: "Teste técnico" },
  { value: "entrevista_final", label: "Entrevista final" },
  { value: "proposta", label: "Proposta" },
  { value: "nao_aprovado", label: "Não aprovado" },
] as const;

export const TEMPLATES = [
  { id: "minimal", name: "Minimal", category: "tecnologia", description: "Tipografia limpa, foco no conteúdo." },
  { id: "modern", name: "Modern", category: "tecnologia", description: "Cabeçalho destacado e seções arejadas." },
  { id: "classic", name: "Classic", category: "corporativo", description: "Estrutura tradicional e sóbria." },
  { id: "professional", name: "Professional", category: "corporativo", description: "Equilíbrio entre densidade e clareza." },
  { id: "tech", name: "Tech", category: "tecnologia", description: "Skills em destaque para vagas técnicas." },
  { id: "executive", name: "Executive", category: "executivo", description: "Presença sênior e resultados no topo." },
  { id: "clean", name: "Clean", category: "primeiro_emprego", description: "Simples, ideal para início de carreira." },
  { id: "compact", name: "Compact", category: "primeiro_emprego", description: "Cabe tudo em uma página." },
] as const;

export const TEMPLATE_FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "tecnologia", label: "Tecnologia" },
  { value: "corporativo", label: "Corporativo" },
  { value: "executivo", label: "Executivo" },
  { value: "primeiro_emprego", label: "Primeiro emprego" },
];
