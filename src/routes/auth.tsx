import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";

const TITLE = "Entrar na MatchCV AI";
const DESCRIPTION = "Acesse sua conta MatchCV AI para analisar currículos, otimizar candidaturas e acompanhar processos.";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup" | "reset";

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const target = search.redirect && search.redirect.startsWith("/") ? search.redirect : "/app";

  useEffect(() => {
    if (!authLoading && user) navigate({ to: target });
  }, [authLoading, user, navigate, target]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: target });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/app`,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já pode começar.");
        navigate({ to: target });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("Enviamos um link de redefinição para o seu e-mail.");
        setMode("login");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível continuar.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      sessionStorage.setItem("matchcv:redirect", target);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Não foi possível entrar com o Google.");
        return;
      }
      if (result.redirected) return;
      navigate({ to: target });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-sm">
          <Logo />
          <h1 className="mt-8 text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Entrar na sua conta" : mode === "signup" ? "Criar sua conta" : "Recuperar acesso"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "reset"
              ? "Informe seu e-mail e enviaremos um link para redefinir sua senha."
              : "Analise seu currículo e acompanhe suas candidaturas em um só lugar."}
          </p>

          {mode !== "reset" ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="mt-8 w-full"
                size="lg"
                onClick={handleGoogle}
                disabled={busy}
              >
                Continuar com Google
              </Button>
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
              </div>
            </>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" ? (
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required />
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
              />
            </div>

            {mode !== "reset" ? (
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
            ) : null}

            <Button type="submit" className="w-full gradient-primary shadow-glow" size="lg" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link"}
            </Button>
          </form>

          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                <button type="button" className="hover:text-foreground" onClick={() => setMode("signup")}>
                  Não tem conta? <span className="font-medium text-primary">Criar conta</span>
                </button>
                <br />
                <button type="button" className="hover:text-foreground" onClick={() => setMode("reset")}>
                  Esqueci minha senha
                </button>
              </>
            ) : (
              <button type="button" className="hover:text-foreground" onClick={() => setMode("login")}>
                Já tenho conta. <span className="font-medium text-primary">Entrar</span>
              </button>
            )}
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            Ao continuar você concorda com os <Link to="/termos" className="underline">Termos de Uso</Link> e a{" "}
            <Link to="/privacidade" className="underline">Política de Privacidade</Link>.
          </p>
        </div>
      </div>

      <div className="hidden items-center justify-center gradient-deep p-14 text-primary-foreground lg:flex">
        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">MatchCV AI</p>
          <p className="mt-6 text-3xl font-semibold leading-tight">
            “Agora eu sei exatamente o que melhorar antes de me candidatar.”
          </p>
          <p className="mt-6 text-sm opacity-80">
            Currículo, vaga, análise por IA, score, melhorias e currículo otimizado — em poucos minutos.
          </p>
        </div>
      </div>
    </div>
  );
}
