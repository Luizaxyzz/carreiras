import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SectionHeading, FaqSection } from "@/components/landing/Sections";
import { ScoreBar } from "@/components/app/ScoreRing";

const TITLE = "Scanner ATS — teste seu currículo antes de se candidatar | MatchCV AI";
const DESCRIPTION =
  "Descubra como os sistemas de triagem leem seu currículo: score ATS, palavras-chave encontradas e ausentes e recomendações práticas.";

export const Route = createFileRoute("/scanner-ats")({
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

const WEIGHTS = [
  { label: "Skills e palavras-chave", value: 30 },
  { label: "Experiência", value: 20 },
  { label: "Requisitos obrigatórios", value: 15 },
  { label: "Formação", value: 10 },
  { label: "Senioridade", value: 10 },
  { label: "Idiomas", value: 5 },
  { label: "Formatação ATS", value: 5 },
  { label: "Diferenciais", value: 5 },
];

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-5 py-16">
          <SectionHeading
            eyebrow="Scanner ATS"
            title={
              <>
                Saiba como os sistemas de triagem <span className="text-gradient">leem seu currículo.</span>
              </>
            }
            description="Calculamos um ATS Score interno a partir de critérios usados por sistemas de recrutamento e pelas próprias vagas."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WEIGHTS.map((w) => (
              <ScoreBar key={w.label} label={w.label} value={w.value} suffix="% do peso" />
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
            O resultado é normalizado de 0 a 100. O score representa o nível estimado de compatibilidade entre seu
            currículo e os requisitos identificados na vaga — nunca uma garantia de contratação.
          </p>

          <div className="mt-10 text-center">
            <Button asChild size="lg" className="gradient-primary shadow-glow">
              <Link to="/app/analise">Rodar meu scanner ATS</Link>
            </Button>
          </div>
        </section>

        <FaqSection />
      </main>
      <SiteFooter />
    </div>
  );
}
