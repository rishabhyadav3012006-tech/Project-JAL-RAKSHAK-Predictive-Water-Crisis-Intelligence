import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { GlassCard, StatusBadge } from '../index';
import { Layers, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ZoneDemandComparisonCard({ zonesComparison, onSelectZone, activeZoneId }) {
  const chartData = (zonesComparison || []).map((z) => ({
    name: z.zone_name.split(':')[0],
    fullName: z.zone_name,
    zone_id: z.zone_id,
    avg_demand: z.avg_demand_m3h,
    peak_demand: z.peak_demand_m3h,
    risk: z.risk_level,
  }));

  return (
    <GlassCard variant="frosted" className="p-6">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-sky-100">
        <div>
          <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
            Multi-Sector Hydraulic Distribution
          </span>
          <h3 className="font-bold text-base text-slate-900">
            Zone-by-Zone Demand Comparison
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">5 Active Sectors</span>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0f2fe" opacity={0.7} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} unit=" m³" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white/95 p-3 rounded-xl border border-sky-100 shadow-md text-xs space-y-1">
                      <strong className="block text-slate-900">{d.fullName}</strong>
                      <div className="text-slate-600">Average: <span className="font-mono text-sky-700 font-bold">{d.avg_demand} m³/h</span></div>
                      <div className="text-slate-600">Peak Surge: <span className="font-mono text-blue-700 font-bold">{d.peak_demand} m³/h</span></div>
                      <div className="text-[10px] text-slate-400 font-semibold">{d.risk}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="avg_demand" radius={[6, 6, 0, 0]} fill="#0ea5e9">
              {chartData.map((entry) => (
                <Cell
                  key={entry.zone_id}
                  fill={entry.zone_id === activeZoneId ? '#0284c7' : '#38bdf8'}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onSelectZone(entry.zone_id)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grid of Zone Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-4 pt-3 border-t border-slate-100">
        {(zonesComparison || []).map((z) => {
          const isSelected = z.zone_id === activeZoneId;
          const isAtRisk = z.risk_level.includes('RISK');

          return (
            <div
              key={z.zone_id}
              onClick={() => onSelectZone(z.zone_id)}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-sky-50/90 border-sky-300 ring-2 ring-sky-400/30 shadow-sm'
                  : 'bg-white border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div className="text-[11px] font-bold text-slate-800 truncate">
                {z.zone_name.split(':')[0]}
              </div>
              <div className="text-xs font-mono font-extrabold text-sky-900 mt-1">
                {z.avg_demand_m3h} <span className="text-[10px] font-normal text-slate-400">m³/h</span>
              </div>
              <div className="text-[10px] flex items-center justify-between text-slate-500 mt-1">
                <span>Peak: {z.peak_demand_m3h}</span>
                {isAtRisk ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500" title="Shortage Deficit" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Adequate Buffer" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
