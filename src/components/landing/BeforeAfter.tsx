import { motion } from "motion/react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useCountUp } from "@/components/app/ScoreRing";

function Metric({ label, value, suffix = "", tone }: { label: string; value: number; suffix?: string; tone: "before" | "after" }) {
  const animated = useCountUp(value, 1400);
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-4xl font-semibold tracking-tight ${tone === "after" ? "text-gradient" : "text-muted-foreground"}`}>
        {animated}
        {suffix}
      </p>
    </div>
  );
}

export function BeforeAfter({
  before = { ats: 54, compat: 48 },
  after = { ats: 93, compat: 89 },
  message = "Seu currículo foi otimizado para destacar as experiências mais relevantes para esta vaga.",
}: {
  before?: { ats: number; compat: number };
  after?: { ats: number; compat: number };
  message?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="surface-card overflow-hidden"
    >
      <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">ANTES</p>
          <div className="mt-4 flex gap-10">
            <Metric label="Score ATS" value={before.ats} tone="before" />
            <Metric label="Compatibilidade" value={before.compat} suffix="%" tone="before" />
          </div>
        </div>

        <div className="mx-auto flex size-12 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-glow">
          <ArrowRight className="size-5" />
        </div>

        <div className="rounded-2xl border border-primary/30 bg-primary-soft/40 p-6">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-primary">DEPOIS</p>
          <div className="mt-4 flex gap-10">
            <Metric label="Score ATS" value={after.ats} tone="after" />
            <Metric label="Compatibilidade" value={after.compat} suffix="%" tone="after" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border bg-background px-6 py-4 sm:px-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
          <TrendingUp className="size-3.5" /> +{after.ats - before.ats} pontos ATS
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
          +{after.compat - before.compat}% de compatibilidade
        </span>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </motion.div>
  );
}
