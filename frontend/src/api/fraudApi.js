import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  timeout: 10000,
});

export async function predictThreat(text) {
  const response = await api.post("/predict", { text });
  return response.data;
}

export async function getMetrics() {
  const response = await api.get("/metrics");
  return response.data;
}
