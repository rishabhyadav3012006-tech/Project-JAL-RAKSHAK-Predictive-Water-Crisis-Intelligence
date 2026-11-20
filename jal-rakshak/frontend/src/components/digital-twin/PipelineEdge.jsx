import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';
import { AlertTriangle, Droplets, Sparkles, ShieldCheck } from 'lucide-react';

/**
 * PipelineEdge
 * Animated water pipeline with flow direction, rate label, and leak highlights.
 * Clearly distinguishes between AI-derived leakage suspicions and physically verified leaks.
 */
function PipelineEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  selected,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isLeak = data?.status === 'leak' || data?.has_leak;
  const isHighlighted = data?.is_highlighted;
  const isVerified = data?.physical_verification?.includes('Physically Verified');
  const suspicionScore = data?.suspicion_score ?? (isLeak ? 0.89 : 0);
  const flowMld = data?.flow_mld ?? 0;

  // Pipeline stroke styling
  let strokeColor = '#0ea5e9'; // default cyan-blue
  if (selected || isHighlighted) {
    strokeColor = isLeak ? '#e11d48' : '#0284c7';
  } else if (isLeak) {
    strokeColor = isVerified ? '#dc2626' : '#f43f5e';
  }

  const strokeWidth = (selected || isHighlighted) ? 4.0 : isLeak ? 3.2 : 2.5;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: isLeak ? '6 4' : '8 6',
          animation: isLeak
            ? 'dashPulse 0.9s linear infinite'
            : 'dashFlow 2s linear infinite',
          filter: (isHighlighted || isLeak) ? 'drop-shadow(0 0 6px rgba(244, 63, 94, 0.45))' : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold shadow-md backdrop-blur-md transition-all cursor-pointer border ${
            isLeak
              ? isVerified
                ? 'bg-rose-100 text-rose-900 border-rose-400 ring-2 ring-rose-500/50 animate-pulse'
                : 'bg-amber-50 text-rose-700 border-rose-300 ring-2 ring-amber-400/40 animate-pulse'
              : (selected || isHighlighted)
              ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-md ring-2 ring-sky-400/50'
              : 'bg-white/95 text-slate-700 border-slate-200/90 hover:bg-sky-50 hover:border-sky-300'
          }`}
        >
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {isLeak ? (
              isVerified ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-rose-700 shrink-0" />
                  <span>VERIFIED LEAK • {flowMld} MLD</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>AI SUSPICION {Math.round(suspicionScore * 100)}% • {flowMld} MLD</span>
                </>
              )
            ) : (
              <>
                <Droplets className="w-2.5 h-2.5 text-sky-500 shrink-0" />
                <span>{flowMld} MLD</span>
              </>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(PipelineEdge);
