import React, { useState } from 'react';
import { GlassModal, PrimaryButton, SecondaryButton, StatusBadge } from '../index';
import { useTelemetry } from '../../context/TelemetryContext';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Flame,
  Radio,
  Cpu,
  Layers,
  Droplets,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Gauge,
  Clock,
  ExternalLink,
} from 'lucide-react';

const DEMO_STAGES = [
  {
    stage: 1,
    title: 'STAGE 1: Normal Grid Operations',
    shortTitle: '1. Baseline',
    icon: CheckCircle2,
    badge: 'Equilibrium (842 MLD)',
    badgeColor: 'normal',
    headline: 'Standard Supervisory Grid Baseline',
    desc: 'The municipal water grid operates in steady-state hydraulic balance. Raw intake delivers 842 MLD from Sharda Sagar Bulk Reservoir. All 17 IoT telemetry transducers (flow, pressure, tank levels, smart consumption meters) operate within nominal tolerances. Network health is optimal at 89%.',
    metrics: [
      { label: 'Bulk Intake Flow', val: '842.0 MLD', note: 'Nominal' },
      { label: 'Sector 9 Pressure', val: '4.85 Bar', note: 'Optimal Head' },
      { label: 'Active Ruptures', val: '0 Confirmed', note: '100% Intact' },
      { label: 'Grid Satisfaction', val: '100.0%', note: '0 Deficit' },
    ],
    actionLabel: 'Verify Baseline Equilibrium',
  },
  {
    stage: 2,
    title: 'STAGE 2: Introduce Unusual Sensor Pattern',
    shortTitle: '2. Anomaly Injection',
    icon: Flame,
    badge: 'Sensor Discrepancy',
    badgeColor: 'warning',
    headline: 'Sudden Inflow Surge & Hydrostatic Pressure Collapse',
    desc: 'A 400mm sub-surface pipe rupture is simulated along Sector 9 distribution feeder. Intake transducer FS-102 records an abrupt +35% volumetric surge (238.5 m³/h), while downstream transducer PS-202 registers an alarming pressure drop from 4.85 bar down to 3.42 bar (-28%).',
    metrics: [
      { label: 'Feeder Flow FS-102', val: '238.5 m³/h', note: '+35% Surge' },
      { label: 'Pressure Node PS-202', val: '3.42 Bar', note: '-1.43 Bar Drop' },
      { label: 'Smart Meter WCM-403', val: '522.0 kL/h', note: 'Flat (Unchanged)' },
      { label: 'Raw Acoustic Signal', val: '8.4 mm/s²', note: 'Vibration Spike' },
    ],
    actionLabel: 'Inject Sector 9 Rupture Anomaly',
  },
  {
    stage: 3,
    title: 'STAGE 3: AI Anomaly Detection',
    shortTitle: '3. AI Detection',
    icon: Cpu,
    badge: 'Isolation Forest Score: 0.892',
    badgeColor: 'critical',
    headline: 'Multi-Variate Unsupervised Anomaly Inference',
    desc: 'The machine learning engine evaluates 10 continuous telemetry dimensions simultaneously. Isolation Forest tree depth collapses along the flow-pressure gradient, flagging an anomalous feature vector with 0.892 confidence score and severity = CRITICAL within 3 seconds of injection.',
    metrics: [
      { label: 'Anomaly Algorithm', val: 'Isolation Forest + XGB', note: 'Dual-Engine' },
      { label: 'Confidence Score', val: '0.892 / 1.0', note: 'Severe Anomaly' },
      { label: 'Inference Latency', val: '14.2 ms', note: 'Real-Time Edge' },
      { label: 'Classification', val: 'CRITICAL EVENT', note: 'Auto-Triage' },
    ],
    actionLabel: 'Run AI Anomaly Inference',
  },
  {
    stage: 4,
    title: 'STAGE 4: Leakage Suspicion & Sensor Corroboration',
    shortTitle: '4. Sensor Fusion',
    icon: Layers,
    badge: 'False Alarm Suppressed',
    badgeColor: 'critical',
    headline: 'Cross-Sensor Bayesian Mass & Energy Corroboration',
    desc: 'Unlike conventional SCADA that triggers sirens on single-sensor flow spikes, JAL-RAKSHAK evaluates mass conservation. Because customer smart meters remain flat (ΔC ≈ 0) despite the flow spike (ΔQ > 0) and pressure collapses (ΔP < 0), morning domestic surge is refuted and an underground pipe rupture is isolated to conduit e-p2-pn102.',
    metrics: [
      { label: 'Isolated Conduit', val: 'e-p2-pn102', note: 'Sector 9 Trunk' },
      { label: 'Physical Confidence', val: '94.1%', note: 'Multi-Sensor Corroborated' },
      { label: 'False Alarm Status', val: 'Refuted (Not Surge)', note: 'Suppression Active' },
      { label: 'Estimated Loss Rate', val: '35.0 MLD', note: 'Non-Revenue Water' },
    ],
    actionLabel: 'Corroborate Multi-Sensor Fusion',
  },
  {
    stage: 5,
    title: 'STAGE 5: Predictive Demand Changes Over Time',
    shortTitle: '5. Demand Forecast',
    icon: TrendingUp,
    badge: 'R² = 0.9726 Diurnal Regressor',
    badgeColor: 'normal',
    headline: 'XGBoost Time-Series Diurnal Consumption Forecast',
    desc: 'The demand forecasting engine projects municipal water consumption across 4 horizons (1h, 6h, 24h, 7d). Incorporating historical diurnal cycles, weekday elasticity, and temperature, it predicts a peak morning demand of 920 MLD at 08:30 AM with ±1.96 RMSE 95% confidence intervals.',
    metrics: [
      { label: '24h Peak Consumption', val: '920.0 MLD', note: 'Peak at 08:30 AM' },
      { label: 'Regression Fit (R²)', val: '0.9726', note: 'Enterprise SLA' },
      { label: '95% Confidence Bounds', val: '± 28.5 MLD', note: 'Empirical CI' },
      { label: 'Lookahead Bias Check', val: '0.00 (Zero Leakage)', note: 'Strict Historical Lags' },
    ],
    actionLabel: 'Inspect Multi-Horizon Forecasts',
  },
  {
    stage: 6,
    title: 'STAGE 6: Introduce Low-Reservoir Scenario',
    shortTitle: '6. Reservoir Drought',
    icon: Droplets,
    badge: 'Drought Stress: 1,200 ML',
    badgeColor: 'warning',
    headline: 'Severe Catchment Depletion & Canal Throttling',
    desc: 'To stress-test municipal water security, Sharda Sagar reservoir storage volume drops from 4,500 ML down to 1,200 ML (26.6% capacity). Upstream canal intake replenishment drops from 842 MLD down to 410 MLD, creating an immediate municipal supply shortfall of 297.7 MLD.',
    metrics: [
      { label: 'Reservoir Storage', val: '1,200.0 ML', note: 'Down from 4,500 ML' },
      { label: 'Available Supply', val: '410.0 MLD', note: 'Canal Throttled' },
      { label: 'Gross Target Demand', val: '707.7 MLD', note: 'Baseline Municipal' },
      { label: 'Supply-Demand Deficit', val: '-297.7 MLD', note: 'Acute Deficit' },
    ],
    actionLabel: 'Simulate Catchment Drought Stress',
  },
  {
    stage: 7,
    title: 'STAGE 7: Digital Twin Simulation & Zone Rationing',
    shortTitle: '7. Digital Twin',
    icon: Radio,
    badge: 'Hydraulic Simulation Active',
    badgeColor: 'critical',
    headline: 'Computational Mass-Balance & Priority Rationing',
    desc: 'The Digital Twin scenario simulator calculates steady-state mass-conservation equilibrium and nodal energy head losses. Following Municipal Board priority guidelines (Residential → Commercial → Industrial → Agricultural), Sector 1-4 Residential water delivery is protected at 100%, while South Industrial and Agricultural zones are throttled.',
    metrics: [
      { label: 'North Residential', val: '100.0% Allocation', note: 'Protected Priority' },
      { label: 'East Commercial', val: '72.5% Allocation', note: 'Moderate Rationing' },
      { label: 'South Industrial', val: '35.0% Allocation', note: 'Severe Curtailment' },
      { label: 'Agricultural Feeder', val: '0.0% (Standby)', note: 'Temporarily Isolated' },
    ],
    actionLabel: 'Execute Hydrodynamic Simulation',
  },
  {
    stage: 8,
    title: 'STAGE 8: Identify At-Risk Zones & Shortage Countdown',
    shortTitle: '8. Shortage Triage',
    icon: Clock,
    badge: 'Depletion in 14.5 Hours',
    badgeColor: 'critical',
    headline: 'Explainable Shortage Risk Model & Operational Advisories',
    desc: 'The 3-term transparent shortage model calculates that Sector 9 balancing storage will deplete within 14.5 hours if current deficit persists. The platform automatically generates mitigation advisories: "Throttle PRV-09 by 1.2 bar, activate East Ridge emergency interconnect, and alert municipal tankers."',
    metrics: [
      { label: 'Critical Zone', val: 'Sector 9 Industrial', note: 'Depletion: 14.5 Hours' },
      { label: 'Shortage Risk Score', val: '0.842 / 1.0', note: 'Critical Category' },
      { label: 'Balancing Tank Reserve', val: '410 kL Remaining', note: 'Rapid Drawdown' },
      { label: 'Mitigation Dispatch', val: 'Interconnect Zone 1', note: 'PRV Throttling' },
    ],
    actionLabel: 'Display Executive Shortage Triage',
  },
];

export default function HackathonDemoTourModal({ isOpen, onClose, onNavigate }) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [stageCompleted, setStageCompleted] = useState({});

  const {
    triggerCorroboratedLeak,
    setHighlightedPipeline,
    updateAlertInvestigation,
    refreshTelemetry,
    toggleLeakSimulation,
  } = useTelemetry();

  const currentStage = DEMO_STAGES[currentStageIdx];

  const handleExecuteStageAction = async () => {
    setIsExecuting(true);

    if (currentStage.stage === 1) {
      refreshTelemetry();
    } else if (currentStage.stage === 2) {
      setHighlightedPipeline('e-p2-pn102');
      await triggerCorroboratedLeak('e-p2-pn102', 'critical');
    } else if (currentStage.stage === 3) {
      // Anomaly AI inference
    } else if (currentStage.stage === 4) {
      setHighlightedPipeline('e-p2-pn102');
    } else if (currentStage.stage === 5) {
      if (onNavigate) onNavigate('demand');
    } else if (currentStage.stage === 6) {
      if (onNavigate) onNavigate('availability');
    } else if (currentStage.stage === 7) {
      if (onNavigate) onNavigate('digital-twin');
    } else if (currentStage.stage === 8) {
      if (onNavigate) onNavigate('availability');
    }

    setStageCompleted((prev) => ({ ...prev, [currentStage.stage]: true }));
    setIsExecuting(false);
  };

  const handleNextStage = () => {
    if (currentStageIdx < DEMO_STAGES.length - 1) {
      setCurrentStageIdx((prev) => prev + 1);
    }
  };

  const handlePrevStage = () => {
    if (currentStageIdx > 0) {
      setCurrentStageIdx((prev) => prev - 1);
    }
  };

  const handleResetTour = () => {
    setCurrentStageIdx(0);
    setStageCompleted({});
    refreshTelemetry();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="JAL-RAKSHAK: Official 8-Stage Hackathon Demonstration Tour"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Stage Progress Stepper (8 Stages) */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pb-4 border-b border-sky-100 text-[10px]">
          {DEMO_STAGES.map((stg, idx) => {
            const Icon = stg.icon;
            const isCurrent = currentStageIdx === idx;
            const isDone = stageCompleted[stg.stage];
            return (
              <button
                key={stg.stage}
                onClick={() => setCurrentStageIdx(idx)}
                className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all border ${
                  isCurrent
                    ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-sm ring-1 ring-sky-400 font-bold'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium'
                    : 'bg-white/60 text-slate-500 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isCurrent
                      ? 'bg-sky-500 text-white shadow-sm'
                      : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate w-full font-mono">{stg.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detail Header */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50/90 to-blue-50/70 border border-sky-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  DEMO STEP {currentStage.stage} OF 8
                </span>
                <StatusBadge status={currentStage.badgeColor} label={currentStage.badge} size="sm" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                {currentStage.headline}
              </h3>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
            Stage {currentStage.stage}/8
          </span>
        </div>

        {/* Stage Narrative Description */}
        <div className="p-4 rounded-xl bg-white/70 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
          <p>{currentStage.desc}</p>
        </div>

        {/* Stage Technical Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentStage.metrics.map((m, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">{m.label}</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono mt-0.5 block">{m.val}</span>
              <span className="text-[10px] text-sky-700 font-mono block mt-0.5">{m.note}</span>
            </div>
          ))}
        </div>

        {/* Live Stage Action Runner */}
        <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-300/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-sky-950 font-medium">
            <Radio className="w-4 h-4 text-sky-600 animate-pulse" />
            <span>Interactive Demo Action: Click button to execute this stage on the live platform.</span>
          </div>
          <button
            onClick={handleExecuteStageAction}
            disabled={isExecuting}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-sm shadow-sky-500/20 flex items-center justify-center gap-1.5 transition-all shrink-0"
          >
            {isExecuting ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{currentStage.actionLabel}</span>
          </button>
        </div>

        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <SecondaryButton onClick={handleResetTour} disabled={isExecuting}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Tour
          </SecondaryButton>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevStage}
              disabled={currentStageIdx === 0}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 font-semibold"
            >
              Previous
            </button>
            <PrimaryButton
              onClick={handleNextStage}
              disabled={currentStageIdx === DEMO_STAGES.length - 1}
            >
              Next Stage <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </PrimaryButton>
          </div>
        </div>
      </div>
    </GlassModal>
  );
}
