import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { APPLICATION_STATUSES } from "@/lib/matchcv-types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/candidaturas")({
  component: ApplicationsPage,
  head: () => ({
    meta: [
      { title: "Minhas candidaturas | MatchCV AI" },
      { name: "description", content: "Acompanhe cada processo seletivo, do primeiro contato até a decisão final." },
      { property: "og:title", content: "Minhas candidaturas | MatchCV AI" },
      { property: "og:description", content: "Acompanhe cada processo seletivo, do primeiro contato até a decisão final." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type ApplicationRow = {
  id: string;
  company: string | null;
  role: string | null;
  status: string;
  notes: string | null;
  compatibility_score: number | null;
  created_at: string;
};

function ApplicationsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNotes, setOpenNotes] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase
        .from("applications")
        .select("id, company, role, status, notes, compatibility_score, created_at")
        .order("created_at", { ascending: false });
      setRows((data ?? []) as ApplicationRow[]);
      setLoading(false);
    })();
  }, [user]);

  async function update(id: string, patch: Partial<ApplicationRow>) {
    setRows((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    const { error } = await supabase.from("applications").update(patch).eq("id", id);
    if (error) toast.error("Não foi possível salvar a alteração.");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><FolderKanban className="size-5" /></div>
        <div>
          <p className="text-sm font-medium text-primary">Acompanhamento</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Minhas candidaturas</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Atualize o estágio de cada processo e guarde suas anotações.</p>
        </div>
      </div>

      <section className="surface-card p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : rows.length ? (
          <div className="divide-y divide-border">
            {rows.map((item) => (
              <div key={item.id} className="space-y-3 py-5 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.role || "Vaga"}{item.company ? ` · ${item.company}` : ""}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString("pt-BR")}
                      {item.compatibility_score != null ? ` · compatibilidade ${item.compatibility_score}%` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(event) => void update(item.id, { status: event.target.value })}
                      className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
                      aria-label="Estágio da candidatura"
                    >
                      {APPLICATION_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                    <Button variant="ghost" size="sm" onClick={() => setOpenNotes(openNotes === item.id ? null : item.id)}>
                      {openNotes === item.id ? "Fechar" : "Anotações"}
                    </Button>
                  </div>
                </div>
                {openNotes === item.id ? (
                  <Textarea
                    defaultValue={item.notes ?? ""}
                    placeholder="Anote contatos, datas de entrevista, próximos passos..."
                    className="min-h-24"
                    onBlur={(event) => void update(item.id, { notes: event.target.value })}
                  />
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            Nenhuma candidatura ainda. <Link to="/app/analise" className="font-medium text-primary hover:underline">Comece uma análise</Link>.
          </div>
        )}
      </section>
    </div>
  );
}
