import React from 'react';
import { GlassCard } from '../index';
import { Clock, AlertTriangle, ShieldAlert, ArrowRight, CheckCircle2, Hospital } from 'lucide-react';

export default function ShortageTimelineCountdown({ shortageTimeline }) {
  if (!shortageTimeline || shortageTimeline.length === 0) {
    return (
      <GlassCard variant="frosted" className="p-6">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-sky-100">
          <h3 className="font-bold text-base text-slate-900">Predicted Shortage Timeline</h3>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> All Zones in Positive Reserve
          </span>
        </div>
        <p className="text-xs text-slate-500 py-3">
          No municipal distribution sectors currently face storage depletion deficits within the 7-day planning window.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="frosted" className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sky-100 gap-2">
        <div>
          <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
            Storage Depletion Horizon
          </span>
          <h3 className="font-bold text-base text-slate-900">
            Critical Zone Depletion Countdown
          </h3>
        </div>
        <span className="text-xs text-rose-600 font-mono font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" /> Deficit Projection Active
        </span>
      </div>

      <div className="space-y-3">
        {shortageTimeline.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/80 via-white to-amber-50/50 border border-rose-200/90 shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{item.zone_name}</h4>
                  <span className="text-xs text-rose-700 font-medium">
                    Continuous Deficit: <strong>-{item.deficit_m3h} m³/h</strong>
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-extrabold text-rose-900 font-mono">
                  ~{item.hours_remaining} Hours
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Zero Floor: {item.projected_depletion_str}
                </span>
              </div>
            </div>

            {/* Critical Facilities Monitored */}
            <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200/80 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Critical Facilities Under Priority Protection:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(item.critical_facilities || []).map((fac, fIdx) => (
                  <span
                    key={fIdx}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"
                  >
                    <Hospital className="w-3 h-3 text-sky-600" />
                    {fac}
                  </span>
                ))}
              </div>
            </div>

            {/* Actionable recommendation */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-rose-100 text-slate-700">
              <div className="flex items-center gap-1.5 text-rose-900 font-semibold text-[11px]">
                <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
                <span>Primary Mitigation: {item.recommended_action}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
