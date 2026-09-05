import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { AnalysisFlow } from "@/components/app/AnalysisFlow";

export const Route = createFileRoute("/app/analise")({ component: AnalysisPage });

function AnalysisPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><Sparkles className="size-5" /></div>
        <div><p className="text-sm font-medium text-primary">Nova análise</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Compare seu currículo com uma vaga</h1><p className="mt-2 max-w-2xl text-muted-foreground">Envie seu currículo, informe a vaga e receba recomendações claras para sua candidatura.</p></div>
      </div>
      <AnalysisFlow />
    </div>
  );
}

