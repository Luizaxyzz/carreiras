import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const TITLE = "Política de Privacidade — MatchCV AI";
const DESCRIPTION =
  "Como a MatchCV AI coleta, usa, protege e exclui os dados pessoais presentes nos currículos enviados à plataforma.";

export const Route = createFileRoute("/privacidade")({
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
        <h1 className="text-3xl font-semibold tracking-tight">Política de Privacidade</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            A MatchCV AI trata dados pessoais contidos em currículos com o único objetivo de gerar análises de
            compatibilidade e versões otimizadas do documento para o próprio titular.
          </p>
          <section>
            <h2 className="text-base font-semibold text-foreground">Dados que coletamos</h2>
            <p className="mt-2">
              Dados de conta (nome e e-mail), o arquivo de currículo enviado, o texto extraído dele, as descrições de
              vaga informadas e os resultados gerados pela inteligência artificial.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground">Como usamos</h2>
            <p className="mt-2">
              Utilizamos os dados para executar a análise solicitada, gerar currículos otimizados, cartas de
              apresentação, preparação para entrevista e manter seu histórico de candidaturas.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground">Compartilhamento</h2>
            <p className="mt-2">
              Currículos nunca são compartilhados entre usuários. O acesso aos registros é restrito por regras de
              segurança em nível de linha no banco de dados: cada conta acessa somente os próprios dados.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground">Exclusão de dados</h2>
            <p className="mt-2">
              Você pode excluir um currículo individualmente ou solicitar a exclusão de todos os seus dados na página de
              Configurações da sua conta. A exclusão é definitiva.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground">Contato</h2>
            <p className="mt-2">Dúvidas sobre privacidade podem ser enviadas pelo e-mail de suporte da plataforma.</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
