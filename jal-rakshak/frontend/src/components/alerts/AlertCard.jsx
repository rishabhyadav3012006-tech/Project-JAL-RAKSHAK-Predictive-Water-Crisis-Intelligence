import React from 'react';
import { GlassCard, StatusBadge, PrimaryButton, SecondaryButton } from '../index';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Sparkles,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Eye,
} from 'lucide-react';

export default function AlertCard({
  alert,
  onAcknowledge,
  onViewDetails,
  onInspectDigitalTwin,
}) {
  const isCritical = alert.severity === 'critical';
  const isHigh = alert.severity === 'high';
  const isMedium = alert.severity === 'medium';
  const isAcknowledged = alert.acknowledged;

  const isVerified = alert.physical_verification?.includes('Physically Verified');
  const isFalsePositive = alert.investigation_status === 'false_positive';

  const severityStyles = {
    critical: {
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
      border: 'border-l-4 border-l-rose-500',
      icon: ShieldAlert,
      iconColor: 'text-rose-600',
    },
    high: {
      badgeBg: 'bg-orange-50 text-orange-800 border-orange-200',
      border: 'border-l-4 border-l-orange-500',
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
    },
    medium: {
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      badgeStatus: 'warning',
      border: 'border-l-4 border-l-amber-500',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    low: {
      badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
      badgeStatus: 'normal',
      border: 'border-l-4 border-l-sky-500',
      icon: Clock,
      iconColor: 'text-sky-600',
    },
  };

  const style = severityStyles[alert.severity] || severityStyles.medium;
  const Icon = style.icon;

  const statusLabels = {
    unassigned: 'Unassigned',
    under_investigation: 'Under Investigation',
    crew_dispatched: 'Crew Dispatched',
    verified_leak: 'Verified Leak',
    false_positive: 'False Positive',
    resolved: 'Resolved',
  };

  const statusPillColors = {
    unassigned: 'bg-slate-100 text-slate-700 border-slate-200',
    under_investigation: 'bg-blue-50 text-blue-700 border-blue-200',
    crew_dispatched: 'bg-purple-50 text-purple-700 border-purple-200',
    verified_leak: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    false_positive: 'bg-slate-100 text-slate-500 border-slate-200 line-through',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <GlassCard
      variant="frosted"
      className={`p-5 transition-all duration-200 hover:shadow-glass-card hover:border-sky-300 ${style.border} ${
        !isAcknowledged ? 'bg-gradient-to-r from-rose-50/20 via-white to-white' : ''
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Main Alert Info */}
        <div className="flex-1 space-y-2">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${style.badgeBg}`}
            >
              {alert.severity}
            </span>

            {/* AI Suspicion vs Physical Verification Badge */}
            {isVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Physically Verified
              </span>
            ) : isFalsePositive ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                False Positive
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                AI Suspicion (Unverified)
              </span>
            )}

            {/* Suspicion Score if present */}
            {alert.suspicion_score !== undefined && alert.suspicion_score !== null && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Confidence: {Math.round(alert.suspicion_score * 100)}%
              </span>
            )}

            {/* Lifecycle Status Pill */}
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                statusPillColors[alert.investigation_status] || statusPillColors.unassigned
              }`}
            >
              {statusLabels[alert.investigation_status] || alert.investigation_status}
            </span>

            {/* Acknowledged Status */}
            {isAcknowledged ? (
              <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Acknowledged
              </span>
            ) : (
              <span className="text-[11px] text-rose-600 font-bold animate-pulse">
                • Unacknowledged
              </span>
            )}
          </div>

          {/* Title & Location */}
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {alert.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {alert.location}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-400">ID: {alert.id}</span>
              {alert.pipeline_ref && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-mono text-[10px] border border-sky-100">
                    Pipe: {alert.pipeline_ref}
                  </span>
                </>
              )}
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" />
                {alert.timestamp}
              </span>
            </div>
          </div>

          {/* Details / Explanation */}
          <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
            {alert.details}
          </p>

          {/* Crew Assignment Note if any */}
          {alert.assigned_crew && (
            <div className="flex items-center gap-2 text-xs text-purple-800 bg-purple-50/70 p-2 rounded-xl border border-purple-100 max-w-fit">
              <UserCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Assigned: <strong>{alert.assigned_crew}</strong></span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          {!isAcknowledged && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Acknowledge
            </button>
          )}

          <div className="flex items-center gap-2">
            {alert.pipeline_ref && (
              <button
                onClick={() => onInspectDigitalTwin(alert.pipeline_ref)}
                className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all flex items-center gap-1 shadow-sm"
                title="Highlight and inspect on the Digital Twin graph"
              >
                <Eye className="w-3.5 h-3.5" />
                Digital Twin
              </button>
            )}

            <button
              onClick={() => onViewDetails(alert)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center gap-1"
            >
              Diagnostics
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
