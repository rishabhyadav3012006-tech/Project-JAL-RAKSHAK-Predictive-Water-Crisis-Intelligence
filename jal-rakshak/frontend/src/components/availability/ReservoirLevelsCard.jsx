import React from 'react';
import { GlassCard, StatusBadge } from '../index';
import { Layers, Droplets, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function ReservoirLevelsCard({ reservoirs }) {
  const defaultReservoirs = [
    {
      id: 'res-sharda',
      name: 'Sharda Sagar Bulk Raw Reservoir',
      type: 'Raw Catchment Basin',
      capacity_ml: 4500.0,
      current_ml: 3802.5,
      level_pct: 84.5,
      inflow_mld: 860.0,
      outflow_mld: 842.0,
      status: 'normal',
      reserve_days: 4.5,
    },
    {
      id: 'res-wtp',
      name: 'Metro Rapid Gravity WTP Clearwell',
      type: 'Treated Potable Storage',
      capacity_ml: 1000.0,
      current_ml: 880.0,
      level_pct: 88.0,
      inflow_mld: 842.0,
      outflow_mld: 820.0,
      status: 'normal',
      reserve_days: 1.1,
    },
    {
      id: 'res-east',
      name: 'East Elevated High-Storage Tank',
      type: 'Elevated Balancing Tank',
      capacity_ml: 950.0,
      current_ml: 724.0,
      level_pct: 76.2,
      inflow_mld: 195.0,
      outflow_mld: 184.0,
      status: 'normal',
      reserve_days: 3.9,
    },
    {
      id: 'res-south',
      name: 'South Industrial Balancing Sump',
      type: 'Ground Balancing Sump',
      capacity_ml: 1500.0,
      current_ml: 876.0,
      level_pct: 58.4,
      inflow_mld: 210.0,
      outflow_mld: 242.5,
      status: 'warning',
      reserve_days: 1.6,
    },
    {
      id: 'res-west',
      name: 'West Sub-aquifer Ground Reservoir',
      type: 'Sub-aquifer Storage Sump',
      capacity_ml: 850.0,
      current_ml: 697.0,
      level_pct: 82.0,
      inflow_mld: 180.0,
      outflow_mld: 174.0,
      status: 'normal',
      reserve_days: 4.0,
    },
  ];

  const list = reservoirs && reservoirs.length > 0 ? reservoirs : defaultReservoirs;

  return (
    <GlassCard variant="frosted" className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sky-100 gap-2">
        <div>
          <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
            Storage Infrastructure
          </span>
          <h3 className="font-bold text-base text-slate-900">
            Municipal Reservoir Levels & Capacity Fill
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          5 Monitored Balancing Assets
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {list.map((res) => {
          const isWarning = res.status === 'warning' || res.level_pct < 65.0;
          const isNetDrawdown = res.outflow_mld > res.inflow_mld;

          return (
            <div
              key={res.id}
              className={`p-4 rounded-2xl border transition-all ${
                isWarning
                  ? 'bg-amber-50/60 border-amber-200/90 shadow-sm'
                  : 'bg-white/80 border-slate-200/80 shadow-sm hover:border-sky-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{res.name}</h4>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                    {res.type || 'Storage Asset'}
                  </span>
                </div>
                <StatusBadge
                  status={isWarning ? 'warning' : 'normal'}
                  label={`${res.level_pct}%`}
                  size="sm"
                />
              </div>

              {/* Graphical Water Fill Gauge */}
              <div className="space-y-1.5 my-3">
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isWarning
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                        : 'bg-gradient-to-r from-sky-400 to-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, res.level_pct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Current: <strong className="text-slate-700">{res.current_ml} ML</strong></span>
                  <span>Capacity: {res.capacity_ml} ML</span>
                </div>
              </div>

              {/* Telemetry metrics */}
              <div className="pt-2 border-t border-slate-100/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="flex items-center gap-1 text-slate-600">
                  <span className="text-[10px] text-slate-400 font-sans">Inflow:</span>
                  <span className="font-bold">{res.inflow_mld} MLD</span>
                </div>

                <div className="flex items-center justify-end gap-1 text-slate-600">
                  <span className="text-[10px] text-slate-400 font-sans">Outflow:</span>
                  <span className={`font-bold flex items-center ${isNetDrawdown ? 'text-amber-700' : 'text-slate-700'}`}>
                    {res.outflow_mld} MLD
                    {isNetDrawdown ? <ArrowDownRight className="w-3 h-3 text-amber-600 inline" /> : <ArrowUpRight className="w-3 h-3 text-emerald-600 inline" />}
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-100/60 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Reserve: <strong className="text-slate-800">{res.reserve_days} Days</strong>
                </span>
                {isWarning && (
                  <span className="text-amber-700 font-bold flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Drawdown Alert
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
