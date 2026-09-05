import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Download, LayoutTemplate, Loader2, Palette, RotateCcw, Save, Sparkles, Type } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_RESUME_APPEARANCE, ResumePreview } from "@/components/resume/ResumePreview";
import type { ResumeAppearance, ResumeFont, ResumeSpacing } from "@/components/resume/ResumePreview";
import { TemplateThumb } from "@/components/landing/TemplateCard";
import { SAMPLE_RESUME } from "@/lib/sample-resume";
import { TEMPLATES } from "@/lib/matchcv-types";
import type { StructuredResume } from "@/lib/matchcv-types";
import { optimizeResume } from "@/lib/ai.functions";
import { downloadResumePdf } from "@/lib/pdf-export";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/app/modelos")({
  component: TemplatesPage,
  validateSearch: (search: Record<string, unknown>) => ({
    analysisId: typeof search["analysisId"] === "string" ? search["analysisId"] as string : undefined,
    builder: typeof search["builder"] === "string" ? search["builder"] as string : undefined,
  }),
});

function TemplatesPage() {
  const { analysisId, builder } = Route.useSearch();
  const { user } = useAuth();
  const [template, setTemplate] = useState("minimal");
  const [resume, setResume] = useState<StructuredResume>(SAMPLE_RESUME);
  const [skills, setSkills] = useState(SAMPLE_RESUME.skills.join(", "));
  const [differentiators, setDifferentiators] = useState((SAMPLE_RESUME.differentiators ?? []).join(", "));
  const [isSample, setIsSample] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [scores, setScores] = useState<{ before: { compatibility: number; ats: number }; after: { compatibility: number; ats: number } } | null>(null);
  const [changes, setChanges] = useState<string[]>([]);
  const [appearance, setAppearance] = useState<ResumeAppearance>(DEFAULT_RESUME_APPEARANCE);

  function applyResume(next: StructuredResume) {
    setResume(next);
    setSkills((next.skills ?? []).join(", "));
    setDifferentiators((next.differentiators ?? []).join(", "));
    setIsSample(false);
  }

  async function generateForJob(showToast = true) {
    if (!analysisId) return;
    setOptimizing(true);
    try {
      const response = await optimizeResume({ data: { analysisId } });
      applyResume(response.resume);
      setScores({ before: response.before, after: response.after });
      setChanges(response.changes ?? []);
      if (showToast) toast.success("Novo currículo direcionado à vaga criado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar o currículo para esta vaga agora.");
    } finally {
      setOptimizing(false);
    }
  }

  useEffect(() => {
    if (builder === "1") {
      const stored = window.sessionStorage.getItem("matchcv-builder-resume");
      if (stored) {
        try { applyResume(JSON.parse(stored) as StructuredResume); } catch { window.sessionStorage.removeItem("matchcv-builder-resume"); }
      }
      return;
    }
    if (!analysisId || !user) return;
    void (async () => {
      const { data: generatedRows } = await supabase.from("generated_resumes").select("content, template, before_scores, after_scores").eq("analysis_id", analysisId).order("created_at", { ascending: false }).limit(1);
      const generated = generatedRows?.[0];
      if (generated?.content) {
        applyResume(generated.content as unknown as StructuredResume);
        setTemplate((generated.template as string) || "minimal");
        if (generated.before_scores && generated.after_scores) setScores({ before: generated.before_scores as { compatibility: number; ats: number }, after: generated.after_scores as { compatibility: number; ats: number } });
        return;
      }
      // Primeira entrada após a análise: já gera a versão para a vaga automaticamente.
      await generateForJob(false);
    })();
  }, [analysisId, builder, user]);

  useEffect(() => {
    const saved = window.localStorage.getItem("matchcv-resume-appearance");
    if (!saved) return;
    try { setAppearance({ ...DEFAULT_RESUME_APPEARANCE, ...(JSON.parse(saved) as Partial<ResumeAppearance>) }); } catch { window.localStorage.removeItem("matchcv-resume-appearance"); }
  }, []);

  function updatePersonal(field: "full_name" | "headline", value: string) {
    setResume((current) => ({ ...current, personal_info: { ...current.personal_info, [field]: value } }));
  }

  function editedResume() {
    return {
      ...resume,
      skills: skills.split(",").map((v) => v.trim()).filter(Boolean),
      differentiators: differentiators.split(",").map((v) => v.trim()).filter(Boolean),
    };
  }

  function applyEdits() {
    const next = editedResume();
    setResume(next);
    if (builder === "1") window.sessionStorage.setItem("matchcv-builder-resume", JSON.stringify(next));
    window.localStorage.setItem("matchcv-resume-appearance", JSON.stringify(appearance));
    toast.success("Alterações aplicadas à visualização.");
  }

  function downloadResume() {
    const next = editedResume();
    setResume(next);
    if (builder === "1") window.sessionStorage.setItem("matchcv-builder-resume", JSON.stringify(next));
    window.localStorage.setItem("matchcv-resume-appearance", JSON.stringify(appearance));
    downloadResumePdf(next);
    toast.success("PDF baixado.");
  }

  return <div className="space-y-8">
    <div className="no-print flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="flex items-start gap-4"><div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><LayoutTemplate className="size-5" /></div><div><p className="text-sm font-medium text-primary">Personalização</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Escolha o modelo do seu currículo</h1><p className="mt-2 max-w-2xl text-muted-foreground">Revise o conteúdo, escolha o visual e baixe o arquivo em PDF.</p></div></div>
      <div className="flex gap-2"><Button variant="outline" onClick={downloadResume}><Download className="mr-2 size-4" />Baixar PDF</Button><Button className="gradient-primary" onClick={applyEdits}><Save className="mr-2 size-4" />Salvar alterações</Button></div>
    </div>

    {analysisId ? <section className="no-print rounded-2xl border border-primary/20 bg-primary-soft/40 p-5 md:flex md:items-center md:justify-between md:gap-6"><div><h2 className="text-lg font-semibold">Currículo criado especificamente para esta vaga</h2><p className="mt-1 text-sm text-muted-foreground">A IA reescreve o currículo por completo para a oportunidade, priorizando ATS, palavras-chave, competências transferíveis e tudo o que seu perfil realmente pode sustentar.</p>{optimizing ? <p className="mt-3 text-sm font-medium text-primary">Gerando a versão direcionada à vaga...</p> : scores ? <p className="mt-3 text-sm font-medium">Aderência comprovada: {scores.before.compatibility}% → <span className="text-primary">{scores.after.compatibility}%</span> · Cobertura ATS da versão: <span className="text-primary">{scores.after.ats}%</span></p> : null}<p className="mt-2 text-xs text-muted-foreground">Cobertura ATS indica o quanto o texto foi alinhado à linguagem da vaga; não transforma requisitos não comprovados em experiência real.</p></div><Button className="mt-4 gradient-primary md:mt-0" onClick={() => void generateForJob(true)} disabled={optimizing}>{optimizing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}{optimizing ? "Criando currículo..." : "Gerar outra versão para a vaga"}</Button></section> : builder === "1" ? <div className="no-print rounded-2xl border border-primary/20 bg-primary-soft/40 p-5"><h2 className="font-semibold">Seu novo currículo está pronto</h2><p className="mt-1 text-sm text-muted-foreground">A IA já estruturou objetivo, resumo, experiências, competências técnicas e diferenciais. Revise abaixo e escolha o modelo.</p></div> : <p className="no-print rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">{isSample ? "Você está vendo um currículo de exemplo." : "Editando seu currículo."}</p>}

    {changes.length ? <section className="no-print surface-card p-6"><h2 className="font-semibold">O que a IA ajustou</h2><ul className="mt-4 space-y-2">{changes.map((item) => <li key={item} className="flex gap-2 text-sm leading-6"><Check className="mt-1 size-4 shrink-0 text-primary" />{item}</li>)}</ul></section> : null}

    <section className="no-print surface-card p-6 md:p-8"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-primary">1. Escolha um modelo</p><h2 className="mt-1 text-xl font-semibold">Um visual para cada oportunidade</h2></div><span className="hidden text-xs text-muted-foreground sm:block">{TEMPLATES.length} modelos</span></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{TEMPLATES.map((item) => <Button key={item.id} type="button" variant="outline" onClick={() => setTemplate(item.id)} className={`group relative h-auto min-w-0 flex-col items-stretch p-2 text-left ${template === item.id ? "border-primary bg-primary-soft/40 ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`}><TemplateThumb template={item.id} resume={resume} appearance={appearance} /><span className="flex items-start justify-between gap-2 px-2 py-2"><span><span className="block text-sm font-semibold">{item.name}</span><span className="mt-1 block whitespace-normal text-xs font-normal leading-5 text-muted-foreground">{item.description}</span></span>{template === item.id ? <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-3.5" /></span> : null}</span></Button>)}</div></section>

    <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,.8fr)_minmax(420px,1.2fr)]">
      <div className="no-print space-y-6">
        <div className="surface-card p-6 md:p-8"><p className="text-sm font-medium text-primary">2. Revise o conteúdo</p><h2 className="mt-1 text-xl font-semibold">Ajustes finais</h2><div className="mt-6 space-y-5">
          <Field label="Nome completo"><Input value={resume.personal_info.full_name} onChange={(e) => updatePersonal("full_name", e.target.value)} /></Field>
          <Field label="Título profissional"><Input value={resume.personal_info.headline ?? ""} onChange={(e) => updatePersonal("headline", e.target.value)} /></Field>
          <Field label="Objetivo"><Textarea value={resume.objective ?? ""} onChange={(e) => setResume((c) => ({ ...c, objective: e.target.value }))} className="min-h-24" /></Field>
          <Field label="Resumo profissional"><Textarea value={resume.professional_summary} onChange={(e) => setResume((c) => ({ ...c, professional_summary: e.target.value }))} className="min-h-32" /></Field>
          <Field label="Competências técnicas"><Input value={skills} onChange={(e) => setSkills(e.target.value)} /><p className="mt-1 text-xs text-muted-foreground">Separe por vírgulas.</p></Field>
          <Field label="Habilidades e diferenciais"><Input value={differentiators} onChange={(e) => setDifferentiators(e.target.value)} /><p className="mt-1 text-xs text-muted-foreground">Separe por vírgulas.</p></Field>
        </div></div>
        <div className="surface-card p-6 md:p-8"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-primary">3. Personalize o visual</p><h2 className="mt-1 text-xl font-semibold">Deixe do seu jeito</h2></div><Button variant="ghost" size="icon" onClick={() => setAppearance(DEFAULT_RESUME_APPEARANCE)}><RotateCcw className="size-4" /></Button></div><div className="mt-6 space-y-6">
          <div><label className="text-sm font-medium">Cor principal</label><div className="mt-3 flex flex-wrap gap-2">{["#244a73", "#315c42", "#7a3648", "#5b4a86", "#9a542f", "#20252b"].map((color) => <Button key={color} variant="outline" size="icon" onClick={() => setAppearance((c) => ({ ...c, color }))} className={appearance.color === color ? "ring-2 ring-primary" : ""}><span className="size-5 rounded-full border" style={{ backgroundColor: color }} /></Button>)}<label className="relative flex size-9 cursor-pointer items-center justify-center rounded-md border"><input type="color" value={appearance.color} onChange={(e) => setAppearance((c) => ({ ...c, color: e.target.value }))} className="absolute inset-0 opacity-0" /><Palette className="size-4" /></label></div></div>
          <div className="grid gap-5 sm:grid-cols-2"><Field label="Fonte"><Select value={appearance.font} onValueChange={(font: ResumeFont) => setAppearance((c) => ({ ...c, font }))}><SelectTrigger><Type className="mr-2 size-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sans">Arial — moderna</SelectItem><SelectItem value="humanist">Trebuchet — acolhedora</SelectItem><SelectItem value="serif">Georgia — clássica</SelectItem><SelectItem value="mono">Courier — técnica</SelectItem></SelectContent></Select></Field><Field label="Espaçamento"><Select value={appearance.spacing} onValueChange={(spacing: ResumeSpacing) => setAppearance((c) => ({ ...c, spacing }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="compact">Compacto</SelectItem><SelectItem value="balanced">Equilibrado</SelectItem><SelectItem value="airy">Amplo</SelectItem></SelectContent></Select></Field></div>
          <div><div className="flex justify-between"><label className="text-sm font-medium">Tamanho do texto</label><span className="text-xs text-muted-foreground">{Math.round(appearance.fontScale * 100)}%</span></div><Slider className="mt-3" min={.85} max={1.18} step={.01} value={[appearance.fontScale]} onValueChange={([fontScale]) => setAppearance((c) => ({ ...c, fontScale: fontScale ?? 1 }))} /></div>
          <div className="flex items-center justify-between"><div><label className="text-sm font-medium">Detalhes visuais</label><p className="text-xs text-muted-foreground">Linhas, faixas e formas.</p></div><Switch checked={appearance.decorations} onCheckedChange={(decorations) => setAppearance((c) => ({ ...c, decorations }))} /></div>
        </div></div>
      </div>
      <div className="surface-card overflow-hidden p-4 md:p-6"><div className="no-print mb-4 flex items-center justify-between"><div><p className="text-sm font-medium text-primary">Visualização ao vivo</p><p className="text-xs text-muted-foreground">Modelo {TEMPLATES.find((i) => i.id === template)?.name}</p></div><span className="rounded-full bg-success-soft px-3 py-1 text-xs font-medium text-success">Compatível com ATS</span></div><div className="resume-preview-stage print-page max-h-[900px] overflow-auto rounded-xl bg-muted/60 p-3 md:p-6"><ResumePreview resume={resume} template={template} appearance={appearance} /></div></div>
    </section>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><label className="text-sm font-medium">{label}</label>{children}</div>; }
