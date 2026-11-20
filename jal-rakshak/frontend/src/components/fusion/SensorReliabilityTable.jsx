import React, { useState } from 'react';
import { GlassCard, StatusBadge } from '../index';
import {
  Radio,
  Gauge,
  Droplets,
  Layers,
  Activity,
  Cpu,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function SensorReliabilityTable({ reliabilities }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const modalityIcons = {
    flow: Droplets,
    pressure: Gauge,
    tank: Layers,
    meter: Activity,
    pump: Cpu,
  };

  const statusStyles = {
    HEALTHY: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    ACCEPTABLE: 'bg-sky-50 text-sky-800 border-sky-300',
    DEGRADED: 'bg-amber-50 text-amber-800 border-amber-300',
    UNRELIABLE: 'bg-rose-50 text-rose-800 border-rose-300',
  };

  const filtered = (reliabilities || []).filter((r) => {
    if (typeFilter !== 'all' && r.sensor_type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return r.sensor_id.toLowerCase().includes(q) || r.zone_id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <GlassCard variant="frosted" className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sky-100 gap-3">
        <div>
          <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
            Edge Health & Telemetry Quality
          </span>
          <h3 className="font-bold text-base text-slate-900">
            IoT Edge Sensor Reliability Matrix
          </h3>
        </div>

        {/* Filter & Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sensor ID or zone..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
          >
            <option value="all">All Modalities</option>
            <option value="flow">Flow Meters</option>
            <option value="pressure">Pressure Probes</option>
            <option value="tank">Tank Sensors</option>
            <option value="meter">Smart Meters</option>
            <option value="pump">Pump Telemetry</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-sky-100 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="pb-3 font-bold">Sensor Asset ID</th>
              <th className="pb-3 font-bold">Zone Sector</th>
              <th className="pb-3 font-bold text-center">Status</th>
              <th className="pb-3 font-bold text-right">Reliability Index</th>
              <th className="pb-3 font-bold text-right">Uptime</th>
              <th className="pb-3 font-bold text-right">Packet Loss</th>
              <th className="pb-3 font-bold text-right">Signal SNR</th>
              <th className="pb-3 font-bold text-right">Calibration Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filtered.map((r) => {
              const Icon = modalityIcons[r.sensor_type] || Radio;
              const badgeClass = statusStyles[r.status] || statusStyles.HEALTHY;

              return (
                <tr key={r.sensor_id} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-3 pr-2 font-sans">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-slate-100 text-slate-600">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong className="block text-slate-900 text-xs font-mono">{r.sensor_id}</strong>
                        <span className="text-[10px] text-slate-400 font-sans capitalize">{r.sensor_type} sensor</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-2 font-sans text-slate-600">
                    {r.zone_id}
                  </td>

                  <td className="py-3 px-2 text-center font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${badgeClass}`}>
                      {r.status}
                    </span>
                  </td>

                  <td className="py-3 px-2 text-right font-extrabold text-sky-950">
                    {r.reliability_score}
                  </td>

                  <td className="py-3 px-2 text-right text-slate-700">
                    {r.uptime_pct}%
                  </td>

                  <td className="py-3 px-2 text-right">
                    <span className={r.packet_loss_pct > 5 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                      {r.packet_loss_pct}%
                    </span>
                  </td>

                  <td className="py-3 px-2 text-right text-slate-600">
                    {r.snr_db} dB
                  </td>

                  <td className="py-3 pl-2 text-right text-emerald-700 font-bold">
                    {r.calibration_health_pct}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
