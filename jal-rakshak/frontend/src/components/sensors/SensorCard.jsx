import React from 'react';
import {
  Droplets,
  Gauge,
  Layers,
  Waves,
  Activity,
  AlertTriangle,
  Battery,
  Wifi,
  ChevronRight,
} from 'lucide-react';
import { GlassCard, StatusBadge } from '../index';

const SENSOR_TYPE_META = {
  flow: {
    icon: Droplets,
    color: 'text-sky-600',
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
    label: 'Flow Sensor',
  },
  pressure: {
    icon: Gauge,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    label: 'Pressure Sensor',
  },
  tank_level: {
    icon: Layers,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    label: 'Tank Level',
  },
  consumption: {
    icon: Waves,
    color: 'text-blue-600',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    label: 'Consumption AMR',
  },
  pump_status: {
    icon: Activity,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'Pump Monitor',
  },
};

/**
 * SensorCard
 * Rich light glass telemetry card showing latest reading, battery, status, and mini-trend.
 */
export default function SensorCard({ sensor, onClick }) {
  const meta = SENSOR_TYPE_META[sensor.sensor_type] || SENSOR_TYPE_META.flow;
  const Icon = meta.icon;
  const isDisconnected = sensor.operational_status === 'disconnected';
  const hasAnomaly = sensor.anomaly_flags && sensor.anomaly_flags.length > 0;

  // Compute mini trend curve from history
  const historyPoints = sensor.history || [];
  const minVal = Math.min(...historyPoints.map((h) => h.value), sensor.measurement_value);
  const maxVal = Math.max(...historyPoints.map((h) => h.value), sensor.measurement_value);
  const range = maxVal - minVal || 1;

  return (
    <GlassCard
      variant="frosted"
      hoverable
      onClick={() => onClick(sensor)}
      className="p-5 flex flex-col justify-between"
    >
      <div>
        {/* Header: ID + Status + Signal */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
              {sensor.sensor_id}
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${meta.bg}`}
            >
              {meta.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <StatusBadge
              status={sensor.operational_status}
              label={sensor.operational_status.toUpperCase()}
              size="sm"
            />
          </div>
        </div>

        {/* Sensor Title & Zone */}
        <div className="mb-3">
          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
            {sensor.sensor_name}
          </h4>
          <span className="text-[11px] text-slate-400 capitalize block">
            Zone: {sensor.zone_id.replace('zone-', '')}
          </span>
        </div>

        {/* Primary Reading Display */}
        <div className="bg-gradient-to-br from-white to-sky-50/50 p-3.5 rounded-2xl border border-sky-100/80 mb-3 shadow-inner">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
            Latest Telemetry Reading
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                isDisconnected
                  ? 'text-slate-400'
                  : hasAnomaly
                  ? 'text-rose-600'
                  : 'text-slate-900'
              }`}
            >
              {isDisconnected ? '---' : sensor.measurement_value}
            </span>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              {sensor.unit}
            </span>
          </div>
        </div>

        {/* Anomaly Badge if flagged */}
        {hasAnomaly && (
          <div className="mb-3 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="truncate">{sensor.anomaly_flags[0]}</span>
          </div>
        )}

        {/* Mini SVG Trend Line */}
        {historyPoints.length > 1 && (
          <div className="h-9 w-full mb-3 flex items-end gap-1 px-1">
            {historyPoints.slice(-14).map((pt, i) => {
              const heightPct = Math.max(15, Math.min(100, ((pt.value - minVal) / range) * 100));
              return (
                <div
                  key={i}
                  className="flex-1 bg-sky-200/80 hover:bg-sky-500 rounded-sm transition-all"
                  style={{ height: `${heightPct}%` }}
                  title={`${pt.value} ${sensor.unit}`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer: Battery + RSSI + Timestamp */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title="Battery Level">
            <Battery className="w-3.5 h-3.5 text-emerald-500" />
            {sensor.battery_percent}%
          </span>
          <span className="flex items-center gap-1" title="Signal Strength">
            <Wifi className="w-3.5 h-3.5 text-sky-500" />
            {sensor.signal_rssi_dbm} dBm
          </span>
        </div>

        <span className="font-mono text-[10px]">
          {new Date(sensor.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </GlassCard>
  );
}
