import React from 'react';
import { useReactFlow } from 'reactflow';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

/**
 * DigitalTwinControls
 * Zoom, fit view, and reset controls for the React Flow canvas.
 */
export default function DigitalTwinControls({ onResetSimulation }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 backdrop-blur-2xl border border-white/95 shadow-glass-md">
      <button
        onClick={() => zoomIn({ duration: 300 })}
        title="Zoom In"
        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <button
        onClick={() => zoomOut({ duration: 300 })}
        title="Zoom Out"
        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <button
        onClick={() => fitView({ padding: 0.2, duration: 400 })}
        title="Fit to Screen"
        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      <button
        onClick={() => {
          fitView({ duration: 400 });
          onResetSimulation?.();
        }}
        title="Reset View & Simulation"
        className="p-2 rounded-xl text-sky-600 hover:text-sky-800 hover:bg-sky-50 transition-colors flex items-center gap-1 text-xs font-semibold"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="hidden sm:inline">Reset</span>
      </button>
    </div>
  );
}
