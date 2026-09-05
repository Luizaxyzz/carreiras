import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Inteligência artificial para deixar seu currículo alinhado com a vaga que você realmente quer.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Produto</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/como-funciona" className="hover:text-foreground">Como funciona</Link></li>
            <li><Link to="/scanner-ats" className="hover:text-foreground">Scanner ATS</Link></li>
            <li><Link to="/modelos" className="hover:text-foreground">Modelos de currículo</Link></li>
            <li><Link to="/precos" className="hover:text-foreground">Preços</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Conta</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/auth" className="hover:text-foreground">Entrar</Link></li>
            <li><Link to="/app/analise" className="hover:text-foreground">Nova análise</Link></li>
            <li><Link to="/app/candidaturas" className="hover:text-foreground">Minhas candidaturas</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/privacidade" className="hover:text-foreground">Política de Privacidade</Link></li>
            <li><Link to="/termos" className="hover:text-foreground">Termos de Uso</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MatchCV AI. Seus dados são privados e nunca compartilhados entre contas.
      </div>
    </footer>
  );
}
