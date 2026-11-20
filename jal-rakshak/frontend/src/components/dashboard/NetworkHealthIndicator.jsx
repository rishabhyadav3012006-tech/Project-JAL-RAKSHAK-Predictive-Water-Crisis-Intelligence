import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { GlassCard, StatusBadge } from '../index';
import { Activity, ShieldCheck, CheckCircle2, Radio, Droplet, Sparkles } from 'lucide-react';

/**
 * NetworkHealthIndicator
 * Consolidated water grid health composite score with sub-system readiness indicators.
 */
export default function NetworkHealthIndicator() {
  const { kpis, zones } = useTelemetry();

  // Color gradient based on overall score
  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <GlassCard variant="frosted" className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Overall Health Score Badge */}
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center">
            {/* Soft ambient circle pulse */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-sky-400/20 to-blue-500/20 flex items-center justify-center border-4 border-white shadow-glass-md">
              <div className="text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight block">
                  {kpis.healthScore}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  / 100
                </span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-white shadow">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900">
                Water Network Health Index
              </h3>
              <StatusBadge
                status={kpis.healthScore >= 80 ? 'normal' : 'warning'}
                label={kpis.healthScore >= 80 ? 'Optimal Condition' : 'Supervision Needed'}
                size="sm"
              />
            </div>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              Real-time composite health derived from hydraulic pressure balance, leakage anomalies, and reservoir replenishment velocity.
            </p>
          </div>
        </div>

        {/* Right: Subsystem Readiness Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:border-l lg:border-sky-100/80 lg:pl-6">
          <div className="p-3 rounded-xl bg-white/70 border border-slate-100 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              Hydraulic Balance
            </span>
            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              98.2%
            </span>
            <span className="text-[10px] text-slate-400">Within 3.5-5.5 Bar</span>
          </div>

          <div className="p-3 rounded-xl bg-white/70 border border-slate-100 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              Water Quality Index
            </span>
            <span className="text-sm font-bold text-sky-700 flex items-center gap-1.5 font-mono">
              <Droplet className="w-4 h-4 text-sky-500 shrink-0" />
              95.4 / 100
            </span>
            <span className="text-[10px] text-slate-400">Turbidity: 0.98 NTU</span>
          </div>

          <div className="p-3 rounded-xl bg-white/70 border border-slate-100 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              IoT Telemetry Link
            </span>
            <span className="text-sm font-bold text-indigo-600 flex items-center gap-1.5 font-mono">
              <Radio className="w-4 h-4 text-indigo-500 shrink-0" />
              {kpis.totalConnectedNodes} / {kpis.totalConnectedNodes}
            </span>
            <span className="text-[10px] text-slate-400">100% Online Nodes</span>
          </div>

          <div className="p-3 rounded-xl bg-white/70 border border-slate-100 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              Storage Horizon
            </span>
            <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-mono">
              <Activity className="w-4 h-4 text-slate-500 shrink-0" />
              {kpis.daysOfWaterSecurity} Days
            </span>
            <span className="text-[10px] text-slate-400">Security Buffer</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
