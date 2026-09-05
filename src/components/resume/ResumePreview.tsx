import type { StructuredResume } from "@/lib/matchcv-types";
import { cn } from "@/lib/utils";

type TemplateId =
  | "minimal"
  | "modern"
  | "classic"
  | "professional"
  | "tech"
  | "executive"
  | "clean"
  | "compact";

type Style = {
  page: string;
  header: string;
  name: string;
  headline: string;
  sectionTitle: string;
  body: string;
  accentBar?: boolean;
  twoColumnSkills?: boolean;
};

const STYLES: Record<TemplateId, Style> = {
  minimal: {
    page: "p-10 text-[11px] leading-relaxed",
    header: "border-b border-neutral-300 pb-4",
    name: "text-2xl font-semibold tracking-tight",
    headline: "text-[11px] uppercase tracking-[0.2em] text-neutral-500",
    sectionTitle: "text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500",
    body: "text-neutral-800",
  },
  modern: {
    page: "p-10 text-[11px] leading-relaxed",
    header: "rounded-lg bg-neutral-900 px-6 py-5 text-white",
    name: "text-2xl font-semibold tracking-tight",
    headline: "text-[11px] text-neutral-200",
    sectionTitle: "text-[11px] font-bold uppercase tracking-wider text-neutral-900",
    body: "text-neutral-800",
    accentBar: true,
  },
  classic: {
    page: "p-12 text-[11px] leading-relaxed font-serif",
    header: "text-center border-b-2 border-neutral-800 pb-4",
    name: "text-2xl font-bold uppercase tracking-[0.12em]",
    headline: "text-[11px] italic text-neutral-600",
    sectionTitle: "text-[11px] font-bold uppercase tracking-[0.14em] border-b border-neutral-300 pb-1",
    body: "text-neutral-900",
  },
  professional: {
    page: "p-10 text-[11px] leading-relaxed",
    header: "pb-4 border-b-4 border-neutral-800",
    name: "text-[26px] font-semibold",
    headline: "text-[11px] font-medium text-neutral-600",
    sectionTitle: "text-[11px] font-bold uppercase tracking-wide text-neutral-700",
    body: "text-neutral-800",
  },
  tech: {
    page: "p-9 text-[11px] leading-relaxed",
    header: "pb-4",
    name: "text-2xl font-semibold tracking-tight",
    headline: "text-[11px] font-mono text-neutral-600",
    sectionTitle: "text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500",
    body: "text-neutral-800",
    twoColumnSkills: true,
  },
  executive: {
    page: "p-12 text-[11.5px] leading-relaxed",
    header: "pb-5 border-b border-neutral-400",
    name: "text-[28px] font-light tracking-[0.04em] uppercase",
    headline: "text-[11px] tracking-[0.14em] uppercase text-neutral-500",
    sectionTitle: "text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-800",
    body: "text-neutral-800",
  },
  clean: {
    page: "p-10 text-[11px] leading-relaxed",
    header: "pb-4",
    name: "text-2xl font-semibold",
    headline: "text-[11px] text-neutral-500",
    sectionTitle: "text-[11px] font-semibold text-neutral-700",
    body: "text-neutral-800",
  },
  compact: {
    page: "p-8 text-[10px] leading-snug",
    header: "pb-3 border-b border-neutral-300",
    name: "text-xl font-semibold",
    headline: "text-[10px] text-neutral-500",
    sectionTitle: "text-[9.5px] font-bold uppercase tracking-wider text-neutral-600",
    body: "text-neutral-800",
    twoColumnSkills: true,
  },
};

function Section({ title, style, children }: { title: string; style: Style; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className={style.sectionTitle}>{title}</h2>
      <div className="mt-2 space-y-2.5">{children}</div>
    </section>
  );
}

export function ResumePreview({
  resume,
  template = "minimal",
  className,
}: {
  resume: StructuredResume;
  template?: string;
  className?: string;
}) {
  const style = STYLES[(template as TemplateId) in STYLES ? (template as TemplateId) : "minimal"];
  const info = resume?.personal_info ?? { full_name: "" };
  const contactLine = [info.email, info.phone, info.location].filter(Boolean).join("  •  ");

  return (
    <article
      className={cn(
        "print-page mx-auto w-full max-w-[820px] bg-white text-neutral-900",
        style.page,
        className,
      )}
    >
      <header className={style.header}>
        <h1 className={style.name}>{info.full_name || "Seu nome"}</h1>
        {info.headline ? <p className={cn("mt-1", style.headline)}>{info.headline}</p> : null}
        {contactLine ? <p className="mt-2 text-[10.5px] text-neutral-600">{contactLine}</p> : null}
        {resume?.links?.length ? (
          <p className="mt-1 text-[10.5px] text-neutral-600">
            {resume.links.map((link, i) => (
              <span key={link.url + i}>
                {i > 0 ? "  •  " : ""}
                <a href={link.url} className="underline decoration-neutral-300">
                  {link.label || link.url}
                </a>
              </span>
            ))}
          </p>
        ) : null}
      </header>

      {style.accentBar ? <div className="mt-4 h-1 w-16 rounded bg-neutral-900" /> : null}

      {resume?.professional_summary ? (
        <Section title="Resumo profissional" style={style}>
          <p className={style.body}>{resume.professional_summary}</p>
        </Section>
      ) : null}

      {resume?.experience?.length ? (
        <Section title="Experiência profissional" style={style}>
          {resume.experience.map((exp, i) => (
            <div key={i}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-semibold">
                  {exp.role}
                  {exp.company ? ` — ${exp.company}` : ""}
                </p>
                <p className="text-[10px] text-neutral-500">
                  {[exp.start_date, exp.end_date].filter(Boolean).join(" – ")}
                  {exp.location ? ` · ${exp.location}` : ""}
                </p>
              </div>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                {exp.bullets?.map((b, j) => (
                  <li key={j} className={style.body}>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      ) : null}

      {resume?.projects?.length ? (
        <Section title="Projetos" style={style}>
          {resume.projects.map((p, i) => (
            <div key={i}>
              <p className="font-semibold">{p.name}</p>
              <p className={style.body}>{p.description}</p>
              {p.tech?.length ? <p className="text-[10px] text-neutral-500">{p.tech.join(" · ")}</p> : null}
            </div>
          ))}
        </Section>
      ) : null}

      {resume?.education?.length ? (
        <Section title="Formação" style={style}>
          {resume.education.map((ed, i) => (
            <div key={i} className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p>
                <span className="font-semibold">{ed.degree}</span>
                {ed.institution ? ` — ${ed.institution}` : ""}
                {ed.details ? <span className="text-neutral-600"> · {ed.details}</span> : null}
              </p>
              <p className="text-[10px] text-neutral-500">{[ed.start_date, ed.end_date].filter(Boolean).join(" – ")}</p>
            </div>
          ))}
        </Section>
      ) : null}

      {resume?.skills?.length ? (
        <Section title="Competências" style={style}>
          <p className={cn(style.body, style.twoColumnSkills && "columns-2 gap-6")}>{resume.skills.join(" • ")}</p>
        </Section>
      ) : null}

      {resume?.certifications?.length ? (
        <Section title="Certificações e cursos" style={style}>
          <ul className="list-disc space-y-0.5 pl-4">
            {resume.certifications.map((c, i) => (
              <li key={i} className={style.body}>
                {c.name}
                {c.issuer ? ` — ${c.issuer}` : ""}
                {c.year ? ` (${c.year})` : ""}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {resume?.languages?.length ? (
        <Section title="Idiomas" style={style}>
          <p className={style.body}>
            {resume.languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join(" • ")}
          </p>
        </Section>
      ) : null}
    </article>
  );
}
