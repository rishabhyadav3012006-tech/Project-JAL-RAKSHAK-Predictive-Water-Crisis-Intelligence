import React, { useState } from 'react';
import { GlassCard, PrimaryButton, SecondaryButton } from '../index';
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  GitCompare,
  Save,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Flame,
  Activity,
  Layers,
  CheckCircle2,
  Settings2,
  Droplets,
  Gauge,
  Wifi,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function ScenarioControlPanel({
  params,
  onChangeParam,
  onRunSimulation,
  onPauseSimulation,
  onResetSimulation,
  onOpenCompare,
  onOpenSave,
  onSelectPreset,
  isPaused,
  isLoading,
  activePresetKey,
  presets = [],
}) {
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);

  // Critical pipeline toggles for user interaction
  const criticalPipelines = [
    { id: 'e-res-wtp', name: 'Raw Intake Aqueduct (Canal → WTP)' },
    { id: 'e-wtp-p1', name: 'North Transmission Trunk (WTP → Pump 1)' },
    { id: 'e-wtp-p2', name: 'South Transmission Trunk (WTP → Pump 2)' },
    { id: 'e-p1-tank1', name: 'East Tank Feed Pipe (Pump 1 → Tank 1)' },
    { id: 'e-p2-pn102', name: 'Sector 9 Industrial Feeder (Pump 2 → PN-102)' },
    { id: 'e-p2-tank2', name: 'West Buffer Feed Pipe (Pump 2 → Tank 2)' },
  ];

  const togglePipeline = (pipeId) => {
    const current = params.pipelines_status?.[pipeId] ?? true;
    onChangeParam('pipelines_status', {
      ...(params.pipelines_status || {}),
      [pipeId]: !current,
    });
  };

  const handlePumpStatusChange = (pumpId, status) => {
    onChangeParam('pumps_status', {
      ...(params.pumps_status || {}),
      [pumpId]: status,
    });
  };

  return (
    <GlassCard className="p-5 space-y-4" glowColor="sky">
      {/* 1. Header & Quick Run Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-sky-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Hydrodynamic Scenario Simulator Controls
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                Phase 13 Computational Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate hydraulic stress, reservoir depletion, pump failures, pipeline ruptures & priority rationing in real time
            </p>
          </div>
        </div>

        {/* Master Simulation Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Run Simulation */}
          <button
            onClick={onRunSimulation}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-sm shadow-sky-500/20 transition-all"
            title="Compute hydraulic simulation and update twin"
          >
            <Play className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : 'fill-white'}`} />
            <span>{isLoading ? 'Simulating...' : 'Run Simulation'}</span>
          </button>

          {/* Pause / Freeze */}
          <button
            onClick={onPauseSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isPaused
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title={isPaused ? 'Resume live simulation updates' : 'Freeze current hydraulic state'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" /> : <Pause className="w-3.5 h-3.5 text-slate-500" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={onResetSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-medium transition-all"
            title="Reset parameters to baseline equilibrium"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>

          {/* Compare Scenarios */}
          <button
            onClick={onOpenCompare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition-all shadow-sm"
            title="View side-by-side Before vs. After comparison"
          >
            <GitCompare className="w-3.5 h-3.5 text-sky-600" />
            <span>Compare</span>
          </button>

          {/* Save Scenario */}
          <button
            onClick={onOpenSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-all"
            title="Save scenario parameters to database"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      {/* 2. 6 Required Preset Scenarios Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            Preset Scenario Simulations:
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Active: <strong>{activePresetKey.replace('_', ' ').toUpperCase()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {presets.map((preset) => {
            const isSelected = activePresetKey === preset.key;
            return (
              <button
                key={preset.key}
                onClick={() => onSelectPreset(preset.key)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold shadow-sm ring-2 ring-sky-500/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    #{preset.key.slice(0, 3).toUpperCase()}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                </div>
                <span className="text-xs font-semibold leading-tight line-clamp-2">
                  {preset.title.replace(/^\d+\.\s*/, '')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Primary Parameter Sliders Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
        {/* Reservoir Volume Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              Reservoir Storage:
            </span>
            <span className="font-mono font-bold text-sky-800">
              {params.reservoir_volume_ml} ML
              <span className="text-slate-400 font-normal ml-1">
                ({Math.round((params.reservoir_volume_ml / 5000) * 100)}%)
              </span>
            </span>
          </div>
          <input
            type="range"
            min="1000"
            max="6000"
            step="100"
            value={params.reservoir_volume_ml}
            onChange={(e) => onChangeParam('reservoir_volume_ml', Number(e.target.value))}
            className="w-full accent-sky-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>1,000 ML (Drought)</span>
            <span>6,000 ML (Full)</span>
          </div>
        </div>

        {/* Incoming Water Supply Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              Incoming Canal Supply:
            </span>
            <span className="font-mono font-bold text-sky-800">
              {params.incoming_supply_mld} MLD
            </span>
          </div>
          <input
            type="range"
            min="300"
            max="1200"
            step="25"
            value={params.incoming_supply_mld}
            onChange={(e) => onChangeParam('incoming_supply_mld', Number(e.target.value))}
            className="w-full accent-sky-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>300 MLD (Rationed)</span>
            <span>1,200 MLD (Surplus)</span>
          </div>
        </div>

        {/* Water Demand Multiplier */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-sky-600" />
              Gross Demand Multiplier:
            </span>
            <span className="font-mono font-bold text-sky-800">
              {params.demand_multiplier}x
              <span className="text-slate-400 font-normal ml-1">
                ({Math.round(760 * params.demand_multiplier)} MLD)
              </span>
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={params.demand_multiplier}
            onChange={(e) => onChangeParam('demand_multiplier', Number(e.target.value))}
            className="w-full accent-sky-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0.5x (Night Low)</span>
            <span>2.0x (Extreme Peak)</span>
          </div>
        </div>
      </div>

      {/* 4. Advanced Configuration Toggle Button */}
      <div className="pt-1">
        <button
          onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
          className="w-full py-1.5 px-3 rounded-xl bg-slate-100/70 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-between transition-all"
        >
          <span className="flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {isAdvancedExpanded
                ? 'Hide Advanced Hydraulic Parameters (Pumps, Pipe Isolations, Leakage Losses & Priorities)'
                : 'Configure Advanced Hydraulic Parameters (Pumps, Pipe Isolations, Leakage Losses & Priorities)'}
            </span>
          </span>
          {isAdvancedExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
      </div>

      {/* 5. Advanced Expandable Drawer */}
      {isAdvancedExpanded && (
        <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm space-y-4 text-xs animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pump 1 & Pump 2 Operating Status */}
            <div className="space-y-3">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                Pump Operating Statuses:
              </span>

              {/* Pump 1 */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">North High-Lift (P-1):</span>
                  <span className="text-[10px] font-mono text-slate-500">420 MLD • 5.8 Bar</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {['online', 'throttled', 'offline'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handlePumpStatusChange('node-pump-1', st)}
                      className={`py-1 rounded-lg font-semibold uppercase text-[10px] transition-all ${
                        (params.pumps_status?.['node-pump-1'] || 'online') === st
                          ? st === 'online'
                            ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                            : st === 'throttled'
                            ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                            : 'bg-rose-100 text-rose-800 font-bold border border-rose-300'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pump 2 */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">South Booster (P-2):</span>
                  <span className="text-[10px] font-mono text-slate-500">400 MLD • 4.8 Bar</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {['online', 'throttled', 'offline'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handlePumpStatusChange('node-pump-2', st)}
                      className={`py-1 rounded-lg font-semibold uppercase text-[10px] transition-all ${
                        (params.pumps_status?.['node-pump-2'] || 'online') === st
                          ? st === 'online'
                            ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                            : st === 'throttled'
                            ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                            : 'bg-rose-100 text-rose-800 font-bold border border-rose-300'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pipeline Availability & Isolations */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                Transmission Pipeline Isolations:
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {criticalPipelines.map((pipe) => {
                  const isOpen = params.pipelines_status?.[pipe.id] ?? true;
                  return (
                    <button
                      key={pipe.id}
                      onClick={() => togglePipeline(pipe.id)}
                      className={`w-full p-2 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isOpen
                          ? 'bg-slate-50 border-slate-200 text-slate-800'
                          : 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                      }`}
                    >
                      <span className="truncate pr-2">{pipe.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                          isOpen
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {isOpen ? 'Open' : 'Isolated'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulated Leakage & Priority Ranking */}
            <div className="space-y-3">
              {/* Simulated Leakage Loss Slider */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-600" />
                    Simulated Pipe Burst Loss:
                  </span>
                  <span className="font-mono font-extrabold text-rose-600">
                    {params.simulated_leakage_mld} MLD
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="2"
                  value={params.simulated_leakage_mld}
                  onChange={(e) => onChangeParam('simulated_leakage_mld', Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 MLD (Intact)</span>
                  <span>80 MLD (Major Rupture)</span>
                </div>
              </div>

              {/* Priority Allocation Policy */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                  Municipal Rationing Priority Order:
                </span>
                <p className="text-[11px] text-slate-500">
                  During supply deficits, water is conserved in strict order:
                </p>
                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">1. Residential</span>
                  <span className="text-slate-400">➔</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">2. Commercial</span>
                  <span className="text-slate-400">➔</span>
                  <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold">3. Industrial</span>
                  <span className="text-slate-400">➔</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">4. Agricultural</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
