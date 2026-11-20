import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import GlassCard from './GlassCard';

/**
 * MetricCard
 * Telemetry statistic display with frosted glass styling, status glow, and trend metrics.
 */
export default function MetricCard({
  title,
  value,
  unit = '',
  trend,
  trendType = 'neutral', // 'up' | 'down' | 'neutral'
  trendLabel = 'vs last hour',
  icon: Icon,
  status = 'normal', // 'normal' | 'warning' | 'critical' | 'info'
  subtitle,
  loading = false,
  className = '',
  onClick,
}) {
  const statusGradients = {
    normal: 'from-emerald-500/10 to-teal-500/5 text-emerald-600 border-emerald-500/20',
    warning: 'from-amber-500/10 to-orange-500/5 text-amber-600 border-amber-500/20',
    critical: 'from-rose-500/10 to-red-500/5 text-rose-600 border-rose-500/20',
    info: 'from-sky-500/10 to-blue-500/5 text-sky-600 border-sky-500/20',
  };

  const trendStyles = {
    up: {
      text: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/60',
      icon: ArrowUpRight,
    },
    down: {
      text: 'text-rose-700 bg-rose-50/80 border-rose-200/60',
      icon: ArrowDownRight,
    },
    neutral: {
      text: 'text-slate-600 bg-slate-50/80 border-slate-200/60',
      icon: Minus,
    },
  };

  const currentTrend = trendStyles[trendType] || trendStyles.neutral;
  const TrendIcon = currentTrend.icon;

  return (
    <GlassCard
      hoverable={!!onClick}
      onClick={onClick}
      variant="frosted"
      className={`p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase block mb-1">
            {title}
          </span>
          {loading ? (
            <div className="h-8 w-28 bg-slate-200/70 animate-pulse rounded-lg my-1" />
          ) : (
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {value}
              </span>
              {unit && (
                <span className="text-xs sm:text-sm font-medium text-slate-500">
                  {unit}
                </span>
              )}
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div
            className={`p-3 rounded-xl bg-gradient-to-br border backdrop-blur-md shadow-sm shrink-0 ${statusGradients[status] || statusGradients.info}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && !loading && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${currentTrend.text}`}
          >
            <TrendIcon className="w-3.5 h-3.5" />
            {trend}
          </span>
          <span className="text-xs text-slate-400">{trendLabel}</span>
        </div>
      )}
    </GlassCard>
  );
}
