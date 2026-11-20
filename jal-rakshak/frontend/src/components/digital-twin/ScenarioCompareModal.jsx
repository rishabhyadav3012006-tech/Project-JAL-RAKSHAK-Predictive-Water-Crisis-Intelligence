import React from 'react';
import { GlassModal, PrimaryButton, SecondaryButton } from '../index';
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Droplets,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function ScenarioCompareModal({ isOpen, onClose, compareData }) {
  if (!compareData || !compareData.baseline || !compareData.simulated) return null;

  const { baseline, simulated, deltas, zone_comparisons } = compareData;

  const renderDelta = (val, unit = '', invert = false) => {
    if (val === 0) return <span className="text-slate-400 font-mono">0.0 {unit}</span>;
    const isPositive = val > 0;
    const isGood = invert ? !isPositive : isPositive;
    return (
      <span
        className={`font-mono font-bold flex items-center gap-0.5 ${
          isGood ? 'text-emerald-600' : 'text-rose-600'
        }`}
      >
        {isPositive ? `+${val}` : val} {unit}
      </span>
    );
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Side-by-Side Scenario Hydraulic Comparison"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Header Notice */}
        <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200/90 text-sky-950 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              Comparing <strong>Baseline Flow ({baseline.scenario_name || 'Normal'})</strong> versus{' '}
              <strong>Simulated Scenario ({simulated.scenario_name || 'Active'})</strong>
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
            HYDRAULIC DELTAS ACTIVE
          </span>
        </div>

        {/* 1. Master Metric Delta Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Supply Delta</span>
            <div className="text-sm font-extrabold mt-1 flex justify-center">
              {renderDelta(deltas.available_water_mld, 'MLD')}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {baseline.water_balance.available_water_mld} ➔ {simulated.water_balance.available_water_mld}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Demand Delta</span>
            <div className="text-sm font-extrabold mt-1 flex justify-center">
              {renderDelta(deltas.demand_mld, 'MLD', true)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {baseline.water_balance.total_demand_mld} ➔ {simulated.water_balance.total_demand_mld}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Delivered Delta</span>
            <div className="text-sm font-extrabold mt-1 flex justify-center">
              {renderDelta(deltas.consumption_mld, 'MLD')}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {baseline.water_balance.total_consumption_mld} ➔ {simulated.water_balance.total_consumption_mld}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Deficit Delta</span>
            <div className="text-sm font-extrabold mt-1 flex justify-center">
              {renderDelta(deltas.deficit_mld, 'MLD', true)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {baseline.water_balance.supply_demand_deficit_mld} ➔ {simulated.water_balance.supply_demand_deficit_mld}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Losses Delta</span>
            <div className="text-sm font-extrabold mt-1 flex justify-center">
              {renderDelta(deltas.losses_mld, 'MLD', true)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {baseline.water_balance.distribution_losses_mld} ➔ {simulated.water_balance.distribution_losses_mld}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Health Score</span>
            <div className="text-sm font-extrabold mt-1 flex justify-center">
              {renderDelta(deltas.overall_health, 'pts')}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {baseline.overall_health} ➔ {simulated.overall_health}
            </span>
          </div>
        </div>

        {/* 2. Zone-by-Zone Shortage & Risk Transition Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-sky-600" />
            Zone-by-Zone Availability & Shortage Risk Shift
          </h4>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Zone / Sector</th>
                  <th className="p-3">Baseline Demand</th>
                  <th className="p-3">Simulated Demand</th>
                  <th className="p-3">Baseline Flow</th>
                  <th className="p-3">Simulated Flow</th>
                  <th className="p-3">Deficit Delta</th>
                  <th className="p-3">Risk Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {(zone_comparisons || []).map((row) => (
                  <tr key={row.zone_id} className={`hover:bg-slate-50/80 ${row.risk_shifted ? 'bg-amber-50/30' : ''}`}>
                    <td className="p-3 font-sans font-bold text-slate-900">{row.name}</td>
                    <td className="p-3 text-slate-600">{row.baseline_demand_mld} MLD</td>
                    <td className="p-3 text-slate-800 font-bold">{row.simulated_demand_mld} MLD</td>
                    <td className="p-3 text-slate-600">{row.baseline_allocated_mld} MLD</td>
                    <td className="p-3 text-emerald-700 font-bold">{row.simulated_allocated_mld} MLD</td>
                    <td className="p-3">
                      {row.simulated_deficit_mld > 0 ? (
                        <span className="text-rose-600 font-bold">+{row.simulated_deficit_mld} MLD</span>
                      ) : (
                        <span className="text-slate-400">0.0 MLD</span>
                      )}
                    </td>
                    <td className="p-3 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                          {row.baseline_shortage_risk}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            row.simulated_shortage_risk === 'Critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : row.simulated_shortage_risk === 'High Risk'
                              ? 'bg-orange-100 text-orange-800 border border-orange-300'
                              : row.simulated_shortage_risk === 'Moderate Risk'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {row.simulated_shortage_risk}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Tank Dynamics Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              East Elevated Tank Reserve Shift:
            </span>
            <div className="flex justify-between text-[11px] font-mono text-slate-600">
              <span>Baseline Level: {baseline.tank_dynamics?.east_tank?.level_pct}%</span>
              <span className="font-bold text-slate-900">
                Simulated: {simulated.tank_dynamics?.east_tank?.level_pct}%
              </span>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>Reserve: {baseline.tank_dynamics?.east_tank?.reserve_hours}h</span>
              <span className="font-bold text-sky-800">
                Simulated Reserve: {simulated.tank_dynamics?.east_tank?.reserve_hours}h
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              South Industrial Buffer Tank Reserve Shift:
            </span>
            <div className="flex justify-between text-[11px] font-mono text-slate-600">
              <span>Baseline Level: {baseline.tank_dynamics?.south_tank?.level_pct}%</span>
              <span className="font-bold text-slate-900">
                Simulated: {simulated.tank_dynamics?.south_tank?.level_pct}%
              </span>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>Reserve: {baseline.tank_dynamics?.south_tank?.reserve_hours}h</span>
              <span className="font-bold text-sky-800">
                Simulated Reserve: {simulated.tank_dynamics?.south_tank?.reserve_hours}h
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <PrimaryButton onClick={onClose}>Close Comparison</PrimaryButton>
        </div>
      </div>
    </GlassModal>
  );
}
