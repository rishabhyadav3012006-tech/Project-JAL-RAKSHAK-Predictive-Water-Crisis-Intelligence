import React from 'react';
import { Clock, MapPin, RefreshCw, Calendar, Sparkles } from 'lucide-react';

export default function ForecastHorizonSelector({
  selectedHorizon,
  onSelectHorizon,
  selectedZone,
  onSelectZone,
  onRefresh,
  isRefreshing,
}) {
  const horizons = [
    { id: '1h', label: 'Next 1 Hour', badge: 'Real-time' },
    { id: '6h', label: 'Next 6 Hours', badge: 'Diurnal Surge' },
    { id: '24h', label: 'Next 24 Hours', badge: 'Daily Balancing' },
    { id: '7d', label: 'Next 7 Days', badge: 'Weekly Horizon' },
  ];

  const zones = [
    { id: 'zone-north', label: 'Zone 1-4: North Residential' },
    { id: 'zone-east', label: 'Zone 5-8: East Commercial & IT' },
    { id: 'zone-south', label: 'Zone 9-12: South Industrial Ring' },
    { id: 'zone-west', label: 'Zone 13-16: West Suburbs' },
    { id: 'zone-central', label: 'Zone 17-20: Central Civic & Hospitals' },
  ];

  return (
    <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Zone Selector */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={selectedZone}
            onChange={(e) => onSelectZone(e.target.value)}
            className="pl-9 pr-8 py-2 text-xs sm:text-sm font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white appearance-none cursor-pointer"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.label}
              </option>
            ))}
          </select>
          <MapPin className="w-4 h-4 text-sky-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Horizon Selection Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline mr-1">
          Horizon:
        </span>
        {horizons.map((h) => {
          const isActive = selectedHorizon.toLowerCase() === h.id;
          return (
            <button
              key={h.id}
              onClick={() => onSelectHorizon(h.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-transparent shadow-md shadow-sky-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{h.label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {h.badge}
              </span>
            </button>
          );
        })}

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl text-slate-600 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 transition-all shrink-0 ml-1"
          title="Re-run forecast inference"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
        </button>
      </div>
    </div>
  );
}
