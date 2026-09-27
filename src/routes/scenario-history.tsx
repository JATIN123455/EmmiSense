import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, GitCompareArrows, Search, Trash2, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DemoBadge, PageHeader, SectionCard, fmt, fmtInt } from "@/components/cs/common";
import { deleteScenario, getScenarioHistory } from "@/services/api";
import type { SavedScenario } from "@/services/types";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/scenario-history")({
  head: () => pageMeta("Scenario History", "Browse, compare and manage saved sustainability scenarios."),
  component: ScenarioHistory,
});

const METRICS: [keyof SavedScenario, string, (n: number) => string][] = [
  ["solarKwh", "Solar Generation (kWh)", fmtInt],
  ["scope1T", "Scope 1 (tCO₂e)", (n) => fmt(n, 2)],
  ["scope2T", "Scope 2 (tCO₂e)", (n) => fmt(n, 2)],
  ["totalT", "Total (tCO₂e)", (n) => fmt(n, 2)],
  ["avoidedT", "Avoided CO₂ (tCO₂e)", (n) => fmt(n, 2)],
  ["indicativeValue", "Indicative Value (₹)", fmtInt],
];

function ScenarioHistory() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["scenarios"], queryFn: getScenarioHistory });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<SavedScenario | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [toDelete, setToDelete] = useState<SavedScenario | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => deleteScenario(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["scenarios"] });
      setCompare((c) => c.filter((x) => x !== id));
      toast.success(`Deleted ${id}`);
    },
  });

  const rows = useMemo(
    () =>
      (data ?? []).filter(
        (s) =>
          (status === "all" || s.status === status) &&
          (s.name.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase())),
      ),
    [data, q, status],
  );
  const compared = (data ?? []).filter((s) => compare.includes(s.id));

  const toggleCompare = (id: string) => {
    setCompare((c) => {
      if (c.includes(id)) return c.filter((x) => x !== id);
      if (c.length >= 2) {
        toast.info("Compare up to two scenarios at a time.");
        return c;
      }
      const next = [...c, id];
      if (next.length === 2) setShowCompare(true);
      return next;
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Records"
        title="Scenario History"
        subtitle="Saved scenario runs. This table is ready to be backed by the SQLite database through the API layer."
        actions={
          <>
            <DemoBadge label="Demo Scenarios" />
            <Button asChild size="sm"><Link to="/scenario-analysis">New scenario</Link></Button>
          </>
        }
      />

      <SectionCard
        title="Saved Scenarios"
        description={compare.length ? `${compare.length}/2 selected for comparison` : "Select two rows with Compare to view them side by side."}
        right={
          compare.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setCompare([])}>Clear selection</Button>
          )
        }
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or ID…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" aria-label="Search scenarios" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="sm:w-44" aria-label="Filter by status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Demo">Demo</SelectItem>
              <SelectItem value="Saved">Saved</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Scenario Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Solar (kWh)</TableHead>
                <TableHead className="text-right">Scope 1</TableHead>
                <TableHead className="text-right">Scope 2</TableHead>
                <TableHead className="text-right">Avoided CO₂</TableHead>
                <TableHead className="text-right">Indicative ₹</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={10}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
                ))}
              {isError && (
                <TableRow><TableCell colSpan={10} className="py-10 text-center text-destructive">Failed to load scenarios.</TableCell></TableRow>
              )}
              {!isLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                    <Inbox className="mx-auto mb-2 h-6 w-6" /> No scenarios match your filters.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((s) => (
                <TableRow key={s.id} data-state={compare.includes(s.id) ? "selected" : undefined}>
                  <TableCell className="font-mono text-xs">{s.id}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.createdAt}</TableCell>
                  <TableCell className="text-right tabular">{fmtInt(s.solarKwh)}</TableCell>
                  <TableCell className="text-right tabular">{fmt(s.scope1T, 1)}</TableCell>
                  <TableCell className="text-right tabular">{fmt(s.scope2T, 1)}</TableCell>
                  <TableCell className="text-right tabular">{fmt(s.avoidedT, 1)}</TableCell>
                  <TableCell className="text-right tabular">{fmtInt(s.indicativeValue)}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "Saved" ? "default" : "secondary"}>{s.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`View ${s.id}`} onClick={() => setView(s)}><Eye className="h-4 w-4" /></Button>
                      </TooltipTrigger><TooltipContent>View</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild>
                        <Button variant={compare.includes(s.id) ? "secondary" : "ghost"} size="icon" aria-label={`Compare ${s.id}`} onClick={() => toggleCompare(s.id)}><GitCompareArrows className="h-4 w-4" /></Button>
                      </TooltipTrigger><TooltipContent>Compare</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${s.id}`} onClick={() => setToDelete(s)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{view?.name}</DialogTitle>
            <DialogDescription>{view?.id} · created {view?.createdAt} · {view?.status}</DialogDescription>
          </DialogHeader>
          {view && (
            <dl className="divide-y text-sm">
              {METRICS.map(([k, l, f]) => (
                <div key={k} className="flex justify-between py-2">
                  <dt className="text-muted-foreground">{l}</dt>
                  <dd className="font-mono">{f(view[k] as number)}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="text-xs text-muted-foreground">Indicative value is not a guaranteed market value.</p>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompare && compared.length === 2} onOpenChange={setShowCompare}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Scenario Comparison</DialogTitle>
            <DialogDescription>Side-by-side view of the two selected scenarios.</DialogDescription>
          </DialogHeader>
          {compared.length === 2 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">{compared[0].name}</TableHead>
                  <TableHead className="text-right">{compared[1].name}</TableHead>
                  <TableHead className="text-right">Δ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {METRICS.map(([k, l, f]) => {
                  const a = compared[0][k] as number;
                  const b = compared[1][k] as number;
                  return (
                    <TableRow key={k}>
                      <TableCell>{l}</TableCell>
                      <TableCell className="text-right tabular">{f(a)}</TableCell>
                      <TableCell className="text-right tabular">{f(b)}</TableCell>
                      <TableCell className="text-right tabular text-muted-foreground">{b - a > 0 ? "+" : ""}{f(b - a)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This removes the scenario from the current session history.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => toDelete && del.mutate(toDelete.id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
