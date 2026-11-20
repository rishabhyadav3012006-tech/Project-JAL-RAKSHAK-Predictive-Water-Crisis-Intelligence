import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AvailabilityOverviewCards from '../components/availability/AvailabilityOverviewCards';
import ReservoirLevelsCard from '../components/availability/ReservoirLevelsCard';
import ShortageRiskMap from '../components/availability/ShortageRiskMap';
import ShortageTimelineCountdown from '../components/availability/ShortageTimelineCountdown';
import ZoneAvailabilityTable from '../components/availability/ZoneAvailabilityTable';
import CriticalZoneDiagnosticModal from '../components/availability/CriticalZoneDiagnosticModal';
import { GlassCard, StatusBadge, PrimaryButton, SecondaryButton } from '../components';
import {
  Droplets,
  Layers,
  AlertTriangle,
  Sparkles,
  Info,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export default function WaterAvailabilityPage() {
  const [zonesShortage, setZonesShortage] = useState([]);
  const [reservoirOverview, setReservoirOverview] = useState(null);
  const [shortageTimeline, setShortageTimeline] = useState([]);
  const [selectedZoneDetail, setSelectedZoneDetail] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch live availability telemetry from backend
  const fetchAvailabilityData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [zonesRes, resRes, timeRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/shortage/zones`, { timeout: 4000 }),
        axios.get(`${API_BASE_URL}/shortage/reservoirs`, { timeout: 4000 }),
        axios.get(`${API_BASE_URL}/shortage/timeline`, { timeout: 4000 }),
      ]);

      if (zonesRes.data && Array.isArray(zonesRes.data)) setZonesShortage(zonesRes.data);
      if (resRes.data) setReservoirOverview(resRes.data);
      if (timeRes.data && Array.isArray(timeRes.data)) setShortageTimeline(timeRes.data);
    } catch {
      // Retain graceful client fallback data
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailabilityData();
  }, [fetchAvailabilityData]);

  const handleSelectZone = (zoneId) => {
    const found = (zonesShortage || []).find((z) => z.zone_id === zoneId);
    if (found) {
      setSelectedZoneDetail(found);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Non-Guaranteed Probabilistic Disclaimer */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-sky-50/60 to-white border border-amber-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-amber-950">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="font-bold text-slate-900 text-sm">
                Probabilistic Water Security & Shortage Risk Forecasting Policy
              </strong>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-200/70 text-amber-900">
                NON-GUARANTEED HYDROLOGIC MODEL
              </span>
            </div>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Water availability forecasts and reserve duration estimates are dynamic simulations derived from current storage levels,
              predicted demand curves, and estimated pipe losses. <strong>Estimates must not be interpreted as guaranteed deterministic outcomes.</strong>
              Supervisory monitoring and field valve calibrations are required.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAvailabilityData}
          disabled={isRefreshing}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-start md:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
          Refresh Models
        </button>
      </div>

      {/* Page Title & Subtitle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-sky-100 gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 shadow-sm">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              Phase 9 Water Availability Module
            </span>
            <StatusBadge
              status={shortageTimeline.length > 0 ? 'warning' : 'normal'}
              label={shortageTimeline.length > 0 ? 'Sector Deficit Alert' : 'City-Wide Equilibrium'}
              size="sm"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Water Availability & Shortage Risk Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Predictive multi-basin reserve depletion modeling, transparent deficit scoring, and critical facility protection
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <AvailabilityOverviewCards
        reservoirOverview={reservoirOverview}
        zonesShortage={zonesShortage}
      />

      {/* Reservoir Storage Levels Section */}
      <ReservoirLevelsCard reservoirs={reservoirOverview?.reservoirs} />

      {/* Shortage Risk Map Grid & Timeline Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ShortageRiskMap
            zonesShortage={zonesShortage}
            onSelectZone={handleSelectZone}
            selectedZoneId={selectedZoneDetail?.zone_id}
          />
        </div>
        <div className="lg:col-span-1">
          <ShortageTimelineCountdown shortageTimeline={shortageTimeline} />
        </div>
      </div>

      {/* Full Zone Availability Balancing Table */}
      <ZoneAvailabilityTable
        zonesShortage={zonesShortage}
        onSelectZone={handleSelectZone}
      />

      {/* Diagnostic Deep-Dive Modal */}
      {selectedZoneDetail && (
        <CriticalZoneDiagnosticModal
          zoneData={selectedZoneDetail}
          onClose={() => setSelectedZoneDetail(null)}
        />
      )}
    </div>
  );
}
