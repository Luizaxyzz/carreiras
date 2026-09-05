import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-glow",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.1">
        <path d="M4 19V6.2A1.2 1.2 0 0 1 5.2 5H14l5 5v9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 16.5 10.7 12l2.6 3 2.7-4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link to={to} className={cn("group inline-flex items-center gap-2.5", className)}>
      <LogoMark className="transition-transform duration-300 group-hover:scale-105" />
      <span className="text-[17px] font-semibold tracking-tight">
        MatchCV<span className="text-primary"> AI</span>
      </span>
    </Link>
  );
}
