import React, { useState, useMemo } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import AlertStatisticsBar from '../components/alerts/AlertStatisticsBar';
import AlertFilterBar from '../components/alerts/AlertFilterBar';
import AlertCard from '../components/alerts/AlertCard';
import AlertDetailModal from '../components/alerts/AlertDetailModal';
import { GlassCard, StatusBadge, PrimaryButton, EmptyState } from '../components';
import {
  Bell,
  ShieldAlert,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Layers,
  HelpCircle,
} from 'lucide-react';

export default function AlertsManagementPage({ onNavigateToDigitalTwin }) {
  const {
    alerts,
    alertStats,
    acknowledgeAlert,
    updateAlertInvestigation,
    triggerCorroboratedLeak,
    setHighlightedPipeline,
    fetchLeakageTelemetry,
    isRefreshing,
  } = useTelemetry();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAlertForModal, setSelectedAlertForModal] = useState(null);
  const [isTriggering, setIsTriggering] = useState(false);

  // Filtered alert list
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Severity filter
      if (severityFilter !== 'all' && alert.severity !== severityFilter) {
        return false;
      }

      // Zone filter
      if (zoneFilter !== 'all' && alert.zone_id !== zoneFilter) {
        return false;
      }

      // Lifecycle status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'unacknowledged' && alert.acknowledged) return false;
        if (statusFilter === 'active' && (alert.investigation_status === 'resolved' || alert.investigation_status === 'false_positive')) return false;
        if (statusFilter === 'verified_leak' && alert.investigation_status !== 'verified_leak') return false;
        if (statusFilter === 'resolved' && alert.investigation_status !== 'resolved') return false;
        if (statusFilter === 'under_investigation' && alert.investigation_status !== 'under_investigation') return false;
        if (statusFilter === 'crew_dispatched' && alert.investigation_status !== 'crew_dispatched') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = alert.title?.toLowerCase().includes(q);
        const matchesLoc = alert.location?.toLowerCase().includes(q);
        const matchesDetails = alert.details?.toLowerCase().includes(q);
        const matchesPipe = alert.pipeline_ref?.toLowerCase().includes(q);
        const matchesCrew = alert.assigned_crew?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLoc && !matchesDetails && !matchesPipe && !matchesCrew) {
          return false;
        }
      }

      return true;
    });
  }, [alerts, severityFilter, zoneFilter, statusFilter, searchQuery]);

  // Trigger test pipeline rupture
  const handleTriggerSimulatedLeak = async () => {
    setIsTriggering(true);
    await triggerCorroboratedLeak('e-p2-pn102', 'critical');
    setIsTriggering(false);
  };

  // Inspect on Digital Twin
  const handleInspectOnDigitalTwin = (pipelineRef) => {
    setHighlightedPipeline(pipelineRef);
    if (onNavigateToDigitalTwin) {
      onNavigateToDigitalTwin('digital-twin');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Suspicion vs Physical Verification Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-sky-50/60 to-white border border-amber-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-amber-950">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="font-bold text-slate-900 text-sm">
                AI Leakage Suspicion vs Ground Truth Verification Policy
              </strong>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-200/70 text-amber-900">
                PROBABILISTIC FUSION
              </span>
            </div>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Every suspicion is generated through multi-sensor fusion (correlating flow surges, hydrostatic pressure collapses, and storage imbalances).
              Per engineering guidelines, pipe corridors are flagged rather than claiming unverified millimeter GPS points. Field acoustic listening sticks are required for physical verification.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Statistics Bar */}
      <AlertStatisticsBar
        stats={alertStats}
        onTriggerTest={handleTriggerSimulatedLeak}
        isTriggering={isTriggering}
      />

      {/* Alert Filter & Search Bar */}
      <AlertFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        severityFilter={severityFilter}
        onSeverityChange={setSeverityFilter}
        zoneFilter={zoneFilter}
        onZoneChange={setZoneFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onRefresh={fetchLeakageTelemetry}
        isRefreshing={isRefreshing}
      />

      {/* Alerts Stream List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Network Incident Feed
            </span>
            <span className="text-xs font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              {filteredAlerts.length} Active Events
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Sorted by priority & acknowledgement state</span>
          </div>
        </div>

        {filteredAlerts.length > 0 ? (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={acknowledgeAlert}
                onViewDetails={setSelectedAlertForModal}
                onInspectDigitalTwin={handleInspectOnDigitalTwin}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Incidents Found"
            description="No active alerts match your current filter parameters or search query."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSeverityFilter('all');
              setZoneFilter('all');
              setStatusFilter('all');
            }}
          />
        )}
      </div>

      {/* Alert Details & Investigation Modal */}
      {selectedAlertForModal && (
        <AlertDetailModal
          alert={selectedAlertForModal}
          onClose={() => setSelectedAlertForModal(null)}
          onAcknowledge={acknowledgeAlert}
          onUpdateStatus={updateAlertInvestigation}
          onInspectDigitalTwin={handleInspectOnDigitalTwin}
        />
      )}
    </div>
  );
}
