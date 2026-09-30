import { Fragment } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, Database, Filter, Wrench, Cpu, Brain, Calculator, GitCompareArrows, HardDrive, LayoutDashboard, User, GraduationCap, Target, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, SectionCard } from "@/components/cs/common";
import { APP_CONFIG } from "@/lib/config";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/about")({
  head: () => pageMeta("About Project", "Problem statement, architecture, methodology and team behind the EmmiSense B.Tech project."),
  component: About,
});

const PIPELINE = [
  { icon: Database, t: "Data Sources", d: "Solar generation + weather sensors" },
  { icon: Filter, t: "Data Preprocessing", d: "Cleaning, resampling, imputation" },
  { icon: Wrench, t: "Feature Engineering", d: "Time features, lags, rolling stats" },
  { icon: Cpu, t: "XGBoost Forecasting", d: "Solar power regression" },
  { icon: Brain, t: "SHAP Explainability", d: "Feature attribution" },
  { icon: Calculator, t: "Carbon Calculation Engine", d: "Scope 1, 2, avoided" },
  { icon: GitCompareArrows, t: "Scenario Analysis", d: "What-if comparisons" },
  { icon: HardDrive, t: "SQLite Storage", d: "Scenarios & results" },
  { icon: LayoutDashboard, t: "Dashboard & Reports", d: "React frontend" },
];

const STACK = [
  ["Frontend", "React + TypeScript + Tailwind + shadcn/ui"],
  ["ML", "Python + XGBoost + SHAP"],
  ["Data Processing", "Pandas + NumPy"],
  ["Database", "SQLite"],
  ["Visualization", "Recharts"],
  ["Reporting", "PDF generation"],
  ["API (planned)", "Python FastAPI"],
];

function About() {
  return (
    <>
      <PageHeader eyebrow="B.Tech Final Year Project" title="About EmmiSense" subtitle="EmmiSense — AI-Powered Carbon Intelligence & Renewable Energy Forecasting" />

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Problem Statement" right={<Target className="h-4 w-4 text-primary" />}>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Organizations need better tools to estimate emissions, understand renewable-energy generation, and evaluate
            sustainability scenarios.
          </p>
        </SectionCard>
        <SectionCard title="Proposed Solution" right={<Lightbulb className="h-4 w-4 text-primary" />}>
          <p className="mb-3 text-sm text-muted-foreground">EmmiSense combines:</p>
          <div className="flex flex-wrap gap-1.5">
            {["Machine Learning", "Solar Generation Forecasting", "Carbon Emission Estimation", "Explainable AI", "Scenario Analysis", "Data Visualization", "Reporting"].map((x) => (
              <Badge key={x} variant="secondary" className="font-normal">{x}</Badge>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <SectionCard className="lg:col-span-3" title="System Architecture" description="End-to-end processing pipeline">
          <div className="mx-auto max-w-md">
            {PIPELINE.map(({ icon: Icon, t, d }, i) => (
              <Fragment key={t}>
                <div className="flex items-center gap-4 rounded-lg border bg-card px-4 py-3 transition-colors hover:border-primary/40">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand text-primary-foreground"><Icon className="h-4 w-4" /></span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{t}</p>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                </div>
                {i < PIPELINE.length - 1 && <ArrowDown className="mx-auto my-1 h-4 w-4 text-primary/60" />}
              </Fragment>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Technology Stack">
            <dl className="divide-y text-sm">
              {STACK.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>
          <SectionCard title="Data & Methodology" description={APP_CONFIG.dataSource.name}>
            <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {APP_CONFIG.dataSource.fields.map((f) => (
                <li key={f} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{f}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">Data source is configurable; no additional datasets are assumed.</p>
          </SectionCard>
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold">Project Team</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Jatin", "Team Member"],
            ["Mayur Gulia", "Team Member"],
            ["Rudra Solanki", "Team Member"],
            ["Dr. Suresh Kumar", "Project Guide"],
          ].map(([n, r]) => (
            <Card key={n} className="shadow-card">
              <CardContent className="flex items-center gap-3 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-primary"><User className="h-5 w-5" /></span>
                <div>
                  <p className="font-semibold">{n}</p>
                  <p className="text-xs text-muted-foreground">{r}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 rounded-xl bg-brand p-6 text-primary-foreground">
          <p className="font-mono text-xs uppercase tracking-widest opacity-80">B.Tech Final Year Project</p>
          <p className="mt-1 font-display text-lg font-bold">EmmiSense — AI-Powered Carbon Intelligence & Renewable Energy Forecasting</p>
        </div>
      </section>
    </>
  );
}
