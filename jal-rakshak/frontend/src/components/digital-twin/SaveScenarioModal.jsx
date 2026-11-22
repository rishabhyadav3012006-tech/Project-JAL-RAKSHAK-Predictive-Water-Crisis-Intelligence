import React, { useState } from 'react';
import { GlassModal, PrimaryButton, SecondaryButton } from '../index';
import {
  Save,
  BookmarkCheck,
  Sliders,
  Droplets,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';

export default function SaveScenarioModal({
  isOpen,
  onClose,
  onSave,
  params = {},
}) {
  const [title, setTitle] = useState(params.name || 'Custom Simulation Scenario');
  const [scenarioKey, setScenarioKey] = useState(
    (params.scenario_key || 'custom_scenario_' + Date.now().toString().slice(-4))
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
  );
  const [description, setDescription] = useState(
    `Simulated with reservoir ${params.reservoir_volume_ml || 4500} ML, incoming supply ${params.incoming_supply_mld || 842} MLD, demand multiplier ${params.demand_multiplier || 1.0}x.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !scenarioKey.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        scenario_key: scenarioKey.trim(),
        title: title.trim(),
        description: description.trim(),
        parameters: params,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to save scenario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Simulation Scenario"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Banner */}
        <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200/90 text-sky-900 text-xs flex items-center gap-2.5">
          <BookmarkCheck className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            Save this hydraulic configuration to compare against future seasonal baselines and drought models.
          </span>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">Scenario successfully persisted to database!</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="scenario-title-input" className="block text-xs font-bold text-slate-700 mb-1">
            Scenario Name / Title *
          </label>
          <input
            id="scenario-title-input"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Summer Heatwave Peak Demand"
            className="w-full px-3 py-2 text-xs rounded-xl bg-white/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
          />
        </div>

        {/* Unique Key */}
        <div>
          <label htmlFor="scenario-key-input" className="block text-xs font-bold text-slate-700 mb-1">
            Unique Scenario Identifier (slug) *
          </label>
          <input
            id="scenario-key-input"
            type="text"
            required
            value={scenarioKey}
            onChange={(e) =>
              setScenarioKey(
                e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')
              )
            }
            placeholder="e.g. summer_heatwave_2026"
            className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="scenario-desc-input" className="block text-xs font-bold text-slate-700 mb-1">
            Description & Operational Assumptions
          </label>
          <textarea
            id="scenario-desc-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes on demand multipliers, pipeline isolation, or pump throttling conditions..."
            className="w-full px-3 py-2 text-xs rounded-xl bg-white/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 resize-none"
          />
        </div>

        {/* Snapshot Summary of Params */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Hydraulic Parameter Snapshot
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div>
              • Reservoir: <strong className="text-slate-800">{params.reservoir_volume_ml || 4500} ML</strong>
            </div>
            <div>
              • Supply: <strong className="text-slate-800">{params.incoming_supply_mld || 842} MLD</strong>
            </div>
            <div>
              • Demand: <strong className="text-slate-800">{params.demand_multiplier || 1.0}x</strong>
            </div>
            <div>
              • Simulated Leak: <strong className="text-slate-800">{params.simulated_leakage_mld || 0} MLD</strong>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <SecondaryButton type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isSubmitting || savedSuccess}>
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5 animate-spin" /> Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> Save Scenario
              </span>
            )}
          </PrimaryButton>
        </div>
      </form>
    </GlassModal>
  );
}
