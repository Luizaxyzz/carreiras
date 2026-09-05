import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FaqSection, PricingSection, SectionHeading } from "@/components/landing/Sections";

const TITLE = "Preços — MatchCV AI";
const DESCRIPTION =
  "Plano grátis com 2 análises por mês e plano Pro por R$ 24,90/mês com análises ilimitadas, todos os templates, carta de apresentação e tracker.";

export const Route = createFileRoute("/precos")({
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
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-5 pt-16">
          <SectionHeading
            eyebrow="Planos"
            title={
              <>
                Um preço simples para <span className="text-gradient">acelerar suas candidaturas.</span>
              </>
            }
          />
        </section>
        <PricingSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </div>
  );
}
