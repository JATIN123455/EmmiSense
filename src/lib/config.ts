/**
 * EmissiSense configuration.
 * All emission factors, prices and model metrics are ASSUMPTIONS / PLACEHOLDERS.
 * Replace with values from your methodology or the Python backend.
 */
export const APP_CONFIG = {
  demoMode: true,
  apiBaseUrl: (import.meta.env['VITE_API_BASE_URL'] as string | undefined) ?? "",
  backendConnected: false,
  model: {
    name: "XGBoost Regressor",
    status: "Prototype",
    data: "Solar + Weather",
    features: [
      "Irradiance",
      "Ambient Temperature",
      "Module Temperature",
      "Hour",
      "Month",
      "Day of Week",
      "Historical Solar Power",
      "Rolling Statistics",
    ],
    // null => "Awaiting trained model". Never put fabricated results here.
    metrics: { mae: null as number | null, rmse: null as number | null, r2: null as number | null },
  },
  dataSource: {
    name: "Configurable — solar plant generation + weather sensor dataset",
    fields: [
      "Solar generation data",
      "Weather / sensor data",
      "Historical generation",
      "Irradiance",
      "Ambient temperature",
      "Module temperature",
      "Time-based features",
    ],
  },
  factors: {
    gridEmissionFactor: 0.71, // kg CO2e/kWh — demo assumption
    fuel: {
      Diesel: { factor: 2.68, unit: "L" },
      Petrol: { factor: 2.31, unit: "L" },
      "Natural Gas": { factor: 2.02, unit: "m³" },
    },
    carbonPricePerTonne: 1000, // INR per tCO2e — indicative assumption
  },
  currency: "₹",
};

export type FuelType = keyof typeof APP_CONFIG.factors.fuel;
