import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/app/configuracoes")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Configurações | MatchCV AI" },
      { name: "description", content: "Gerencie seu perfil, plano e os dados usados nas análises de currículo." },
      { property: "og:title", content: "Configurações | MatchCV AI" },
      { property: "og:description", content: "Gerencie seu perfil, plano e os dados usados nas análises de currículo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [plan, setPlan] = useState("free");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase.from("profiles").select("full_name, plan").eq("id", user.id).maybeSingle();
      setFullName(data?.full_name ?? (user.user_metadata?.['full_name'] as string) ?? "");
      setPlan(data?.plan ?? "free");
    })();
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: fullName });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar seu perfil.");
      return;
    }
    toast.success("Perfil atualizado.");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><Settings className="size-5" /></div>
        <div>
          <p className="text-sm font-medium text-primary">Sua conta</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Configurações</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Gerencie seu perfil e os dados usados nas análises.</p>
        </div>
      </div>

      <section className="surface-card max-w-xl space-y-5 p-6">
        <div className="space-y-2">
          <label htmlFor="full-name" className="text-sm font-medium">Nome completo</label>
          <Input id="full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Seu nome" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">E-mail</label>
          <Input id="email" value={user?.email ?? ""} readOnly disabled />
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-border p-4">
          <div>
            <p className="text-sm font-medium">Plano atual</p>
            <p className="mt-1 text-xs text-muted-foreground">{plan === "free" ? "Gratuito" : plan}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="gradient-primary" onClick={() => void save()} disabled={saving}>Salvar alterações</Button>
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              void navigate({ to: "/auth" });
            }}
          >
            <LogOut className="mr-2 size-4" />Sair da conta
          </Button>
        </div>
      </section>
    </div>
  );
}
