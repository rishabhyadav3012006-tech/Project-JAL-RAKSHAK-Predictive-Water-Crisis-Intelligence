import React, { useState, useEffect } from 'react';
import { checkHealth } from '../services/api';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw, Server, Cpu, Database, Radio } from 'lucide-react';
import GlassCard from './GlassCard';
import StatusBadge from './StatusBadge';
import SecondaryButton from './SecondaryButton';

/**
 * HealthCard
 * Light glassmorphic system health monitor widget communicating with FastAPI backend.
 */
export default function HealthCard({ className = '' }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealth(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Failed to reach FastAPI backend');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard variant="frosted" className={`p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-sky-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-100 shadow-sm shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">
              FastAPI Core API Telemetry
            </h3>
            <p className="text-xs text-slate-500">
              Endpoint: <code className="text-sky-700 bg-sky-50/80 px-1.5 py-0.5 rounded border border-sky-200/60 font-mono">GET /api/v1/health</code>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {health ? (
            <StatusBadge status="normal" label="Connected" size="md" />
          ) : error ? (
            <StatusBadge status="critical" label="Disconnected" size="md" />
          ) : (
            <StatusBadge status="info" label="Probing..." size="md" />
          )}
          <SecondaryButton
            size="sm"
            onClick={fetchHealth}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh
          </SecondaryButton>
        </div>
      </div>

      {loading && !health && !error && (
        <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
          <p className="text-xs text-slate-500">Connecting to ASGI backend service...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-200/80 text-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Connection Standby</p>
            <p className="text-xs text-rose-700 mt-1">{error}</p>
            <p className="text-xs text-slate-500 mt-2">
              Start FastAPI with: <code className="text-slate-800 bg-white/80 px-1.5 py-0.5 rounded border border-rose-200 font-mono">uvicorn main:app --reload</code>
            </p>
          </div>
        </div>
      )}

      {health && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/80 p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">
                Status
              </span>
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {health.status.toUpperCase()}
              </span>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">
                Roundtrip Latency
              </span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                <Activity className="w-4 h-4 text-sky-500" />
                {health.latency} ms
              </span>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">
                Environment
              </span>
              <span className="text-sm font-mono font-bold text-sky-700 uppercase">
                {health.environment}
              </span>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">
                API Version
              </span>
              <span className="text-sm font-mono font-bold text-slate-700">
                v{health.version}
              </span>
            </div>
          </div>

          <div className="bg-white/70 p-4 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-xs font-bold text-slate-700 block mb-2.5">
              Subsystem Readiness Matrix
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Database className="w-4 h-4 text-sky-500" />
                <span>DB: <strong className="text-slate-900">{health.details?.database}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <span>AI Engine: <strong className="text-slate-900">{health.details?.ai_engine}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Radio className="w-4 h-4 text-amber-500" />
                <span>IoT Sim: <strong className="text-slate-900">{health.details?.iot_simulator}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>Digital Twin: <strong className="text-slate-900">{health.details?.digital_twin}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[11px] text-slate-400 pt-1 gap-1">
            <span>Service: <strong>{health.service}</strong></span>
            <span>Last checked: {lastChecked}</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
