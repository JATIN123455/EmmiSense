import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Cpu } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DemoBadge, InfoTip, PageHeader, SectionCard } from "@/components/cs/common";
import { ForecastChart } from "@/components/cs/ForecastChart";
import { getModelMetrics, getSolarForecast } from "@/services/api";
import { APP_CONFIG } from "@/lib/config";
import type { ForecastRange } from "@/services/types";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/solar-forecast")({
  head: () => pageMeta("Solar Forecast", "Machine-learning-based solar power prediction using historical generation and weather features."),
  component: SolarForecast,
});

function SolarForecast() {
  const [range, setRange] = useState<ForecastRange>("7d");
  const forecast = useQuery({ queryKey: ["forecast", range], queryFn: () => getSolarForecast(range) });
  const metrics = useQuery({ queryKey: ["model-metrics"], queryFn: getModelMetrics });
  const rows = forecast.data ? [...forecast.data].filter((p) => p.actual > 0).reverse().slice(0, 24) : [];

  return (
    <>
      <PageHeader
        eyebrow="Forecasting"
        title="Solar Generation Forecast"
        subtitle="Machine-learning-based solar power prediction using historical generation and weather features."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Model Information" right={<Cpu className="h-4 w-4 text-primary" />}>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Model</p>
          <p className="font-display text-lg font-bold">{APP_CONFIG.model.name}</p>
          <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">Input features</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {APP_CONFIG.model.features.map((f) => (
              <Badge key={f} variant="secondary" className="font-normal">{f}</Badge>
            ))}
          </div>
        </SectionCard>

        <SectionCard className="lg:col-span-2" title="Evaluation Metrics" description="Computed on the held-out test set by the Python backend.">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["MAE", "Mean Absolute Error (kW)", metrics.data?.mae],
              ["RMSE", "Root Mean Squared Error (kW)", metrics.data?.rmse],
              ["R²", "Coefficient of determination", metrics.data?.r2],
            ].map(([k, d, v]) => (
              <div key={k as string} className="rounded-lg border border-dashed p-4">
                <div className="flex items-center gap-1.5">
                  <p className="font-mono text-sm font-semibold">{k as string}</p>
                  <InfoTip text={d as string} />
                </div>
                {metrics.isLoading ? (
                  <Skeleton className="mt-2 h-6 w-24" />
                ) : v == null ? (
                  <p className="mt-2 text-sm font-medium text-muted-foreground">Awaiting trained model</p>
                ) : (
                  <p className="mt-2 font-display text-xl font-bold">{(v as number).toFixed(3)} <DemoBadge label="Demo Metric" /></p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No metric values are shown until the trained model reports them. Configure in the app settings or connect the backend.
          </p>
        </SectionCard>
      </div>

      <SectionCard
        className="mt-6"
        title="Actual vs Predicted Solar Power"
        right={
          <div className="flex items-center gap-2">
            <DemoBadge />
            <Tabs value={range} onValueChange={(v) => setRange(v as ForecastRange)}>
              <TabsList>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="7d">7 Days</TabsTrigger>
                <TabsTrigger value="30d">30 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        }
      >
        {forecast.data ? <ForecastChart data={forecast.data} height={360} /> : <Skeleton className="h-[360px] w-full" />}
      </SectionCard>

      <SectionCard className="mt-6" title="Forecast Records" description="Most recent 24 daylight records" right={<DemoBadge />}>
        <div className="max-h-96 overflow-auto rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-muted">
              <TableRow>
                <TableHead>Timestamp (UTC)</TableHead>
                <TableHead className="text-right">Actual Power (kW)</TableHead>
                <TableHead className="text-right">Predicted Power (kW)</TableHead>
                <TableHead className="text-right">Residual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.timestamp}>
                  <TableCell className="font-mono text-xs">{r.timestamp.slice(0, 16).replace("T", " ")}</TableCell>
                  <TableCell className="text-right tabular">{r.actual.toFixed(1)}</TableCell>
                  <TableCell className="text-right tabular">{r.predicted.toFixed(1)}</TableCell>
                  <TableCell className="text-right tabular text-muted-foreground">{(r.actual - r.predicted).toFixed(1)}</TableCell>
                </TableRow>
              ))}
              {!forecast.data && (
                <TableRow>
                  <TableCell colSpan={4}><Skeleton className="h-24 w-full" /></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </>
  );
}
