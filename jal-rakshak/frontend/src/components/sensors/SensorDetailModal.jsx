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
import { X, Battery, Wifi, Activity, AlertTriangle, Calendar } from 'lucide-react';
import { StatusBadge, PrimaryButton } from '../index';

/**
 * SensorDetailModal
 * High-definition historical analytics modal for the selected IoT sensor.
 */
export default function SensorDetailModal({ sensor, onClose }) {
  if (!sensor) return null;

  const history = (sensor.history || []).map((h, idx) => ({
    time: new Date(h.timestamp).toLocaleTimeString(),
    value: h.value,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-3xl border border-white/90 shadow-glass-modal rounded-3xl p-6 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-sky-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                {sensor.sensor_id}
              </span>
              <StatusBadge
                status={sensor.operational_status}
                label={sensor.operational_status.toUpperCase()}
                size="sm"
              />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {sensor.sensor_name}
            </h3>
            <span className="text-xs text-slate-500">
              Zone: <strong className="text-slate-700">{sensor.zone_id}</strong> • Type: <strong className="text-slate-700">{sensor.sensor_type}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Measurement Stats Banner */}
        <div className="my-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Latest Reading</span>
            <span className="text-xl font-extrabold font-mono text-slate-900">
              {sensor.measurement_value} <span className="text-xs font-normal text-slate-500">{sensor.unit}</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Battery Health</span>
            <span className="text-xl font-extrabold font-mono text-emerald-600 flex items-center gap-1">
              <Battery className="w-4 h-4 text-emerald-500" />
              {sensor.battery_percent}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Signal Strength</span>
            <span className="text-xl font-extrabold font-mono text-sky-700 flex items-center gap-1">
              <Wifi className="w-4 h-4 text-sky-500" />
              {sensor.signal_rssi_dbm} dBm
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Protocol</span>
            <span className="text-sm font-bold font-mono text-slate-700 mt-1 block">
              MQTT / LoRaWAN
            </span>
          </div>
        </div>

        {/* Historical Trend Chart */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Real-Time Historical Telemetry (Last 30 Readings)</span>
            <span className="text-sky-600 font-mono font-normal">Sample Rate: 2.0s</span>
          </div>

          <div className="h-60 w-full rounded-2xl bg-slate-50/50 p-2 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sensorModalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} unit={` ${sensor.unit}`} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  fill="url(#sensorModalGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metadata Details */}
        {sensor.metadata && (
          <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1 text-slate-600 mb-5">
            {Object.entries(sensor.metadata).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="capitalize text-slate-400">{k.replace(/_/g, ' ')}:</span>
                <strong className="text-slate-800 font-medium">{String(v)}</strong>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <PrimaryButton onClick={onClose} size="sm">
            Close Inspector
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
