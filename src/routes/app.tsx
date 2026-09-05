import { Outlet, Link, createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  BriefcaseBusiness,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app")({ component: AppLayout });

const NAV = [
  { to: "/app", label: "Visão geral", icon: LayoutDashboard },
  { to: "/app/analise", label: "Nova análise", icon: Sparkles },
  { to: "/app/curriculos", label: "Meus currículos", icon: FileText },
  { to: "/app/vagas", label: "Minhas vagas", icon: BriefcaseBusiness },
  { to: "/app/candidaturas", label: "Candidaturas", icon: FolderKanban },
  { to: "/app/modelos", label: "Modelos", icon: BarChart3 },
  { to: "/app/configuracoes", label: "Configurações", icon: Settings },
] as const;

function AppLayout() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: pathname } });
  }, [loading, user, navigate, pathname]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Carregando seu espaço...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-surface px-4 py-5 transition-transform md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2">
          <Logo />
          <button type="button" className="rounded-lg p-2 text-muted-foreground md:hidden" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-8 rounded-2xl bg-primary-soft/70 p-4">
          <p className="text-xs font-medium text-primary">Seu próximo passo</p>
          <p className="mt-1 text-sm font-semibold">Analise uma vaga com seu currículo</p>
          <Button asChild size="sm" className="mt-3 w-full gradient-primary">
            <Link to="/app/analise" onClick={() => setMobileOpen(false)}>Começar agora</Link>
          </Button>
        </div>
        <nav className="mt-8 space-y-1" aria-label="Navegação do painel">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/app" }}
              activeProps={{ className: "bg-primary-soft text-primary" }}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute inset-x-4 bottom-5 rounded-2xl border border-border bg-background p-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">{(user.user_metadata?.['full_name'] || user.email || "U").slice(0, 2).toUpperCase()}</span>
            <div className="min-w-0"><p className="truncate text-sm font-medium">{user.user_metadata?.['full_name'] || user.email}</p><p className="truncate text-xs text-muted-foreground">Plano gratuito</p></div>
          </div>
          <button type="button" className="mt-3 w-full rounded-lg px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => void signOut()}>Sair da conta</button>
        </div>
      </aside>
      {mobileOpen ? <button type="button" className="fixed inset-0 z-40 bg-primary-ink/20 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" /> : null}
      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-background/85 px-5 backdrop-blur-xl md:px-8">
          <button type="button" className="rounded-lg p-2 text-muted-foreground md:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu className="size-5" /></button>
          <div className="hidden md:block"><p className="text-sm font-medium">Olá, {user.user_metadata?.['full_name'] || user.email?.split("@")[0] || "por aqui"} 👋</p><p className="text-xs text-muted-foreground">Vamos deixar sua próxima candidatura mais forte.</p></div>
          <div className="ml-auto flex items-center gap-3"><span className="hidden text-xs text-muted-foreground sm:inline">Seus dados são privados</span><span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">MS</span></div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-8 md:px-8"><Outlet /></main>
      </div>
    </div>
  );
}
