import type { CSSProperties, ReactNode } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import type { StructuredResume } from "@/lib/matchcv-types";
import { cn } from "@/lib/utils";

export type ResumeFont = "sans" | "serif" | "humanist" | "mono";
export type ResumeSpacing = "compact" | "balanced" | "airy";
export type ResumeAppearance = { color: string; font: ResumeFont; fontScale: number; spacing: ResumeSpacing; decorations: boolean };

export const DEFAULT_RESUME_APPEARANCE: ResumeAppearance = { color: "#244a73", font: "sans", fontScale: 1, spacing: "balanced", decorations: true };

const FONT_STACKS: Record<ResumeFont, string> = {
  sans: 'Arial, Helvetica, sans-serif', serif: 'Georgia, "Times New Roman", serif', humanist: 'Trebuchet MS, Arial, sans-serif', mono: '"Courier New", monospace',
};

type PreviewProps = { resume: StructuredResume; template?: string; appearance?: ResumeAppearance; className?: string };

function Contact({ resume, icons = false }: { resume: StructuredResume; icons?: boolean }) {
  const info = resume.personal_info;
  const items = [{ text: info.phone, Icon: Phone }, { text: info.email, Icon: Mail }, { text: info.location, Icon: MapPin }].filter((item) => item.text);
  return <div className={cn("resume-contact", icons && "resume-contact-icons")}>{items.map(({ text, Icon }) => <span key={text}>{icons ? <Icon aria-hidden="true" /> : null}{text}</span>)}{resume.links?.map((link) => <span key={link.url}>{link.label || link.url}</span>)}</div>;
}

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return <section className={cn("resume-section", className)}><h2>{title}</h2><div className="resume-section-content">{children}</div></section>;
}

function Objective({ resume }: { resume: StructuredResume }) {
  const text = resume.objective || resume.personal_info.headline;
  return text ? <Section title="Objetivo"><p className="resume-objective">{text}</p></Section> : null;
}

function Summary({ resume }: { resume: StructuredResume }) {
  return resume.professional_summary ? <Section title="Resumo profissional"><p>{resume.professional_summary}</p></Section> : null;
}

function Experience({ resume }: { resume: StructuredResume }) {
  return resume.experience?.length ? <Section title="Experiência profissional">{resume.experience.map((exp, index) => <div className="resume-entry" key={`${exp.company}-${index}`}><div className="resume-entry-head"><strong>{exp.role}</strong><span>{[exp.start_date, exp.end_date].filter(Boolean).join(" – ")}</span></div><div className="resume-entry-sub"><strong>{exp.company}</strong>{exp.location ? <span> · {exp.location}</span> : null}</div>{exp.bullets?.length ? <ul>{exp.bullets.map((bullet, itemIndex) => <li key={itemIndex}>{bullet}</li>)}</ul> : null}</div>)}</Section> : null;
}

function Education({ resume }: { resume: StructuredResume }) {
  return resume.education?.length ? <Section title="Formação acadêmica">{resume.education.map((education, index) => <div className="resume-entry" key={`${education.institution}-${index}`}><div className="resume-entry-head"><strong>{education.degree}</strong><span>{[education.start_date, education.end_date].filter(Boolean).join(" – ")}</span></div><div>{education.institution}{education.details ? ` · ${education.details}` : ""}</div></div>)}</Section> : null;
}

function Skills({ resume }: { resume: StructuredResume }) {
  return resume.skills?.length ? <Section title="Competências técnicas"><ul className="resume-skill-list">{resume.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul></Section> : null;
}

function Differentiators({ resume }: { resume: StructuredResume }) {
  return resume.differentiators?.length ? <Section title="Habilidades e diferenciais"><ul>{resume.differentiators.map((item) => <li key={item}>{item}</li>)}</ul></Section> : null;
}

function Languages({ resume }: { resume: StructuredResume }) {
  return resume.languages?.length ? <Section title="Idiomas"><p>{resume.languages.map((language) => `${language.name}${language.level ? ` — ${language.level}` : ""}`).join(" · ")}</p></Section> : null;
}

function Extras({ resume }: { resume: StructuredResume }) {
  return <>{resume.projects?.length ? <Section title="Projetos">{resume.projects.map((project, index) => <div className="resume-entry" key={`${project.name}-${index}`}><strong>{project.name}</strong><p>{project.description}</p>{project.tech?.length ? <small>{project.tech.join(" · ")}</small> : null}</div>)}</Section> : null}{resume.certifications?.length ? <Section title="Cursos e certificações"><ul>{resume.certifications.map((item, index) => <li key={`${item.name}-${index}`}>{item.name}{item.issuer ? ` — ${item.issuer}` : ""}{item.year ? ` (${item.year})` : ""}</li>)}</ul></Section> : null}</>;
}

function StandardLayout({ resume }: { resume: StructuredResume }) { return <><header className="resume-header"><h1>{resume.personal_info.full_name || "Seu nome"}</h1>{resume.personal_info.headline ? <p className="resume-headline">{resume.personal_info.headline}</p> : null}<Contact resume={resume} /></header><main><Objective resume={resume} /><Summary resume={resume} /><Experience resume={resume} /><Skills resume={resume} /><Differentiators resume={resume} /><Education resume={resume} /><Extras resume={resume} /><Languages resume={resume} /></main></>; }
function CleanLayout({ resume }: { resume: StructuredResume }) { return <><header className="resume-header"><div><h1>{resume.personal_info.full_name || "Seu nome"}</h1><p className="resume-headline">{resume.personal_info.headline}</p></div><Contact resume={resume} icons /></header><main><Objective resume={resume} /><Summary resume={resume} /><Education resume={resume} /><Experience resume={resume} /><Skills resume={resume} /><Differentiators resume={resume} /><Languages resume={resume} /><Extras resume={resume} /></main></>; }
function CompactLayout({ resume }: { resume: StructuredResume }) { return <><header className="resume-header"><h1>{resume.personal_info.full_name || "Seu nome"}</h1><p className="resume-headline">{resume.personal_info.headline}</p><Contact resume={resume} /></header><Objective resume={resume} /><Summary resume={resume} /><div className="resume-columns"><div><Experience resume={resume} /><Extras resume={resume} /></div><div><Skills resume={resume} /><Differentiators resume={resume} /><Education resume={resume} /><Languages resume={resume} /></div></div></>; }
function ExecutiveLayout({ resume }: { resume: StructuredResume }) { return <div className="resume-executive-grid"><aside><Summary resume={resume} /><Contact resume={resume} icons /><Education resume={resume} /></aside><main><header className="resume-header"><h1>{resume.personal_info.full_name || "Seu nome"}</h1><p className="resume-headline">{resume.personal_info.headline}</p></header><Objective resume={resume} /><Experience resume={resume} /><Skills resume={resume} /><Differentiators resume={resume} /><Extras resume={resume} /><Languages resume={resume} /></main></div>; }
function ModernLayout({ resume }: { resume: StructuredResume }) { return <div className="resume-modern-grid"><aside><header className="resume-header"><h1>{resume.personal_info.full_name || "Seu nome"}</h1></header><Section title="Contato"><Contact resume={resume} icons /></Section><Skills resume={resume} /><Differentiators resume={resume} /><Languages resume={resume} /><Extras resume={resume} /></aside><main><Objective resume={resume} /><Summary resume={resume} /><Education resume={resume} /><Experience resume={resume} /></main></div>; }
function ProfessionalLayout({ resume }: { resume: StructuredResume }) { return <><header className="resume-header"><h1>{resume.personal_info.full_name || "Seu nome"}</h1><Contact resume={resume} icons /></header><main><Objective resume={resume} /><Summary resume={resume} /><Experience resume={resume} /><Skills resume={resume} /><Differentiators resume={resume} /><Education resume={resume} /><Languages resume={resume} /><Extras resume={resume} /></main></>; }
function TechLayout({ resume }: { resume: StructuredResume }) { return <><header className="resume-header"><div><h1>{resume.personal_info.full_name || "Seu nome"}</h1><p className="resume-headline">{resume.personal_info.headline}</p></div><Contact resume={resume} icons /><p className="resume-tech-summary">{resume.professional_summary}</p></header><Objective resume={resume} /><div className="resume-tech-pair"><Skills resume={resume} /><Differentiators resume={resume} /></div><Experience resume={resume} /><Education resume={resume} /><Extras resume={resume} /><Languages resume={resume} /></>; }

const LAYOUTS: Record<string, (props: { resume: StructuredResume }) => ReactNode> = { clean: CleanLayout, compact: CompactLayout, executive: ExecutiveLayout, modern: ModernLayout, professional: ProfessionalLayout, tech: TechLayout };

export function ResumePreview({ resume, template = "minimal", appearance = DEFAULT_RESUME_APPEARANCE, className }: PreviewProps) {
  const Layout = LAYOUTS[template] ?? StandardLayout;
  const style = { "--resume-accent": appearance.color, "--resume-font": FONT_STACKS[appearance.font], "--resume-scale": appearance.fontScale } as CSSProperties;
  return <article style={style} className={cn("print-page resume-document", `resume-template-${template}`, `resume-spacing-${appearance.spacing}`, !appearance.decorations && "resume-no-decoration", className)}><Layout resume={resume} /></article>;
}
