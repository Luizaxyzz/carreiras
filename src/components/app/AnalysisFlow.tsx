import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardPaste,
  FileText,
  FileUp,
  Loader2,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScoreBar, ScoreRing } from "@/components/app/ScoreRing";
import { analyzeApplication } from "@/lib/ai.functions";
import type { AnalysisResult } from "@/lib/matchcv-types";
import { extractTextFromFile } from "@/lib/extract-text";
import { ExtraTools } from "@/components/app/ExtraTools";

const LOADING_STEPS = [
  "Lendo seu currículo...",
  "Identificando suas experiências...",
  "Analisando requisitos da vaga...",
  "Comparando competências...",
  "Verificando palavras-chave ATS...",
  "Calculando compatibilidade...",
  "Preparando recomendações...",
];

type Phase = "input" | "loading" | "result";
type JobMode = "description" | "url";

export function AnalysisFlow() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("input");
  const [jobMode, setJobMode] = useState<JobMode>("description");
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<{ analysisId: string; analysis: AnalysisResult } | null>(null);

  async function selectFile(nextFile: File | undefined) {
    if (!nextFile) return;
    if (!/\.(pdf|docx)$/i.test(nextFile.name)) {
      toast.error("Envie um arquivo PDF ou DOCX.");
      return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      toast.error("O currículo deve ter no máximo 10 MB.");
      return;
    }
    try {
      const text = await extractTextFromFile(nextFile);
      if (text.length < 30) throw new Error("Não conseguimos extrair texto suficiente desse arquivo.");
      setFile(nextFile);
      setResumeText(text);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível ler o currículo.");
    }
  }

  async function handleAnalyze(event: React.FormEvent) {
    event.preventDefault();
    if (!file || !resumeText) {
      toast.error("Envie seu currículo antes de continuar.");
      return;
    }
    if (jobMode === "description" && jobDescription.trim().length < 20) {
      toast.error("Cole uma descrição de vaga com pelo menos 20 caracteres.");
      return;
    }
    if (jobMode === "url" && jobUrl.trim().length < 10) {
      toast.error("Informe o link da vaga.");
      return;
    }

    setPhase("loading");
    setLoadingStep(0);
    const timer = window.setInterval(() => setLoadingStep((current) => Math.min(current + 1, LOADING_STEPS.length - 1)), 1250);
    try {
      const response = await analyzeApplication({
        data: {
          resumeText,
          jobDescription: jobMode === "description" ? jobDescription : `Link da vaga: ${jobUrl}`,
          jobUrl: jobMode === "url" ? jobUrl : undefined,
        },
      });
      setResult(response);
      setPhase("result");
    } catch (error) {
      setPhase("input");
      toast.error(error instanceof Error ? error.message : "Não foi possível analisar agora.");
    } finally {
      window.clearInterval(timer);
    }
  }

  if (phase === "loading") return <AnalysisLoading step={loadingStep} />;
  if (phase === "result" && result) return <AnalysisResultView result={result} />;

  return (
    <form onSubmit={handleAnalyze} className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {["Currículo", "Vaga", "Resultado"].map((step, index) => (
          <div key={step} className="flex items-center gap-3 text-sm">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{index + 1}</span>
            <span className={index === 0 ? "font-semibold" : "text-muted-foreground"}>{step}</span>
            {index < 2 ? <span className="hidden h-px flex-1 bg-border sm:block" /> : null}
          </div>
        ))}
      </div>

      <section className="surface-card p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><FileText className="size-5" /></div>
          <div><h2 className="text-lg font-semibold">1. Envie seu currículo</h2><p className="mt-1 text-sm text-muted-foreground">Usaremos apenas as informações reais que você enviar.</p></div>
        </div>
        <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(event) => selectFile(event.target.files?.[0])} />
        {file ? (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary-soft/50 p-4">
            <div className="flex min-w-0 items-center gap-3"><CheckCircle2 className="size-5 shrink-0 text-primary" /><div className="min-w-0"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">Texto extraído e pronto para análise</p></div></div>
            <button type="button" className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground" onClick={() => { setFile(null); setResumeText(""); }} aria-label="Remover currículo"><X className="size-4" /></button>
          </div>
        ) : (
          <button type="button" className={`mt-6 flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition-colors ${dragging ? "border-primary bg-primary-soft/50" : "border-border hover:border-primary/50 hover:bg-accent/40"}`} onClick={() => fileInputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); void selectFile(event.dataTransfer.files[0]); }}><FileUp className="size-8 text-primary" /><span className="mt-3 text-sm font-medium">Arraste seu currículo ou clique para selecionar</span><span className="mt-1 text-xs text-muted-foreground">PDF ou DOCX · até 10 MB</span></button>
        )}
      </section>

      <section className="surface-card p-6 md:p-8">
        <div className="flex items-start gap-4"><div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><Target className="size-5" /></div><div><h2 className="text-lg font-semibold">2. Informe a vaga</h2><p className="mt-1 text-sm text-muted-foreground">Quanto mais completa a descrição, mais útil será o resultado.</p></div></div>
        <div className="mt-6 inline-flex rounded-xl bg-muted p-1"><button type="button" className={`rounded-lg px-3 py-2 text-xs font-medium ${jobMode === "description" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`} onClick={() => setJobMode("description")}><ClipboardPaste className="mr-1.5 inline size-3.5" />Colar descrição</button><button type="button" className={`rounded-lg px-3 py-2 text-xs font-medium ${jobMode === "url" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`} onClick={() => setJobMode("url")}><ArrowRight className="mr-1.5 inline size-3.5" />Colar link</button></div>
        {jobMode === "description" ? <Textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} className="mt-4 min-h-48 resize-y" placeholder="Cole aqui a descrição completa da vaga, incluindo requisitos, qualificações e diferenciais..." /> : <div className="mt-4 space-y-2"><label htmlFor="job-url" className="text-sm font-medium">Link da vaga</label><Input id="job-url" type="url" value={jobUrl} onChange={(event) => setJobUrl(event.target.value)} placeholder="https://empresa.com/vaga" /><p className="text-xs text-muted-foreground">A análise por link será preparada para uma futura leitura automática da página.</p></div>}
      </section>

      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/20 bg-primary-soft/40 p-5 sm:flex-row sm:items-center"><div className="flex gap-3"><Sparkles className="mt-0.5 size-5 shrink-0 text-primary" /><p className="text-sm leading-6">A análise compara seu currículo com a vaga sem inventar experiências ou qualificações.</p></div><Button type="submit" size="lg" className="w-full shrink-0 gradient-primary sm:w-auto">Analisar compatibilidade <ArrowRight className="size-4" /></Button></div>
    </form>
  );
}

function AnalysisLoading({ step }: { step: number }) {
  const progress = ((step + 1) / LOADING_STEPS.length) * 100;
  return <div className="mx-auto max-w-2xl py-12 text-center"><div className="mx-auto flex size-20 items-center justify-center rounded-3xl gradient-primary text-primary-foreground shadow-glow"><Sparkles className="size-9 animate-pulse" /></div><p className="mt-8 text-sm font-medium text-primary">Análise em andamento</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Estamos entendendo seu perfil.</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Em poucos instantes você verá o que já está forte e o que pode melhorar.</p><div className="mt-10 surface-card p-6 text-left"><div className="mb-5 flex items-center justify-between text-xs text-muted-foreground"><span>{Math.round(progress)}% concluído</span><Loader2 className="size-4 animate-spin text-primary" /></div><div className="h-2 overflow-hidden rounded-full bg-primary-soft"><div className="h-full rounded-full gradient-primary transition-all duration-700" style={{ width: `${progress}%` }} /></div><div className="mt-6 space-y-3">{LOADING_STEPS.map((label, index) => <div key={label} className={`flex items-center gap-3 text-sm ${index > step ? "text-muted-foreground/50" : "text-foreground"}`}>{index < step ? <Check className="size-4 text-primary" /> : index === step ? <Loader2 className="size-4 animate-spin text-primary" /> : <span className="size-4 rounded-full border border-border" />}{label}</div>)}</div></div></div>;
}

function AnalysisResultView({ result }: { result: { analysisId: string; analysis: AnalysisResult } }) {
  const analysis = result.analysis;
  const statusIcon = { atendido: <Check className="size-4" />, parcial: <AlertCircle className="size-4" />, ausente: <X className="size-4" /> };
  return <div className="space-y-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-primary">Resultado da análise</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Seu resultado para esta vaga</h1><p className="mt-2 text-muted-foreground">{analysis.job?.job_title || "Vaga analisada"}{analysis.job?.company ? ` · ${analysis.job.company}` : ""}</p></div><Button type="button" className="gradient-primary" onClick={() => window.location.reload()}>Nova análise</Button></div><section className="grid gap-6 rounded-3xl gradient-deep p-6 text-primary-foreground shadow-glow md:grid-cols-[auto_1fr] md:items-center md:p-8"><ScoreRing value={analysis.scores.compatibility} label="COMPATIBILIDADE" className="mx-auto" /><div><p className="text-sm text-white/70">O score representa o nível estimado de compatibilidade entre seu currículo e os requisitos identificados na vaga.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><ScoreBar label="ATS Score" value={analysis.scores.ats} /><ScoreBar label="Experiência" value={analysis.scores.experience} /></div></div></section><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Hard skills", analysis.scores.hard_skills], ["Formação", analysis.scores.education], ["Palavras-chave", analysis.scores.keywords], ["Diferenciais", analysis.scores.differentials]].map(([label, value]) => <ScoreBar key={label} label={String(label)} value={Number(value)} />)}</section><div className="grid gap-6 lg:grid-cols-2"><section className="surface-card p-6"><h2 className="font-semibold">Como você atende aos requisitos</h2><div className="mt-5 space-y-3">{analysis.requirements.length ? analysis.requirements.map((item) => <div key={`${item.type}-${item.requirement}`} className="flex gap-3 rounded-xl border border-border p-3"><span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${item.status === "atendido" ? "bg-emerald-100 text-emerald-700" : item.status === "parcial" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{statusIcon[item.status]}</span><div><p className="text-sm font-medium">{item.requirement}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.evidence}</p></div></div>) : <p className="text-sm text-muted-foreground">Nenhum requisito estruturado foi retornado.</p>}</div></section><section className="surface-card p-6"><h2 className="font-semibold">Palavras-chave importantes</h2><p className="mt-1 text-sm text-muted-foreground">Encontradas e ausentes no seu currículo.</p><div className="mt-5 flex flex-wrap gap-2">{analysis.keywords_found.map((keyword) => <span key={`found-${keyword}`} className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">{keyword} ✓</span>)}{analysis.keywords_missing.map((keyword) => <span key={`missing-${keyword}`} className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">{keyword} · ausente</span>)}</div></section><section className="surface-card p-6"><h2 className="font-semibold">O que já está ajudando</h2><ul className="mt-4 space-y-3">{analysis.strengths.map((item) => <li key={item} className="flex gap-2 text-sm leading-6"><Check className="mt-1 size-4 shrink-0 text-emerald-600" />{item}</li>)}</ul></section><section className="surface-card p-6"><h2 className="font-semibold">Pontos de atenção</h2><ul className="mt-4 space-y-3">{analysis.attention_points.map((item) => <li key={item} className="flex gap-2 text-sm leading-6"><AlertCircle className="mt-1 size-4 shrink-0 text-amber-600" />{item}</li>)}</ul></section></div><section className="rounded-3xl border border-primary/20 bg-primary-soft/40 p-6 md:flex md:items-center md:justify-between md:gap-6"><div><h2 className="text-lg font-semibold">Pronto para melhorar seu currículo?</h2><p className="mt-1 text-sm text-muted-foreground">A IA irá adaptar seu currículo usando somente suas experiências e qualificações reais.</p></div><Button asChild className="mt-4 gradient-primary md:mt-0"><Link to="/app/modelos" search={{ analysisId: result.analysisId }}>Gerar currículo otimizado <ArrowRight className="size-4" /></Link></Button></section><ExtraTools analysisId={result.analysisId} /></div>;
}
