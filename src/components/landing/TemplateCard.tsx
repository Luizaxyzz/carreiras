import { Check, Eye } from "lucide-react";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { SAMPLE_RESUME } from "@/lib/sample-resume";
import type { StructuredResume } from "@/lib/matchcv-types";
import { cn } from "@/lib/utils";

export function TemplateThumb({
  template,
  resume,
}: {
  template: string;
  resume?: StructuredResume | undefined;
}) {
  return (
    <div className="pointer-events-none aspect-[210/297] w-full overflow-hidden rounded-xl border border-border bg-white">
      <div className="origin-top-left scale-[0.42] sm:scale-[0.38]" style={{ width: "238%" }}>
        <ResumePreview resume={resume ?? SAMPLE_RESUME} template={template} />
      </div>
    </div>
  );
}

export function TemplateCard({
  id,
  name,
  description,
  selected,
  onSelect,
  resume,
}: {
  id: string;
  name: string;
  description: string;
  selected?: boolean;
  onSelect?: (id: string) => void;
  resume?: StructuredResume;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(id)}
      className={cn(
        "group relative w-full rounded-2xl border bg-surface p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-card",
        selected ? "border-primary ring-2 ring-primary/30" : "border-border",
      )}
    >
      <div className="relative overflow-hidden rounded-xl">
        <TemplateThumb template={id} resume={resume} />
        <div className="absolute inset-0 hidden items-center justify-center rounded-xl bg-primary-ink/50 backdrop-blur-[1px] group-hover:flex">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-semibold">
            <Eye className="size-3.5" /> Visualizar
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-2 px-1 pb-1">
        <div>
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {selected ? (
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full gradient-primary text-primary-foreground">
            <Check className="size-3.5" />
          </span>
        ) : null}
      </div>
    </button>
  );
}
