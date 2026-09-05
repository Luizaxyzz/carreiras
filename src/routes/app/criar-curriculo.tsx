import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, FilePenLine, FileUp, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { buildResume } from "@/lib/ai.functions";
import { extractTextFromFile } from "@/lib/extract-text";

export const Route = createFileRoute("/app/criar-curriculo")({ component: ResumeBuilderPage });

function ResumeBuilderPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profileText, setProfileText] = useState("");
  const [oldResumeText, setOldResumeText] = useState("");
  const [changeRequest, setChangeRequest] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadOldResume(file?: File) {
    if (!file) return;
    if (!/\.(pdf|docx)$/i.test(file.name)) { toast.error("Envie um currículo em PDF ou DOCX."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("O arquivo deve ter no máximo 10 MB."); return; }
    try {
      const text = await extractTextFromFile(file);
      if (text.trim().length < 30) throw new Error("Não conseguimos extrair informações suficientes do arquivo.");
      setOldResumeText(text);
      setFileName(file.name);
      toast.success("Currículo antigo lido com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível ler o currículo antigo.");
    }
  }

  async function generate() {
    if (`${profileText} ${oldResumeText}`.trim().length < 30) {
      toast.error("Envie seu currículo antigo ou conte um pouco mais sobre seu perfil.");
      return;
    }
    setLoading(true);
    try {
      const response = await buildResume({ data: { profileText, oldResumeText, changeRequest } });
      window.sessionStorage.setItem("matchcv-builder-resume", JSON.stringify(response.resume));
      toast.success("Seu novo currículo foi criado. Agora escolha o modelo e personalize.");
      await navigate({ to: "/app/modelos", search: { builder: "1" } as any });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar o currículo agora.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="mx-auto max-w-4xl space-y-8">
    <div className="flex items-start gap-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><FilePenLine className="size-5" /></div>
      <div><p className="text-sm font-medium text-primary">Currículo com IA</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Crie ou atualize seu currículo</h1><p className="mt-2 max-w-2xl text-muted-foreground">Use seu currículo antigo como base, acrescente informações novas e diga exatamente o que quer mudar. A IA reorganiza tudo em um currículo profissional e compatível com ATS.</p></div>
    </div>

    <section className="surface-card p-6 md:p-8">
      <div className="flex gap-3"><FileUp className="mt-1 size-5 shrink-0 text-primary" /><div><h2 className="font-semibold">1. Envie seu currículo antigo</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Opcional, mas recomendado. A IA usa o PDF/DOCX para recuperar experiências, formação, cursos, contato e demais informações já existentes.</p></div></div>
      <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => void loadOldResume(e.target.files?.[0])} />
      {fileName ? <div className="mt-5 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary-soft/50 p-4"><div className="flex items-center gap-3"><CheckCircle2 className="size-5 text-primary" /><div><p className="text-sm font-medium">{fileName}</p><p className="text-xs text-muted-foreground">Informações extraídas e prontas para a IA</p></div></div><button type="button" className="rounded-lg p-2 text-muted-foreground hover:bg-background" onClick={() => { setFileName(""); setOldResumeText(""); }} aria-label="Remover currículo antigo"><X className="size-4" /></button></div> : <button type="button" className={`mt-5 flex min-h-36 w-full flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition-colors ${dragging ? "border-primary bg-primary-soft/50" : "border-border hover:border-primary/50 hover:bg-accent/40"}`} onClick={() => fileRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); void loadOldResume(e.dataTransfer.files[0]); }}><FileUp className="size-7 text-primary" /><span className="mt-3 text-sm font-medium">Arraste seu currículo antigo ou clique para selecionar</span><span className="mt-1 text-xs text-muted-foreground">PDF ou DOCX · até 10 MB</span></button>}
    </section>

    <section className="surface-card p-6 md:p-8">
      <div className="flex gap-3"><Sparkles className="mt-1 size-5 shrink-0 text-primary" /><div><h2 className="font-semibold">2. Adicione informações novas</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Inclua o que não estava no currículo antigo: cursos novos, faculdade, estágio, empregos, projetos, ferramentas, certificados, idiomas, resultados e links.</p></div></div>
      <Textarea value={profileText} onChange={(e) => setProfileText(e.target.value)} className="mt-5 min-h-64 resize-y" placeholder={'Exemplo:\nNovo estágio na empresa X...\nCurso de Python...\nProjeto com Power BI...\nInglês intermediário...'} />
    </section>

    <section className="surface-card p-6 md:p-8">
      <div><h2 className="font-semibold">3. O que você quer mudar no novo currículo?</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Escreva em linguagem normal. Por exemplo: “quero focar em tecnologia”, “deixe mais curto”, “destaque meus cursos”, “retire meu emprego antigo”, “quero um perfil mais executivo”.</p></div>
      <Textarea value={changeRequest} onChange={(e) => setChangeRequest(e.target.value)} className="mt-5 min-h-40 resize-y" placeholder="Quero que o novo currículo..." />
      <div className="mt-5 rounded-xl bg-primary-soft/50 p-4 text-sm leading-6 text-muted-foreground"><strong className="text-foreground">A IA vai reconstruir o currículo, não apenas copiar o antigo.</strong> Ela cria objetivo, resumo profissional, experiências melhor escritas, competências técnicas, habilidades e diferenciais, formação, cursos e projetos a partir das informações fornecidas.</div>
      <Button type="button" size="lg" className="mt-6 w-full gradient-primary sm:w-auto" onClick={() => void generate()} disabled={loading}>{loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}{loading ? "Criando seu novo currículo..." : "Criar novo currículo com IA"}</Button>
    </section>
  </div>;
}
