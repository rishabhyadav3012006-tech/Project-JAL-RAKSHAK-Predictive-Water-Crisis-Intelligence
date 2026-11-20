import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useTelemetry } from '../../context/TelemetryContext';
import { GlassCard } from '../index';
import { Gauge } from 'lucide-react';

function CustomGlassTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-glass-md text-xs">
        <span className="font-bold text-slate-800 block mb-1 font-mono">
          Hour: {label}
        </span>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-slate-600 my-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}:</span>
            <strong className="text-slate-900 font-mono">
              {entry.value} Bar
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * Chart 3: Pressure Monitoring across distribution rings
 */
export default function PressureMonitoringChart() {
  const { hourlyData } = useTelemetry();

  return (
    <GlassCard variant="frosted" className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Gauge className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Distribution Ring Pressure Monitoring
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time hydrostatic pressure curves with calibrated safety thresholds (Bar)
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-0.5 bg-sky-500" /> Ring 1 North
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-0.5 bg-indigo-500" /> Ring 2 East
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-0.5 bg-amber-500" /> Ring 3 South
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              domain={[2.0, 6.5]}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
              unit=" B"
            />
            <Tooltip content={<CustomGlassTooltip />} />
            {/* Safety Boundaries */}
            <ReferenceLine
              y={5.5}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: 'Max Surge limit (5.5 Bar)', fill: '#ef4444', fontSize: 10, position: 'top' }}
            />
            <ReferenceLine
              y={3.5}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{ value: 'Min Pressure limit (3.5 Bar)', fill: '#f59e0b', fontSize: 10, position: 'bottom' }}
            />
            <Line
              type="monotone"
              dataKey="pressureRing1"
              name="Ring 1 (North Core)"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="pressureRing2"
              name="Ring 2 (East Commercial)"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="pressureRing3"
              name="Ring 3 (South Industrial)"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
