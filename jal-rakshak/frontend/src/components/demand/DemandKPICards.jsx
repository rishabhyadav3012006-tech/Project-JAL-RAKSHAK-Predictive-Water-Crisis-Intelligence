import React from 'react';
import { GlassCard } from '../index';
import {
  TrendingUp,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Sparkles,
} from 'lucide-react';

export default function DemandKPICards({ summary, horizon }) {
  const isDeficit = (summary?.net_supply_gap_m3 ?? 0) < 0;

  const kpis = [
    {
      title: 'Projected Avg Demand',
      value: `${summary?.average_demand_m3h ?? 445.0} m³/h`,
      desc: `Over selected ${horizon.toUpperCase()} horizon`,
      icon: TrendingUp,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      border: 'border-sky-100',
    },
    {
      title: 'Peak Projected Load',
      value: `${summary?.peak_demand_m3h ?? 637.9} m³/h`,
      desc: 'Maximum expected diurnal surge',
      icon: Gauge,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      title: 'Planned Supply Buffer',
      value: `${summary?.planned_supply_m3 ?? 10800} m³`,
      desc: 'Municipal treatment allocation',
      icon: Droplets,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      border: 'border-cyan-100',
    },
    {
      title: 'Expected Supply-Demand Gap',
      value: `${isDeficit ? '' : '+'}${summary?.net_supply_gap_m3 ?? 540.0} m³`,
      desc: isDeficit ? 'Deficit warning: dispatch reserve' : 'Healthy operating headroom',
      icon: isDeficit ? AlertTriangle : CheckCircle2,
      color: isDeficit ? 'text-rose-600' : 'text-emerald-600',
      bg: isDeficit ? 'bg-rose-50' : 'bg-emerald-50',
      border: isDeficit ? 'border-rose-100' : 'border-emerald-100',
    },
    {
      title: 'Forecast Confidence',
      value: '±3.8% (95% CI)',
      desc: 'XGBoost sequential bound',
      icon: Sparkles,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <GlassCard key={i} className="p-4" variant="frosted">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">{kpi.title}</span>
              <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color} border ${kpi.border}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {kpi.value}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{kpi.desc}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}
