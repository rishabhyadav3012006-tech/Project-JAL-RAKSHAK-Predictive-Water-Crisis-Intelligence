import React from 'react';

/**
 * StatusBadge
 * High-clarity light glass telemetry status pill with animated glowing dot.
 */
export default function StatusBadge({
  status = 'normal', // 'normal' | 'online' | 'warning' | 'critical' | 'info' | 'standby' | 'offline'
  label,
  pulse = true,
  size = 'md', // 'sm' | 'md'
  className = '',
}) {
  const configs = {
    normal: {
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200/80',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      ping: 'bg-emerald-400',
      defaultLabel: 'Normal',
    },
    online: {
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200/80',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      ping: 'bg-emerald-400',
      defaultLabel: 'Online',
    },
    warning: {
      bg: 'bg-amber-50/80',
      border: 'border-amber-200/80',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      ping: 'bg-amber-400',
      defaultLabel: 'Warning',
    },
    critical: {
      bg: 'bg-rose-50/80',
      border: 'border-rose-200/80',
      text: 'text-rose-700',
      dot: 'bg-rose-500',
      ping: 'bg-rose-400',
      defaultLabel: 'Critical',
    },
    info: {
      bg: 'bg-sky-50/80',
      border: 'border-sky-200/80',
      text: 'text-sky-700',
      dot: 'bg-sky-500',
      ping: 'bg-sky-400',
      defaultLabel: 'Info',
    },
    standby: {
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-200/80',
      text: 'text-indigo-700',
      dot: 'bg-indigo-500',
      ping: 'bg-indigo-400',
      defaultLabel: 'Standby',
    },
    offline: {
      bg: 'bg-slate-100/80',
      border: 'border-slate-200/80',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
      ping: 'bg-slate-300',
      defaultLabel: 'Offline',
    },
  };

  const current = configs[status] || configs.normal;
  const displayLabel = label || current.defaultLabel;

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-2',
  };

  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full backdrop-blur-md border shadow-sm ${current.bg} ${current.border} ${current.text} ${sizeStyles[size]} ${className}`}
    >
      <span className="relative flex shrink-0">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.ping}`}
          />
        )}
        <span className={`relative inline-flex rounded-full ${dotSize} ${current.dot}`} />
      </span>
      <span>{displayLabel}</span>
    </span>
  );
}
