import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ForecastPoint } from "@/services/types";

export function ForecastChart({ data, height = 340, brush = true }: { data: ForecastPoint[]; height?: number; brush?: boolean }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} minTickGap={32} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            width={52}
            label={{ value: "Solar Power (kW)", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "var(--muted-foreground)" } }}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, background: "var(--card)" }}
            formatter={(v: number) => [`${v.toFixed(1)} kW`]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="actual" name="Actual" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="predicted" name="Predicted" stroke="var(--chart-2)" strokeWidth={2} strokeDasharray="5 4" dot={false} />
          {brush && data.length > 30 && (
            <Brush dataKey="label" height={22} stroke="var(--primary)" travellerWidth={8} fill="var(--muted)" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
