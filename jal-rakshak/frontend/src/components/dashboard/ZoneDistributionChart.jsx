import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { useTelemetry } from '../../context/TelemetryContext';
import { GlassCard } from '../index';
import { PieChart as PieIcon } from 'lucide-react';

const ZONE_COLORS = ['#0ea5e9', '#0284c7', '#38bdf8', '#6366f1'];

function CustomGlassTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-glass-md text-xs">
        <span className="font-bold text-slate-800 block mb-1">
          {data.name}
        </span>
        <div className="space-y-0.5 text-slate-600">
          <p>Inflow Share: <strong className="text-sky-700 font-mono">{data.inflow} MLD</strong></p>
          <p>Loss Percentage: <strong className="text-amber-700 font-mono">{data.waterLossPercent}%</strong></p>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Chart 5: Water Distribution by Zone (Donut Chart)
 */
export default function ZoneDistributionChart() {
  const { zones } = useTelemetry();

  const totalInflow = zones.reduce((sum, z) => sum + z.inflow, 0);

  return (
    <GlassCard variant="frosted" className="p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <PieIcon className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-base text-slate-900">
            Water Distribution by Zone
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Relative volume distribution share across municipal sectors
        </p>
      </div>

      <div className="relative h-60 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomGlassTooltip />} />
            <Pie
              data={zones}
              dataKey="inflow"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
            >
              {zones.map((entry, index) => (
                <Cell
                  key={`zone-${index}`}
                  fill={ZONE_COLORS[index % ZONE_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center label inside donut hole */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-slate-400 font-medium">Total Supply</span>
          <span className="text-lg font-extrabold text-slate-900 font-mono">
            {totalInflow.toFixed(0)} <span className="text-xs font-normal text-slate-500">MLD</span>
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
        {zones.map((zone, idx) => {
          const share = ((zone.inflow / totalInflow) * 100).toFixed(1);
          return (
            <div key={zone.id} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: ZONE_COLORS[idx % ZONE_COLORS.length] }}
              />
              <div className="truncate">
                <span className="font-medium text-slate-700 block truncate">{zone.name.split(' ')[0]}</span>
                <span className="text-[11px] text-slate-400 font-mono">{share}% ({zone.inflow} MLD)</span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
