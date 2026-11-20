import React from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  MapPin,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';

export default function AlertFilterBar({
  searchQuery,
  onSearchChange,
  severityFilter,
  onSeverityChange,
  zoneFilter,
  onZoneChange,
  statusFilter,
  onStatusChange,
  onRefresh,
  isRefreshing,
}) {
  const severities = [
    { id: 'all', label: 'All Severities' },
    { id: 'critical', label: 'Critical' },
    { id: 'high', label: 'High' },
    { id: 'medium', label: 'Medium' },
    { id: 'low', label: 'Low' },
  ];

  const statuses = [
    { id: 'all', label: 'All Statuses' },
    { id: 'unacknowledged', label: 'Unacknowledged' },
    { id: 'active', label: 'Active Incidents' },
    { id: 'under_investigation', label: 'Under Investigation' },
    { id: 'crew_dispatched', label: 'Crew Dispatched' },
    { id: 'verified_leak', label: 'Verified Leaks' },
    { id: 'resolved', label: 'Resolved' },
  ];

  const zones = [
    { id: 'all', label: 'All Zones (City-Wide)' },
    { id: 'zone-north', label: 'Zone 1-4: North Residential' },
    { id: 'zone-east', label: 'Zone 5-8: East Commercial' },
    { id: 'zone-south', label: 'Zone 9-12: South Industrial Ring' },
    { id: 'zone-west', label: 'Zone 13-16: West Suburbs' },
    { id: 'zone-central', label: 'Zone 17-20: Central Civic' },
  ];

  return (
    <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-sky-100 shadow-sm space-y-3.5">
      {/* Top Row: Search and Zone Dropdown */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search alerts by location, pipeline ID, keywords, or crew..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <select
              value={zoneFilter}
              onChange={(e) => onZoneChange(e.target.value)}
              className="pl-8 pr-8 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:bg-white appearance-none cursor-pointer"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.label}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-sky-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-slate-600 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 transition-all shrink-0"
            title="Refresh Alert Stream"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bottom Row: Filter Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        {/* Severity Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Severity:
          </span>
          {severities.map((s) => {
            const isActive = severityFilter === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSeverityChange(s.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  isActive
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Lifecycle:
          </span>
          {statuses.map((st) => {
            const isActive = statusFilter === st.id;
            return (
              <button
                key={st.id}
                onClick={() => onStatusChange(st.id)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
