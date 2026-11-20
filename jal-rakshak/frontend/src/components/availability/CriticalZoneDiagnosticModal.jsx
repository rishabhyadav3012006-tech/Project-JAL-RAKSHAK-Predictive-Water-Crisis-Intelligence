import React from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Hospital,
  Activity,
  ArrowRight,
  TrendingDown,
  Info,
  Sliders,
} from 'lucide-react';
import { StatusBadge, PrimaryButton, SecondaryButton } from '../index';

export default function CriticalZoneDiagnosticModal({ zoneData, onClose }) {
  if (!zoneData) return null;

  const isDeficit = zoneData.is_deficit;
  const formula = zoneData.transparent_formula || {
    deficit_term: 0.28,
    reserve_term: 0.30,
    storage_term: 0.12,
    total_score: zoneData.shortage_risk_score,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-3xl border border-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto z-10">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-sky-100 gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
                Zonal Shortage Risk Deep-Dive
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {zoneData.zone_id}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {zoneData.zone_name}
            </h2>
            <p className="text-xs text-slate-500">
              Population Served: <strong>{(zoneData.population_served / 1000).toFixed(0)}k Residents</strong> • Storage Fill: <strong>{zoneData.storage_level_pct}% ({zoneData.current_storage_m3} m³)</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Non-Guaranteed Disclaimer Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 shadow-sm">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>Probabilistic Hydrodynamic Estimate:</strong> {zoneData.disclaimer || 'Predictions reflect dynamic simulation parameters and are not guaranteed future outcomes. Continuous monitoring required.'}
          </p>
        </div>

        {/* Transparent Formula Explainability Card */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Transparent Shortage Risk Model Scoring
            </span>
            <span className="text-xs font-mono font-extrabold text-sky-800 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
              Overall Score: {zoneData.shortage_risk_score} / 1.00
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-sans">Deficit Ratio (40%)</span>
              <strong className="text-rose-700 font-mono text-sm">+{formula.deficit_term}</strong>
              <span className="text-[9px] text-slate-400 block mt-0.5">Net outflow deficit</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-sans">Reserve Urgency (35%)</span>
              <strong className="text-amber-700 font-mono text-sm">+{formula.reserve_term}</strong>
              <span className="text-[9px] text-slate-400 block mt-0.5">Hours remaining</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-sans">Storage Level (25%)</span>
              <strong className="text-blue-700 font-mono text-sm">+{formula.storage_term}</strong>
              <span className="text-[9px] text-slate-400 block mt-0.5">Tank depletion fraction</span>
            </div>
          </div>
        </div>

        {/* Hydraulic Balance Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100">
            <span className="text-[10px] text-slate-400 font-sans block">Inflow Supply</span>
            <strong className="text-slate-900">{zoneData.incoming_supply_m3h} m³/h</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100">
            <span className="text-[10px] text-slate-400 font-sans block">Predicted Demand</span>
            <strong className="text-sky-900">{zoneData.predicted_demand_m3h} m³/h</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100">
            <span className="text-[10px] text-slate-400 font-sans block">Leakage Drag</span>
            <strong className="text-slate-600">{zoneData.leakage_loss_m3h} m³/h</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
            <span className="text-[10px] text-slate-400 font-sans block">Net Balance Rate</span>
            <strong className={isDeficit ? 'text-rose-600' : 'text-emerald-600'}>
              {zoneData.net_balance_m3h > 0 ? '+' : ''}{zoneData.net_balance_m3h} m³/h
            </strong>
          </div>
        </div>

        {/* Critical Facilities Under Risk */}
        {zoneData.critical_facilities && zoneData.critical_facilities.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Monitored Critical Facilities in Sector
            </span>
            <div className="flex flex-wrap gap-2">
              {zoneData.critical_facilities.map((fac, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5"
                >
                  <Hospital className="w-3.5 h-3.5 text-sky-600" />
                  {fac}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actionable Engineering Recommendations */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50/60 to-white border border-sky-200/80 space-y-2.5">
          <span className="text-xs font-bold text-sky-900 uppercase tracking-wider block">
            Actionable Mitigation Recommendations
          </span>
          <div className="space-y-2">
            {(zoneData.recommendations || []).map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <ArrowRight className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <PrimaryButton onClick={onClose}>Close Diagnostic</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
