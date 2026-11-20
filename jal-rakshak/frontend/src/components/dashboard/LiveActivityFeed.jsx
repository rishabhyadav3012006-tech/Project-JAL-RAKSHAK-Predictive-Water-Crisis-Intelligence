import React, { useState, useMemo } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { GlassCard, StatusBadge } from '../index';
import {
  Radio,
  Wifi,
  WifiOff,
  Pause,
  Play,
  RefreshCw,
  AlertTriangle,
  Gauge,
  Layers,
  ShieldAlert,
  Droplets,
  Activity,
  Filter,
  Search,
  Sparkles,
  Clock,
  CheckCircle2,
  Send,
  Zap,
} from 'lucide-react';

const EVENT_TYPE_FILTERS = [
  { id: 'all', label: 'All Events' },
  { id: 'ANOMALY_EVENT', label: 'Anomalies' },
  { id: 'LEAKAGE_SUSPICION', label: 'Leakages' },
  { id: 'TANK_LEVEL_CHANGE', label: 'Tank Shifts' },
  { id: 'ZONE_STATUS_CHANGE', label: 'Zone Status' },
  { id: 'SENSOR_READING', label: 'Sensors' },
];

export default function LiveActivityFeed({ className = '' }) {
  const {
    wsStatus,
    isLivePaused,
    togglePauseLiveUpdates,
    lastSyncedTime,
    activityFeed,
    sensorConnectivity,
    reconnectWebSocket,
    triggerManualEvent,
    clearActivityFeed,
  } = useTelemetry();

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInjecting, setIsInjecting] = useState(false);

  // Filter feed items based on category and search query
  const filteredFeed = useMemo(() => {
    return activityFeed.filter((item) => {
      const matchesCategory =
        activeFilter === 'all' ||
        item.type === activeFilter ||
        (activeFilter === 'LEAKAGE_SUSPICION' && item.type?.includes('LEAK')) ||
        (activeFilter === 'ANOMALY_EVENT' && item.type?.includes('ANOMALY'));

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.zone_id?.toLowerCase().includes(searchLower) ||
        item.sensor_id?.toLowerCase().includes(searchLower);

      return matchesCategory && matchesSearch;
    });
  }, [activityFeed, activeFilter, searchQuery]);

  // Quick simulated event injector to test end-to-end WebSocket loop
  const handleQuickInject = async (type) => {
    setIsInjecting(true);
    try {
      if (type === 'leak') {
        await triggerManualEvent({
          event_type: 'LEAKAGE_SUSPICION',
          title: 'Acoustic Leak Signature Detected: Sector 9 Main',
          description: 'Bayesian multi-modal probability score: 0.932. Acute hydraulic pressure gradient corroborated.',
          severity: 'CRITICAL',
          zone_id: 'zone-south',
          sensor_id: 'PIPE-SEC-09',
        });
      } else if (type === 'pressure') {
        await triggerManualEvent({
          event_type: 'ANOMALY_EVENT',
          title: 'Hydrostatic Shockwave on Sector 9 Feeder',
          description: 'Pressure transducer PN-102 dropped by 1.48 bar below normal operating band.',
          severity: 'HIGH',
          zone_id: 'zone-south',
          sensor_id: 'PS-202',
        });
      } else if (type === 'tank') {
        await triggerManualEvent({
          event_type: 'TANK_LEVEL_CHANGE',
          title: 'Elevated Balancing Tank Drawdown Anomaly',
          description: 'Draw rate exceeded inflow by 18.5 m³/h; storage level shifted to 64.2%.',
          severity: 'MEDIUM',
          zone_id: 'zone-east',
          sensor_id: 'TLS-302',
        });
      }
    } finally {
      setIsInjecting(false);
    }
  };

  const getEventIcon = (type, severity) => {
    switch (type) {
      case 'LEAKAGE_SUSPICION':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'ANOMALY_EVENT':
        return <Gauge className="w-4 h-4 text-amber-600" />;
      case 'TANK_LEVEL_CHANGE':
        return <Layers className="w-4 h-4 text-sky-600" />;
      case 'ZONE_STATUS_CHANGE':
        return <ShieldAlert className="w-4 h-4 text-orange-600" />;
      case 'SENSOR_READING':
        return <Droplets className="w-4 h-4 text-emerald-600" />;
      default:
        return <Activity className="w-4 h-4 text-sky-600" />;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-rose-50 text-rose-700 border border-rose-200">
            Critical
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-orange-50 text-orange-700 border border-orange-200">
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-200">
            Medium
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-sky-50 text-sky-700 border border-sky-200">
            Low
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium tracking-wider uppercase bg-slate-50 text-slate-600 border border-slate-200">
            Normal
          </span>
        );
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <GlassCard className={`p-5 space-y-4 ${className}`} glowColor="sky">
      {/* 1. Header & Live Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sky-100/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Live Intelligence Activity Feed
              </h3>
              {/* Live Connection Badge */}
              {wsStatus === 'connected' && !isLivePaused && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  LIVE WS
                </span>
              )}

              {wsStatus === 'connected' && isLivePaused && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Pause className="w-3 h-3 text-amber-500" />
                  PAUSED
                </span>
              )}

              {wsStatus === 'connecting' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                  CONNECTING...
                </span>
              )}

              {(wsStatus === 'disconnected' || wsStatus === 'error') && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <WifiOff className="w-3 h-3 text-rose-500" />
                  RECONNECTING
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Last synchronized: <strong>{lastSyncedTime}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Buffer: {activityFeed.length} events</span>
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Resume Button */}
          <button
            onClick={togglePauseLiveUpdates}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isLivePaused
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={isLivePaused ? 'Resume live streaming updates' : 'Freeze current view'}
          >
            {isLivePaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>Resume Feed</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-500" />
                <span>Pause Feed</span>
              </>
            )}
          </button>

          {/* Reconnect Button */}
          <button
            onClick={reconnectWebSocket}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50 transition-all"
            title="Force reconnect WebSocket"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">Reconnect</span>
          </button>
        </div>
      </div>

      {/* 2. Sensor Connectivity & Ingestion Health Bar */}
      <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-slate-600 font-medium flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-sky-600" />
            Grid Connectivity:
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {sensorConnectivity.online} Online
          </span>
          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {sensorConnectivity.warning} Warning
          </span>
          <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            {sensorConnectivity.offline} Offline
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            ({sensorConnectivity.connectivity_rate_pct}% reliability)
          </span>
        </div>

        {/* Quick event simulation trigger pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-medium hidden md:inline">Test Ingestion:</span>
          <button
            onClick={() => handleQuickInject('leak')}
            disabled={isInjecting}
            className="px-2 py-0.5 text-[11px] font-semibold rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all flex items-center gap-1"
          >
            <Zap className="w-3 h-3 text-rose-600" />
            +Leak
          </button>
          <button
            onClick={() => handleQuickInject('pressure')}
            disabled={isInjecting}
            className="px-2 py-0.5 text-[11px] font-semibold rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all flex items-center gap-1"
          >
            <Zap className="w-3 h-3 text-amber-600" />
            +Shock
          </button>
        </div>
      </div>

      {/* 3. Toolbar: Filter Buttons & Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100/70 border border-slate-200/60 text-xs">
          {EVENT_TYPE_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeFilter === filter.id
                  ? 'bg-white text-sky-800 shadow-sm border border-slate-200/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter feed events..."
            className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
          />
        </div>
      </div>

      {/* 4. Scrollable Activity Stream List */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {filteredFeed.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200 text-slate-500 text-xs">
            <Radio className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
            <p className="font-semibold text-slate-700">No events match current filter</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live stream is continuously monitoring hydrostatic sensors for anomalies.
            </p>
          </div>
        ) : (
          filteredFeed.map((event) => (
            <div
              key={event.id}
              className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                event.severity === 'CRITICAL'
                  ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50'
                  : event.severity === 'HIGH'
                  ? 'bg-orange-50/40 border-orange-200 hover:bg-orange-50/60'
                  : 'bg-white/80 border-slate-200/70 hover:bg-white'
              }`}
            >
              {/* Event Icon in Circular Container */}
              <div
                className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  event.severity === 'CRITICAL'
                    ? 'bg-rose-100/80 text-rose-700'
                    : event.severity === 'HIGH'
                    ? 'bg-orange-100/80 text-orange-700'
                    : event.severity === 'MEDIUM'
                    ? 'bg-amber-100/80 text-amber-700'
                    : 'bg-sky-100/80 text-sky-700'
                }`}
              >
                {getEventIcon(event.type, event.severity)}
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {event.title}
                    </span>
                    {getSeverityBadge(event.severity)}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-1.5">
                  {event.description}
                </p>

                {/* Metadata Tags */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500">
                  {event.zone_id && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Sector: {event.zone_id.replace('zone-', '').toUpperCase()}
                    </span>
                  )}
                  {event.sensor_id && (
                    <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                      Sensor: {event.sensor_id}
                    </span>
                  )}
                  <span className="text-slate-400">
                    Type: {event.type?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Status */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          Single source of truth synchronized via WebSocket (`/ws/telemetry`)
        </span>
        <button
          onClick={clearActivityFeed}
          className="text-slate-400 hover:text-slate-700 text-[10px] font-medium transition-colors"
        >
          Clear Feed Buffer
        </button>
      </div>
    </GlassCard>
  );
}
