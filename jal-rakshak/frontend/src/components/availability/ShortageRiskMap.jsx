import React from 'react';
import { GlassCard, StatusBadge } from '../index';
import {
  MapPin,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Clock,
  TrendingDown,
  TrendingUp,
  Droplets,
  ChevronRight,
  Activity,
} from 'lucide-react';

export default function ShortageRiskMap({ zonesShortage, onSelectZone, selectedZoneId }) {
  const riskStyles = {
    Critical: {
      bg: 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/40',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      textColor: 'text-rose-900',
      icon: ShieldAlert,
      iconColor: 'text-rose-600',
    },
    'High Risk': {
      bg: 'bg-orange-50/90 border-orange-300 ring-1 ring-orange-400/30',
      badgeBg: 'bg-orange-100 text-orange-800 border-orange-300',
      textColor: 'text-orange-900',
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
    },
    'Moderate Risk': {
      bg: 'bg-amber-50/70 border-amber-200/90',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      textColor: 'text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    'Low Risk': {
      bg: 'bg-sky-50/70 border-sky-200/90',
      badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
      textColor: 'text-sky-900',
      icon: ShieldCheck,
      iconColor: 'text-sky-600',
    },
    Normal: {
      bg: 'bg-white/90 border-slate-200/90 hover:border-sky-300',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      textColor: 'text-slate-900',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
    },
  };

  return (
    <GlassCard variant="frosted" className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sky-100 gap-2">
        <div>
          <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
            Zonal Topological Risk Grid
          </span>
          <h3 className="font-bold text-base text-slate-900">
            Municipal Water Shortage Risk Matrix
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>Click any zone to inspect transparent balance formulas & critical assets</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {(zonesShortage || []).map((zone) => {
          const style = riskStyles[zone.risk_category] || riskStyles.Normal;
          const Icon = style.icon;
          const isSelected = zone.zone_id === selectedZoneId;
          const isDeficit = zone.is_deficit;

          return (
            <div
              key={zone.zone_id}
              onClick={() => onSelectZone(zone.zone_id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm relative ${style.bg} ${
                isSelected ? 'ring-2 ring-sky-500 shadow-md' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white shadow-sm border border-slate-100">
                    <Icon className={`w-4 h-4 ${style.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {zone.zone_name.split(':')[0]}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      {zone.zone_name.split(':')[1]?.trim() || zone.zone_id}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badgeBg}`}
                >
                  {zone.risk_category}
                </span>
              </div>

              {/* Risk Score Progress Bar */}
              <div className="space-y-1 my-3">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-slate-500">Shortage Risk Score</span>
                  <span className="font-mono font-bold text-slate-800">
                    {Math.round(zone.shortage_risk_score * 100)} / 100
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      zone.shortage_risk_score >= 0.75
                        ? 'bg-rose-600'
                        : zone.shortage_risk_score >= 0.58
                        ? 'bg-orange-500'
                        : zone.shortage_risk_score >= 0.40
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, zone.shortage_risk_score * 100)}%` }}
                  />
                </div>
              </div>

              {/* Key Balance Metrics */}
              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Net Balance</span>
                  <span
                    className={`font-bold flex items-center gap-0.5 ${
                      isDeficit ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {isDeficit ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    {zone.net_balance_m3h > 0 ? '+' : ''}{zone.net_balance_m3h} m³/h
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Remaining Buffer</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {zone.reserve_hours ? `${zone.reserve_hours}h` : 'Equilibrium'}
                  </span>
                </div>
              </div>

              {/* Population & Trigger link */}
              <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-500">
                <span>Pop: <strong>{(zone.population_served / 1000).toFixed(0)}k residents</strong></span>
                <span className="font-bold text-sky-700 flex items-center gap-0.5 hover:underline">
                  View Mitigations <ChevronRight className="w-3 h-3 inline" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
