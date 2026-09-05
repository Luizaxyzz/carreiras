import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HeroDemo } from "@/components/landing/HeroDemo";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import {
  FaqSection,
  FeaturesSection,
  FinalCta,
  HowItWorksSection,
  PricingSection,
  ProblemSection,
  SectionHeading,
  TemplatesSection,
  TestimonialsSection,
} from "@/components/landing/Sections";

const TITLE = "MatchCV AI — Currículo otimizado com IA para cada vaga";
const DESCRIPTION =
  "Envie seu currículo e a vaga desejada. A IA da MatchCV mostra seu score de compatibilidade, o que falta e gera um currículo otimizado pronto para baixar.";

export const Route = createFileRoute("/")({
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
  component: Home,
});

const HERO_CHECKS = ["Análise ATS", "Score de compatibilidade", "Otimização com IA", "Currículo pronto para baixar"];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 -top-40 h-[420px] bg-[radial-gradient(60%_60%_at_50%_50%,var(--primary-soft),transparent)]"
            aria-hidden
          />
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/60 px-3.5 py-1.5 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" /> Currículos otimizados com Inteligência Artificial
              </span>

              <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Descubra se seu currículo está{" "}
                <span className="text-gradient">pronto para a vaga.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                Envie seu currículo e a vaga que deseja. Nossa IA identifica requisitos, compara seu perfil e mostra
                exatamente como aumentar sua compatibilidade.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="group gradient-primary shadow-glow hover:opacity-95">
                  <Link to="/app/analise">
                    Analisar meu currículo grátis
                    <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/como-funciona">Ver como funciona</Link>
                </Button>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {HERO_CHECKS.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-primary" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <HeroDemo />
          </div>
        </section>

        <ProblemSection />
        <HowItWorksSection />

        <section className="mx-auto max-w-6xl px-5 py-20">
          <SectionHeading
            eyebrow="Antes e depois"
            title={
              <>
                Veja o salto de <span className="text-gradient">compatibilidade</span> após a otimização.
              </>
            }
            description="O mesmo profissional, as mesmas experiências reais — apenas melhor organizadas e posicionadas para a vaga."
          />
          <div className="mt-12">
            <BeforeAfter />
          </div>
        </section>

        <TemplatesSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <FinalCta />
      </main>

      <SiteFooter />
    </div>
  );
}
