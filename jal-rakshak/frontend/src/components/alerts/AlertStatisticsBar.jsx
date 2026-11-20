import React from 'react';
import { GlassCard } from '../index';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export default function AlertStatisticsBar({ stats, onTriggerTest, isTriggering }) {
  const cards = [
    {
      title: 'Total Incidents',
      value: stats?.total_alerts ?? 5,
      desc: 'All recorded network events',
      icon: Bell,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      border: 'border-sky-100',
    },
    {
      title: 'Active Critical',
      value: stats?.active_critical ?? 1,
      desc: 'Immediate dispatch required',
      icon: ShieldAlert,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
    },
    {
      title: 'Acknowledged Rate',
      value: `${stats?.acknowledged_pct ?? 60.0}%`,
      desc: `${stats?.acknowledged_count ?? 3} of ${stats?.total_alerts ?? 5} triaged`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      title: 'Avg Triage Latency',
      value: `${stats?.average_response_mins ?? 38.5}m`,
      desc: 'From trigger to acknowledgement',
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      title: 'False Positive Rate',
      value: `${stats?.false_positive_rate_pct ?? 0.0}%`,
      desc: 'Corroborated by sensor fusion',
      icon: HelpCircle,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-100',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
            Incident Command Telemetry
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            Real-Time Alert & Incident Statistics
          </h2>
        </div>

        <button
          onClick={onTriggerTest}
          disabled={isTriggering}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-500/20 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isTriggering ? 'Simulating Divergence...' : 'Simulate Corroborated Pipe Rupture'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <GlassCard key={i} className="p-4" variant="frosted">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">{c.title}</span>
                <div className={`p-1.5 rounded-lg ${c.bg} ${c.color} border ${c.border}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                {c.value}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{c.desc}</p>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
