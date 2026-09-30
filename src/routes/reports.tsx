import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, FileDown, BarChart3, Loader2, Info, Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/cs/common";
import { generateReport, getScenarioHistory, type ReportKind } from "@/services/api";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/reports")({
  head: () => pageMeta("Reports", "Generate project summaries, scenario reports and model evaluation exports."),
  component: Reports,
});

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Reports() {
  const { data: scenarios } = useQuery({ queryKey: ["scenarios"], queryFn: getScenarioHistory });
  const [selected, setSelected] = useState<string>("SC-001");
  const [busy, setBusy] = useState<ReportKind | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const scen = scenarios?.find((s) => s.id === selected);

  async function handle(kind: ReportKind) {
    setBusy(kind);
    try {
      const res = await generateReport(kind);
      if (kind === "project" && scen) {
        downloadText(
          `emmisense-summary-${scen.id}.txt`,
          [
            "EmmiSense — Scenario Summary",
            "==========================================",
            `Scenario: ${scen.name} (${scen.id})`,
            `Created: ${scen.createdAt}`,
            `Solar generation: ${scen.solarKwh} kWh`,
            `Scope 1: ${scen.scope1T} tCO2e`,
            `Scope 2: ${scen.scope2T} tCO2e`,
            `Total: ${scen.totalT} tCO2e`,
            `Avoided: ${scen.avoidedT} tCO2e`,
            `Indicative value: INR ${scen.indicativeValue} (indicative estimate, not a market value)`,
            "",
            "Note: Generated from sample inputs and not presented as experimental results.",
          ].join("\n"),
        );
        toast.success("Text summary downloaded", { description: "Full PDF reports require the backend." });
      } else {
        setNotice(res.message);
        toast.info(res.message);
      }
    } catch {
      toast.error("Report request failed.");
    } finally {
      setBusy(null);
    }
  }

  const cards: { kind: ReportKind; icon: LucideIcon; title: string; desc: string; btn: string; btnIcon: LucideIcon }[] = [
    { kind: "project", icon: FileText, title: "Project Report", desc: "Generate a summary of the selected scenario.", btn: "Generate Report", btnIcon: Download },
    { kind: "scenario", icon: FileDown, title: "Scenario Report", desc: "Formatted PDF with charts and assumptions for the selected scenario.", btn: "Download PDF", btnIcon: FileDown },
    { kind: "model", icon: BarChart3, title: "Model Evaluation", desc: "MAE, RMSE, R² and prediction residuals from the trained model.", btn: "Download Results", btnIcon: Download },
  ];

  return (
    <>
      <PageHeader eyebrow="Output" title="EmmiSense Reports" subtitle="Export summaries and evaluation results for documentation and review." />

      <div className="mb-6 max-w-sm space-y-1.5">
        <Label className="text-xs">Selected scenario</Label>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger><SelectValue placeholder="Choose scenario" /></SelectTrigger>
          <SelectContent>
            {(scenarios ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.id} · {s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map(({ kind, icon: Icon, title, desc, btn, btnIcon: BI }) => (
          <Card key={kind} className="flex flex-col shadow-card transition-colors hover:border-primary/30">
            <CardContent className="flex flex-1 flex-col p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary"><Icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{desc}</p>
              <Button className="mt-6" variant={kind === "project" ? "default" : "outline"} onClick={() => handle(kind)} disabled={busy !== null}>
                {busy === kind ? <Loader2 className="h-4 w-4 animate-spin" /> : <BI className="h-4 w-4" />} {btn}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {notice && (
        <Alert className="mt-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Not generated yet</AlertTitle>
          <AlertDescription>{notice} No PDF or result file was created.</AlertDescription>
        </Alert>
      )}
    </>
  );
}
