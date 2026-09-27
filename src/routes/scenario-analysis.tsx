import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, RotateCcw, Save, Sun, Factory, PlugZap, Sigma, Leaf, IndianRupee, Loader2, GitCompareArrows } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DemoBadge, KpiCard, PageHeader, SectionCard, fmt, fmtInt } from "@/components/cs/common";
import { runScenario, saveScenario } from "@/services/api";
import { APP_CONFIG } from "@/lib/config";
import type { ScenarioInput, ScenarioResult } from "@/services/types";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/scenario-analysis")({
  head: () => pageMeta("Scenario Analysis", "Compare operational scenarios and estimate their impact on renewable generation and carbon emissions."),
  component: ScenarioAnalysis,
});

const BASELINE_INPUT: ScenarioInput = {
  name: "Baseline",
  electricityKwh: 117000,
  solarCapacityKw: 100,
  solarKwh: 12480,
  fuelLitres: 6940,
  productionUnits: 5000,
  gridFactor: APP_CONFIG.factors.gridEmissionFactor,
  carbonPrice: APP_CONFIG.factors.carbonPricePerTonne,
};

const DEFAULT: ScenarioInput = { ...BASELINE_INPUT, name: "Rooftop expansion", solarCapacityKw: 250, solarKwh: 31200, fuelLitres: 4200 };

function num(v: string) {
  return Math.max(0, parseFloat(v) || 0);
}

function ScenarioAnalysis() {
  const qc = useQueryClient();
  const [form, setForm] = useState<ScenarioInput>(DEFAULT);
  const [result, setResult] = useState<{ base: ScenarioResult; scen: ScenarioResult; input: ScenarioInput } | null>(null);

  const run = useMutation({
    mutationFn: async (i: ScenarioInput) => {
      const [base, scen] = await Promise.all([runScenario({ ...BASELINE_INPUT, gridFactor: i.gridFactor, carbonPrice: i.carbonPrice }), runScenario(i)]);
      return { base, scen, input: i };
    },
    onSuccess: setResult,
    onError: () => toast.error("Scenario run failed."),
  });

  const save = useMutation({
    mutationFn: () => saveScenario(result!.input.name || "Untitled scenario", result!.scen),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["scenarios"] });
      toast.success(`Saved as ${s.id}`, { description: "Stored in demo session history." });
    },
  });

  const set = (k: keyof ScenarioInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: k === "name" ? e.target.value : num(e.target.value) }));

  const F = ({ k, label, unit }: { k: keyof ScenarioInput; label: string; unit: string }) => (
    <div className="space-y-1.5">
      <Label htmlFor={k} className="text-xs">{label}</Label>
      <div className="relative">
        <Input id={k} type="number" min={0} step="any" value={form[k] as number} onChange={set(k)} className="pr-16 tabular" />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-[11px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );

  const s = result?.scen;
  const b = result?.base;
  const rows = s && b
    ? [
        { metric: "Solar Generation", unit: "MWh", base: b.solarKwh / 1000, scen: s.solarKwh / 1000, good: "up" },
        { metric: "Scope 1", unit: "tCO₂e", base: b.scope1T, scen: s.scope1T, good: "down" },
        { metric: "Scope 2", unit: "tCO₂e", base: b.scope2T, scen: s.scope2T, good: "down" },
        { metric: "Total Emissions", unit: "tCO₂e", base: b.totalT, scen: s.totalT, good: "down" },
        { metric: "Avoided CO₂", unit: "tCO₂e", base: b.avoidedT, scen: s.avoidedT, good: "up" },
      ]
    : [];

  return (
    <>
      <PageHeader
        eyebrow="What-if Engine"
        title="Sustainability Scenario Analysis"
        subtitle="Compare operational scenarios and estimate their impact on renewable generation and carbon emissions."
        actions={<DemoBadge label="Demo Engine" />}
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <SectionCard title="Scenario Inputs" description="Baseline is fixed for comparison.">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              run.mutate(form);
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Scenario name</Label>
              <Input id="name" value={form.name} onChange={set("name")} />
            </div>
            <fieldset className="space-y-3">
              <legend className="mb-2 font-mono text-[11px] uppercase tracking-wider text-primary">Energy</legend>
              {F({ k: "electricityKwh", label: "Electricity Consumption", unit: "kWh" })}
              {F({ k: "solarCapacityKw", label: "Solar Capacity", unit: "kWp" })}
              {F({ k: "solarKwh", label: "Solar Generation", unit: "kWh" })}
            </fieldset>
            <fieldset className="space-y-3">
              <legend className="mb-2 font-mono text-[11px] uppercase tracking-wider text-primary">Operations</legend>
              {F({ k: "fuelLitres", label: "Fuel Consumption (diesel)", unit: "L" })}
              {F({ k: "productionUnits", label: "Production Volume", unit: "units" })}
            </fieldset>
            <fieldset className="space-y-3">
              <legend className="mb-2 font-mono text-[11px] uppercase tracking-wider text-primary">Assumptions</legend>
              {F({ k: "gridFactor", label: "Grid Emission Factor", unit: "kg/kWh" })}
              {F({ k: "carbonPrice", label: "Carbon Credit Price", unit: "₹/t" })}
            </fieldset>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={run.isPending}>
                {run.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run Scenario
              </Button>
              <Button type="button" variant="outline" onClick={() => { setForm(DEFAULT); setResult(null); }}>
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
          </form>
        </SectionCard>

        <div className="space-y-6">
          {!s || !b ? (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed bg-card p-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
                <GitCompareArrows className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display font-semibold">No scenario run yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Adjust the inputs and click <strong>Run Scenario</strong> to see the scenario summary and a comparison against the baseline.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Scenario Summary · {result.input.name}</h2>
                <Button variant="outline" size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
                  <Save className="h-4 w-4" /> Save scenario
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <KpiCard icon={Sun} label="Solar Generation" value={fmtInt(s.solarKwh)} unit="kWh" sub="Scenario input" />
                <KpiCard icon={Factory} tone="warning" label="Scope 1" value={fmt(s.scope1T, 2)} unit="tCO₂e" sub="Diesel combustion" />
                <KpiCard icon={PlugZap} tone="teal" label="Scope 2" value={fmt(s.scope2T, 2)} unit="tCO₂e" sub="Net grid import" />
                <KpiCard icon={Sigma} tone="muted" label="Total Emissions" value={fmt(s.totalT, 2)} unit="tCO₂e" sub={`${fmt(((s.totalT - b.totalT) / b.totalT) * 100)}% vs baseline`} />
                <KpiCard icon={Leaf} label="Avoided CO₂" value={fmt(s.avoidedT, 2)} unit="tCO₂e" sub="Solar displacement" />
                <KpiCard icon={IndianRupee} tone="muted" label="Indicative Carbon Value" value={`₹${fmtInt(s.indicativeValue)}`} sub="Indicative — not market value" />
              </div>

              <SectionCard title="Baseline vs Scenario" right={<DemoBadge />}>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(v: number) => v.toFixed(2)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="base" name="Baseline" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="scen" name="Scenario" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-right">Baseline</TableHead>
                      <TableHead className="text-right">Scenario</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => {
                      const d = r.scen - r.base;
                      const better = r.good === "up" ? d > 0 : d < 0;
                      return (
                        <TableRow key={r.metric}>
                          <TableCell className="font-medium">{r.metric} <span className="text-xs text-muted-foreground">({r.unit})</span></TableCell>
                          <TableCell className="text-right tabular">{fmt(r.base, 2)}</TableCell>
                          <TableCell className="text-right tabular">{fmt(r.scen, 2)}</TableCell>
                          <TableCell className={`text-right tabular ${d === 0 ? "text-muted-foreground" : better ? "text-primary" : "text-destructive"}`}>
                            {d > 0 ? "+" : ""}{fmt(d, 2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <p className="mt-3 text-xs text-muted-foreground">
                  Demo engine: Scope 2 uses net grid import (consumption − solar). Values are demo calculations until the backend is connected.{" "}
                  <Link to="/scenario-history" className="text-primary hover:underline">View history</Link>
                </p>
              </SectionCard>
            </>
          )}
        </div>
      </div>
    </>
  );
}
