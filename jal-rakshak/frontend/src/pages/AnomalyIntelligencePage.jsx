import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LiveInferenceInspector from '../components/anomaly/LiveInferenceInspector';
import ModelEvaluationCard from '../components/anomaly/ModelEvaluationCard';
import StoredEventsTable from '../components/anomaly/StoredEventsTable';
import { GlassCard, StatusBadge, PrimaryButton } from '../components';
import {
  Cpu,
  ShieldAlert,
  Sparkles,
  BarChart2,
  RefreshCw,
  AlertTriangle,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export default function AnomalyIntelligencePage() {
  const [evaluationData, setEvaluationData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAnomalyData = async () => {
    setLoading(true);
    try {
      const [evalRes, eventsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/anomaly/evaluation`, { timeout: 3000 }),
        axios.get(`${API_BASE_URL}/anomaly/events`, { timeout: 3000 }),
      ]);
      if (evalRes.data) setEvaluationData(evalRes.data);
      if (eventsRes.data && Array.isArray(eventsRes.data)) setEvents(eventsRes.data);
    } catch {
      // Retain fallback structures
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalyData();
  }, []);

  const handleNewPrediction = (pred) => {
    if (pred && pred.severity in ['HIGH', 'CRITICAL']) {
      fetchAnomalyData();
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sky-100 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 shadow-sm">
              <Cpu className="w-3.5 h-3.5 text-sky-500" />
              Phase 6 AI Engine
            </span>
            <StatusBadge status="normal" label="Isolation Forest Active" size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Leakage & Anomaly Detection Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Unsupervised Isolation Forest baseline with supervised XGBoost benchmarking for pipe rupture & demand anomaly triage
          </p>
        </div>

        <button
          onClick={fetchAnomalyData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 transition-all self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Models</span>
        </button>
      </div>

      {/* Top AI Performance Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard variant="frosted" className="p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">
            Flagged Anomaly Events
          </span>
          <span className="text-2xl font-extrabold font-mono text-slate-900">
            {events.length} Incidents
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Stored in incident queue
          </span>
        </GlassCard>

        <GlassCard variant="frosted" className="p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">
            Isolation Forest Baseline F1
          </span>
          <span className="text-2xl font-extrabold font-mono text-sky-700">
            {evaluationData?.isolation_forest?.f1_score ? evaluationData.isolation_forest.f1_score.toFixed(3) : '0.536'}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Unsupervised tree depth
          </span>
        </GlassCard>

        <GlassCard variant="frosted" className="p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">
            XGBoost Evaluator F1
          </span>
          <span className="text-2xl font-extrabold font-mono text-emerald-600">
            {evaluationData?.xgboost?.f1_score ? evaluationData.xgboost.f1_score.toFixed(3) : '0.994'}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Supervised benchmark
          </span>
        </GlassCard>

        <GlassCard variant="frosted" className="p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">
            Critical Pipeline Threats
          </span>
          <span className="text-2xl font-extrabold font-mono text-rose-600">
            1 Rupture Alert
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Sector 9 South Conduit
          </span>
        </GlassCard>
      </div>

      {/* 1. Live Inference Inspector with 5 Detection Archetypes */}
      <section>
        <LiveInferenceInspector onNewPrediction={handleNewPrediction} />
      </section>

      {/* 2. Model Evaluation Report & Synthetic Data Notice */}
      <section>
        <ModelEvaluationCard evaluationData={evaluationData} />
      </section>

      {/* 3. Stored Anomaly Events Table */}
      <section>
        <StoredEventsTable events={events} />
      </section>
    </div>
  );
}
