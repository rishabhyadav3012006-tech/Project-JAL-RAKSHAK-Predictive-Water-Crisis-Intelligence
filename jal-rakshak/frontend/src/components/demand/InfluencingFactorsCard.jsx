import React from 'react';
import { GlassCard } from '../index';
import { Sparkles, Sun, Clock, Calendar, HelpCircle } from 'lucide-react';

export default function InfluencingFactorsCard({ factors }) {
  const defaultFactors = [
    {
      factor: 'Diurnal Morning & Evening Household Surge',
      importance_pct: 34.5,
      impact: 'Primary driver around 08:00 and 19:00 hrs due to domestic residential routine.',
      correlation: 'Strong Positive Cyclical',
    },
    {
      factor: 'Ambient Temperature & Evaporative Cooling',
      importance_pct: 26.2,
      impact: '+1.8% volumetric consumption per degree Celsius above 26°C.',
      correlation: 'Positive Linear Elasticity',
    },
    {
      factor: 'Autoregressive 24h & 168h Seasonality',
      importance_pct: 21.8,
      impact: 'Prior day same-hour and same-weekday lag features maintain baseline momentum.',
      correlation: 'High Autocorrelation',
    },
    {
      factor: 'Weekend vs Weekday Operational Shift',
      importance_pct: 17.5,
      impact: '+12% shift on Saturday/Sunday reflecting residential occupancy patterns.',
      correlation: 'Categorical Shift',
    },
  ];

  const items = factors && factors.length > 0 ? factors : defaultFactors;

  return (
    <GlassCard variant="frosted" className="p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-sky-100">
        <div>
          <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
            Explainable AI Insights
          </span>
          <h3 className="font-bold text-base text-slate-900">
            Factors Influencing Demand Forecasts
          </h3>
        </div>
        <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm space-y-1.5 text-xs"
          >
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold">{item.factor}</strong>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
                {item.importance_pct}%
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">{item.impact}</p>
            <div className="text-[10px] font-semibold text-slate-400 pt-1 border-t border-slate-100">
              Correlation: <span className="text-sky-700">{item.correlation}</span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
