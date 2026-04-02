import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  /** Accessible label for screen readers */
  label?: string;
  className?: string;
  barClassName?: string;
}

/**
 * Lightweight, native-CSS progress bar.
 * Intentionally avoids Radix/external library dependencies so it can be
 * rendered in any context without "use client" overhead.
 */
export function ProgressBar({ value, label, className, barClassName }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("bg-primary/10 h-1.5 w-full overflow-hidden rounded-full", className)}
    >
      <div
        className={cn(
          "h-full rounded-full bg-emerald-500 transition-all duration-500",
          barClassName
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
