import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SectionHeading } from "@/components/landing/Sections";
import { TemplateCard } from "@/components/landing/TemplateCard";
import { TEMPLATES, TEMPLATE_FILTERS } from "@/lib/matchcv-types";
import { cn } from "@/lib/utils";

const TITLE = "Modelos de currículo ATS-friendly — MatchCV AI";
const DESCRIPTION =
  "Oito modelos de currículo profissionais e compatíveis com ATS: Minimal, Modern, Classic, Professional, Tech, Executive, Clean e Compact.";

export const Route = createFileRoute("/modelos")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const [filter, setFilter] = useState("todos");
  const [selected, setSelected] = useState<string | null>(null);
  const list = TEMPLATES.filter((t) => filter === "todos" || t.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading
          eyebrow="Modelos"
          title={
            <>
              Escolha como seu currículo <span className="text-gradient">vai ficar.</span>
            </>
          }
          description="Todos os modelos usam texto real e selecionável, fontes comuns e estrutura limpa para leitura por ATS."
        />

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {TEMPLATE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                filter === f.value
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((t) => (
            <TemplateCard
              key={t.id}
              id={t.id}
              name={t.name}
              description={t.description}
              selected={selected === t.id}
              onSelect={setSelected}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="gradient-primary shadow-glow">
            <Link to="/app/analise">Usar um modelo com meu currículo</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
