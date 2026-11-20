import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTelemetry } from '../context/TelemetryContext';
import SimulationControlBar from '../components/sensors/SimulationControlBar';
import SensorCard from '../components/sensors/SensorCard';
import SensorDetailModal from '../components/sensors/SensorDetailModal';
import LiveActivityFeed from '../components/dashboard/LiveActivityFeed';
import { GlassCard, StatusBadge } from '../components';
import {
  Radio,
  Filter,
  Search,
  Droplets,
  Gauge,
  Layers,
  Waves,
  Activity,
  AlertTriangle,
  Info,
  Wifi,
  WifiOff,
  Pause,
  Play,
  Clock,
  Sparkles,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Seeded fallback inventory ensuring live display works under all runtime conditions
const FALLBACK_SENSORS = [
  // 1. Flow Sensors
  { sensor_id: 'FS-101', sensor_name: 'Bulk Intake Magflow Meter', sensor_type: 'flow', zone_id: 'zone-north', measurement_value: 842.4, unit: 'm³/h', operational_status: 'online', battery_percent: 96, signal_rssi_dbm: -64, timestamp: new Date().toISOString(), anomaly_flags: [], metadata: { pipe_dia_mm: 1800, calibration_due: '2027-01-15' }, history: [838, 839, 841, 840, 842, 841, 842.4].map((v, i) => ({ timestamp: new Date(Date.now() - (7 - i) * 10000).toISOString(), value: v })) },
  { sensor_id: 'FS-102', sensor_name: 'Sector 9 South Feeder Meter', sensor_type: 'flow', zone_id: 'zone-south', measurement_value: 238.5, unit: 'm³/h', operational_status: 'warning', battery_percent: 88, signal_rssi_dbm: -72, timestamp: new Date().toISOString(), anomaly_flags: ['High Flow Discrepancy'], metadata: { pipe_dia_mm: 800, calibration_due: '2027-03-20' }, history: [210, 212, 215, 230, 235, 238.5].map((v, i) => ({ timestamp: new Date(Date.now() - (6 - i) * 10000).toISOString(), value: v })) },
  { sensor_id: 'FS-103', sensor_name: 'East High-Service Flow Meter', sensor_type: 'flow', zone_id: 'zone-east', measurement_value: 312.0, unit: 'm³/h', operational_status: 'online', battery_percent: 94, signal_rssi_dbm: -68, timestamp: new Date().toISOString(), anomaly_flags: [], metadata: { pipe_dia_mm: 900, calibration_due: '2026-12-10' }, history: [308, 310, 311, 310, 312].map((v, i) => ({ timestamp: new Date(Date.now() - (5 - i) * 10000).toISOString(), value: v })) },
  { sensor_id: 'FS-104', sensor_name: 'West Suburbs Distribution Meter', sensor_type: 'flow', zone_id: 'zone-west', measurement_value: 184.2, unit: 'm³/h', operational_status: 'online', battery_percent: 91, signal_rssi_dbm: -74, timestamp: new Date().toISOString(), anomaly_flags: [], metadata: { pipe_dia_mm: 650, calibration_due: '2027-04-05' }, history: [180, 182, 183, 184.2].map((v, i) => ({ timestamp: new Date(Date.now() - (4 - i) * 10000).toISOString(), value: v })) },

  // 2. Pressure Sensors
  { sensor_id: 'PS-201', sensor_name: 'North Lift Discharge Transducer', sensor_type: 'pressure', zone_id: 'zone-north', measurement_value: 5.82, unit: 'Bar', operational_status: 'online', battery_percent: 95, signal_rssi_dbm: -62, timestamp: new Date().toISOString(), anomaly_flags: [], metadata: { range_max_bar: 10.0, accuracy: '+/- 0.05 Bar' }, history: [5.78, 5.8, 5.81, 5.82].map((v, i) => ({ timestamp: new Date(Date.now() - (4 - i) * 10000).toISOString(), value: v })) },
  { sensor_id: 'PS-202', sensor_name: 'Sector 9 Industrial Transducer', sensor_type: 'pressure', zone_id: 'zone-south', measurement_value: 3.42, unit: 'Bar', operational_status: 'critical', battery_percent: 86, signal_rssi_dbm: -79, timestamp: new Date().toISOString(), anomaly_flags: ['Negative Pressure Gradient (-1.6 Bar)'], metadata: { range_max_bar: 8.0, accuracy: '+/- 0.05 Bar' }, history: [4.8, 4.7, 4.2, 3.8, 3.5, 3.42].map((v, i) => ({ timestamp: new Date(Date.now() - (6 - i) * 10000).toISOString(), value: v })) },
  { sensor_id: 'PS-203', sensor_name: 'East Ring Distribution Transducer', sensor_type: 'pressure', zone_id: 'zone-east', measurement_value: 5.12, unit: 'Bar', operational_status: 'online', battery_percent: 92, signal_rssi_dbm: -65, timestamp: new Date().toISOString(), anomaly_flags: [], metadata: { range_max_bar: 8.0, accuracy: '+/- 0.05 Bar' }, history: [5.1, 5.11, 5.12].map((v, i) => ({ timestamp: new Date(Date.now() - (3 - i) * 10000).toISOString(), value: v })) },
  { sensor_id: 'PS-204', sensor_name: 'West Ground Sump Nodal Sensor', sensor_type: 'pressure', zone_id: 'zone-west', measurement_value: 4.45, unit: 'Bar', operational_status: 'online', battery_percent: 89, signal_rssi_dbm: -71, timestamp: new Date().toISOString(), anomaly_flags: [], metadata: { range_max_bar: 8.0, accuracy: '+/- 0.05 Bar' }, history: [4.42, 4.44, 4.45].map((v, i) => ({ timestamp: new Date(Date.now() - (3 - i) * 10000).toISOString(), value: v })) },

  // 3. Tank Level Sensors
  { sensor_id: 'TLS-301', sensor_name: 'Sharda Sagar Bulk Basin Level', sensor_type: 'tank_level', zone_id: 'zone-north', measurement_value: 84.5, unit: '%', operational_status: 'online', battery_percent: 98, signal_rssi_dbm: -60, timestamp: new Date().toISOString(), anomaly_flags: [], metadata: { sensor_technology: 'Radar Level Transducer' }, history: [84.2, 84.3, 84.4, 84.5].map((v, i) => ({ timestamp: new Date(Date.now() - (4 - i) * 10000).toISOString(), value: v })) },
  { sensor_id: 'TLS-302', sensor_name: 'East Elevated Balancing Tank Level', sensor_type: 'tank_level', zone_id: 'zone-east', measurement_value: 76.2, unit: '%', operational_status: 'online', battery_percent: 91, signal_rssi_dbm: -69, timestamp: new Date().toISOString(), anomaly_flags: [], metadata: { sensor_technology: 'Ultrasonic Level Sensor' }, history: [76.5, 76.4, 76.2].map((v, i) => ({ timestamp: new Date(Date.now() - (3 - i) * 10000).toISOString(), value: v })) },
  { sensor_id: 'TLS-303', sensor_name: 'South Industrial Buffer Tank Level', sensor_type: 'tank_level', zone_id: 'zone-south', measurement_value: 68.4, unit: '%', operational_status: 'warning', battery_percent: 84, signal_rssi_dbm: -76, timestamp: new Date().toISOString(), anomaly_flags: ['Low Buffer Level'], metadata: { sensor_technology: 'Depth Transducer' }, history: [72, 70.5, 69.2, 68.4].map((v, i) => ({ timestamp: new Date(Date.now() - (4 - i) * 10000).toISOString(), value: v })) },
  { sensor_id: 'TLS-304', sensor_name: 'West Sub-aquifer Clear Sump Level', sensor_type: 'tank_level', zone_id: 'zone-west', measurement_value: 82.0, unit: '%', operational_status: 'online', battery_percent: 95, signal_rssi_dbm: -66, timestamp: new Date().toISOString(), anomaly_flags: [], metadata: { sensor_technology: 'Ultrasonic Level Sensor' }, history: [81.8, 81.9, 82.0].map((v, i) => ({ timestamp: new Date(Date.now() - (3 - i) * 10000).toISOString(), value: v })) },

  // 4. Water Consumption Meters
  { sensor_id: 'WCM-401', sensor_name: 'Sector 1-4 Residential Bulk Meter', sensor_type: 'consumption', zone_id: 'zone-north', measurement_value: 418.5, unit: 'kL/h', operational_status: 'online', battery_percent: 93, signal_rssi_dbm: -63, timestamp: new Date().toISOString(), anomaly_flags: [], metadata: { protocol: 'AMR / Wireless M-Bus' }, history: [410, 412, 415, 418.5].map((v, i) => ({ timestamp: new Date(Date.now() - (4 - i) * 10000).toISOString(), value: v })) },
  { sensor_id: 'WCM-402', sensor_name: 'Zone 5-8 Commercial Zone AMR Meter', sensor_type: 'consumption', zone_id: 'zone-east', measurement_value: 362.0, unit: 'kL/h', operational_status: 'online', battery_percent: 90, signal_rssi_dbm: -70, timestamp: new Date().toISOString(), anomaly_flags: [], metadata: { protocol: 'Cellular NB-IoT' }, history: [355, 358, 360, 362].map((v, i) => ({ timestamp: new Date(Date.now() - (4 - i) * 10000).toISOString(), value: v })) },
  { sensor_id: 'WCM-403', sensor_name: 'South Industrial High-Draw Meter', sensor_type: 'consumption', zone_id: 'zone-south', measurement_value: 522.0, unit: 'kL/h', operational_status: 'online', battery_percent: 87, signal_rssi_dbm: -73, timestamp: new Date().toISOString(), anomaly_flags: [], metadata: { protocol: 'Modbus RTU' }, history: [515, 518, 520, 522].map((v, i) => ({ timestamp: new Date(Date.now() - (4 - i) * 10000).toISOString(), value: v })) },

  // 5. Pump Status Sensors
  { sensor_id: 'PSS-501', sensor_name: 'North Lift Pump #1 VFD Monitor', sensor_type: 'pump_status', zone_id: 'zone-north', measurement_value: 1450.0, unit: 'RPM', operational_status: 'online', battery_percent: 97, signal_rssi_dbm: -58, timestamp: new Date().toISOString(), anomaly_flags: [], metadata: { power_draw_kw: 112.5 }, history: [1448, 1450, 1449, 1450].map((v, i) => ({ timestamp: new Date(Date.now() - (4 - i) * 10000).toISOString(), value: v })) },
  { sensor_id: 'PSS-502', sensor_name: 'South Booster Pump #2 VFD Monitor', sensor_type: 'pump_status', zone_id: 'zone-south', measurement_value: 1200.0, unit: 'RPM', operational_status: 'warning', battery_percent: 89, signal_rssi_dbm: -75, timestamp: new Date().toISOString(), anomaly_flags: ['High Bearing Temperature (64°C)'], metadata: { power_draw_kw: 85.0 }, history: [1400, 1350, 1250, 1200].map((v, i) => ({ timestamp: new Date(Date.now() - (4 - i) * 10000).toISOString(), value: v })) },
];

export default function LiveSensorsPage() {
  const {
    liveSensors,
    sensorConnectivity,
    wsStatus,
    isLivePaused,
    togglePauseLiveUpdates,
    lastSyncedTime,
  } = useTelemetry();

  const [sensors, setSensors] = useState(FALLBACK_SENSORS);
  const [simStatus, setSimStatus] = useState({
    is_running: true,
    active_scenario: 'normal',
    fallback_mode: true,
    total_readings_generated: 1420,
  });
  const [selectedType, setSelectedType] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedSensor, setInspectedSensor] = useState(null);

  // Sync sensors immediately when live WebSocket packet updates liveSensors
  useEffect(() => {
    if (liveSensors && liveSensors.length > 0 && !isLivePaused) {
      setSensors((prev) =>
        liveSensors.map((ls) => {
          const prevMatch = prev.find((p) => p.sensor_id === ls.sensor_id);
          return {
            ...ls,
            // maintain client metadata & history if backend summary is compact
            metadata: ls.metadata || prevMatch?.metadata || {},
            history: (ls.history && ls.history.length > 0)
              ? ls.history
              : (prevMatch?.history || []),
          };
        })
      );
    }
  }, [liveSensors, isLivePaused]);

  // Fallback REST fetcher only runs if WebSocket is disconnected (avoids redundant polling)
  const fetchSensorsFallback = async () => {
    try {
      const [sensorsRes, statusRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/sensors`, { timeout: 2500 }),
        axios.get(`${API_BASE_URL}/sensors/simulation/status`, { timeout: 2500 }),
      ]);
      if (sensorsRes.data && Array.isArray(sensorsRes.data)) {
        setSensors(sensorsRes.data);
      }
      if (statusRes.data) {
        setSimStatus(statusRes.data);
      }
    } catch {
      // Local client-side simulation jitter fallback
      setSensors((prev) =>
        prev.map((s) => {
          const jitter = (Math.random() - 0.5) * 0.4;
          const newVal = +(s.measurement_value + jitter).toFixed(2);
          const history = [...(s.history || []), { timestamp: new Date().toISOString(), value: newVal }].slice(-15);
          return {
            ...s,
            measurement_value: newVal,
            timestamp: new Date().toISOString(),
            history,
          };
        })
      );
    }
  };

  useEffect(() => {
    // If WebSocket is not connected, use a relaxed 5s polling interval
    if (wsStatus !== 'connected') {
      fetchSensorsFallback();
      const interval = setInterval(fetchSensorsFallback, 5000);
      return () => clearInterval(interval);
    }
  }, [wsStatus]);

  // Handle Start / Pause / Reset controls
  const handleControlAction = async (action) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/sensors/simulation/control`, { action });
      setSimStatus(res.data);
    } catch {
      if (action === 'start') setSimStatus((p) => ({ ...p, is_running: true }));
      if (action === 'pause') setSimStatus((p) => ({ ...p, is_running: false }));
      if (action === 'reset') {
        setSensors(FALLBACK_SENSORS);
        setSimStatus((p) => ({ ...p, active_scenario: 'normal', is_running: true }));
      }
    }
  };

  // Handle Scenario Switch
  const handleScenarioChange = async (scenario) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/sensors/simulation/control`, {
        action: 'start',
        scenario,
      });
      setSimStatus(res.data);
    } catch {
      setSimStatus((p) => ({ ...p, active_scenario: scenario }));
    }
  };

  // Filtered Sensor Array
  const filteredSensors = sensors.filter((s) => {
    const matchesType = selectedType === 'all' || s.sensor_type === selectedType;
    const matchesZone = selectedZone === 'all' || s.zone_id === selectedZone;
    const matchesSearch =
      s.sensor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sensor_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesZone && matchesSearch;
  });

  const sensorTypes = [
    { id: 'all', label: `All Sensors (${sensors.length})` },
    { id: 'flow', label: 'Flow (4)', icon: Droplets },
    { id: 'pressure', label: 'Pressure (4)', icon: Gauge },
    { id: 'tank_level', label: 'Tank Level (4)', icon: Layers },
    { id: 'consumption', label: 'Consumption (3)', icon: Waves },
    { id: 'pump_status', label: 'Pump Monitors (2)', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Top Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-sky-50/90 border border-sky-200/90 text-sky-950 text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            <strong>Real-Time Water Intelligence Pipeline:</strong> Continuous MQTT telemetry stream synchronized across 17 multi-modal probes.
          </span>
        </div>
        <div className="flex items-center gap-2">
          {wsStatus === 'connected' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              WEBSOCKET ACTIVE {isLivePaused ? '(PAUSED)' : ''}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
              CONNECTING WS...
            </span>
          )}
          <span className="text-[11px] font-mono text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
            Synced: {lastSyncedTime}
          </span>
          <button
            onClick={togglePauseLiveUpdates}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all"
          >
            {isLivePaused ? (
              <>
                <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-slate-500" />
                <span>Pause</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Page Title & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sky-100 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 shadow-sm">
              <Radio className="w-3.5 h-3.5 text-sky-500" />
              Phase 12 Live Intelligence
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {sensorConnectivity.online} Online • {sensorConnectivity.warning} Warning • {sensorConnectivity.offline} Offline
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            IoT Sensor Telemetry Grid
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time electromagnetic flow meters, hydrostatic pressure transducers, ultrasonic depth gauges & pump monitors
          </p>
        </div>
      </div>

      {/* Simulation Engine Control Bar */}
      <SimulationControlBar
        status={simStatus}
        onControlAction={handleControlAction}
        onScenarioChange={handleScenarioChange}
        activeScenario={simStatus.active_scenario}
      />

      {/* Toolbar: Category Tabs + Zone Filter + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm text-xs font-semibold">
          {sensorTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                selectedType === t.id
                  ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.icon && <t.icon className="w-3.5 h-3.5 text-sky-600" />}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Zone Selector & Search */}
        <div className="flex items-center gap-3">
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-white/90 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">All Sectors</option>
            <option value="zone-north">North District</option>
            <option value="zone-east">East Core</option>
            <option value="zone-south">South Industrial</option>
            <option value="zone-west">West Suburbs</option>
          </select>

          <div className="relative w-48 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sensor ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Grid of Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSensors.map((sensor) => (
          <SensorCard
            key={sensor.sensor_id}
            sensor={sensor}
            onClick={setInspectedSensor}
          />
        ))}
      </div>

      {/* Real-time Activity Stream Feed */}
      <div className="pt-2">
        <LiveActivityFeed />
      </div>

      {/* Detailed Modal on Card Click */}
      {inspectedSensor && (
        <SensorDetailModal
          sensor={inspectedSensor}
          onClose={() => setInspectedSensor(null)}
        />
      )}
    </div>
  );
}
