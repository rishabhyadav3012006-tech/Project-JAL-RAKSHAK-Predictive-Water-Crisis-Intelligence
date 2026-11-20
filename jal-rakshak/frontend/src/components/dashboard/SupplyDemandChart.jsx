import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useTelemetry } from '../../context/TelemetryContext';
import { GlassCard } from '../index';
import { Droplets } from 'lucide-react';

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
 * Chart 2: Water Supply versus Demand Comparison
 */
export default function SupplyDemandChart() {
  const { hourlyData } = useTelemetry();

  return (
    <GlassCard variant="frosted" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Droplets className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Water Supply versus Demand
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bulk distribution intake vs consumer demand curve across the municipal grid
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="supplyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
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
              dataKey="supply"
              name="Bulk Water Supply"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#supplyGradient)"
            />
            <Area
              type="monotone"
              dataKey="consumption"
              name="Consumer Demand"
              stroke="#0284c7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#demandGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
