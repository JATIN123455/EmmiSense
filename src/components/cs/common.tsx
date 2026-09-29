import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
}: {
  title: string;
  subtitle: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  unit,
  sub,
  icon: Icon,
  tone = "primary",
  tag,
  loading,
}: {
  label: string;
  value: string;
  unit?: string;
  sub: string;
  icon: LucideIcon;
  tone?: "primary" | "teal" | "muted" | "warning";
  tag?: ReactNode;
  loading?: boolean;
}) {
  const toneCls = {
    primary: "bg-accent text-primary",
    teal: "bg-secondary text-teal",
    muted: "bg-muted text-muted-foreground",
    warning: "bg-warning text-warning-foreground",
  }[tone];
  return (
    <Card className="shadow-card transition-colors hover:border-primary/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", toneCls)}>
            <Icon className="h-4.5 w-4.5" />
          </span>
          {tag}
        </div>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-28" />
        ) : (
          <p className="mt-1 font-display text-2xl font-bold tabular text-foreground">
            {value}
            {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

export function SectionCard({
  title,
  description,
  right,
  children,
  className,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("shadow-card", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="font-display text-base">{title}</CardTitle>
          {description && <CardDescription className="mt-1">{description}</CardDescription>}
        </div>
        {right}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label="More info" className="text-muted-foreground hover:text-foreground">
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-dashed bg-muted/60 px-3 py-2 font-mono text-xs text-muted-foreground">
      {children}
    </p>
  );
}

export const fmt = (n: number, d = 1) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtInt = (n: number) => Math.round(n).toLocaleString("en-IN");
