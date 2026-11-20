import React, { useState } from 'react';
import { GlassModal, PrimaryButton, SecondaryButton, StatusBadge } from '../index';
import { useTelemetry } from '../../context/TelemetryContext';
import { exportIncidentAuditCSV } from '../../utils/exportUtils';
import {
  Flame,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Gauge,
  Droplets,
  Truck,
  RotateCcw,
  Sparkles,
  Download,
  FileSpreadsheet,
  TrendingDown,
  DollarSign,
} from 'lucide-react';

export default function CrisisDemoModal({ isOpen, onClose, onNavigateToTwin }) {
  const {
    alerts,
    triggerCorroboratedLeak,
    setHighlightedPipeline,
    updateAlertInvestigation,
    refreshTelemetry,
    toggleLeakSimulation,
    isSimulationMode,
  } = useTelemetry();

  const [activeStep, setActiveStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState(false);

  // Step 1: Trigger Rupture
  const handleTriggerCrisis = async () => {
    setIsProcessing(true);
    setHighlightedPipeline('e-p2-pn102');
    await triggerCorroboratedLeak('e-p2-pn102', 'critical');
    setIsProcessing(false);
    setActiveStep(2);
  };

  // Step 2: Apply Mitigations & Dispatch
  const handleMitigateAndDispatch = async () => {
    setIsProcessing(true);
    await updateAlertInvestigation(
      'ALT-2026-001',
      'INVESTIGATING',
      'Pending Acoustic Correlation',
      'Field Rapid Unit 4 (Vikram Singh)',
      'Automated PRV throttled by 1.2 bar to curb volumetric loss'
    );
    setDispatchStatus(true);
    setIsProcessing(false);
    setActiveStep(3);
  };

  // Step 3: Advance to Executive Audit
  const handleProceedToAudit = () => {
    setActiveStep(4);
  };

  // Step 4: Reset Grid to Equilibrium
  const handleResetGrid = () => {
    if (isSimulationMode) {
      toggleLeakSimulation('zone-south');
    }
    refreshTelemetry();
    setActiveStep(1);
    setDispatchStatus(false);
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Live Municipal Water Crisis & AI Recovery Playbook"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Step Indicator Bar (4 steps) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-4 border-b border-sky-100 text-xs">
          {[
            { step: 1, title: '1. Pipe Burst', icon: Flame },
            { step: 2, title: '2. AI Fusion', icon: Layers },
            { step: 3, title: '3. Shortage Triage', icon: Truck },
            { step: 4, title: '4. Executive Audit', icon: FileSpreadsheet },
          ].map((s) => {
            const Icon = s.icon;
            const isCurrent = activeStep === s.step;
            const isCompleted = activeStep > s.step;
            return (
              <div
                key={s.step}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                  isCurrent
                    ? 'bg-sky-50/80 border-sky-300 text-sky-800 font-bold shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-sky-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                </div>
                <span className="truncate">{s.title}</span>
              </div>
            );
          })}
        </div>

        {/* STEP 1: Crisis Injection */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                <Flame className="w-5 h-5 animate-pulse text-rose-600" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Scenario: High-Pressure Feeder Rupture (Sector 9)
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Simulate an underground catastrophic fracture in the 400mm secondary distribution conduit. In flow alone, this manifests as an acute volumetric surge (+35%), but downstream pressure collapses (-28%).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Transmission Inflow</span>
                <span className="text-base font-extrabold text-rose-600 block mt-1">+35.8% Surge</span>
                <span className="text-[11px] text-slate-500 font-mono">FLOW-Z3-001 (238 m³/h)</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Hydrostatic Pressure</span>
                <span className="text-base font-extrabold text-rose-600 block mt-1">-28.8% Collapse</span>
                <span className="text-[11px] text-slate-500 font-mono">PS-202 (3.42 Bar)</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Customer Smart Meters</span>
                <span className="text-base font-extrabold text-slate-700 block mt-1">+1.4% Flat</span>
                <span className="text-[11px] text-slate-500 font-mono">Unmetered Deficit Confirmed</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Step 1 of 4: Physical Rupture Simulation
              </span>
              <PrimaryButton onClick={handleTriggerCrisis} disabled={isProcessing}>
                <Flame className="w-3.5 h-3.5 mr-1.5 text-rose-300" />
                {isProcessing ? 'Simulating Fracture...' : 'Inject Pipe Burst Scenario'}
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* STEP 2: AI Multi-Sensor Corroboration */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200/90 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-700 shrink-0">
                <Layers className="w-5 h-5 text-sky-600" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Why Traditional SCADA Fails vs. How JAL-RAKSHAK Solves It
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Traditional SCADA raises generic threshold alarms for every flow bump (e.g. morning demand surges trigger false positives). JAL-RAKSHAK evaluates physical hydraulic conservation laws across multi-modal telemetry streams:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Traditional SCADA Approach
                </div>
                <p className="text-slate-500 text-[11px]">
                  Flow threshold &gt;15% triggered uncorroborated siren. No geographic isolation. Cannot distinguish between legitimate morning draw and physical fracture.
                </p>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  High False Alarm Rate (38%)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  JAL-RAKSHAK AI Sensor Fusion
                </div>
                <p className="text-slate-600 text-[11px]">
                  Corroborates flow surge (+35%) with simultaneous pressure drop (-28%) and zero customer meter billing increase. Eliminates false alarms with 94.1% confidence.
                </p>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  94.1% Verified Rupture Confidence
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <SecondaryButton onClick={() => setActiveStep(1)}>
                Back
              </SecondaryButton>
              <PrimaryButton onClick={handleMitigateAndDispatch} disabled={isProcessing}>
                <ArrowRight className="w-3.5 h-3.5 mr-1" />
                Proceed to Shortage Triage & Dispatch
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* STEP 3: Automated Mitigation & Dispatch */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Active Mitigation Deployed & Field Crew Dispatched
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  JAL-RAKSHAK calculated tank reserve depletion (14.5 hours remaining in Sector 9 buffer tank), throttled downstream PRV to suppress loss by 65%, and routed balancing flow from East Elevated Tank.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                <span className="text-slate-600 font-medium">Assigned Rapid Response Unit:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-sky-600" />
                  Field Rapid Unit 4 (Vikram Singh) — ETA 18 mins
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                <span className="text-slate-600 font-medium">Automated Supervisory Action:</span>
                <span className="font-bold text-emerald-700">PRV Throttled (-1.2 Bar) • East Tank Balanced</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                <span className="text-slate-600 font-medium">Database Audit Trail Status:</span>
                <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                  Logged in alert_history & incident tables
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <SecondaryButton onClick={() => setActiveStep(2)}>
                Back
              </SecondaryButton>
              <PrimaryButton onClick={handleProceedToAudit}>
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                View Executive Audit & Export
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* STEP 4: Executive Incident Audit Report & Export */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200/90 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-700 shrink-0">
                <Sparkles className="w-5 h-5 text-sky-600" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Executive Incident & Impact Resolution Report
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Post-incident automated audit calculated across multi-modal SCADA logs, billing discrepancy delta, and hydraulic valve telemetries.
                </p>
              </div>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <Droplets className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Water Saved</span>
                <span className="text-base font-extrabold text-slate-900 block mt-0.5">1,420 m³</span>
                <span className="text-[10px] text-emerald-600 font-semibold">65% Volumetric Curb</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <DollarSign className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Loss Prevented</span>
                <span className="text-base font-extrabold text-emerald-700 block mt-0.5">₹78,100</span>
                <span className="text-[10px] text-slate-500 font-mono">at ₹55/m³ rate</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <Gauge className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Response Time</span>
                <span className="text-base font-extrabold text-indigo-700 block mt-0.5">4.2 min</span>
                <span className="text-[10px] text-slate-400 line-through">4.8h manual</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer Outages</span>
                <span className="text-base font-extrabold text-emerald-700 block mt-0.5">0 Outages</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Dynamic Balancing</span>
              </div>
            </div>

            {/* Export & Actions */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 font-medium">Download Official Audit Package:</span>
              <button
                onClick={() => exportIncidentAuditCSV(alerts)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-sky-800 font-bold border border-sky-200 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5 text-sky-600" />
                <span>Export Incident Audit (CSV)</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between pt-2 gap-2">
              <SecondaryButton onClick={handleResetGrid}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset Grid to Normal Baseline
              </SecondaryButton>
              <PrimaryButton onClick={() => { onClose(); if (onNavigateToTwin) onNavigateToTwin(); }}>
                <Cpu className="w-3.5 h-3.5 mr-1.5" />
                Inspect on Digital Twin Canvas
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </GlassModal>
  );
}
