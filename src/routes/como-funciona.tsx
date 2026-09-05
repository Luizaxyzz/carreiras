import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HowItWorksSection, SectionHeading, FinalCta } from "@/components/landing/Sections";
import { BeforeAfter } from "@/components/landing/BeforeAfter";

const TITLE = "Como funciona a análise de currículo — MatchCV AI";
const DESCRIPTION =
  "Entenda o passo a passo da MatchCV AI: envio do currículo, leitura da vaga, análise por IA, score de compatibilidade e currículo otimizado em PDF.";

export const Route = createFileRoute("/como-funciona")({
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

const COMPARED = [
  "experiência",
  "formação",
  "tecnologias",
  "ferramentas",
  "competências",
  "palavras-chave",
  "requisitos obrigatórios",
  "diferenciais",
  "senioridade",
  "idioma",
  "localização",
  "tempo de experiência solicitado",
];

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-5 pb-4 pt-16 text-center">
          <SectionHeading
            eyebrow="Passo a passo"
            title={
              <>
                Currículo, vaga, análise e <span className="text-gradient">currículo otimizado.</span>
              </>
            }
            description="Todo o processo acontece em poucos minutos, sem telas técnicas e sempre mostrando o próximo passo."
          />
        </section>

        <HowItWorksSection />

        <section className="mx-auto max-w-6xl px-5 py-20">
          <SectionHeading eyebrow="Análise inteligente" title="O que a IA compara" />
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {COMPARED.map((item) => (
              <span key={item} className="rounded-full bg-primary-soft px-4 py-2 text-sm text-primary">
                {item}
              </span>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
            A IA nunca inventa experiências, cursos, tecnologias ou resultados. Ela reorganiza, reescreve e destaca o
            que já é verdadeiro no seu currículo.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <BeforeAfter />
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="gradient-primary shadow-glow">
              <Link to="/app/analise">Analisar meu currículo grátis</Link>
            </Button>
          </div>
        </section>

        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
