import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

type AppPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export function AppPage({ eyebrow, title, description, icon: Icon }: AppPageProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><Icon className="size-5" /></div>
        <div><p className="text-sm font-medium text-primary">{eyebrow}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-2 max-w-2xl text-muted-foreground">{description}</p></div>
      </div>
      <section className="surface-card flex min-h-72 flex-col items-center justify-center p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary"><Icon className="size-6" /></div>
        <h2 className="mt-5 text-lg font-semibold">Esta área está pronta para você</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">Em breve, seus dados aparecerão aqui. Comece uma análise para alimentar seu espaço de trabalho.</p>
        <Button asChild className="mt-6 gradient-primary"><Link to="/app/analise">Começar uma análise <ArrowRight className="ml-2 size-4" /></Link></Button>
      </section>
    </div>
  );
}
