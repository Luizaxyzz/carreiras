import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/app/curriculos")({
  component: ResumesPage,
  head: () => ({
    meta: [
      { title: "Meus currículos | MatchCV AI" },
      { name: "description", content: "Acesse seus currículos enviados e as versões otimizadas geradas para cada vaga." },
      { property: "og:title", content: "Meus currículos | MatchCV AI" },
      { property: "og:description", content: "Acesse seus currículos enviados e as versões otimizadas geradas para cada vaga." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type ResumeRow = { id: string; title: string; created_at: string; raw_text: string | null };
type GeneratedRow = {
  id: string;
  template: string;
  created_at: string;
  analysis_id: string | null;
  after_scores: { compatibility?: number; ats?: number } | null;
};

function ResumesPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [generated, setGenerated] = useState<GeneratedRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [{ data: r }, { data: g }] = await Promise.all([
        supabase.from("resumes").select("id, title, created_at, raw_text").order("created_at", { ascending: false }),
        supabase.from("generated_resumes").select("id, template, created_at, analysis_id, after_scores").order("created_at", { ascending: false }),
      ]);
      setResumes((r ?? []) as ResumeRow[]);
      setGenerated((g ?? []) as unknown as GeneratedRow[]);
      setLoading(false);
    })();
  }, [user]);

  async function removeResume(id: string) {
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) {
      toast.error("Não foi possível excluir agora.");
      return;
    }
    setResumes((current) => current.filter((item) => item.id !== id));
    toast.success("Currículo removido.");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><FileText className="size-5" /></div>
        <div>
          <p className="text-sm font-medium text-primary">Biblioteca</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Meus currículos</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Seus currículos enviados e as versões otimizadas para cada oportunidade.</p>
        </div>
      </div>

      <section className="surface-card p-6">
        <h2 className="font-semibold">Currículos enviados</h2>
        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground">Carregando...</p>
        ) : resumes.length ? (
          <div className="mt-5 divide-y divide-border">
            {resumes.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Enviado em {new Date(item.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => void removeResume(item.id)} aria-label="Excluir currículo"><Trash2 className="size-4" /></Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            Nenhum currículo ainda. <Link to="/app/analise" className="font-medium text-primary hover:underline">Comece uma análise</Link>.
          </div>
        )}
      </section>

      <section className="surface-card p-6">
        <h2 className="font-semibold">Versões otimizadas</h2>
        {generated.length ? (
          <div className="mt-5 divide-y divide-border">
            {generated.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">Modelo {item.template}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString("pt-BR")}
                    {item.after_scores?.compatibility ? ` · compatibilidade ${item.after_scores.compatibility}%` : ""}
                  </p>
                </div>
                {item.analysis_id ? (
                  <Button asChild size="sm" variant="outline">
                    <Link to="/app/modelos" search={{ analysisId: item.analysis_id }}>Abrir <ArrowRight className="ml-2 size-3.5" /></Link>
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            <Sparkles className="mx-auto mb-3 size-5 text-primary" />
            Depois de uma análise, gere seu currículo otimizado em Modelos.
          </div>
        )}
      </section>
    </div>
  );
}
