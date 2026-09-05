import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, AlertTriangle, Sparkles, FileText } from "lucide-react";
import { ScoreRing } from "@/components/app/ScoreRing";

const TAGS = [
  { label: "Python", ok: true },
  { label: "Git", ok: true },
  { label: "REST APIs", ok: true },
  { label: "Angular", ok: false },
  { label: "FastAPI", ok: false },
];

const LINES = [
  "Lendo seu currículo...",
  "Analisando requisitos da vaga...",
  "Verificando palavras-chave ATS...",
  "Calculando compatibilidade...",
];

export function HeroDemo() {
  const [line, setLine] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setLine((v) => (v + 1) % LINES.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary-soft/70 blur-2xl" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="surface-card overflow-hidden shadow-card"
      >
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <Sparkles className="size-4 text-primary" />
          <motion.span key={line} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground">
            {LINES[line]}
          </motion.span>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">CURRÍCULO</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <FileText className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Maria Silva</p>
                <p className="text-xs text-muted-foreground">Desenvolvedora de Software</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[92, 76, 64, 84].map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ width: 0 }}
                  animate={{ width: `${w}%` }}
                  transition={{ delay: 0.3 + i * 0.12, duration: 0.8 }}
                  className="h-2 rounded-full bg-muted"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-background p-4">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">COMPATIBILIDADE</p>
            <ScoreRing value={87} size={132} label="ATS SCORE" className="mt-2" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border px-5 py-4">
          {TAGS.map((tag, i) => (
            <motion.span
              key={tag.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.12 }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                tag.ok ? "bg-success-soft text-success" : "bg-warning-soft text-warning-foreground"
              }`}
            >
              {tag.ok ? <Check className="size-3" /> : <AlertTriangle className="size-3" />}
              {tag.label}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
