import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ScatterChart } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, SectionCard } from "@/components/cs/common";
import { getSHAPData } from "@/services/api";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/explainable-ai")({
  head: () => pageMeta("Explainable AI", "Understand which features influence the solar-generation prediction using SHAP."),
  component: ExplainableAI,
});

function ExplainableAI() {
  const { data, isError } = useQuery({ queryKey: ["shap"], queryFn: getSHAPData });

  return (
    <>
      <PageHeader
        eyebrow="Model Transparency"
        title="Explainable AI"
        subtitle="Understand which features influence the solar-generation prediction."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="SHAP Feature Importance" description="Mean absolute SHAP value per feature (global importance)">
          {isError ? (
            <p className="py-16 text-center text-sm text-destructive">Could not load SHAP data.</p>
          ) : data ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} label={{ value: "mean(|SHAP value|)", position: "insideBottom", offset: -2, style: { fontSize: 11, fill: "var(--muted-foreground)" } }} />
                  <YAxis type="category" dataKey="feature" width={150} tick={{ fontSize: 12, fill: "var(--foreground)" }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: number) => v.toFixed(3)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {data.map((d, i) => (
                      <Cell key={d.feature} fill={i < 2 ? "var(--chart-1)" : i < 4 ? "var(--chart-3)" : "var(--chart-5)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Skeleton className="h-80 w-full" />
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Sample values only. Trained-model SHAP values will be produced by the Python SHAP TreeExplainer after integration.
          </p>
        </SectionCard>

        <SectionCard title="How to interpret SHAP" right={<BookOpen className="h-4 w-4 text-primary" />}>
          <p className="text-sm leading-relaxed">
            SHAP values quantify the contribution of individual features to a model prediction. Larger absolute values indicate
            greater influence on the prediction.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Based on Shapley values from cooperative game theory.</li>
            <li>• Each prediction = base value + sum of feature SHAP values.</li>
            <li>• Global importance averages |SHAP| across all samples.</li>
            <li>• Positive values push predicted power up, negative push it down.</li>
          </ul>
        </SectionCard>
      </div>

      <SectionCard className="mt-6" title="SHAP Summary (Beeswarm) Plot" description="Per-sample feature effects, coloured by feature value">
        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 p-10 text-center">
          <ScatterChart className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-display font-semibold">Awaiting SHAP output from backend</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            The beeswarm plot will render here once the ML backend exposes per-sample SHAP values via the API.
          </p>
        </div>
      </SectionCard>
    </>
  );
}
