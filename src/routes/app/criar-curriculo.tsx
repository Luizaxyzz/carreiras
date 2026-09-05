import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FilePenLine, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { buildResume } from "@/lib/ai.functions";

export const Route = createFileRoute("/app/criar-curriculo")({ component: ResumeBuilderPage });

function ResumeBuilderPage() {
  const navigate = useNavigate();
  const [profileText, setProfileText] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (profileText.trim().length < 30) { toast.error("Conte um pouco mais sobre seu perfil para a IA montar o currículo."); return; }
    setLoading(true);
    try {
      const response = await buildResume({ data: { profileText } });
      window.sessionStorage.setItem("matchcv-builder-resume", JSON.stringify(response.resume));
      toast.success("Seu currículo foi criado. Agora escolha o modelo e personalize.");
      await navigate({ to: "/app/modelos", search: { builder: "1" } as any });
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível criar o currículo agora."); }
    finally { setLoading(false); }
  }

  return <div className="mx-auto max-w-4xl space-y-8">
    <div className="flex items-start gap-4"><div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><FilePenLine className="size-5" /></div><div><p className="text-sm font-medium text-primary">Currículo com IA</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Crie ou atualize seu currículo</h1><p className="mt-2 max-w-2xl text-muted-foreground">Sem vaga específica. Conte sua trajetória e a IA organiza tudo em um currículo profissional e compatível com ATS.</p></div></div>
    <section className="surface-card p-6 md:p-8"><div className="flex gap-3"><Sparkles className="mt-1 size-5 shrink-0 text-primary" /><div><h2 className="font-semibold">Coloque todas as suas informações</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Pode escrever do seu jeito. Inclua nome, contato, objetivo ou área, experiências, estágios, formação, cursos, certificações, projetos, ferramentas, habilidades, idiomas e links. A IA fará a organização e a escrita profissional.</p></div></div><Textarea value={profileText} onChange={(e) => setProfileText(e.target.value)} className="mt-6 min-h-96 resize-y" placeholder={'Exemplo:\nNome e contato...\n\nExperiências / estágios...\n\nFaculdade e cursos...\n\nProjetos...\n\nFerramentas e habilidades...\n\nIdiomas...'} /><div className="mt-5 rounded-xl bg-primary-soft/50 p-4 text-sm leading-6 text-muted-foreground"><strong className="text-foreground">Você não precisa formatar nada.</strong> A IA transforma suas informações em resumo profissional, experiências com bullets, formação, cursos, projetos e competências, sem inventar qualificações.</div><Button type="button" size="lg" className="mt-6 w-full gradient-primary sm:w-auto" onClick={() => void generate()} disabled={loading}>{loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}{loading ? "Criando seu currículo..." : "Criar currículo com IA"}</Button></section>
  </div>;
}
