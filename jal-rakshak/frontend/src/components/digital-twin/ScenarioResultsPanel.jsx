import React from 'react';
import { GlassCard, StatusBadge } from '../index';
import {
  Droplets,
  Layers,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Info,
  Clock,
  ShieldAlert,
  Gauge,
  Sparkles,
} from 'lucide-react';

export default function ScenarioResultsPanel({ results }) {
  if (!results || !results.water_balance) return null;

  const { water_balance, tank_dynamics, zones_availability, overall_health, assumptions_and_limitations } = results;

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300">Critical</span>;
      case 'High Risk':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-800 border border-orange-300">High Risk</span>;
      case 'Moderate Risk':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">Moderate</span>;
      case 'Low Risk':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-sky-100 text-sky-800 border border-sky-300">Low Risk</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">Normal</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Top Water Balance KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {/* Available Water */}
        <GlassCard variant="frosted" className="p-3 text-center border-t-2 border-t-sky-500">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Available Supply</span>
          <span className="text-base font-extrabold text-sky-800 font-mono mt-0.5 block">
            {water_balance.available_water_mld} MLD
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Intake from {water_balance.reservoir_volume_ml} ML
          </span>
        </GlassCard>

        {/* Total Demand */}
        <GlassCard variant="frosted" className="p-3 text-center border-t-2 border-t-blue-500">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Demand</span>
          <span className="text-base font-extrabold text-slate-800 font-mono mt-0.5 block">
            {water_balance.total_demand_mld} MLD
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Gross Municipal Target</span>
        </GlassCard>

        {/* Actual Consumption */}
        <GlassCard variant="frosted" className="p-3 text-center border-t-2 border-t-emerald-500">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Delivered Water</span>
          <span className="text-base font-extrabold text-emerald-700 font-mono mt-0.5 block">
            {water_balance.total_consumption_mld} MLD
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {water_balance.satisfaction_rate_pct}% Satisfied
          </span>
        </GlassCard>

        {/* Supply-Demand Deficit */}
        <GlassCard
          variant="frosted"
          className={`p-3 text-center border-t-2 ${
            water_balance.supply_demand_deficit_mld > 0 ? 'border-t-rose-500 bg-rose-50/20' : 'border-t-emerald-500'
          }`}
        >
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Supply Deficit</span>
          <span
            className={`text-base font-extrabold font-mono mt-0.5 block ${
              water_balance.supply_demand_deficit_mld > 0 ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {water_balance.supply_demand_deficit_mld > 0 ? `-${water_balance.supply_demand_deficit_mld}` : '0.0'} MLD
          </span>
          <span className="text-[10px] font-semibold text-slate-500">
            {water_balance.supply_demand_deficit_mld > 0 ? 'Shortfall Action Needed' : 'Equilibrium'}
          </span>
        </GlassCard>

        {/* Losses */}
        <GlassCard variant="frosted" className="p-3 text-center border-t-2 border-t-amber-500">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Distribution Losses</span>
          <span className="text-base font-extrabold text-amber-700 font-mono mt-0.5 block">
            {water_balance.distribution_losses_mld} MLD
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {water_balance.simulated_leakage_mld > 0 ? `+${water_balance.simulated_leakage_mld} MLD Burst` : 'Friction Only'}
          </span>
        </GlassCard>

        {/* Overall Health Score */}
        <GlassCard variant="frosted" className="p-3 text-center border-t-2 border-t-indigo-500">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Grid Health Index</span>
          <span
            className={`text-base font-extrabold font-mono mt-0.5 block ${
              overall_health >= 85 ? 'text-emerald-700' : overall_health >= 65 ? 'text-amber-600' : 'text-rose-600'
            }`}
          >
            {overall_health} / 100
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {overall_health >= 85 ? 'Optimal' : overall_health >= 65 ? 'Stressed' : 'Critical'}
          </span>
        </GlassCard>
      </div>

      {/* 2. Middle Row: Storage Tank Dynamics & Zone Availability Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Storage Tank Dynamics */}
        <GlassCard className="p-4 space-y-3 lg:col-span-1" glowColor="sky">
          <div className="flex items-center justify-between pb-2 border-b border-sky-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-600" />
              Storage Tank Depletion Dynamics
            </h4>
            <span className="text-[10px] font-mono text-slate-400">2 Balancing Sumps</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* East Tank */}
            {tank_dynamics?.east_tank && (
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 truncate">
                    {tank_dynamics.east_tank.name}
                  </span>
                  <span className="font-mono font-bold text-sky-800">
                    {tank_dynamics.east_tank.level_pct}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      tank_dynamics.east_tank.level_pct < 35
                        ? 'bg-rose-500'
                        : tank_dynamics.east_tank.level_pct < 60
                        ? 'bg-amber-500'
                        : 'bg-sky-500'
                    }`}
                    style={{ width: `${tank_dynamics.east_tank.level_pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Net Flow: {tank_dynamics.east_tank.net_flow_mld > 0 ? `+${tank_dynamics.east_tank.net_flow_mld}` : tank_dynamics.east_tank.net_flow_mld} MLD</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Reserve: {tank_dynamics.east_tank.reserve_hours}h
                  </span>
                </div>
              </div>
            )}

            {/* South Tank */}
            {tank_dynamics?.south_tank && (
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 truncate">
                    {tank_dynamics.south_tank.name}
                  </span>
                  <span className="font-mono font-bold text-sky-800">
                    {tank_dynamics.south_tank.level_pct}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      tank_dynamics.south_tank.level_pct < 35
                        ? 'bg-rose-500'
                        : tank_dynamics.south_tank.level_pct < 60
                        ? 'bg-amber-500'
                        : 'bg-sky-500'
                    }`}
                    style={{ width: `${tank_dynamics.south_tank.level_pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Net Flow: {tank_dynamics.south_tank.net_flow_mld > 0 ? `+${tank_dynamics.south_tank.net_flow_mld}` : tank_dynamics.south_tank.net_flow_mld} MLD</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Reserve: {tank_dynamics.south_tank.reserve_hours}h
                  </span>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Zone-Wise Shortage Risk Grid */}
        <GlassCard className="p-4 space-y-3 lg:col-span-2" glowColor="sky">
          <div className="flex items-center justify-between pb-2 border-b border-sky-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-sky-600" />
              Zone-Wise Water Availability & Shortage Risk Triage
            </h4>
            <span className="text-[10px] font-mono text-slate-400">4 Distribution Sectors</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {(zones_availability || []).map((zone) => (
              <div
                key={zone.zone_id}
                className={`p-3 rounded-xl border space-y-2 transition-all ${
                  zone.shortage_risk === 'Critical'
                    ? 'bg-rose-50/70 border-rose-200'
                    : zone.shortage_risk === 'High Risk'
                    ? 'bg-orange-50/70 border-orange-200'
                    : zone.shortage_risk === 'Moderate Risk'
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="font-bold text-slate-900 leading-tight">{zone.name}</h5>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      Sector: {zone.sector_type} • Feeder: {zone.feeder_status}
                    </span>
                  </div>
                  {getRiskBadge(zone.shortage_risk)}
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100 text-[11px] font-mono">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block">Demand</span>
                    <span className="font-bold text-slate-700">{zone.target_demand_mld} MLD</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block">Allocated</span>
                    <span className="font-bold text-emerald-700">{zone.allocated_flow_mld} MLD</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block">Deficit</span>
                    <span className={`font-bold ${zone.deficit_mld > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {zone.deficit_mld} MLD
                    </span>
                  </div>
                </div>

                {/* Availability percentage bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Availability Ratio</span>
                    <span className="font-bold">{zone.availability_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        zone.availability_pct < 50
                          ? 'bg-rose-500'
                          : zone.availability_pct < 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${zone.availability_pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* 3. Assumptions and Limitations Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs space-y-1 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Assumptions & Simplified Hydrodynamic Limitations</span>
        </div>
        <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5 pl-1">
          {(assumptions_and_limitations || []).map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
