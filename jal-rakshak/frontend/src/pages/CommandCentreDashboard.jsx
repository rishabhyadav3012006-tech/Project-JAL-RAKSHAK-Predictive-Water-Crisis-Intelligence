import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import KPIGrid from '../components/dashboard/KPIGrid';
import NetworkHealthIndicator from '../components/dashboard/NetworkHealthIndicator';
import ConsumptionChart from '../components/dashboard/ConsumptionChart';
import SupplyDemandChart from '../components/dashboard/SupplyDemandChart';
import PressureMonitoringChart from '../components/dashboard/PressureMonitoringChart';
import ReservoirCapacityChart from '../components/dashboard/ReservoirCapacityChart';
import ZoneDistributionChart from '../components/dashboard/ZoneDistributionChart';
import ZoneAvailabilityTable from '../components/dashboard/ZoneAvailabilityTable';
import RecentAlertsSection from '../components/dashboard/RecentAlertsSection';
import LiveActivityFeed from '../components/dashboard/LiveActivityFeed';
import { StatusBadge, PrimaryButton, SecondaryButton } from '../components';
import {
  Sparkles,
  Droplets,
  RefreshCw,
  Clock,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Radio,
  Wifi,
} from 'lucide-react';

/**
 * CommandCentreDashboard
 * The central monitoring workspace for JAL-RAKSHAK water intelligence SaaS.
 */
export default function CommandCentreDashboard() {
  const { isRefreshing, refreshTelemetry, lastRefreshedAt, wsStatus, isLivePaused, lastSyncedTime } = useTelemetry();
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header & Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-sky-100 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              Phase 12 Real-Time Platform
            </span>
            {wsStatus === 'connected' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                LIVE WS STREAM {isLivePaused ? '(PAUSED)' : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                CONNECTING TELEMETRY...
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-50 text-slate-600 border border-slate-200">
              Synced: {lastSyncedTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Water Distribution Command Centre
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time hydrostatic supervisory control, AI leak triage, and predictive reservoir replenishment
          </p>
        </div>

        {/* Quick controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 rounded-xl bg-white/80 border border-slate-200/80 text-xs font-semibold shadow-sm">
            {['6h', '12h', '24h', '7d'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedTimeRange === range
                    ? 'bg-sky-50 text-sky-800 border border-sky-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={refreshTelemetry}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/90 hover:bg-white text-slate-700 border border-slate-200 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* 1. DASHBOARD KPI CARDS (6 required cards) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Key Performance Indicators (Synchronized Data Stream)
          </h2>
          <span className="text-[11px] text-slate-400">
            Updated {lastRefreshedAt}
          </span>
        </div>
        <KPIGrid />
      </section>

      {/* 2. WATER NETWORK HEALTH INDICATOR */}
      <section>
        <NetworkHealthIndicator />
      </section>

      {/* 3. CHARTS ROW 1: Consumption vs Target & Supply vs Demand */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsumptionChart />
        <SupplyDemandChart />
      </section>

      {/* 4. CHARTS ROW 2: Pressure Monitoring, Reservoir Trends & Zone Distribution */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PressureMonitoringChart />
        <ReservoirCapacityChart />
        <ZoneDistributionChart />
      </section>

      {/* 5. ZONE-WISE WATER AVAILABILITY TABLE */}
      <section>
        <ZoneAvailabilityTable />
      </section>

      {/* 6. REAL-TIME ACTIVITY FEED & RECENT ALERTS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <LiveActivityFeed />
        <RecentAlertsSection />
      </section>
    </div>
  );
}
