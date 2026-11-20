import React from 'react';
import { Droplets } from 'lucide-react';
import PrimaryButton from './PrimaryButton';

/**
 * EmptyState
 * Clean water-themed empty state card with light refraction and action CTA.
 */
export default function EmptyState({
  icon: Icon = Droplets,
  title = 'No Data Available',
  description = 'No telemetry records or events match your current criteria. Try adjusting your filters or check sensor node connections.',
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`p-10 text-center rounded-3xl bg-white/70 backdrop-blur-xl border border-white/90 shadow-glass-sm max-w-lg mx-auto ${className}`}
    >
      <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <div className="absolute inset-0 bg-sky-400/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-50 to-blue-50 border border-sky-200/80 shadow-sm flex items-center justify-center text-sky-600">
          <Icon className="w-7 h-7" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <div className="mt-6">
          <PrimaryButton onClick={onAction} size="md">
            {actionText}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
