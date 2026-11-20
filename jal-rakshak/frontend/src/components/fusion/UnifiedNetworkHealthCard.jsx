import React from 'react';
import { GlassCard, StatusBadge } from '../index';
import {
  Activity,
  Gauge,
  Droplets,
  Layers,
  Radio,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function UnifiedNetworkHealthCard({ healthData }) {
  const score = healthData?.unified_health_score ?? 89.0;
  const status = healthData?.status ?? 'GOOD / HEALTHY';
  const verdict = healthData?.verdict ?? 'Municipal water grid operating in optimal hydraulic equilibrium.';
  const sub = healthData?.sub_indices || {};

  const subIndices = [
    {
      title: 'Hydrostatic Pressure Stability',
      score: sub.pressure_stability?.score ?? 88.5,
      weight: '25%',
      desc: sub.pressure_stability?.status ?? 'Sector 9: 3.42 Bar (Localized variance)',
      icon: Gauge,
      color: 'text-sky-600',
      barColor: 'from-sky-400 to-blue-600',
    },
    {
      title: 'Volumetric Inflow Equilibrium',
      score: sub.volumetric_equilibrium?.score ?? 92.0,
      weight: '25%',
      desc: sub.volumetric_equilibrium?.status ?? 'Balanced (+2.4% Headroom)',
      icon: Droplets,
      color: 'text-blue-600',
      barColor: 'from-blue-400 to-indigo-600',
    },
    {
      title: 'Balancing Storage Fill Health',
      score: sub.storage_fill_health?.score ?? 84.5,
      weight: '20%',
      desc: sub.storage_fill_health?.status ?? '8.3 Days City-Wide Reserve',
      icon: Layers,
      color: 'text-indigo-600',
      barColor: 'from-indigo-400 to-purple-600',
    },
    {
      title: 'NRW Distribution Efficiency',
      score: sub.nrw_efficiency?.score ?? 83.6,
      weight: '15%',
      desc: sub.nrw_efficiency?.status ?? '16.4% Unaccounted Loss Rate',
      icon: TrendingUp,
      color: 'text-cyan-600',
      barColor: 'from-cyan-400 to-teal-600',
    },
    {
      title: 'Telemetry Network Reliability',
      score: sub.telemetry_reliability?.score ?? 96.5,
      weight: '15%',
      desc: sub.telemetry_reliability?.status ?? '17 Connected Edge Probes',
      icon: Radio,
      color: 'text-emerald-600',
      barColor: 'from-emerald-400 to-green-600',
    },
  ];

  return (
    <GlassCard variant="frosted" className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-sky-100 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
              Multi-Modal Telemetry Fusion
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Cross-Modal Validated
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            Unified Water Network Health Assessment
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            {verdict}
          </p>
        </div>

        {/* Big Overall Health Dial */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-sky-50 to-blue-50/50 p-4 rounded-2xl border border-sky-100 shadow-sm shrink-0">
          <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-md border-2 border-sky-400">
            <span className="text-xl font-black font-mono text-sky-950">
              {score}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Composite Health Index
            </span>
            <span className="text-sm font-extrabold text-slate-900 block">
              {status}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> 100-Point Normalized Index
            </span>
          </div>
        </div>
      </div>

      {/* 5 Sub-Indices Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {subIndices.map((idx, i) => {
          const Icon = idx.icon;
          return (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm space-y-2 hover:border-sky-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 truncate">{idx.title}</span>
                <span className="text-[9px] font-mono text-slate-400">w: {idx.weight}</span>
              </div>

              <div className="flex items-center justify-between font-mono">
                <span className="text-lg font-extrabold text-slate-900">{idx.score}%</span>
                <Icon className={`w-4 h-4 ${idx.color}`} />
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${idx.barColor}`}
                  style={{ width: `${idx.score}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-400 truncate pt-0.5">{idx.desc}</p>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
