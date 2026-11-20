import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  INITIAL_ZONES_DATA,
  INITIAL_RESERVOIRS,
  INITIAL_HOURLY_DATA,
  INITIAL_ALERTS,
  INITIAL_SUSPICIONS,
  calculateAggregateKPIs,
} from '../services/telemetryData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Bilingual Translations (English & Hindi for Jal Jeevan Mission Alignment)
export const TRANSLATIONS = {
  en: {
    appTitle: 'JAL-RAKSHAK',
    tagline: 'Water Intelligence Platform',
    dashboard: 'Command Centre',
    digitalTwin: 'Digital Twin',
    liveSensors: 'Live Sensors',
    anomalyIntelligence: 'Anomaly AI',
    leakageIntelligence: 'Leak Intelligence',
    demandForecasting: 'Demand Forecast',
    waterAvailability: 'Shortage Risk',
    sensorFusion: 'Sensor Fusion',
    analytics: 'Analytics & Compliance',
    settings: 'Settings',
    crisisDemo: 'Crisis Demo',
    networkHealth: 'Network Health',
    dailyInflow: 'Daily Inflow',
    activeLeaks: 'Active Leaks',
    reserveDuration: 'Reserve Duration',
    searchPlaceholder: 'Search telemetry, sensors, conduits, reservoirs... (⌘K)',
    exportPackage: 'Export Package',
  },
  hi: {
    appTitle: 'जल रक्षक',
    tagline: 'स्मार्ट जल ग्रिड बुद्धिमत्ता प्रणाली',
    dashboard: 'कमांड सेंटर',
    digitalTwin: 'डिजिटल ट्विन',
    liveSensors: 'लाइव सेंसर्स',
    anomalyIntelligence: 'विसंगति एआई',
    leakageIntelligence: 'रिसाव बुद्धिमत्ता',
    demandForecasting: 'मांग पूर्वानुमान',
    waterAvailability: 'जल कमी जोखिम',
    sensorFusion: 'सेंसर संलयन',
    analytics: 'एनालिटिक्स व अनुपालन',
    settings: 'सेटिंग्स',
    crisisDemo: 'संकट प्रदर्शन',
    networkHealth: 'नेटवर्क स्वास्थ्य',
    dailyInflow: 'दैनिक जल प्रवाह',
    activeLeaks: 'सक्रिय रिसाव',
    reserveDuration: 'रिजर्व अवधि',
    searchPlaceholder: 'टेलीमेट्री, सेंसर, पाइपलाइन, जलाशय खोजें... (⌘K)',
    exportPackage: 'डेटा निर्यात',
  },
};

// Derive WebSocket URL from API base or window location
const getWebSocketUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // If Vite dev server on 5173, backend is on 8000
  const host = window.location.hostname || 'localhost';
  return `${protocol}//${host}:8000/ws/telemetry`;
};

const TelemetryContext = createContext(null);

export function TelemetryProvider({ children }) {
  const [zones, setZones] = useState(INITIAL_ZONES_DATA);
  const [reservoirs, setReservoirs] = useState(INITIAL_RESERVOIRS);
  const [hourlyData, setHourlyData] = useState(INITIAL_HOURLY_DATA);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [suspicions, setSuspicions] = useState(INITIAL_SUSPICIONS);
  const [highlightedPipeline, setHighlightedPipeline] = useState('e-p2-pn102');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date().toLocaleTimeString());
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [networkHealthScore, setNetworkHealthScore] = useState(89.0);
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en?.[key] || key;
  };

  // Real-time WebSocket states
  const [wsStatus, setWsStatus] = useState('connecting'); // 'connected' | 'connecting' | 'disconnected' | 'error'
  const [isLivePaused, setIsLivePaused] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date().toLocaleTimeString());
  const [liveSensors, setLiveSensors] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [sensorConnectivity, setSensorConnectivity] = useState({
    total_sensors: 17,
    online: 16,
    warning: 1,
    offline: 0,
    connectivity_rate_pct: 94.1,
    mqtt_connected: false,
    fallback_mode: true,
    last_synced: new Date().toLocaleTimeString(),
  });

  const [alertStats, setAlertStats] = useState({
    total_alerts: 5,
    active_critical: 1,
    active_high: 1,
    acknowledged_count: 3,
    acknowledged_pct: 60.0,
    resolved_count: 2,
    verified_leaks: 0,
    false_positives: 0,
    unverified_suspicions: 3,
    false_positive_rate_pct: 0.0,
    average_response_mins: 38.5,
  });

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isLivePausedRef = useRef(isLivePaused);
  isLivePausedRef.current = isLivePaused;

  // Hydrate activity feed from REST endpoint initially or upon reconnect
  const hydrateActivityFeed = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/realtime/activity-feed?limit=30`, { timeout: 3000 });
      if (res.data && Array.isArray(res.data)) {
        setActivityFeed(res.data);
      }
    } catch {
      // Retain seeded activity feed
    }
  }, []);

  // Fetch live alerts & suspicions from backend
  const fetchLeakageTelemetry = useCallback(async () => {
    try {
      const [alertsRes, suspRes, statsRes, zonesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/leakage/alerts`, { timeout: 3000 }),
        axios.get(`${API_BASE_URL}/leakage/suspicions`, { timeout: 3000 }),
        axios.get(`${API_BASE_URL}/leakage/alerts/stats`, { timeout: 3000 }),
        axios.get(`${API_BASE_URL}/zones/water-availability`, { timeout: 3000 }).catch(() => null),
      ]);
      const alertItems = Array.isArray(alertsRes?.data) ? alertsRes.data : (alertsRes?.data?.items || []);
      if (alertItems.length > 0) {
        setAlerts(alertItems);
      }
      if (suspRes?.data && Array.isArray(suspRes.data) && suspRes.data.length > 0) {
        setSuspicions(suspRes.data);
      }
      if (statsRes?.data) {
        setAlertStats(statsRes.data);
      }
      if (zonesRes?.data && Array.isArray(zonesRes.data) && zonesRes.data.length > 0) {
        setZones((prev) =>
          prev.map((pz) => {
            const dbMatch = zonesRes.data.find(
              (dz) => dz.name?.toLowerCase().includes(pz.name?.toLowerCase()) || dz.zone_id === pz.id
            );
            if (dbMatch) {
              return {
                ...pz,
                inflow: dbMatch.current_flow_m3h ?? pz.inflow,
                pressure: dbMatch.pressure_bar ?? pz.pressure,
                lossPct: dbMatch.loss_pct ?? pz.lossPct,
                status: dbMatch.status?.toLowerCase() === 'leak_suspected' ? 'critical' : 'normal',
              };
            }
            return pz;
          })
        );
      }
    } catch {
      // Retain seeded fallback structures smoothly
    }
  }, []);

  // WebSocket Connection & Real-Time Ingestion Lifecycle
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      setWsStatus('connecting');
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);

          // Handle welcome or personal ping
          if (packet.type === 'CONNECTION_ESTABLISHED') {
            setWsStatus('connected');
            return;
          }

          // If stream is paused by operator, preserve frozen snapshot
          if (isLivePausedRef.current) {
            return;
          }

          // Process TELEMETRY_PULSE
          if (packet.type === 'TELEMETRY_PULSE') {
            const timeStr = new Date().toLocaleTimeString();
            setLastSyncedTime(timeStr);
            setLastRefreshedAt(timeStr);

            // 1. Update live sensor inventory
            if (packet.sensors && Array.isArray(packet.sensors)) {
              setLiveSensors(packet.sensors);
            }

            // 2. Update sensor connectivity metrics
            if (packet.sensor_connectivity) {
              setSensorConnectivity(packet.sensor_connectivity);
            }

            // 3. Update network health score
            if (typeof packet.network_health_score === 'number') {
              setNetworkHealthScore(packet.network_health_score);
            }

            // 4. Update Digital Twin highlighted pipeline & sector 9 telemetry
            if (packet.digital_twin) {
              if (packet.digital_twin.active_leak_pipeline) {
                setHighlightedPipeline(packet.digital_twin.active_leak_pipeline);
              }
              // Reflect in South zone
              setZones((prev) =>
                prev.map((zone) => {
                  if (zone.id === 'zone-south') {
                    const isBurst = Boolean(packet.digital_twin.active_leak_pipeline);
                    return {
                      ...zone,
                      pressure: +(packet.digital_twin.sector9_pressure || zone.pressure).toFixed(2),
                      inflow: +(packet.digital_twin.sector9_flow || zone.inflow).toFixed(1),
                      activeLeaks: isBurst ? 2 : 0,
                      status: isBurst ? 'critical' : 'normal',
                      leakRisk: isBurst ? 'Critical' : 'Low',
                      lastUpdated: 'Just now (WS)',
                    };
                  }
                  return zone;
                })
              );
            }

            // 5. Ingest new events into live activity feed
            if (packet.new_events && Array.isArray(packet.new_events) && packet.new_events.length > 0) {
              setActivityFeed((prev) => {
                const existingIds = new Set(prev.map((e) => e.id));
                const incoming = packet.new_events.filter((e) => !existingIds.has(e.id));
                return [...incoming, ...prev].slice(0, 60);
              });
            }
          }

          // Ingest user-triggered event broadcast
          if (packet.type === 'USER_TRIGGERED_EVENT' && packet.event) {
            setActivityFeed((prev) => [packet.event, ...prev.filter((e) => e.id !== packet.event.id)].slice(0, 60));
          }
        } catch {
          // Ignore parse errors on raw pings
        }
      };

      ws.onerror = () => {
        setWsStatus('error');
      };

      ws.onclose = () => {
        setWsStatus('disconnected');
        wsRef.current = null;
        // Automatic reconnection backoff: retry in 3 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connectWebSocket();
          }, 3000);
        }
      };
    } catch {
      setWsStatus('error');
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connectWebSocket();
        }, 3000);
      }
    }
  }, []);

  useEffect(() => {
    hydrateActivityFeed();
    fetchLeakageTelemetry();
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [hydrateActivityFeed, fetchLeakageTelemetry, connectWebSocket]);

  // Compute unified dynamic KPIs from the common dataset
  const kpis = useMemo(() => {
    return calculateAggregateKPIs(zones, hourlyData);
  }, [zones, hourlyData]);

  // Pause / Resume live feed updates
  const togglePauseLiveUpdates = () => {
    setIsLivePaused((prev) => {
      const next = !prev;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ action: next ? 'pause' : 'resume' }));
        } catch {
          // Pass
        }
      }
      return next;
    });
  };

  // Manual WebSocket reconnection trigger
  const reconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    connectWebSocket();
  };

  // Inject manual event to test live stream
  const triggerManualEvent = async (eventPayload) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/realtime/trigger-event`, eventPayload);
      return res.data;
    } catch {
      const mockEvent = {
        id: `act-${Date.now()}`,
        type: eventPayload.event_type || 'ANOMALY_EVENT',
        title: eventPayload.title,
        description: eventPayload.description,
        severity: eventPayload.severity || 'NORMAL',
        zone_id: eventPayload.zone_id || 'zone-south',
        sensor_id: eventPayload.sensor_id,
        timestamp: new Date().toISOString(),
      };
      setActivityFeed((prev) => [mockEvent, ...prev].slice(0, 60));
      return { status: 'mock_injected', event: mockEvent };
    }
  };

  // Clear live activity feed
  const clearActivityFeed = () => {
    setActivityFeed([]);
  };

  // Acknowledge an alert with backend synchronization
  const acknowledgeAlert = async (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
    try {
      await axios.post(`${API_BASE_URL}/leakage/alerts/${alertId}/acknowledge`, {}, { timeout: 3000 });
      fetchLeakageTelemetry();
    } catch {
      // Local state is already updated
    }
  };

  // Update alert investigation status, crew assignment, or verification note
  const updateAlertInvestigation = async (
    alertId,
    investigationStatus,
    physicalVerification,
    assignedCrew,
    note
  ) => {
    const timestampStr = new Date().toLocaleTimeString();
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          const updatedTimeline = [
            ...(a.timeline || []),
            {
              time: timestampStr,
              actor: 'Operator',
              action: `Status: ${investigationStatus}${note ? ` (${note})` : ''}`,
            },
          ];
          return {
            ...a,
            investigation_status: investigationStatus,
            physical_verification: physicalVerification || a.physical_verification,
            assigned_crew: assignedCrew || a.assigned_crew,
            timeline: updatedTimeline,
          };
        }
        return a;
      })
    );

    try {
      await axios.patch(
        `${API_BASE_URL}/leakage/alerts/${alertId}`,
        {
          investigation_status: investigationStatus,
          physical_verification: physicalVerification,
          assigned_crew: assignedCrew,
          note: note,
          actor: 'Operator',
        },
        { timeout: 3000 }
      );
      fetchLeakageTelemetry();
    } catch {
      // Local state is already updated
    }
  };

  // Trigger test corroborated leak across sensor fusion engine & digital twin
  const triggerCorroboratedLeak = async (pipelineRef = 'e-p2-pn102', severity = 'critical') => {
    setHighlightedPipeline(pipelineRef);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/leakage/trigger-test-leak`,
        { pipeline_ref: pipelineRef, severity },
        { timeout: 4000 }
      );
      if (res.data?.suspicion) {
        setSuspicions((prev) => [res.data.suspicion, ...prev]);
      }
      if (res.data?.alert) {
        setAlerts((prev) => [res.data.alert, ...prev]);
      }
      fetchLeakageTelemetry();
      return res.data;
    } catch {
      // Local simulation fallback
      const mockSusp = {
        id: `LS-2026-${Date.now().toString().slice(-3)}`,
        pipeline_ref: pipelineRef,
        potential_location: `Pipeline Section [${pipelineRef}]`,
        zone_id: 'zone-south',
        suspicion_score: severity === 'critical' ? 0.912 : 0.745,
        severity: severity,
        timestamp: 'Just now',
        investigation_status: 'under_investigation',
        physical_verification: 'AI Suspicion (Unverified)',
        estimated_loss_rate_m3h: 21.4,
        explanation: `Multi-Sensor Corroboration: Acute pressure shock (-1.45 bar) accompanied by +34.2% inflow surge and balancing tank drawdown rate. Corroborated leak signature.`,
        supporting_observations: [
          { sensor_id: 'PS-202', sensor_type: 'pressure', metric: 'Pressure', observed_value: 3.10, baseline_value: 4.80, unit: 'bar', deviation_pct: -35.4, reliability_score: 0.98, anomaly_flag: true },
          { sensor_id: 'FS-102', sensor_type: 'flow', metric: 'Flow Rate', observed_value: 238.5, baseline_value: 165.0, unit: 'm³/h', deviation_pct: 42.4, reliability_score: 0.96, anomaly_flag: true },
        ],
      };
      setSuspicions((prev) => [mockSusp, ...prev]);
      const mockAlert = {
        id: `alt-${Date.now().toString().slice(-4)}`,
        severity: severity,
        title: `AI Leakage Suspicion Corroborated (${Math.round(mockSusp.suspicion_score * 100)}%)`,
        location: mockSusp.potential_location,
        timestamp: 'Just now',
        details: mockSusp.explanation,
        acknowledged: false,
        zone_id: 'zone-south',
        pipeline_ref: pipelineRef,
        suspicion_id: mockSusp.id,
        suspicion_score: mockSusp.suspicion_score,
        investigation_status: 'under_investigation',
        physical_verification: 'AI Suspicion (Unverified)',
        supporting_observations: mockSusp.supporting_observations,
        timeline: [
          { time: 'Just now', actor: 'Sensor Fusion AI', action: 'Multi-modal telemetry divergence corroborated' },
        ],
      };
      setAlerts((prev) => [mockAlert, ...prev]);
      return { status: 'mock_injected', suspicion: mockSusp, alert: mockAlert };
    }
  };

  // Simulate a realistic telemetry pulse (subtle fluctuations)
  const refreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setZones((prev) =>
        prev.map((zone) => {
          const jitterInflow = (Math.random() * 0.8 - 0.4);
          const jitterPressure = (Math.random() * 0.1 - 0.05);
          return {
            ...zone,
            inflow: +(zone.inflow + jitterInflow).toFixed(1),
            pressure: +(Math.max(2.5, Math.min(6.5, zone.pressure + jitterPressure))).toFixed(2),
            lastUpdated: 'Just now',
          };
        })
      );
      const timeStr = new Date().toLocaleTimeString();
      setLastRefreshedAt(timeStr);
      setLastSyncedTime(timeStr);
      fetchLeakageTelemetry();
      setIsRefreshing(false);
    }, 600);
  };

  // Inject or resolve simulated pipeline leak
  const toggleLeakSimulation = (zoneId = 'zone-south') => {
    setIsSimulationMode((prev) => !prev);
    setZones((prev) =>
      prev.map((zone) => {
        if (zone.id === zoneId) {
          const hasLeak = zone.activeLeaks > 0;
          return {
            ...zone,
            activeLeaks: hasLeak ? 0 : 2,
            pressure: hasLeak ? 4.9 : 3.42,
            status: hasLeak ? 'normal' : 'critical',
            leakRisk: hasLeak ? 'Low' : 'Critical',
          };
        }
        return zone;
      })
    );

    if (!isSimulationMode) {
      triggerCorroboratedLeak('e-p2-pn102', 'critical');
    }
  };

  const contextValue = useMemo(() => ({
    zones,
    reservoirs,
    hourlyData,
    alerts,
    suspicions,
    highlightedPipeline,
    setHighlightedPipeline,
    alertStats,
    kpis,
    selectedZoneFilter,
    setSelectedZoneFilter,
    isRefreshing,
    lastRefreshedAt,
    refreshTelemetry,
    isSimulationMode,
    toggleLeakSimulation,
    acknowledgeAlert,
    updateAlertInvestigation,
    triggerCorroboratedLeak,
    fetchLeakageTelemetry,
    // Real-Time & Live Telemetry Features
    wsStatus,
    isLivePaused,
    togglePauseLiveUpdates,
    setIsLivePaused,
    lastSyncedTime,
    activityFeed,
    liveSensors,
    sensorConnectivity,
    networkHealthScore,
    reconnectWebSocket,
    triggerManualEvent,
    clearActivityFeed,
    // Language & Localization
    language,
    setLanguage,
    toggleLanguage,
    t,
  }), [
    zones,
    reservoirs,
    hourlyData,
    alerts,
    suspicions,
    highlightedPipeline,
    alertStats,
    kpis,
    selectedZoneFilter,
    isRefreshing,
    lastRefreshedAt,
    refreshTelemetry,
    isSimulationMode,
    toggleLeakSimulation,
    acknowledgeAlert,
    updateAlertInvestigation,
    triggerCorroboratedLeak,
    fetchLeakageTelemetry,
    wsStatus,
    isLivePaused,
    togglePauseLiveUpdates,
    lastSyncedTime,
    activityFeed,
    liveSensors,
    sensorConnectivity,
    networkHealthScore,
    reconnectWebSocket,
    triggerManualEvent,
    clearActivityFeed,
    language,
  ]);

  return (
    <TelemetryContext.Provider value={contextValue}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
}
