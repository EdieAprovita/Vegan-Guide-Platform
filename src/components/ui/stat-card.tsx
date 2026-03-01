import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

interface StatCardProps {
  /** Card label / metric name */
  label: string;
  /** Formatted display value (e.g. toLocaleString result or "--") */
  value: string;
  /**
   * Trend percentage relative to the previous period.
   * Pass `null` or `undefined` when unavailable — no badge is rendered.
   */
  trend?: number | null;
  /** Lucide icon shown in the header */
  icon: LucideIcon;
  /**
   * 0–100 progress value used to render the mini bar.
   * If omitted the bar is hidden.
   */
  progress?: number;
  /** Additional class names applied to the outer Card element */
  className?: string;
}

/**
 * Reusable stat card for analytics dashboards.
 *
 * Renders:
 * - An icon + label header
 * - The primary metric value in large bold text
 * - An optional color-coded trend badge (green = positive, red = negative)
 * - An optional mini progress bar showing relative value
 */
export function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  progress,
  className,
}: StatCardProps) {
  const hasTrend = trend !== null && trend !== undefined;
  const isPositive = hasTrend && (trend as number) >= 0;

  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" aria-hidden="true" />
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Primary value */}
        <p className="text-2xl font-bold tracking-tight">{value}</p>

        {/* Trend indicator */}
        {hasTrend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isPositive ? "text-emerald-600" : "text-red-600",
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {(trend as number).toFixed(1)}% vs last period
            </span>
          </div>
        )}

        {/* Mini progress bar */}
        {progress !== undefined && (
          <ProgressBar
            value={progress}
            label={`${label} progress`}
            className="mt-1"
          />
        )}
      </CardContent>
    </Card>
  );
}
