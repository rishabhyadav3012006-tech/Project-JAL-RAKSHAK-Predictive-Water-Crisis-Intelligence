import React from 'react';
import { AlertOctagon, RefreshCw, Home, ChevronRight } from 'lucide-react';

/**
 * Production Error Boundary for JAL-RAKSHAK Command Centre.
 * Catches JavaScript errors anywhere in their child component tree,
 * logs the exception details, and displays a resilient fallback UI.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Production logger hook
    console.error('[JAL-RAKSHAK ErrorBoundary caught an exception]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900/90 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Top Glow Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-sky-500" />

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  Telemetry Module Recovered
                </h2>
                <p className="text-xs text-slate-400">
                  JAL-RAKSHAK Resilient Fault-Tolerance Layer
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              An unexpected render anomaly occurred in the dashboard view. The underlying physical mass-balance engine and background telemetry streams remain uncorrupted.
            </p>

            {this.state.error && (
              <details className="mb-6 rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-xs font-mono text-rose-300">
                <summary className="cursor-pointer text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1 select-none">
                  <ChevronRight className="w-3.5 h-3.5" /> Technical Diagnostics
                </summary>
                <div className="mt-2 text-[11px] overflow-x-auto whitespace-pre-wrap text-slate-400 max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Component
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Return to Overview
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
