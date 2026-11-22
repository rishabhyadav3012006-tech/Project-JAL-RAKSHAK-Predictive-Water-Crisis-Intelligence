import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  UserCheck,
  MapPin,
  Eye,
  Radio,
  FileText,
  Activity,
  Layers,
  Gauge,
  Droplets,
  HelpCircle,
} from 'lucide-react';
import { StatusBadge, PrimaryButton, SecondaryButton } from '../index';

export default function AlertDetailModal({
  alert,
  onClose,
  onAcknowledge,
  onUpdateStatus,
  onInspectDigitalTwin,
}) {
  if (!alert) return null;

  const [investigationStatus, setInvestigationStatus] = useState(
    alert.investigation_status || 'under_investigation'
  );
  const [physicalVerification, setPhysicalVerification] = useState(
    alert.physical_verification || 'AI Suspicion (Unverified)'
  );
  const [assignedCrew, setAssignedCrew] = useState(alert.assigned_crew || '');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdateStatus(
      alert.id,
      investigationStatus,
      physicalVerification,
      assignedCrew,
      note
    );
    setIsSaving(false);
  };

  const isVerified = physicalVerification?.includes('Physically Verified');
  const observations = alert.supporting_observations || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-modal-title"
        className="relative w-full max-w-3xl bg-white/95 backdrop-blur-3xl border border-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto z-10"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-sky-100 gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
                {alert.severity} Incident
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  isVerified
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                {isVerified ? 'Physically Verified' : 'AI Leakage Suspicion (Probabilistic)'}
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {alert.id}</span>
            </div>

            <h2 id="alert-modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {alert.title}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {alert.location} • Zone: <strong className="text-slate-700">{alert.zone_id}</strong>
              {alert.pipeline_ref && (
                <>
                  {' '}• Pipeline Asset: <code className="font-mono text-sky-700 font-bold">{alert.pipeline_ref}</code>
                </>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close incident details modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spatial Topology & AI Disclaimer Callout */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>AI Leakage Suspicion vs Ground Truth Pinpointing</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            This alert is an AI multi-sensor hypothesis derived from synchronized flow-rate spikes, hydrostatic pressure drops, and tank volume imbalance.
            <strong> The sensor network isolates the affected pipe segment, but does not claim millimeter-level pinpointing.</strong>
            Physical acoustic correlation or listening-stick survey is required before excavation.
          </p>
        </div>

        {/* Multi-Sensor Corroboration Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Multi-Sensor Supporting Evidence
            </span>
            {alert.suspicion_score !== undefined && (
              <span className="text-xs font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                Fusion Confidence: {Math.round(alert.suspicion_score * 100)}%
              </span>
            )}
          </div>

          {observations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {observations.map((obs, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800">{obs.sensor_id}</span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-white text-slate-500 border border-slate-200">
                      {obs.sensor_type}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] font-medium">{obs.metric}</div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-mono text-xs">
                    <span className="text-slate-500">
                      Observed: <strong className="text-slate-900">{obs.observed_value} {obs.unit}</strong>
                    </span>
                    <span
                      className={`font-bold ${
                        obs.deviation_pct > 0 ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    >
                      {obs.deviation_pct > 0 ? '+' : ''}{obs.deviation_pct}% vs baseline
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Sensor Reliability: {Math.round(obs.reliability_score * 100)}%</span>
                    {obs.anomaly_flag && (
                      <span className="text-rose-600 font-semibold">• Anomaly Flag</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 text-slate-500 text-xs">
              Direct telemetry observations linked from regional SCADA and acoustic sensors.
            </div>
          )}
        </div>

        {/* Detailed Explanation */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Sensor Fusion Diagnostic Rationale
          </span>
          <p className="text-xs text-slate-700 bg-sky-50/50 p-3.5 rounded-2xl border border-sky-100 leading-relaxed">
            {alert.details}
          </p>
        </div>

        {/* Investigation & Field Crew Management Console */}
        <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-4">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Incident Investigation & Field Dispatch Console
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="alert-investigation-status" className="text-xs font-semibold text-slate-600 block mb-1">
                Investigation Lifecycle
              </label>
              <select
                id="alert-investigation-status"
                value={investigationStatus}
                onChange={(e) => setInvestigationStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="unassigned">Unassigned</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="crew_dispatched">Crew Dispatched to Site</option>
                <option value="verified_leak">Physically Verified Leak (Excavation Planned)</option>
                <option value="false_positive">False Positive (Sensor Recalibration)</option>
                <option value="resolved">Resolved & Closed</option>
              </select>
            </div>

            <div>
              <label htmlFor="alert-physical-verification" className="text-xs font-semibold text-slate-600 block mb-1">
                Physical Ground Verification State
              </label>
              <select
                id="alert-physical-verification"
                value={physicalVerification}
                onChange={(e) => setPhysicalVerification(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="AI Suspicion (Unverified)">AI Suspicion (Unverified)</option>
                <option value="Physically Verified (Field Acoustic Crew)">Physically Verified (Field Acoustic Crew)</option>
                <option value="False Positive (Meter Recalibration Required)">False Positive (Meter Recalibration Required)</option>
              </select>
            </div>

            <div>
              <label htmlFor="alert-assigned-crew" className="text-xs font-semibold text-slate-600 block mb-1">
                Assigned Repair Crew / Unit
              </label>
              <input
                id="alert-assigned-crew"
                type="text"
                value={assignedCrew}
                onChange={(e) => setAssignedCrew(e.target.value)}
                placeholder="e.g. Team Gamma (Acoustic Correlator Unit 2)"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label htmlFor="alert-field-note" className="text-xs font-semibold text-slate-600 block mb-1">
                Field Inspection Note / Action Summary
              </label>
              <input
                id="alert-field-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Hydro-vibration matches joint seal fracture at km 3.2"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2">
              {!alert.acknowledged && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Mark Acknowledged
                </button>
              )}
              {alert.pipeline_ref && (
                <button
                  onClick={() => {
                    onClose();
                    onInspectDigitalTwin(alert.pipeline_ref);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-600" />
                  Inspect on Digital Twin
                </button>
              )}
            </div>

            <PrimaryButton onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Investigation Status'}
            </PrimaryButton>
          </div>
        </div>

        {/* Timeline & Incident History Audit Log */}
        {alert.timeline && alert.timeline.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Incident Audit Log & Action History
            </span>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {alert.timeline.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-slate-700">{item.action}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>{item.actor}</span>
                      <span>•</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
