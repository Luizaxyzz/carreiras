import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Download, LayoutTemplate, Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { SAMPLE_RESUME } from "@/lib/sample-resume";
import { TEMPLATES } from "@/lib/matchcv-types";
import type { AnalysisResult, StructuredResume } from "@/lib/matchcv-types";
import { optimizeResume } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/app/modelos")({
  component: TemplatesPage,
  validateSearch: (search: Record<string, unknown>) => ({
    analysisId: typeof search['analysisId'] === "string" ? (search['analysisId'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Modelos de currículo | MatchCV AI" },
      { name: "description", content: "Escolha um modelo compatível com ATS, otimize o conteúdo com IA e exporte seu currículo." },
      { property: "og:title", content: "Modelos de currículo | MatchCV AI" },
      { property: "og:description", content: "Escolha um modelo compatível com ATS, otimize o conteúdo com IA e exporte seu currículo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function TemplatesPage() {
  const { analysisId } = Route.useSearch();
  const { user } = useAuth();
  const [template, setTemplate] = useState("minimal");
  const [resume, setResume] = useState<StructuredResume>(SAMPLE_RESUME);
  const [skills, setSkills] = useState(SAMPLE_RESUME.skills.join(", "));
  const [isSample, setIsSample] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [scores, setScores] = useState<{ before: { compatibility: number; ats: number }; after: { compatibility: number; ats: number } } | null>(null);
  const [changes, setChanges] = useState<string[]>([]);

  useEffect(() => {
    if (!analysisId || !user) return;
    void (async () => {
      const { data: generatedRows } = await supabase
        .from("generated_resumes")
        .select("content, template, before_scores, after_scores")
        .eq("analysis_id", analysisId)
        .order("created_at", { ascending: false })
        .limit(1);
      const generated = generatedRows?.[0];
      if (generated?.content) {
        applyResume(generated.content as unknown as StructuredResume);
        setTemplate((generated.template as string) || "minimal");
        if (generated.before_scores && generated.after_scores) {
          setScores({
            before: generated.before_scores as { compatibility: number; ats: number },
            after: generated.after_scores as { compatibility: number; ats: number },
          });
        }
        return;
      }
      const { data: analysisRow } = await supabase.from("analyses").select("result").eq("id", analysisId).maybeSingle();
      const result = analysisRow?.result as AnalysisResult | undefined;
      if (result?.resume) applyResume(result.resume);
    })();
  }, [analysisId, user]);

  function applyResume(next: StructuredResume) {
    setResume(next);
    setSkills((next.skills ?? []).join(", "));
    setIsSample(false);
  }

  function updateResume(field: "full_name" | "headline", value: string) {
    setResume((current) => ({ ...current, personal_info: { ...current.personal_info, [field]: value } }));
  }

  async function runOptimize() {
    if (!analysisId) {
      toast.error("Faça uma análise primeiro para otimizar seu currículo.");
      return;
    }
    setOptimizing(true);
    try {
      const response = await optimizeResume({ data: { analysisId } });
      applyResume(response.resume);
      setScores({ before: response.before, after: response.after });
      setChanges(response.changes ?? []);
      toast.success("Currículo otimizado com base nas suas experiências reais.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível otimizar agora.");
    } finally {
      setOptimizing(false);
    }
  }

  function saveResume() {
    setResume((current) => ({ ...current, skills: skills.split(",").map((skill) => skill.trim()).filter(Boolean) }));
    toast.success("Alterações aplicadas à visualização.");
  }

  function downloadResume() {
    saveResume();
    setTimeout(() => window.print(), 200);
  }

  return (
    <div className="space-y-8">
      <div className="no-print flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><LayoutTemplate className="size-5" /></div>
          <div><p className="text-sm font-medium text-primary">Personalização</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Otimize e personalize seu currículo</h1><p className="mt-2 max-w-2xl text-muted-foreground">Escolha um layout compatível com ATS e ajuste seu conteúdo com uma visualização em tempo real.</p></div>
        </div>
        <div className="flex gap-2 sm:shrink-0">
          <Button variant="outline" onClick={downloadResume}><Download className="mr-2 size-4" />Exportar PDF</Button>
          <Button className="gradient-primary" onClick={saveResume}><Save className="mr-2 size-4" />Salvar alterações</Button>
        </div>
      </div>

      {analysisId ? (
        <section className="no-print rounded-2xl border border-primary/20 bg-primary-soft/40 p-5 md:flex md:items-center md:justify-between md:gap-6">
          <div>
            <h2 className="text-lg font-semibold">Currículo otimizado para esta vaga</h2>
            <p className="mt-1 text-sm text-muted-foreground">A IA reorganiza e reescreve apenas o que já existe no seu currículo.</p>
            {scores ? (
              <p className="mt-3 text-sm font-medium">
                Compatibilidade {scores.before.compatibility}% → <span className="text-primary">{scores.after.compatibility}%</span> · ATS {scores.before.ats}% → <span className="text-primary">{scores.after.ats}%</span>
              </p>
            ) : null}
          </div>
          <Button className="mt-4 gradient-primary md:mt-0" onClick={() => void runOptimize()} disabled={optimizing}>
            {optimizing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
            {optimizing ? "Otimizando..." : "Gerar versão otimizada"}
          </Button>
        </section>
      ) : (
        <p className="no-print rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
          {isSample ? "Você está vendo um currículo de exemplo. Faça uma análise para trazer os seus dados reais." : "Editando seu currículo."}
        </p>
      )}

      {changes.length ? (
        <section className="no-print surface-card p-6">
          <h2 className="font-semibold">O que a IA ajustou</h2>
          <ul className="mt-4 space-y-2">{changes.map((item) => <li key={item} className="flex gap-2 text-sm leading-6"><Check className="mt-1 size-4 shrink-0 text-primary" />{item}</li>)}</ul>
        </section>
      ) : null}

      <section className="no-print surface-card p-6 md:p-8">
        <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium text-primary">1. Escolha um modelo</p><h2 className="mt-1 text-xl font-semibold">Um visual para cada oportunidade</h2></div><span className="hidden text-xs text-muted-foreground sm:block">{TEMPLATES.length} modelos disponíveis</span></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((item) => (
            <button key={item.id} type="button" onClick={() => setTemplate(item.id)} className={`group rounded-2xl border p-4 text-left transition-all ${template === item.id ? "border-primary bg-primary-soft/40 ring-2 ring-primary/20" : "border-border hover:border-primary/40 hover:bg-accent/30"}`}>
              <div className="flex items-start justify-between gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"><LayoutTemplate className="size-4" /></span>{template === item.id ? <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-3.5" /></span> : null}</div>
              <p className="mt-4 text-sm font-semibold">{item.name}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(420px,1.2fr)]">
        <div className="no-print surface-card p-6 md:p-8">
          <div className="flex items-start gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary"><Sparkles className="size-4" /></div><div><p className="text-sm font-medium text-primary">2. Edite seu conteúdo</p><h2 className="mt-1 text-xl font-semibold">Ajustes rápidos e reais</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Melhore a apresentação sem inventar experiências ou qualificações.</p></div></div>
          <div className="mt-6 space-y-5"><div className="space-y-2"><label htmlFor="resume-name" className="text-sm font-medium">Nome completo</label><Input id="resume-name" value={resume.personal_info.full_name} onChange={(event) => updateResume("full_name", event.target.value)} /></div><div className="space-y-2"><label htmlFor="resume-headline" className="text-sm font-medium">Título profissional</label><Input id="resume-headline" value={resume.personal_info.headline ?? ""} onChange={(event) => updateResume("headline", event.target.value)} /></div><div className="space-y-2"><label htmlFor="resume-summary" className="text-sm font-medium">Resumo profissional</label><Textarea id="resume-summary" value={resume.professional_summary} onChange={(event) => setResume((current) => ({ ...current, professional_summary: event.target.value }))} className="min-h-32 resize-y" /></div><div className="space-y-2"><label htmlFor="resume-skills" className="text-sm font-medium">Competências</label><Input id="resume-skills" value={skills} onChange={(event) => setSkills(event.target.value)} /><p className="text-xs text-muted-foreground">Separe cada competência por vírgula.</p></div></div>
        </div>
        <div className="surface-card overflow-hidden p-4 md:p-6"><div className="no-print mb-4 flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-primary">Visualização ao vivo</p><p className="text-xs text-muted-foreground">Modelo {TEMPLATES.find((item) => item.id === template)?.name}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Compatível com ATS</span></div><div className="print-page max-h-[760px] overflow-auto rounded-xl bg-muted/60 p-3 md:p-6"><ResumePreview resume={resume} template={template} /></div></div>
      </section>
    </div>
  );
}
