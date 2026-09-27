import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sun,
  Calculator,
  GitCompareArrows,
  Brain,
  History,
  FileText,
  GraduationCap,
  Menu,
  Leaf,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/config";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/solar-forecast", label: "Solar Forecast", icon: Sun },
  { to: "/carbon-calculator", label: "Carbon Calculator", icon: Calculator },
  { to: "/scenario-analysis", label: "Scenario Analysis", icon: GitCompareArrows },
  { to: "/explainable-ai", label: "Explainable AI", icon: Brain },
  { to: "/scenario-history", label: "Scenario History", icon: History },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/about", label: "About Project", icon: GraduationCap },
] as const;

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-primary-foreground">
        <Leaf className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <p className="font-display text-[15px] font-bold text-foreground">CarbonSense</p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Carbon Intelligence</p>
      </div>
    </div>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-0.5 px-3" aria-label="Main">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            activeOptions={{ exact: to === "/" }}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeProps={{ className: "bg-sidebar-accent !text-sidebar-accent-foreground font-semibold" }}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="m-3 rounded-lg border bg-soft p-4 text-xs">
        <dl className="space-y-2">
          {[
            ["Project Status", APP_CONFIG.model.status],
            ["Model", "XGBoost"],
            ["Data", APP_CONFIG.model.data],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-medium text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
        {APP_CONFIG.demoMode && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-warning px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-warning-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning-foreground" />
            Demo Mode Active
          </div>
        )}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-sidebar lg:block">
        <SidebarBody />
      </aside>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <Button variant="outline" size="icon" aria-label="Open navigation" onClick={() => setOpen(true)}>
          <Menu className="h-4 w-4" />
        </Button>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">{children}</div>
        <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-muted-foreground md:px-8">
          CarbonSense · B.Tech Final Year Project · Values shown in Demo Mode are illustrative and not experimental results.
        </footer>
      </main>
    </div>
  );
}
