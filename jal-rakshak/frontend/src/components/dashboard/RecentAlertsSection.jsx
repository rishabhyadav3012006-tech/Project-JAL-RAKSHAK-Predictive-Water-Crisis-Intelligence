import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { GlassCard, StatusBadge, PrimaryButton, SecondaryButton } from '../index';
import { AlertTriangle, CheckCircle, Bell, Radio, ShieldAlert } from 'lucide-react';

/**
 * RecentAlertsSection
 * Displays active municipal water network alerts with severity pills and actions.
 */
export default function RecentAlertsSection() {
  const { alerts, acknowledgeAlert, toggleLeakSimulation, isSimulationMode } = useTelemetry();

  return (
    <GlassCard variant="frosted" className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-sky-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Recent Alerts & Anomaly Incidents
            </h3>
            <p className="text-xs text-slate-500">
              Real-time pipeline incidents flagged by IoT edge probes and AI models
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SecondaryButton
            size="sm"
            icon={ShieldAlert}
            onClick={() => toggleLeakSimulation('zone-south')}
          >
            {isSimulationMode ? 'Reset Simulation' : 'Inject Simulated Leak'}
          </SecondaryButton>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isHigh = alert.severity === 'high';
          const isWarning = alert.severity === 'warning' || alert.severity === 'medium';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all ${
                alert.acknowledged
                  ? 'bg-white/60 border-slate-100 opacity-75'
                  : isCritical
                  ? 'bg-rose-50/70 border-rose-200/80 shadow-sm'
                  : isHigh
                  ? 'bg-orange-50/70 border-orange-200/80 shadow-sm'
                  : isWarning
                  ? 'bg-amber-50/70 border-amber-200/80 shadow-sm'
                  : 'bg-sky-50/70 border-sky-200/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-rose-100 text-rose-700'
                        : isHigh
                        ? 'bg-orange-100 text-orange-700'
                        : isWarning
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">
                        {alert.title}
                      </h4>
                      <StatusBadge
                        status={alert.severity}
                        label={alert.severity.toUpperCase()}
                        size="sm"
                      />
                      {alert.acknowledged && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Acknowledged
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {alert.details}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span>Location: <strong className="text-slate-600">{alert.location}</strong></span>
                      <span>•</span>
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                </div>

                {!alert.acknowledged && (
                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Acknowledge
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
