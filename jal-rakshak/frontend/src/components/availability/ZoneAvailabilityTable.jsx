import React from 'react';
import { GlassCard, StatusBadge } from '../index';
import { TrendingDown, TrendingUp, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';

export default function ZoneAvailabilityTable({ zonesShortage, onSelectZone }) {
  const riskBadges = {
    Critical: 'bg-rose-100 text-rose-800 border-rose-300',
    'High Risk': 'bg-orange-100 text-orange-800 border-orange-300',
    'Moderate Risk': 'bg-amber-100 text-amber-800 border-amber-300',
    'Low Risk': 'bg-sky-100 text-sky-800 border-sky-300',
    Normal: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  return (
    <GlassCard variant="frosted" className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sky-100 gap-2">
        <div>
          <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
            Hydraulic Balancing Matrix
          </span>
          <h3 className="font-bold text-base text-slate-900">
            Zone-Wise Water Availability & Reserve Metrics
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          5 Monitored Sectors
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-sky-100 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="pb-3 font-bold">Zone Sector</th>
              <th className="pb-3 font-bold text-right">Storage Level</th>
              <th className="pb-3 font-bold text-right">Inflow Supply</th>
              <th className="pb-3 font-bold text-right">Pred. Demand</th>
              <th className="pb-3 font-bold text-right">Leakage Drag</th>
              <th className="pb-3 font-bold text-right">Net Balance</th>
              <th className="pb-3 font-bold text-right">Reserve Hours</th>
              <th className="pb-3 font-bold text-center">Risk Category</th>
              <th className="pb-3 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {(zonesShortage || []).map((z) => {
              const isDeficit = z.is_deficit;
              const badgeClass = riskBadges[z.risk_category] || riskBadges.Normal;

              return (
                <tr key={z.zone_id} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-3.5 pr-2 font-sans">
                    <strong className="block text-slate-900 text-xs">{z.zone_name.split(':')[0]}</strong>
                    <span className="text-[10px] text-slate-400 block font-normal font-sans">
                      {z.zone_name.split(':')[1]?.trim()} • {(z.population_served / 1000).toFixed(0)}k pop
                    </span>
                  </td>

                  <td className="py-3.5 px-2 text-right">
                    <span className="font-bold text-slate-800">{z.storage_level_pct}%</span>
                    <span className="block text-[10px] text-slate-400">{z.current_storage_m3} m³</span>
                  </td>

                  <td className="py-3.5 px-2 text-right text-slate-700">
                    {z.incoming_supply_m3h} m³/h
                  </td>

                  <td className="py-3.5 px-2 text-right text-sky-800 font-bold">
                    {z.predicted_demand_m3h} m³/h
                  </td>

                  <td className="py-3.5 px-2 text-right text-slate-500">
                    {z.leakage_loss_m3h > 15 ? (
                      <span className="text-rose-600 font-bold">{z.leakage_loss_m3h} m³/h</span>
                    ) : (
                      <span>{z.leakage_loss_m3h} m³/h</span>
                    )}
                  </td>

                  <td className="py-3.5 px-2 text-right font-extrabold">
                    <span className={`inline-flex items-center gap-0.5 ${isDeficit ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isDeficit ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {z.net_balance_m3h > 0 ? '+' : ''}{z.net_balance_m3h} m³/h
                    </span>
                  </td>

                  <td className="py-3.5 px-2 text-right">
                    {z.reserve_hours ? (
                      <span className="font-bold text-slate-900">{z.reserve_hours}h</span>
                    ) : (
                      <span className="text-emerald-700 font-sans font-semibold text-[11px]">Equilibrium</span>
                    )}
                  </td>

                  <td className="py-3.5 px-2 text-center font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${badgeClass}`}>
                      {z.risk_category}
                    </span>
                  </td>

                  <td className="py-3.5 pl-2 text-center font-sans">
                    <button
                      onClick={() => onSelectZone(z.zone_id)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-all inline-flex items-center gap-0.5"
                    >
                      Mitigate <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
