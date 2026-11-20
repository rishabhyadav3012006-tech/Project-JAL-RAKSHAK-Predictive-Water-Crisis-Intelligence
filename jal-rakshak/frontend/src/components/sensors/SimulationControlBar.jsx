import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { PrimaryButton, SecondaryButton, StatusBadge } from '../index';

/**
 * SimulationControlBar
 * Real-time controls for Python IoT simulation engine with scenarios and MQTT status.
 */
export default function SimulationControlBar({
  status,
  onControlAction,
  onScenarioChange,
  activeScenario,
}) {
  const isRunning = status?.is_running ?? true;
  const isFallback = status?.fallback_mode ?? true;
  const totalPackets = status?.total_readings_generated ?? 128;

  const scenarios = [
    { id: 'normal', label: '1. Normal Operating Conditions' },
    { id: 'increased_demand', label: '2. Increased Diurnal Demand (+35%)' },
    { id: 'flow_anomaly', label: '3. Sudden Flow Anomaly & Pipe Rupture' },
    { id: 'pressure_fluctuation', label: '4. Pressure Oscillations & Valve Hunting' },
    { id: 'gradual_depletion', label: '5. Gradual Reservoir Tank Depletion' },
    { id: 'sensor_disconnection', label: '6. Intermittent Sensor Disconnection' },
  ];

  return (
    <div className="p-5 rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/95 shadow-glass-md space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Simulation Engine Status & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onControlAction(isRunning ? 'pause' : 'start')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Engine</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Engine</span>
                </>
              )}
            </button>

            <button
              onClick={() => onControlAction('reset')}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Reset Simulation Clock"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Prominent SIMULATED DATA Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>SIMULATED DATA STREAM</span>
          </div>

          {/* MQTT Status Indicator */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Radio className="w-3.5 h-3.5 text-sky-600" />
            <span>
              {isFallback ? 'MQTT Local Fallback Mode (Active)' : 'MQTT Broker Connected'}
            </span>
          </span>
        </div>

        {/* Right: Packet Counter & Tick frequency */}
        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
          <span>Packets Generated: <strong className="text-slate-900">{totalPackets.toLocaleString()}</strong></span>
          <span>•</span>
          <span>Tick: <strong>2.0s</strong></span>
        </div>
      </div>

      {/* Scenarios Preset Selector Bar */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
          Simulation Scenario:
        </span>
        <div className="flex flex-wrap items-center gap-2 flex-1 justify-start sm:justify-end">
          {scenarios.map((sc) => {
            const isSelected = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => onScenarioChange(sc.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all border ${
                  isSelected
                    ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-sm ring-1 ring-sky-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {sc.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
