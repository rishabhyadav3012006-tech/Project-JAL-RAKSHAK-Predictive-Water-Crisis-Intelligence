import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useTelemetry } from '../../context/TelemetryContext';
import { GlassCard } from '../index';
import { Database } from 'lucide-react';

function CustomGlassTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-glass-md text-xs">
        <h4 className="font-bold text-slate-900 mb-1">{data.name}</h4>
        <div className="space-y-1 text-slate-600">
          <p>Stored Volume: <strong className="text-sky-700 font-mono">{data.currentML} ML</strong></p>
          <p>Total Capacity: <strong className="text-slate-800 font-mono">{data.capacityML} ML</strong></p>
          <p>Capacity Filled: <strong className="text-emerald-700 font-mono">{data.percentage}%</strong></p>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Chart 4: Reservoir Capacity Trends
 */
export default function ReservoirCapacityChart() {
  const { reservoirs } = useTelemetry();

  return (
    <GlassCard variant="frosted" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Reservoir Storage Levels
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Current stored water volume vs designed storage capacity (Million Litres)
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={reservoirs} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 10 }}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
              unit=" ML"
            />
            <Tooltip content={<CustomGlassTooltip />} />
            <Bar dataKey="capacityML" name="Designed Capacity" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
            <Bar dataKey="currentML" name="Current Water Level" radius={[6, 6, 0, 0]}>
              {reservoirs.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.percentage < 70 ? '#f59e0b' : '#0ea5e9'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
