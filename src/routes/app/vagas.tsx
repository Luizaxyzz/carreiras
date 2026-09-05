import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BriefcaseBusiness, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/app/vagas")({
  component: JobsPage,
  head: () => ({
    meta: [
      { title: "Minhas vagas | MatchCV AI" },
      { name: "description", content: "Veja todas as vagas que você analisou e a compatibilidade de cada uma com o seu currículo." },
      { property: "og:title", content: "Minhas vagas | MatchCV AI" },
      { property: "og:description", content: "Veja todas as vagas que você analisou e a compatibilidade de cada uma com o seu currículo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type JobRow = {
  id: string;
  title: string | null;
  company: string | null;
  source_url: string | null;
  created_at: string;
  analyses: { id: string; compatibility_score: number; ats_score: number }[] | null;
};

function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase
        .from("jobs")
        .select("id, title, company, source_url, created_at, analyses(id, compatibility_score, ats_score)")
        .order("created_at", { ascending: false });
      setJobs((data ?? []) as unknown as JobRow[]);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><BriefcaseBusiness className="size-5" /></div>
        <div>
          <p className="text-sm font-medium text-primary">Oportunidades</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Minhas vagas</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Todas as vagas que você já analisou, com a compatibilidade calculada.</p>
        </div>
      </div>

      <section className="surface-card p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : jobs.length ? (
          <div className="divide-y divide-border">
            {jobs.map((job) => {
              const analysis = job.analyses?.[0];
              return (
                <div key={job.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{job.title || "Vaga analisada"}{job.company ? ` · ${job.company}` : ""}</p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      {new Date(job.created_at).toLocaleDateString("pt-BR")}
                      {job.source_url ? (
                        <a href={job.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                          link da vaga <ExternalLink className="size-3" />
                        </a>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {analysis ? <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">{analysis.compatibility_score}%</span> : null}
                    {analysis ? (
                      <Button asChild size="sm" variant="outline">
                        <Link to="/app/modelos" search={{ analysisId: analysis.id }}>Otimizar <ArrowRight className="ml-2 size-3.5" /></Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            Nenhuma vaga analisada ainda. <Link to="/app/analise" className="font-medium text-primary hover:underline">Analisar uma vaga</Link>.
          </div>
        )}
      </section>
    </div>
  );
}
