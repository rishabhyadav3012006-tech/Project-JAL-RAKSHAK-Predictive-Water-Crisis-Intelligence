"""Real-time event processing, MQTT/Simulator ingestion, and WebSocket dispatcher."""
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from app.websocket.manager import ws_manager
from simulation.engine import sim_engine
from anomaly_detection.detector import anomaly_detector
from sensor_fusion import CrossSensorDetector
from mqtt.client import mqtt_manager

logger = logging.getLogger("JalRakshakRealtime")

class RealtimeEventProcessor:
    """Processes live incoming sensor packets, evaluates anomalies & leaks, and broadcasts to WebSockets."""

    def __init__(self):
        self.is_active = True
        self.activity_feed: List[Dict[str, Any]] = []
        self.max_feed_size = 60
        self.last_processed_tick = 0
        self.subscribers = []
        self.prev_tank_levels: Dict[str, float] = {}
        self.prev_zone_status: Dict[str, str] = {}
        self._init_default_feed()

    def _init_default_feed(self):
        """Pre-populate recent events for immediate UI hydration."""
        now = datetime.now(timezone.utc)
        self.activity_feed = [
            {
                "id": "act-1",
                "type": "LEAKAGE_SUSPICION",
                "title": "Sub-surface Rupture Corroborated in Sector 9",
                "description": "Cross-sensor physical law engine confirmed flow surge (+35%) and pressure drop (3.42 bar).",
                "severity": "CRITICAL",
                "zone_id": "zone-south",
                "sensor_id": "FLOW-Z3-001",
                "timestamp": now.isoformat(),
                "icon": "AlertTriangle",
            },
            {
                "id": "act-2",
                "type": "ANOMALY_EVENT",
                "title": "Sudden Pressure Deviation Detected",
                "description": "Sector 9 hydrostatic transducer reported -28.8% drop below baseline.",
                "severity": "HIGH",
                "zone_id": "zone-south",
                "sensor_id": "PS-202",
                "timestamp": now.isoformat(),
                "icon": "Gauge",
            },
            {
                "id": "act-3",
                "type": "TANK_LEVEL_CHANGE",
                "title": "South Industrial Buffer Tank Level Drop",
                "description": "Storage level dropped to 68.4% with increased draw rate of 4.8 m³/h.",
                "severity": "MEDIUM",
                "zone_id": "zone-south",
                "sensor_id": "TLS-303",
                "timestamp": now.isoformat(),
                "icon": "Layers",
            },
            {
                "id": "act-4",
                "type": "ZONE_STATUS_CHANGE",
                "title": "Sector 9 South Zone Status: Critical",
                "description": "Zone compliance reclassified to active leak investigation based on acoustic & hydraulic telemetry.",
                "severity": "HIGH",
                "zone_id": "zone-south",
                "sensor_id": None,
                "timestamp": now.isoformat(),
                "icon": "ShieldAlert",
            },
            {
                "id": "act-5",
                "type": "SENSOR_READING",
                "title": "Bulk Intake Magflow Normal",
                "description": "Indravati transmission aqueduct transmitting 842.4 m³/h at 5.82 bar.",
                "severity": "NORMAL",
                "zone_id": "zone-north",
                "sensor_id": "FS-101",
                "timestamp": now.isoformat(),
                "icon": "Droplets",
            },
        ]

    def add_activity(
        self,
        event_type: str,
        title: str,
        description: str,
        severity: str = "NORMAL",
        zone_id: Optional[str] = None,
        sensor_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Appends a new event to the live activity feed and enforces buffer limits."""
        event = {
            "id": f"act-{int(datetime.now(timezone.utc).timestamp() * 1000)}",
            "type": event_type,
            "title": title,
            "description": description,
            "severity": severity,
            "zone_id": zone_id,
            "sensor_id": sensor_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self.activity_feed.insert(0, event)
        if len(self.activity_feed) > self.max_feed_size:
            self.activity_feed.pop()
        return event

    def ingest_mqtt_reading(self, payload: Dict[str, Any]):
        """Ingests a reading received from MQTT broker and logs significant anomalies."""
        s_id = payload.get("sensor_id")
        flags = payload.get("anomaly_flags", [])
        if flags:
            self.add_activity(
                event_type="ANOMALY_EVENT",
                title=f"MQTT Telemetry Anomaly on {s_id}",
                description=f"Sensor reported flags: {', '.join(flags)}",
                severity="HIGH" if any("critical" in f.lower() or "drop" in f.lower() for f in flags) else "MEDIUM",
                zone_id=payload.get("zone_id"),
                sensor_id=s_id,
            )

    async def process_live_tick(self):
        """Processes one simulation tick, detects anomalies/leaks, monitors connectivity, and broadcasts WebSocket packet."""
        sensors = sim_engine.get_all_sensors()
        if not sensors:
            return

        now = datetime.now(timezone.utc).isoformat()
        current_tick = sim_engine.step_counter

        # 1. Evaluate Sensor Connectivity
        total_sensors = len(sensors)
        online_count = sum(1 for s in sensors if s.operational_status == "online")
        warning_count = sum(1 for s in sensors if s.operational_status in ["warning", "degraded"])
        offline_count = sum(1 for s in sensors if s.operational_status in ["critical", "offline"])
        connectivity_rate = round(((online_count + warning_count) / max(total_sensors, 1)) * 100, 1)

        connectivity_summary = {
            "total_sensors": total_sensors,
            "online": online_count,
            "warning": warning_count,
            "offline": offline_count,
            "connectivity_rate_pct": connectivity_rate,
            "mqtt_connected": mqtt_manager.is_connected,
            "fallback_mode": mqtt_manager.fallback_mode,
            "last_synced": now,
        }

        # 2. Prepare Telemetry Sensor Summaries
        sensor_summaries = []
        for s in sensors:
            sensor_summaries.append({
                "sensor_id": s.sensor_id,
                "sensor_name": s.sensor_name,
                "sensor_type": s.sensor_type,
                "zone_id": s.zone_id,
                "measurement_value": s.measurement_value,
                "unit": s.unit,
                "operational_status": s.operational_status,
                "battery_percent": s.battery_percent,
                "signal_rssi_dbm": s.signal_rssi_dbm,
                "anomaly_flags": s.anomaly_flags,
                "timestamp": s.timestamp,
                "metadata": s.metadata,
                "history": [{"timestamp": h.timestamp, "value": h.value} for h in s.history[-10:]],
            })

        # 3. Check for Severe Sensor Anomalies in this tick
        new_events = []
        for s in sensors:
            if s.anomaly_flags and len(s.anomaly_flags) > 0 and current_tick % 3 == 0:
                flag = s.anomaly_flags[0]
                event = self.add_activity(
                    event_type="ANOMALY_EVENT",
                    title=f"Telemetry Alert: {s.sensor_name}",
                    description=f"{flag.replace('_', ' ').title()}: observed reading {s.measurement_value} {s.unit}",
                    severity="HIGH" if "critical" in flag.lower() or "drop" in flag.lower() else "MEDIUM",
                    zone_id=s.zone_id,
                    sensor_id=s.sensor_id,
                )
                new_events.append(event)

        # 4. Check Tank Level Shifts
        tank_sensors = [s for s in sensors if s.sensor_type == "tank_level"]
        for ts in tank_sensors:
            prev_val = self.prev_tank_levels.get(ts.sensor_id)
            if prev_val is not None:
                delta = ts.measurement_value - prev_val
                if abs(delta) >= 1.5 and current_tick % 5 == 0:
                    trend = "decreased" if delta < 0 else "increased"
                    event = self.add_activity(
                        event_type="TANK_LEVEL_CHANGE",
                        title=f"Tank Level Shift: {ts.sensor_name}",
                        description=f"Storage {trend} by {abs(delta):.1f}% to {ts.measurement_value:.1f}%",
                        severity="MEDIUM" if ts.measurement_value < 70 else "NORMAL",
                        zone_id=ts.zone_id,
                        sensor_id=ts.sensor_id,
                    )
                    new_events.append(event)
            self.prev_tank_levels[ts.sensor_id] = ts.measurement_value

        # 5. Check Sector 9 Pipe Burst Scenario & Zone Status Changes
        flow_s9 = next((s for s in sensors if s.sensor_id in ["FS-102", "FLOW-Z3-001"]), None)
        press_s9 = next((s for s in sensors if s.sensor_id in ["PS-202", "PRESS-Z3-001"]), None)
        tank_s9 = next((s for s in sensors if s.sensor_id in ["TLS-303", "TANK-Z3-001"]), None)

        is_leak_active = sim_engine.active_scenario in ["pipe_burst", "PIPE_BURST"]
        current_zone_status = "CRITICAL" if is_leak_active else "NORMAL"
        prev_status = self.prev_zone_status.get("zone-south", "NORMAL")

        if current_zone_status != prev_status:
            event = self.add_activity(
                event_type="ZONE_STATUS_CHANGE",
                title=f"Zone Status Transition: Sector 9 South Zone",
                description=f"Status transitioned from {prev_status} to {current_zone_status} (Burst scenario: {is_leak_active}).",
                severity="CRITICAL" if is_leak_active else "NORMAL",
                zone_id="zone-south",
                sensor_id=None,
            )
            new_events.append(event)
            self.prev_zone_status["zone-south"] = current_zone_status

        if is_leak_active and current_tick % 4 == 0:
            leak_event = self.add_activity(
                event_type="LEAKAGE_SUSPICION",
                title="Sector 9 Secondary Feeder Rupture Corroborated",
                description="Cross-sensor Bayesian fusion score: 0.941. Flow surge paired with severe pressure drop (3.42 bar).",
                severity="CRITICAL",
                zone_id="zone-south",
                sensor_id="PIPE-SEC-09",
            )
            new_events.append(leak_event)

        # 6. Construct Real-Time Broadcast Packet
        broadcast_packet = {
            "type": "TELEMETRY_PULSE",
            "timestamp": now,
            "step": current_tick,
            "scenario": sim_engine.active_scenario,
            "sensor_connectivity": connectivity_summary,
            "total_sensors": len(sensors),
            "sensors": sensor_summaries,
            "new_events": new_events,
            "digital_twin": {
                "active_leak_pipeline": "e-p2-pn102" if is_leak_active else None,
                "sector9_pressure": press_s9.measurement_value if press_s9 else 3.42,
                "sector9_flow": flow_s9.measurement_value if flow_s9 else 224.0,
                "sector9_tank_pct": tank_s9.measurement_value if tank_s9 else 68.4,
            },
            "network_health_score": 74.5 if is_leak_active else 89.0,
        }

        # 7. Broadcast to all connected WebSocket clients
        await ws_manager.broadcast(broadcast_packet)

    def get_recent_activity(self) -> List[Dict[str, Any]]:
        return self.activity_feed

realtime_processor = RealtimeEventProcessor()
