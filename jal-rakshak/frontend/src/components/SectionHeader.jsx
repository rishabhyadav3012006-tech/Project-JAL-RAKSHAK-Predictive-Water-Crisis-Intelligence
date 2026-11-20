import React from 'react';

/**
 * SectionHeader
 * Typography header with category badge, bold title, descriptive subtitle and action slot.
 */
export default function SectionHeader({
  badge,
  title,
  description,
  action,
  align = 'left', // 'left' | 'center'
  className = '',
}) {
  const isCenter = align === 'center';

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-sky-100/70 ${className}`}
    >
      <div className={`space-y-1.5 ${isCenter ? 'text-center mx-auto' : ''}`}>
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/70 shadow-sm">
            {badge}
          </div>
        )}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className={`shrink-0 flex items-center gap-3 ${isCenter ? 'justify-center' : ''}`}>
          {action}
        </div>
      )}
    </div>
  );
}
