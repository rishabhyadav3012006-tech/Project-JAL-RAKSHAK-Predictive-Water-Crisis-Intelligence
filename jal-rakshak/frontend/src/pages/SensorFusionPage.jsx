import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UnifiedNetworkHealthCard from '../components/fusion/UnifiedNetworkHealthCard';
import DetectionComparisonCard from '../components/fusion/DetectionComparisonCard';
import SensorReliabilityTable from '../components/fusion/SensorReliabilityTable';
import MultiStreamAlignmentChart from '../components/fusion/MultiStreamAlignmentChart';
import { GlassCard, StatusBadge, PrimaryButton, SecondaryButton } from '../components';
import {
  Layers,
  Sparkles,
  RefreshCw,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export default function SensorFusionPage() {
  const [healthData, setHealthData] = useState(null);
  const [reliabilities, setReliabilities] = useState([]);
  const [benchmarkCases, setBenchmarkCases] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFusionData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [healthRes, relRes, compRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/fusion/live-assessment`, { timeout: 4000 }),
        axios.get(`${API_BASE_URL}/fusion/sensor-reliability`, { timeout: 4000 }),
        axios.get(`${API_BASE_URL}/fusion/compare-detection`, { timeout: 4000 }),
      ]);

      if (healthRes.data) setHealthData(healthRes.data);
      if (relRes.data && Array.isArray(relRes.data)) setReliabilities(relRes.data);
      if (compRes.data && Array.isArray(compRes.data)) setBenchmarkCases(compRes.data);
    } catch {
      // Retain graceful client fallbacks
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFusionData();
  }, [fetchFusionData]);

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-sky-100 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 shadow-sm">
              <Layers className="w-3.5 h-3.5 text-sky-500" />
              Phase 10 Intelligence Module
            </span>
            <StatusBadge
              status="normal"
              label="Multi-Modal Corroboration Active"
              size="sm"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Multi-Sensor Fusion Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Timestamp alignment, outlier filtering, and cross-sensor hydraulic physical law verification
          </p>
        </div>

        <button
          onClick={fetchFusionData}
          disabled={isRefreshing}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-start lg:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
          Refresh Fusion Telemetry
        </button>
      </div>

      {/* 1. Unified Network Health Card */}
      <UnifiedNetworkHealthCard healthData={healthData} />

      {/* 2. Interactive Detection Comparison: Single Sensor vs Fused Engine */}
      <DetectionComparisonCard benchmarkCases={benchmarkCases} />

      {/* 3. Multi-Stream Timestamp Alignment */}
      <MultiStreamAlignmentChart />

      {/* 4. Sensor Reliability Matrix Table */}
      <SensorReliabilityTable reliabilities={reliabilities} />
    </div>
  );
}
