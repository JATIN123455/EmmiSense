import type { ForecastPoint, ForecastRange, SavedScenario, ShapFeature } from "./types";

// Deterministic PRNG so demo charts are stable across renders / SSR.
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CAPACITY_KW = 500;
const END = new Date("2026-09-27T23:00:00Z").getTime();

export function buildForecast(range: ForecastRange): ForecastPoint[] {
  const days = range === "today" ? 1 : range === "7d" ? 7 : 30;
  const step = range === "30d" ? 3 : 1; // hours
  const rand = mulberry32(42);
  const points: ForecastPoint[] = [];
  const hours = days * 24;
  let cloud = 1;
  for (let i = hours - 1; i >= 0; i -= 1) {
    const t = END - i * 3600_000;
    const d = new Date(t);
    const h = d.getUTCHours();
    if (h === 0) cloud = 0.65 + rand() * 0.35;
    const r = rand();
    if ((hours - 1 - i) % step !== 0) continue;
    const sun = Math.max(0, Math.sin((Math.PI * (h - 6)) / 12));
    const actual = +(CAPACITY_KW * Math.pow(sun, 1.2) * cloud * (0.93 + r * 0.1)).toFixed(1);
    const predicted = sun === 0 ? 0 : +(actual * (0.94 + rand() * 0.12)).toFixed(1);
    points.push({
      timestamp: d.toISOString(),
      label:
        range === "today"
          ? `${String(h).padStart(2, "0")}:00`
          : `${d.getUTCDate()} ${d.toLocaleString("en", { month: "short", timeZone: "UTC" })} ${String(h).padStart(2, "0")}h`,
      actual,
      predicted,
    });
  }
  return points;
}

export const DEMO_SHAP: ShapFeature[] = [
  { feature: "Irradiance", value: 0.62 },
  { feature: "Historical Solar Power", value: 0.41 },
  { feature: "Module Temperature", value: 0.23 },
  { feature: "Ambient Temperature", value: 0.14 },
  { feature: "Hour", value: 0.11 },
  { feature: "Day of Week", value: 0.04 },
  { feature: "Month", value: 0.03 },
];

export const DEMO_SCENARIOS: SavedScenario[] = [
  { id: "SC-001", name: "Baseline FY26", createdAt: "2026-08-02", solarKwh: 12480, scope1T: 18.6, scope2T: 74.2, totalT: 92.8, avoidedT: 8.9, indicativeValue: 8900, status: "Draft" },
  { id: "SC-002", name: "Rooftop +200 kW", createdAt: "2026-08-11", solarKwh: 18900, scope1T: 18.6, scope2T: 69.6, totalT: 88.2, avoidedT: 13.4, indicativeValue: 13400, status: "Draft" },
  { id: "SC-003", name: "Diesel genset phase-out", createdAt: "2026-08-19", solarKwh: 12480, scope1T: 6.2, scope2T: 78.1, totalT: 84.3, avoidedT: 8.9, indicativeValue: 8900, status: "Draft" },
  { id: "SC-004", name: "Night-shift reduction", createdAt: "2026-09-03", solarKwh: 12480, scope1T: 17.9, scope2T: 61.4, totalT: 79.3, avoidedT: 8.9, indicativeValue: 8900, status: "Draft" },
  { id: "SC-005", name: "Combined roadmap 2027", createdAt: "2026-09-18", solarKwh: 24300, scope1T: 5.8, scope2T: 58.7, totalT: 64.5, avoidedT: 17.3, indicativeValue: 17300, status: "Draft" },
];
