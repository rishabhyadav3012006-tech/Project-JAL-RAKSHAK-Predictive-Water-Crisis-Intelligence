import React, { useState } from 'react';
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/**
 * DigitalTwinLegend
 * Translucent overlay explaining node and pipeline iconography.
 */
export default function DigitalTwinLegend() {
  const [isExpanded, setIsExpanded] = useState(true);

  const items = [
    { label: 'Main Reservoir', icon: Database, color: 'text-sky-600' },
    { label: 'Treatment Plant', icon: ShieldCheck, color: 'text-emerald-600' },
    { label: 'Pumping Station', icon: Activity, color: 'text-indigo-600' },
    { label: 'Storage Tank', icon: Layers, color: 'text-cyan-600' },
    { label: 'Residential Zone', icon: Home, color: 'text-blue-600' },
    { label: 'Industrial Zone', icon: Factory, color: 'text-amber-600' },
    { label: 'Agricultural Feeder', icon: Sprout, color: 'text-teal-600' },
    { label: 'Pressure Monitor', icon: Gauge, color: 'text-purple-600' },
    { label: 'Flow Sensor', icon: Radio, color: 'text-sky-500' },
  ];

  return (
    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-2xl border border-white/95 rounded-2xl shadow-glass-md p-3.5 max-w-xs transition-all">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Network Topology Legend
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600"
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
            {items.map((it, idx) => {
              const Icon = it.icon;
              return (
                <div key={idx} className="flex items-center gap-1.5 truncate">
                  <Icon className={`w-3.5 h-3.5 ${it.color} shrink-0`} />
                  <span className="truncate">{it.label}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded bg-sky-500" />
              <span className="text-slate-600">Active Flow (Directional)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded bg-rose-500 animate-pulse" />
              <span className="text-rose-700 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-500" /> Suspected Leak Pipeline
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
