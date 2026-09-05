import type { StructuredResume } from "./matchcv-types";

export const SAMPLE_RESUME: StructuredResume = {
  personal_info: {
    full_name: "Maria Silva",
    headline: "Desenvolvedora de Software",
    email: "maria.silva@email.com",
    phone: "(11) 90000-0000",
    location: "São Paulo, SP",
  },
  professional_summary:
    "Desenvolvedora com experiência em aplicações web, integração de APIs REST e automação de rotinas com Python. Atuação em equipe ágil com foco em qualidade de código e entregas contínuas.",
  experience: [
    {
      role: "Desenvolvedora de Software",
      company: "Empresa de Tecnologia",
      location: "São Paulo, SP",
      start_date: "2022",
      end_date: "Atual",
      bullets: [
        "Desenvolvimento e manutenção de APIs REST utilizadas por times internos.",
        "Automação de rotinas de dados com Python, reduzindo tarefas manuais do time.",
        "Participação em code reviews e versionamento com Git.",
      ],
    },
    {
      role: "Estagiária de Desenvolvimento",
      company: "Consultoria Digital",
      start_date: "2021",
      end_date: "2022",
      bullets: ["Apoio na construção de interfaces web com JavaScript, HTML e CSS."],
    },
  ],
  education: [
    { degree: "Análise e Desenvolvimento de Sistemas", institution: "Universidade", start_date: "2019", end_date: "2022" },
  ],
  skills: ["Python", "JavaScript", "Git", "APIs REST", "HTML", "CSS", "SQL", "Scrum"],
  certifications: [{ name: "Fundamentos de Cloud", issuer: "Plataforma online", year: "2023" }],
  projects: [
    { name: "Dashboard de indicadores", description: "Painel web para acompanhamento de métricas de time.", tech: ["Python", "JavaScript"] },
  ],
  languages: [
    { name: "Português", level: "Nativo" },
    { name: "Inglês", level: "Intermediário" },
  ],
  links: [
    { label: "linkedin.com/in/mariasilva", url: "https://linkedin.com" },
    { label: "github.com/mariasilva", url: "https://github.com" },
  ],
};
