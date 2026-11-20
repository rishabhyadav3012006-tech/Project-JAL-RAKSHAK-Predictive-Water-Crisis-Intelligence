import React from 'react';
import { GlassCard } from '../index';
import {
  Droplets,
  Layers,
  AlertTriangle,
  Clock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export default function AvailabilityOverviewCards({ reservoirOverview, zonesShortage }) {
  const overallCurrent = reservoirOverview?.overall_current_ml ?? 6979.5;
  const overallCapacity = reservoirOverview?.overall_capacity_ml ?? 8800.0;
  const overallPct = reservoirOverview?.overall_fill_pct ?? 79.3;
  const securityDays = reservoirOverview?.city_wide_water_security_days ?? 8.3;

  const deficitZonesCount = (zonesShortage || []).filter((z) => z.is_deficit).length;
  const criticalZonesCount = (zonesShortage || []).filter((z) => z.risk_category === 'Critical' || z.risk_category === 'High Risk').length;

  const totalSupply = (zonesShortage || []).reduce((acc, z) => acc + z.incoming_supply_m3h, 0);
  const totalDemand = (zonesShortage || []).reduce((acc, z) => acc + z.predicted_demand_m3h, 0);
  const totalLeakage = (zonesShortage || []).reduce((acc, z) => acc + z.leakage_loss_m3h, 0);
  const netCityBalance = Math.round(totalSupply - (totalDemand + totalLeakage));

  const kpis = [
    {
      title: 'City Bulk Storage Volume',
      value: `${overallCurrent.toLocaleString()} ML`,
      desc: `${overallPct}% of ${overallCapacity.toLocaleString()} ML total capacity`,
      icon: Layers,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      border: 'border-sky-100',
    },
    {
      title: 'Water Security Horizon',
      value: `${securityDays} Days`,
      desc: 'City-wide baseline reserve duration',
      icon: Clock,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      title: 'Sectors Under Deficit',
      value: `${deficitZonesCount} of 5 Zones`,
      desc: deficitZonesCount > 0 ? 'Zone 9-12 South under stress' : 'All zones in equilibrium',
      icon: deficitZonesCount > 0 ? AlertTriangle : ShieldCheck,
      color: deficitZonesCount > 0 ? 'text-amber-600' : 'text-emerald-600',
      bg: deficitZonesCount > 0 ? 'bg-amber-50' : 'bg-emerald-50',
      border: deficitZonesCount > 0 ? 'border-amber-100' : 'border-emerald-100',
    },
    {
      title: 'Critical Risk Sectors',
      value: `${criticalZonesCount} Active`,
      desc: criticalZonesCount > 0 ? 'Mitigation protocols active' : 'Normal risk status',
      icon: AlertTriangle,
      color: criticalZonesCount > 0 ? 'text-rose-600' : 'text-sky-600',
      bg: criticalZonesCount > 0 ? 'bg-rose-50' : 'bg-sky-50',
      border: criticalZonesCount > 0 ? 'border-rose-100' : 'border-sky-100',
    },
    {
      title: 'City Net Flow Headroom',
      value: `${netCityBalance > 0 ? '+' : ''}${netCityBalance} m³/h`,
      desc: 'Supply vs (Demand + Leakage)',
      icon: TrendingUp,
      color: netCityBalance >= 0 ? 'text-cyan-600' : 'text-rose-600',
      bg: netCityBalance >= 0 ? 'bg-cyan-50' : 'bg-rose-50',
      border: netCityBalance >= 0 ? 'border-cyan-100' : 'border-rose-100',
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
