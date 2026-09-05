import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

export function ScoreRing({
  value,
  size = 200,
  label = "COMPATIBILIDADE",
  className,
}: {
  value: number;
  size?: number;
  label?: string;
  className?: string;
}) {
  const animated = useCountUp(value);
  const stroke = size / 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--primary-glow)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--primary-soft)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * animated) / 100}
          style={{ transition: "stroke-dashoffset 120ms linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tracking-tight" style={{ fontSize: size / 4.4 }}>
          {animated}%
        </span>
        <span className="mt-1 text-[10px] font-medium tracking-[0.18em] text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export function ScoreBar({ label, value, suffix = "%" }: { label: string; value: number; suffix?: string }) {
  const animated = useCountUp(value, 900);
  return (
    <div className="surface-card p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-lg font-semibold">
          {animated}
          <span className="text-sm text-muted-foreground">{suffix}</span>
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-soft">
        <div
          className="h-full rounded-full gradient-primary transition-[width] duration-700 ease-out"
          style={{ width: `${animated}%` }}
        />
      </div>
    </div>
  );
}
