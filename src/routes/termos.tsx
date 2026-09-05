import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const TITLE = "Termos de Uso — MatchCV AI";
const DESCRIPTION =
  "Regras de uso da plataforma MatchCV AI: responsabilidades do usuário, limites da análise por IA e condições dos planos.";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Termos de Uso</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground">Uso da plataforma</h2>
            <p className="mt-2">
              Ao criar uma conta você declara que as informações do currículo enviado são verdadeiras e de sua
              titularidade.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground">Limites da análise por IA</h2>
            <p className="mt-2">
              Os scores representam o nível estimado de compatibilidade entre o currículo e os requisitos identificados
              na vaga. Não constituem garantia de entrevista ou contratação.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground">Conteúdo gerado</h2>
            <p className="mt-2">
              A inteligência artificial reorganiza e reescreve apenas informações já presentes no currículo enviado. É
              responsabilidade do usuário revisar o resultado antes de utilizá-lo em uma candidatura.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground">Planos</h2>
            <p className="mt-2">
              O plano gratuito possui limites de uso mensais. O plano Pro é cobrado mensalmente e pode ser cancelado a
              qualquer momento.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
