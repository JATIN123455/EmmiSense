import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PlugZap, Fuel, Sun, IndianRupee, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemoBadge, Formula, PageHeader, SectionCard, fmt, fmtInt } from "@/components/cs/common";
import { APP_CONFIG } from "@/lib/config";
import { calculateCarbon } from "@/services/api";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/carbon-calculator")({
  head: () => pageMeta("Carbon Calculator", "Estimate Scope 1, Scope 2 and avoided emissions from operational scenarios."),
  component: CarbonCalculator,
});

function Field({ id, label, value, onChange, unit }: { id: string; label: string; value: number; onChange: (n: number) => void; unit?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <div className="relative">
        <Input id={id} type="number" min={0} step="any" value={Number.isFinite(value) ? value : ""} onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))} className="pr-20 tabular" />
        {unit && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-[11px] text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

function Result({ label, kg }: { label: string; kg: number }) {
  return (
    <div className="rounded-lg bg-soft p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tabular">{fmt(kg / 1000, 2)} <span className="text-sm font-medium text-muted-foreground">tCO₂e</span></p>
      <p className="font-mono text-xs text-muted-foreground">{fmtInt(kg)} kg CO₂e</p>
    </div>
  );
}

function CarbonCalculator() {
  const f = APP_CONFIG.factors;
  const [elec, setElec] = useState(104500);
  const [grid, setGrid] = useState(f.gridEmissionFactor);
  const [fuelType, setFuelType] = useState("Diesel");
  const [fuel, setFuel] = useState(6940);
  const [fuelFactor, setFuelFactor] = useState(f.fuel.Diesel.factor);
  const [solar, setSolar] = useState(12480);
  const [solarGrid, setSolarGrid] = useState(f.gridEmissionFactor);
  const [price, setPrice] = useState(f.carbonPricePerTonne);

  const main = calculateCarbon({ electricityKwh: elec, gridFactor: grid, fuelLitres: fuel, fuelFactor, solarKwh: 0, carbonPrice: price });
  const avoidedKg = solar * solarGrid;
  const [avoidedOverride, setAvoidedOverride] = useState<number | null>(null);
  const avoidedT = avoidedOverride ?? +(avoidedKg / 1000).toFixed(3);

  return (
    <>
      <PageHeader
        eyebrow="Carbon Engine"
        title="Carbon Emissions Calculator"
        subtitle="Estimate Scope 1, Scope 2 and avoided emissions from operational scenarios."
        actions={<DemoBadge label="Demo Emission Factors" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="A · Electricity" description="Scope 2 — purchased electricity" right={<PlugZap className="h-4 w-4 text-teal" />}>
          <div className="space-y-4">
            <Field id="elec" label="Electricity Consumption" unit="kWh" value={elec} onChange={setElec} />
            <Field id="grid" label="Grid Emission Factor" unit="kg/kWh" value={grid} onChange={setGrid} />
            <Formula>Scope 2 = Electricity × Grid EF</Formula>
            <Result label="Estimated Scope 2 Emissions" kg={main.scope2Kg} />
          </div>
        </SectionCard>

        <SectionCard title="B · Fuel" description="Scope 1 — direct combustion" right={<Fuel className="h-4 w-4 text-warning-foreground" />}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Fuel Type</Label>
              <Select
                value={fuelType}
                onValueChange={(v) => {
                  setFuelType(v);
                  setFuelFactor(f.fuel[v].factor);
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(f.fuel).map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Field id="fuel" label="Fuel Consumption" unit={f.fuel[fuelType].unit} value={fuel} onChange={setFuel} />
            <Field id="ff" label="Emission Factor" unit={`kg/${f.fuel[fuelType].unit}`} value={fuelFactor} onChange={setFuelFactor} />
            <Formula>Scope 1 = Fuel × Emission Factor</Formula>
            <Result label="Estimated Scope 1 Emissions" kg={main.scope1Kg} />
          </div>
        </SectionCard>

        <SectionCard title="C · Renewable Energy" description="Avoided emissions" right={<Sun className="h-4 w-4 text-primary" />}>
          <div className="space-y-4">
            <Field id="solar" label="Solar Generation" unit="kWh" value={solar} onChange={(n) => { setSolar(n); setAvoidedOverride(null); }} />
            <Field id="sgrid" label="Grid Emission Factor" unit="kg/kWh" value={solarGrid} onChange={(n) => { setSolarGrid(n); setAvoidedOverride(null); }} />
            <Formula>Avoided = Renewable Generation × Grid EF</Formula>
            <Result label="Estimated Avoided Emissions" kg={avoidedKg} />
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard className="lg:col-span-1" title="Summary" description="Gross operational footprint">
          <dl className="space-y-3 text-sm">
            {[
              ["Scope 1", main.scope1Kg],
              ["Scope 2", main.scope2Kg],
              ["Gross total", main.totalKg],
              ["Avoided", avoidedKg],
              ["Net (gross − avoided)", main.totalKg - avoidedKg],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between border-b pb-2 last:border-0">
                <dt className="text-muted-foreground">{k as string}</dt>
                <dd className="font-mono tabular">{fmt((v as number) / 1000, 2)} t</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <SectionCard className="lg:col-span-2" title="Indicative Carbon-Credit Value" right={<IndianRupee className="h-4 w-4 text-muted-foreground" />}>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Field id="avt" label="Avoided emissions" unit="tCO₂e" value={avoidedT} onChange={setAvoidedOverride} />
              <Field id="price" label="Assumed price per tCO₂e" unit="₹/t" value={price} onChange={setPrice} />
              <Formula>Value = Avoided tCO₂e × Assumed price</Formula>
            </div>
            <div className="flex flex-col justify-between rounded-lg border bg-soft p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Indicative value</p>
                <p className="mt-1 font-display text-4xl font-bold tabular">₹{fmtInt(avoidedT * price)}</p>
              </div>
              <p className="mt-4 flex items-start gap-2 rounded-md bg-warning p-3 text-xs text-warning-foreground">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Indicative estimate — not a guaranteed market value. The price is a user assumption, not an official carbon-credit price.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
