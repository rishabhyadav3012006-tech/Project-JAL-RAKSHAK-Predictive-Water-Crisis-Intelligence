import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { GlassCard } from '../index';
import { Layers, Droplets, Gauge, Activity, Clock } from 'lucide-react';

export default function MultiStreamAlignmentChart() {
  // Synchronized discrete time-epoch stream data
  const alignedStreamData = [
    { time: '00:00', flow: 145.0, pressure: 4.85, meter: 120.0, tank: 86.0 },
    { time: '02:00', flow: 120.0, pressure: 5.10, meter: 95.0, tank: 87.5 },
    { time: '04:00', flow: 135.0, pressure: 5.00, meter: 105.0, tank: 88.0 },
    { time: '06:00', flow: 195.0, pressure: 4.60, meter: 175.0, tank: 86.5 },
    { time: '08:00', flow: 235.0, pressure: 4.25, meter: 220.0, tank: 83.0 },
    { time: '10:00', flow: 215.0, pressure: 4.40, meter: 195.0, tank: 81.5 },
    { time: '12:00', flow: 190.0, pressure: 4.65, meter: 170.0, tank: 80.0 },
    { time: '14:00', flow: 180.0, pressure: 4.75, meter: 160.0, tank: 79.2 },
    { time: '16:00', flow: 205.0, pressure: 4.50, meter: 185.0, tank: 78.5 },
    { time: '18:00', flow: 230.0, pressure: 4.30, meter: 215.0, tank: 77.0 },
    { time: '20:00', flow: 210.0, pressure: 4.55, meter: 190.0, tank: 76.2 },
    { time: '22:00', flow: 170.0, pressure: 4.75, meter: 145.0, tank: 76.0 },
  ];

  return (
    <GlassCard variant="frosted" className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sky-100 gap-2">
        <div>
          <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
            Temporal Synchronization
          </span>
          <h3 className="font-bold text-base text-slate-900">
            Multi-Stream Telemetry Timestamp Alignment
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1 text-sky-600">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Flow (m³/h)
          </span>
          <span className="flex items-center gap-1 text-blue-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Pressure (Bar)
          </span>
          <span className="flex items-center gap-1 text-indigo-600">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Meter (m³/h)
          </span>
          <span className="flex items-center gap-1 text-purple-600">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Tank Fill (%)
          </span>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={alignedStreamData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0f2fe" opacity={0.7} />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} unit=" m³" />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 8]} unit=" b" />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white/95 p-3 rounded-xl border border-sky-100 shadow-md text-xs space-y-1">
                      <strong className="block text-slate-900 border-b pb-1 font-mono">{label} Aligned Epoch</strong>
                      <div className="text-sky-700">Inflow: <span className="font-mono font-bold">{d.flow} m³/h</span></div>
                      <div className="text-blue-700">Pressure: <span className="font-mono font-bold">{d.pressure} Bar</span></div>
                      <div className="text-indigo-700">Smart Meter: <span className="font-mono font-bold">{d.meter} m³/h</span></div>
                      <div className="text-purple-700">Storage Tank: <span className="font-mono font-bold">{d.tank}%</span></div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line yAxisId="left" type="monotone" dataKey="flow" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 2 }} name="Flow" />
            <Line yAxisId="right" type="monotone" dataKey="pressure" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} name="Pressure" />
            <Line yAxisId="left" type="monotone" dataKey="meter" stroke="#6366f1" strokeWidth={2} strokeDasharray="3 3" dot={false} name="Meter" />
            <Line yAxisId="left" type="monotone" dataKey="tank" stroke="#9333ea" strokeWidth={1.5} dot={false} name="Tank" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
