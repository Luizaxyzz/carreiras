import { useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, Mail, MessageSquareQuote, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCoverLetter, generateInterviewQuestions, generateLinkedinSuggestions } from "@/lib/ai.functions";
import type { InterviewPrep, LinkedinSuggestions } from "@/lib/matchcv-types";

type Tool = "letter" | "interview" | "linkedin";

export function ExtraTools({ analysisId }: { analysisId: string }) {
  const [busy, setBusy] = useState<Tool | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [prep, setPrep] = useState<InterviewPrep | null>(null);
  const [linkedin, setLinkedin] = useState<LinkedinSuggestions | null>(null);

  async function run(tool: Tool) {
    setBusy(tool);
    try {
      if (tool === "letter") setLetter((await generateCoverLetter({ data: { analysisId } })).letter);
      if (tool === "interview") setPrep(await generateInterviewQuestions({ data: { analysisId } }));
      if (tool === "linkedin") setLinkedin(await generateLinkedinSuggestions({ data: { analysisId } }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível gerar agora.");
    } finally {
      setBusy(null);
    }
  }

  function copy(text: string) {
    void navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência.");
  }

  return (
    <section className="surface-card p-6">
      <h2 className="font-semibold">Materiais para esta candidatura</h2>
      <p className="mt-1 text-sm text-muted-foreground">Gerados a partir das suas experiências reais e desta vaga.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Button variant="outline" disabled={busy !== null} onClick={() => void run("letter")}>
          {busy === "letter" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Mail className="mr-2 size-4" />}Carta de apresentação
        </Button>
        <Button variant="outline" disabled={busy !== null} onClick={() => void run("interview")}>
          {busy === "interview" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <MessageSquareQuote className="mr-2 size-4" />}Preparo para entrevista
        </Button>
        <Button variant="outline" disabled={busy !== null} onClick={() => void run("linkedin")}>
          {busy === "linkedin" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Linkedin className="mr-2 size-4" />}Sugestões de LinkedIn
        </Button>
      </div>

      {letter ? (
        <div className="mt-6 rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Carta de apresentação</h3>
            <Button size="sm" variant="ghost" onClick={() => copy(letter)}><Copy className="mr-2 size-3.5" />Copiar</Button>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{letter}</p>
        </div>
      ) : null}

      {prep ? (
        <div className="mt-6 space-y-4 rounded-2xl border border-border p-5">
          <h3 className="text-sm font-semibold">Preparo para entrevista</h3>
          {[["Perguntas técnicas", prep.technical_questions], ["Perguntas comportamentais", prep.behavioral_questions]].map(([title, list]) => (
            <div key={String(title)}>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">{String(title)}</p>
              <ul className="mt-2 space-y-3">
                {((list as InterviewPrep["technical_questions"]) ?? []).map((item) => (
                  <li key={item.question} className="text-sm leading-6">
                    <span className="font-medium">{item.question}</span>
                    <span className="mt-1 block text-muted-foreground">{item.suggested_answer}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {prep.topics_to_study?.length ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">Temas para estudar</p>
              <div className="mt-2 flex flex-wrap gap-2">{prep.topics_to_study.map((topic) => <span key={topic} className="rounded-full bg-muted px-3 py-1 text-xs">{topic}</span>)}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {linkedin ? (
        <div className="mt-6 space-y-4 rounded-2xl border border-border p-5">
          <h3 className="text-sm font-semibold">Sugestões para o LinkedIn</h3>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Títulos</p>
            <ul className="mt-2 space-y-2">{(linkedin.headline ?? []).map((item) => <li key={item} className="text-sm">{item}</li>)}</ul>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">Sobre</p>
              <Button size="sm" variant="ghost" onClick={() => copy(linkedin.about)}><Copy className="mr-2 size-3.5" />Copiar</Button>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{linkedin.about}</p>
          </div>
          {linkedin.skills?.length ? <div className="flex flex-wrap gap-2">{linkedin.skills.map((skill) => <span key={skill} className="rounded-full bg-muted px-3 py-1 text-xs">{skill}</span>)}</div> : null}
        </div>
      ) : null}
    </section>
  );
}
