import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Download, LayoutTemplate, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { SAMPLE_RESUME } from "@/lib/sample-resume";
import { TEMPLATES } from "@/lib/matchcv-types";
import type { StructuredResume } from "@/lib/matchcv-types";

export const Route = createFileRoute("/app/modelos")({ component: TemplatesPage });

function TemplatesPage() {
  const [template, setTemplate] = useState("minimal");
  const [resume, setResume] = useState<StructuredResume>(SAMPLE_RESUME);
  const [skills, setSkills] = useState(SAMPLE_RESUME.skills.join(", "));

  function updateResume(field: "full_name" | "headline", value: string) {
    setResume((current) => ({ ...current, personal_info: { ...current.personal_info, [field]: value } }));
  }

  function saveResume() {
    setResume((current) => ({ ...current, skills: skills.split(",").map((skill) => skill.trim()).filter(Boolean) }));
    toast.success("Alterações salvas nesta sessão.");
  }

  function downloadResume() {
    toast.info("Seu currículo está pronto para exportação após salvar as alterações.");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><LayoutTemplate className="size-5" /></div>
          <div><p className="text-sm font-medium text-primary">Personalização</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Otimize e personalize seu currículo</h1><p className="mt-2 max-w-2xl text-muted-foreground">Escolha um layout compatível com ATS e ajuste seu conteúdo com uma visualização em tempo real.</p></div>
        </div>
        <div className="flex gap-2 sm:shrink-0"><Button variant="outline" onClick={downloadResume}><Download className="mr-2 size-4" />Exportar</Button><Button className="gradient-primary" onClick={saveResume}><Save className="mr-2 size-4" />Salvar alterações</Button></div>
      </div>

      <section className="surface-card p-6 md:p-8">
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
        <div className="surface-card p-6 md:p-8">
          <div className="flex items-start gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary"><Sparkles className="size-4" /></div><div><p className="text-sm font-medium text-primary">2. Edite seu conteúdo</p><h2 className="mt-1 text-xl font-semibold">Ajustes rápidos e reais</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Melhore a apresentação sem inventar experiências ou qualificações.</p></div></div>
          <div className="mt-6 space-y-5"><div className="space-y-2"><label htmlFor="resume-name" className="text-sm font-medium">Nome completo</label><Input id="resume-name" value={resume.personal_info.full_name} onChange={(event) => updateResume("full_name", event.target.value)} /></div><div className="space-y-2"><label htmlFor="resume-headline" className="text-sm font-medium">Título profissional</label><Input id="resume-headline" value={resume.personal_info.headline ?? ""} onChange={(event) => updateResume("headline", event.target.value)} /></div><div className="space-y-2"><label htmlFor="resume-summary" className="text-sm font-medium">Resumo profissional</label><Textarea id="resume-summary" value={resume.professional_summary} onChange={(event) => setResume((current) => ({ ...current, professional_summary: event.target.value }))} className="min-h-32 resize-y" /></div><div className="space-y-2"><label htmlFor="resume-skills" className="text-sm font-medium">Competências</label><Input id="resume-skills" value={skills} onChange={(event) => setSkills(event.target.value)} /><p className="text-xs text-muted-foreground">Separe cada competência por vírgula.</p></div></div>
        </div>
        <div className="surface-card overflow-hidden p-4 md:p-6"><div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-primary">Visualização ao vivo</p><p className="text-xs text-muted-foreground">Modelo {TEMPLATES.find((item) => item.id === template)?.name}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Compatível com ATS</span></div><div className="max-h-[760px] overflow-auto rounded-xl bg-muted/60 p-3 md:p-6"><ResumePreview resume={resume} template={template} /></div></div>
      </section>
    </div>
  );
}

