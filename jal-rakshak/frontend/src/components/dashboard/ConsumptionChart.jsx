import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useTelemetry } from '../../context/TelemetryContext';
import { GlassCard } from '../index';
import { Waves } from 'lucide-react';

/**
 * Custom light glassmorphism tooltip for Recharts.
 */
function CustomGlassTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-glass-md text-xs">
        <span className="font-bold text-slate-800 block mb-1.5 font-mono">
          Time: {label}
        </span>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-slate-600 my-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}:</span>
            <strong className="text-slate-900 font-mono">
              {entry.value} MLD
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * Chart 1: Water Consumption Over Time
 */
export default function ConsumptionChart() {
  const { hourlyData } = useTelemetry();

  return (
    <GlassCard variant="frosted" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <Waves className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Water Consumption Over Time
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            24-hour metered consumption vs AI-predicted consumption target (MLD)
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-sky-500" />
            <span>Actual Consumption</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-1.5 rounded bg-blue-300" />
            <span>Target Baseline</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
              unit=" M"
            />
            <Tooltip content={<CustomGlassTooltip />} />
            <Area
              type="monotone"
              dataKey="consumption"
              name="Current Consumption"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#consumptionGradient)"
            />
            <Area
              type="monotone"
              dataKey="target"
              name="Target Baseline"
              stroke="#93c5fd"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
