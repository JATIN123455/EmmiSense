export interface DashboardMetrics {
  solarGenerationKwh: number;
  scope1T: number;
  scope2T: number;
  avoidedT: number;
  indicativeValue: number;
  isDemo: boolean;
}

export interface ForecastPoint {
  timestamp: string; // ISO
  label: string;
  actual: number;
  predicted: number;
}

export type ForecastRange = "today" | "7d" | "30d";

export interface ModelMetrics {
  model: string;
  mae: number | null;
  rmse: number | null;
  r2: number | null;
  status: "awaiting" | "demo" | "trained";
}

export interface ShapFeature {
  feature: string;
  value: number;
}

export interface CarbonInput {
  electricityKwh: number;
  gridFactor: number;
  fuelLitres: number;
  fuelFactor: number;
  solarKwh: number;
  carbonPrice: number;
}

export interface CarbonResult {
  scope1Kg: number;
  scope2Kg: number;
  avoidedKg: number;
  totalKg: number;
  indicativeValue: number;
}

export interface ScenarioInput {
  name: string;
  electricityKwh: number;
  solarCapacityKw: number;
  solarKwh: number;
  fuelLitres: number;
  productionUnits: number;
  gridFactor: number;
  carbonPrice: number;
}

export interface ScenarioResult {
  solarKwh: number;
  scope1T: number;
  scope2T: number;
  totalT: number;
  avoidedT: number;
  indicativeValue: number;
}

export interface SavedScenario extends ScenarioResult {
  id: string;
  name: string;
  createdAt: string;
  status: "Demo" | "Saved" | "Draft";
}
