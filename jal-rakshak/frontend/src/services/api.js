import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// System & Diagnostics
export const checkHealth = async () => {
  const startTime = Date.now();
  const response = await apiClient.get('/health');
  const latency = Date.now() - startTime;
  return { ...response.data, latency };
};

export const checkStatus = async () => {
  const response = await apiClient.get('/status');
  return response.data;
};

// 1. Dashboard Metrics & Charts
export const fetchDashboardMetrics = async () => {
  const response = await apiClient.get('/dashboard/metrics');
  return response.data;
};

export const fetchDashboardCharts = async () => {
  const response = await apiClient.get('/dashboard/charts');
  return response.data;
};

// 2. Digital Twin
export const fetchDigitalTwinNetwork = async () => {
  const response = await apiClient.get('/digital-twin/network');
  return response.data;
};

export const simulateDigitalTwin = async (action) => {
  const response = await apiClient.post('/digital-twin/simulate', action);
  return response.data;
};

// 3. IoT Sensors & Live Telemetry
export const fetchLiveSensors = async () => {
  const response = await apiClient.get('/sensors/live');
  return response.data;
};

export const fetchSensorsList = async (params = {}) => {
  const response = await apiClient.get('/sensors', { params });
  return response.data;
};

// 4. Anomaly Detection
export const fetchAnomalyEvents = async (params = {}) => {
  const response = await apiClient.get('/anomalies/events', { params });
  return response.data;
};

export const predictAnomaly = async (payload) => {
  const response = await apiClient.post('/anomalies/predict', payload);
  return response.data;
};

export const triggerAnomalyTest = async (exampleType) => {
  const response = await apiClient.post('/anomalies/trigger-test', { example_type: exampleType });
  return response.data;
};

// 5. Predictive Leakage Intelligence & Alerts
export const fetchLeakageAlerts = async (params = {}) => {
  const response = await apiClient.get('/leakage/alerts', { params });
  return response.data;
};

export const updateLeakageAlertStatus = async (alertId, data) => {
  const response = await apiClient.put(`/leakage/alerts/${alertId}/status`, data);
  return response.data;
};

export const fetchLeakageStatistics = async () => {
  const response = await apiClient.get('/leakage/statistics');
  return response.data;
};

// 6. Water Demand Forecasting
export const fetchDemandForecasts = async (zoneId = 'zone-north', horizon = '24h') => {
  const response = await apiClient.get(`/demand/forecasts/${zoneId}`, { params: { horizon } });
  return response.data;
};

// 7. Water Availability & Shortage Prediction
export const fetchShortageOverview = async () => {
  const response = await apiClient.get('/shortage/overview');
  return response.data;
};

export const fetchReservoirs = async () => {
  const response = await apiClient.get('/shortage/reservoirs');
  return response.data;
};

export const fetchShortageTimeline = async () => {
  const response = await apiClient.get('/shortage/timeline');
  return response.data;
};

// 8. Multi-Sensor Fusion Intelligence
export const fetchSensorFusionHealth = async () => {
  const response = await apiClient.get('/fusion/live-assessment');
  return response.data;
};

export const fetchSensorReliabilities = async () => {
  const response = await apiClient.get('/fusion/sensor-reliability');
  return response.data;
};

// 9. Analytics & Compliance Reports
export const fetchWaterBalance = async () => {
  const response = await apiClient.get('/analytics/water-balance');
  return response.data;
};

export const fetchComplianceReport = async () => {
  const response = await apiClient.get('/analytics/compliance-report');
  return response.data;
};
