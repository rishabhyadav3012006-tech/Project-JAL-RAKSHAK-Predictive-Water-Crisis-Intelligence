import React from 'react';
import { GlassCard, StatusBadge } from '../index';
import { AlertTriangle, Clock, CheckCircle, ShieldAlert } from 'lucide-react';

/**
 * StoredEventsTable
 * Displays historical stored anomaly events with scores and explanations.
 */
export default function StoredEventsTable({ events = [] }) {
  const getSeverityStyle = (sev) => {
    if (sev === 'CRITICAL') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (sev === 'HIGH') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (sev === 'MODERATE') return 'bg-sky-50 text-sky-700 border-sky-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  return (
    <GlassCard variant="frosted" className="p-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-sky-100">
        <div>
          <h3 className="font-bold text-base text-slate-900">
            Stored Anomaly Incidents & Historical Log
          </h3>
          <p className="text-xs text-slate-500">
            Audit trail of AI-flagged pipeline anomalies, acoustic deviations, and reservoir depletion alerts
          </p>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          {events.length} Recorded Events
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Event ID & Time</th>
              <th className="py-2.5 px-3">Sector & Asset</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Score</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Diagnostic Explanation</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((ev) => (
              <tr key={ev.id} className="hover:bg-sky-50/40 transition-colors">
                <td className="py-3 px-3">
                  <span className="font-mono font-bold text-slate-900 block">{ev.id}</span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {ev.timestamp}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <span className="font-semibold text-slate-800 block">{ev.sensor_id}</span>
                  <span className="text-[11px] text-slate-400 capitalize">{ev.zone_id.replace('zone-', '')}</span>
                </td>

                <td className="py-3 px-3 font-medium text-slate-700">
                  {ev.category}
                </td>

                <td className="py-3 px-3 font-mono font-bold text-rose-600">
                  {(ev.anomaly_score * 100).toFixed(1)}%
                </td>

                <td className="py-3 px-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityStyle(ev.severity)}`}>
                    {ev.severity}
                  </span>
                </td>

                <td className="py-3 px-3 max-w-xs text-slate-600 text-[11px] leading-relaxed">
                  {ev.explanation}
                </td>

                <td className="py-3 px-3">
                  {ev.acknowledged ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Resolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Action Needed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
