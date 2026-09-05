import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, BriefcaseBusiness, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/app/")({ component: Dashboard });

const STATS = [
  { label: "Currículos criados", value: "0", icon: FileText },
  { label: "Vagas analisadas", value: "0", icon: BriefcaseBusiness },
  { label: "Compatibilidade média", value: "—", icon: Sparkles },
  { label: "Melhor score ATS", value: "—", icon: BarChart3 },
];

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(STATS);
  const [recentAnalyses, setRecentAnalyses] = useState<{ id: string; compatibility_score: number; created_at: string; jobs: { title: string | null; company: string | null } | null }[]>([]);

  useEffect(() => {
    if (!user) return;
    async function loadDashboard() {
      const [{ count: resumeCount }, { count: jobCount }, { data: analyses }] = await Promise.all([
        supabase.from("resumes").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("analyses").select("id, compatibility_score, created_at, jobs(title, company)").order("created_at", { ascending: false }).limit(5),
      ]);
      const rows = (analyses ?? []) as typeof recentAnalyses;
      setRecentAnalyses(rows);
      const scores = rows.map((item) => item.compatibility_score).filter((score) => Number.isFinite(score));
      setStats([
        { label: "Currículos criados", value: String(resumeCount ?? 0), icon: FileText },
        { label: "Vagas analisadas", value: String(jobCount ?? 0), icon: BriefcaseBusiness },
        { label: "Compatibilidade média", value: scores.length ? `${Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)}%` : "—", icon: Sparkles },
        { label: "Melhor score ATS", value: "—", icon: BarChart3 },
      ]);
    }
    void loadDashboard();
  }, [user]);

  return (
    <div className="space-y-8">
      <div><p className="text-sm font-medium text-primary">Visão geral</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Olá, {user?.user_metadata?.['full_name'] || user?.email?.split("@")[0] || "por aqui"} 👋</h1><p className="mt-2 text-muted-foreground">Seu espaço para transformar boas experiências em candidaturas mais fortes.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon }) => <div key={label} className="surface-card p-5"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{label}</p><Icon className="size-4 text-primary" /></div><p className="mt-4 text-3xl font-semibold">{value}</p></div>)}</div>
      <section className="relative overflow-hidden rounded-3xl gradient-deep p-7 text-primary-foreground shadow-glow md:p-10"><div className="relative max-w-xl"><span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium">Primeiro passo</span><h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">Descubra o quanto seu currículo combina com uma vaga.</h2><p className="mt-3 text-sm leading-6 text-white/75">Envie seu currículo e informe a vaga. A MatchCV AI encontra pontos fortes e oportunidades reais de melhoria.</p><Button asChild size="lg" className="mt-6 bg-white text-primary hover:bg-white/90"><Link to="/app/analise">Nova análise <ArrowRight className="ml-2 size-4" /></Link></Button></div></section>
      <section className="surface-card p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Análises recentes</h2><p className="mt-1 text-sm text-muted-foreground">Seu histórico aparecerá aqui.</p></div><Link to="/app/candidaturas" className="text-sm font-medium text-primary hover:underline">Ver candidaturas</Link></div>{recentAnalyses.length ? <div className="mt-6 divide-y divide-border">{recentAnalyses.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 py-4 first:pt-0"><div className="min-w-0"><p className="truncate text-sm font-medium">{item.jobs?.title || "Vaga analisada"}{item.jobs?.company ? ` · ${item.jobs.company}` : ""}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString("pt-BR")}</p></div><span className="shrink-0 rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">{item.compatibility_score}%</span></div>)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">Nenhuma análise realizada ainda.</div>}</section>
    </div>
  );
}
