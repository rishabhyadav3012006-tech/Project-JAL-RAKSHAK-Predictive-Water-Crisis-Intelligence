import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ForecastHorizonSelector from '../components/demand/ForecastHorizonSelector';
import DemandKPICards from '../components/demand/DemandKPICards';
import DemandForecastChart from '../components/demand/DemandForecastChart';
import ZoneDemandComparisonCard from '../components/demand/ZoneDemandComparisonCard';
import ModelPerformanceMetricsCard from '../components/demand/ModelPerformanceMetricsCard';
import InfluencingFactorsCard from '../components/demand/InfluencingFactorsCard';
import { GlassCard, StatusBadge, PrimaryButton } from '../components';
import {
  TrendingUp,
  Cpu,
  Droplets,
  AlertTriangle,
  Sparkles,
  Calendar,
  Layers,
  Info,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export default function DemandForecastingPage() {
  const [selectedHorizon, setSelectedHorizon] = useState('24h');
  const [selectedZone, setSelectedZone] = useState('zone-north');
  const [forecastData, setForecastData] = useState(null);
  const [evaluationReport, setEvaluationReport] = useState(null);
  const [zonesComparison, setZonesComparison] = useState([]);
  const [influencingFactors, setInfluencingFactors] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch forecast data from FastAPI backend
  const fetchDemandData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [fcRes, evRes, compRes, factorsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/demand/forecast`, {
          params: { zone_id: selectedZone, horizon: selectedHorizon },
          timeout: 4000,
        }),
        axios.get(`${API_BASE_URL}/demand/evaluation`, {
          params: { zone_id: selectedZone },
          timeout: 4000,
        }),
        axios.get(`${API_BASE_URL}/demand/zones-comparison`, {
          params: { horizon: selectedHorizon },
          timeout: 4000,
        }),
        axios.get(`${API_BASE_URL}/demand/factors`, {
          params: { zone_id: selectedZone },
          timeout: 4000,
        }),
      ]);

      if (fcRes.data) setForecastData(fcRes.data);
      if (evRes.data) setEvaluationReport(evRes.data);
      if (compRes.data && Array.isArray(compRes.data)) setZonesComparison(compRes.data);
      if (factorsRes.data && Array.isArray(factorsRes.data)) setInfluencingFactors(factorsRes.data);
    } catch {
      // Local fallback generation
      generateLocalFallback(selectedZone, selectedHorizon);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedZone, selectedHorizon]);

  useEffect(() => {
    fetchDemandData();
  }, [fetchDemandData]);

  // Local fallback generator in case backend is offline
  const generateLocalFallback = (zoneId, horizon) => {
    const steps = horizon === '1h' ? 1 : horizon === '6h' ? 6 : horizon === '7d' ? 168 : 24;
    const base = zoneId === 'zone-south' ? 460 : zoneId === 'zone-east' ? 360 : 420;

    const mockPoints = [];
    for (let i = 1; i <= Math.min(steps, 24); i++) {
      const val = Math.round(base + 80 * Math.sin(i * 0.3) + 40 * Math.cos(i * 0.15));
      mockPoints.push({
        time: `${(i + 8) % 24}:00`,
        predicted_demand: val,
        confidence_lower: Math.round(val - 25),
        confidence_upper: Math.round(val + 25),
        planned_supply: Math.round(base * 1.08),
        supply_gap: Math.round(base * 1.08 - val),
      });
    }

    setForecastData({
      zone_id: zoneId,
      zone_name: zoneId === 'zone-north' ? 'Zone 1-4: North Residential' : zoneId,
      horizon: horizon,
      summary: {
        average_demand_m3h: base,
        peak_demand_m3h: base + 95,
        planned_supply_m3: base * 1.08 * steps,
        total_volume_m3: base * steps,
        net_supply_gap_m3: 340.0,
        supply_risk_level: 'ADEQUATE BUFFER',
        high_demand_periods: 'Peak morning surge projected between 08:00 and 10:00.',
      },
      recent_actuals: [
        { time: '02:00', historical_actual: base - 90 },
        { time: '04:00', historical_actual: base - 70 },
        { time: '06:00', historical_actual: base + 20 },
      ],
      forecast_trajectory: mockPoints,
    });
  };

  const isDeficit = (forecastData?.summary?.net_supply_gap_m3 ?? 0) < 0;

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-sky-100 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              Phase 8 Predictive Intelligence
            </span>
            <StatusBadge
              status={isDeficit ? 'warning' : 'normal'}
              label={isDeficit ? 'Shortage Risk Flagged' : 'Adequate Supply Buffer'}
              size="sm"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Water Demand Forecasting Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervised XGBoost & sequential diurnal deep regressors predicting municipal consumption horizons
          </p>
        </div>
      </div>

      {/* Horizon & Zone Controls */}
      <ForecastHorizonSelector
        selectedHorizon={selectedHorizon}
        onSelectHorizon={setSelectedHorizon}
        selectedZone={selectedZone}
        onSelectZone={setSelectedZone}
        onRefresh={fetchDemandData}
        isRefreshing={isRefreshing}
      />

      {/* High Demand Warning Banner if peak detected */}
      {isDeficit && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong className="block text-sm font-bold">Anticipated Peak Shortage Risk</strong>
              <p className="text-rose-700 mt-0.5">
                {forecastData?.summary?.high_demand_periods} Reserve drawdown or booster pumping ramp-up recommended.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-rose-200/70 text-rose-900 uppercase">
            Deficit Warning
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <DemandKPICards
        summary={forecastData?.summary}
        horizon={selectedHorizon}
      />

      {/* Main Interactive Forecast Chart */}
      <DemandForecastChart
        forecastData={forecastData}
        horizon={selectedHorizon}
        zoneName={forecastData?.zone_name || selectedZone}
      />

      {/* Zone Comparison Grid */}
      <ZoneDemandComparisonCard
        zonesComparison={zonesComparison}
        onSelectZone={setSelectedZone}
        activeZoneId={selectedZone}
      />

      {/* Bottom Row: Model Evaluation & Influencing Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModelPerformanceMetricsCard evaluationReport={evaluationReport} />
        <InfluencingFactorsCard factors={influencingFactors} />
      </div>
    </div>
  );
}
