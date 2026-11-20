import React from 'react';

/**
 * LoadingSkeleton
 * Shimmering light frosted glass placeholders for loading states.
 */
export default function LoadingSkeleton({
  type = 'text', // 'text' | 'card' | 'metric' | 'avatar' | 'button' | 'table-row'
  lines = 3,
  className = '',
}) {
  const baseShimmer =
    'bg-slate-200/70 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent';

  if (type === 'metric') {
    return (
      <div className={`p-5 rounded-2xl bg-white/70 border border-white/80 shadow-sm ${className}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <div className={`h-3 w-20 rounded-md ${baseShimmer}`} />
            <div className={`h-7 w-28 rounded-lg ${baseShimmer}`} />
          </div>
          <div className={`w-10 h-10 rounded-xl ${baseShimmer}`} />
        </div>
        <div className={`h-3 w-32 rounded-md ${baseShimmer}`} />
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`p-6 rounded-2xl bg-white/70 border border-white/80 shadow-sm space-y-4 ${className}`}>
        <div className={`h-5 w-40 rounded-lg ${baseShimmer}`} />
        <div className="space-y-2">
          <div className={`h-3 w-full rounded ${baseShimmer}`} />
          <div className={`h-3 w-5/6 rounded ${baseShimmer}`} />
          <div className={`h-3 w-4/6 rounded ${baseShimmer}`} />
        </div>
        <div className={`h-8 w-24 rounded-xl ${baseShimmer}`} />
      </div>
    );
  }

  if (type === 'avatar') {
    return <div className={`w-10 h-10 rounded-full ${baseShimmer} ${className}`} />;
  }

  if (type === 'button') {
    return <div className={`h-9 w-24 rounded-xl ${baseShimmer} ${className}`} />;
  }

  if (type === 'table-row') {
    return (
      <div className={`flex items-center gap-4 py-3 px-4 border-b border-slate-100 ${className}`}>
        <div className={`h-3 w-8 rounded ${baseShimmer}`} />
        <div className={`h-3 w-32 rounded ${baseShimmer}`} />
        <div className={`h-3 w-24 rounded ${baseShimmer}`} />
        <div className={`h-3 w-16 rounded ${baseShimmer}`} />
      </div>
    );
  }

  // Default: text lines
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className={`h-3.5 rounded-lg ${baseShimmer} ${
            idx === lines - 1 && lines > 1 ? 'w-4/5' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}
