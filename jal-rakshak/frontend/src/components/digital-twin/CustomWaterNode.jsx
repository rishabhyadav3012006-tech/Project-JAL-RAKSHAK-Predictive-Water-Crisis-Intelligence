import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import {
  Database,
  ShieldCheck,
  Activity,
  Layers,
  Home,
  Factory,
  Sprout,
  Gauge,
  Radio,
  AlertTriangle,
  Droplets,
} from 'lucide-react';

const TYPE_CONFIG = {
  reservoir: {
    icon: Database,
    label: 'Main Reservoir',
    gradient: 'from-sky-500 to-blue-600',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  treatment: {
    icon: ShieldCheck,
    label: 'Treatment Plant',
    gradient: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  pump: {
    icon: Activity,
    label: 'Pumping Station',
    gradient: 'from-indigo-500 to-violet-600',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  tank: {
    icon: Layers,
    label: 'Storage Tank',
    gradient: 'from-cyan-500 to-sky-600',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  residential: {
    icon: Home,
    label: 'Residential Zone',
    gradient: 'from-blue-500 to-indigo-600',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  industrial: {
    icon: Factory,
    label: 'Industrial Zone',
    gradient: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  agricultural: {
    icon: Sprout,
    label: 'Agricultural Feeder',
    gradient: 'from-teal-500 to-emerald-600',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  sensor_pressure: {
    icon: Gauge,
    label: 'Pressure Monitor',
    gradient: 'from-purple-500 to-indigo-600',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  sensor_flow: {
    icon: Radio,
    label: 'Flow Sensor',
    gradient: 'from-sky-400 to-cyan-500',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
};

function CustomWaterNode({ data, selected }) {
  const config = TYPE_CONFIG[data.type] || TYPE_CONFIG.reservoir;
  const Icon = config.icon;
  const hasLeak = data.has_leak;
  const isLowPressure = data.is_low_pressure;

  return (
    <div
      className={`relative min-w-[190px] max-w-[230px] rounded-2xl p-3.5 transition-all duration-300 bg-white/95 backdrop-blur-2xl border ${
        selected
          ? 'border-sky-500 shadow-[0_0_25px_rgba(14,165,233,0.35)] ring-2 ring-sky-400'
          : hasLeak
          ? 'border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)] ring-2 ring-rose-400/80'
          : isLowPressure
          ? 'border-amber-300 shadow-glass-sm ring-1 ring-amber-300/80'
          : 'border-white/90 shadow-glass-sm hover:shadow-glass-md hover:border-sky-200'
      }`}
    >
      {/* React Flow Incoming Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 !bg-sky-500 !border-2 !border-white"
      />

      {/* Top Header: Icon + Category Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div
          className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${config.gradient} flex items-center justify-center text-white shadow-sm shrink-0`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.badgeColor} truncate`}
        >
          {config.label}
        </span>
      </div>

      {/* Node Title & Zone */}
      <div className="mb-2.5">
        <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-1">
          {data.label}
        </h4>
        <span className="text-[10px] text-slate-400 truncate block">
          Zone: {data.zone}
        </span>
      </div>

      {/* Live Measurement Badges */}
      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[11px] font-mono">
        <div className="bg-slate-50/80 p-1 rounded-lg text-center">
          <span className="text-[9px] text-slate-400 uppercase font-sans block">Pressure</span>
          <span
            className={`font-bold ${
              isLowPressure ? 'text-amber-600' : 'text-slate-800'
            }`}
          >
            {data.pressure_bar} B
          </span>
        </div>

        <div className="bg-slate-50/80 p-1 rounded-lg text-center">
          <span className="text-[9px] text-slate-400 uppercase font-sans block">
            {data.level_percent !== null && data.level_percent !== undefined ? 'Storage' : 'Flow'}
          </span>
          <span className="font-bold text-sky-700">
            {data.level_percent !== null && data.level_percent !== undefined
              ? `${data.level_percent}%`
              : `${data.flow_mld} M`}
          </span>
        </div>
      </div>

      {/* Suspected Leak Indicator Pill */}
      {hasLeak && (
        <div className="mt-2 flex items-center justify-center gap-1 py-0.5 px-2 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          <span>Acoustic Leak Flagged</span>
        </div>
      )}

      {/* React Flow Outgoing Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-sky-500 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(CustomWaterNode);
