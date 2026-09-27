/**
 * CarbonSense API service layer.
 * Every function currently returns DEMO data. To connect the Python FastAPI
 * backend, set VITE_API_BASE_URL + APP_CONFIG.backendConnected and replace the
 * mock branch with `request(...)` calls. UI code only imports from here.
 */
import { APP_CONFIG } from "@/lib/config";
import { buildForecast, DEMO_SCENARIOS, DEMO_SHAP } from "./mock-data";
import type {
  CarbonInput,
  CarbonResult,
  DashboardMetrics,
  ForecastPoint,
  ForecastRange,
  ModelMetrics,
  SavedScenario,
  ScenarioInput,
  ScenarioResult,
  ShapFeature,
} from "./types";

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${APP_CONFIG.apiBaseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
const live = () => APP_CONFIG.backendConnected && !!APP_CONFIG.apiBaseUrl;

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (live()) return request("/api/dashboard");
  await delay();
  return { solarGenerationKwh: 12480, scope1T: 18.6, scope2T: 74.2, avoidedT: 8.9, indicativeValue: 8900, isDemo: true };
}

export async function getSolarForecast(range: ForecastRange): Promise<ForecastPoint[]> {
  if (live()) return request(`/api/forecast?range=${range}`);
  await delay();
  return buildForecast(range);
}

export async function getModelMetrics(): Promise<ModelMetrics> {
  if (live()) return request("/api/model/metrics");
  await delay(200);
  const m = APP_CONFIG.model.metrics;
  return { model: APP_CONFIG.model.name, ...m, status: m.mae === null ? "awaiting" : "demo" };
}

export async function getSHAPData(): Promise<ShapFeature[]> {
  if (live()) return request("/api/shap");
  await delay();
  return DEMO_SHAP;
}

/** Pure formula mirror of the backend carbon engine (for instant UI feedback). */
export function calculateCarbon(i: CarbonInput): CarbonResult {
  const scope2Kg = i.electricityKwh * i.gridFactor;
  const scope1Kg = i.fuelLitres * i.fuelFactor;
  const avoidedKg = i.solarKwh * i.gridFactor;
  return {
    scope1Kg,
    scope2Kg,
    avoidedKg,
    totalKg: scope1Kg + scope2Kg,
    indicativeValue: (avoidedKg / 1000) * i.carbonPrice,
  };
}

export async function runScenario(i: ScenarioInput): Promise<ScenarioResult> {
  if (live()) return request("/api/scenario/run", { method: "POST", body: JSON.stringify(i) });
  await delay(500);
  const fuelFactor = APP_CONFIG.factors.fuel["Diesel"].factor;
  const netGridKwh = Math.max(0, i.electricityKwh - i.solarKwh);
  const scope1T = (i.fuelLitres * fuelFactor) / 1000;
  const scope2T = (netGridKwh * i.gridFactor) / 1000;
  const avoidedT = (i.solarKwh * i.gridFactor) / 1000;
  return {
    solarKwh: i.solarKwh,
    scope1T,
    scope2T,
    totalT: scope1T + scope2T,
    avoidedT,
    indicativeValue: avoidedT * i.carbonPrice,
  };
}

// In-memory store (replace with SQLite via backend).
let store: SavedScenario[] = [...DEMO_SCENARIOS];
let counter = DEMO_SCENARIOS.length;

export async function getScenarioHistory(): Promise<SavedScenario[]> {
  if (live()) return request("/api/scenarios");
  await delay();
  return [...store];
}

export async function saveScenario(name: string, r: ScenarioResult): Promise<SavedScenario> {
  if (live()) return request("/api/scenarios", { method: "POST", body: JSON.stringify({ name, ...r }) });
  await delay(250);
  counter += 1;
  const s: SavedScenario = {
    ...r,
    id: `SC-${String(counter).padStart(3, "0")}`,
    name,
    createdAt: new Date().toISOString().slice(0, 10),
    status: "Saved",
  };
  store = [s, ...store];
  return s;
}

export async function deleteScenario(id: string): Promise<void> {
  if (live()) {
    await request(`/api/scenarios/${id}`, { method: "DELETE" });
    return;
  }
  await delay(150);
  store = store.filter((s) => s.id !== id);
}

export type ReportKind = "project" | "scenario" | "model";
export async function generateReport(kind: ReportKind): Promise<{ generated: boolean; message: string }> {
  if (live()) return request(`/api/reports/${kind}`, { method: "POST" });
  await delay(400);
  return { generated: false, message: "Backend report generation will be connected after ML integration." };
}
