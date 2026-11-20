"""IoT Sensor Simulation Engine orchestrator."""
import time
import threading
from datetime import datetime, timezone
from typing import Dict, List, Any

# Local package imports
try:
    from sensors.sensor_models import SensorWithHistory, HistoricalPoint, SimulatorStatus
    from simulation.scenarios import SimulationScenario, mutate_sensor_reading
    from mqtt.client import mqtt_manager
except ImportError:
    from ..sensors.sensor_models import SensorWithHistory, HistoricalPoint, SimulatorStatus
    from .scenarios import SimulationScenario, mutate_sensor_reading
    from ..mqtt.client import mqtt_manager

# Authoritative Initial Sensor Inventory (5 required types across zones)
INITIAL_SENSORS_CONFIG = [
  # 1. Flow Sensors (m3/h)
  {"id": "FS-101", "name": "Bulk Intake Magflow Meter", "type": "flow", "zone": "zone-north", "base": 840.0, "unit": "m³/h", "metadata": {"pipe_dia_mm": 1800, "calibration_due": "2027-01-15"}},
  {"id": "FS-102", "name": "Sector 9 South Feeder Meter", "type": "flow", "zone": "zone-south", "base": 240.0, "unit": "m³/h", "metadata": {"pipe_dia_mm": 800, "calibration_due": "2027-03-20"}},
  {"id": "FS-103", "name": "East High-Service Flow Meter", "type": "flow", "zone": "zone-east", "base": 310.0, "unit": "m³/h", "metadata": {"pipe_dia_mm": 900, "calibration_due": "2026-12-10"}},
  {"id": "FS-104", "name": "West Suburbs Distribution Meter", "type": "flow", "zone": "zone-west", "base": 185.0, "unit": "m³/h", "metadata": {"pipe_dia_mm": 650, "calibration_due": "2027-04-05"}},

  # 2. Pressure Sensors (Bar)
  {"id": "PS-201", "name": "North Lift Discharge Transducer", "type": "pressure", "zone": "zone-north", "base": 5.80, "unit": "Bar", "metadata": {"range_max_bar": 10.0, "accuracy": "+/- 0.05 Bar"}},
  {"id": "PS-202", "name": "Sector 9 Industrial Transducer", "type": "pressure", "zone": "zone-south", "base": 3.42, "unit": "Bar", "metadata": {"range_max_bar": 8.0, "accuracy": "+/- 0.05 Bar"}},
  {"id": "PS-203", "name": "East Ring Distribution Transducer", "type": "pressure", "zone": "zone-east", "base": 5.12, "unit": "Bar", "metadata": {"range_max_bar": 8.0, "accuracy": "+/- 0.05 Bar"}},
  {"id": "PS-204", "name": "West Ground Sump Nodal Sensor", "type": "pressure", "zone": "zone-west", "base": 4.45, "unit": "Bar", "metadata": {"range_max_bar": 8.0, "accuracy": "+/- 0.05 Bar"}},

  # 3. Tank-Level Sensors (%)
  {"id": "TLS-301", "name": "Sharda Sagar Bulk Basin Level", "type": "tank_level", "zone": "zone-north", "base": 84.5, "unit": "%", "metadata": {"sensor_technology": "Radar Level Transducer", "max_head_m": 120.0}},
  {"id": "TLS-302", "name": "East Elevated Balancing Tank Level", "type": "tank_level", "zone": "zone-east", "base": 76.2, "unit": "%", "metadata": {"sensor_technology": "Ultrasonic Level Sensor", "max_head_m": 35.0}},
  {"id": "TLS-303", "name": "South Industrial Buffer Tank Level", "type": "tank_level", "zone": "zone-south", "base": 68.4, "unit": "%", "metadata": {"sensor_technology": "Hydrostatic Pressure Depth Gauge", "max_head_m": 25.0}},
  {"id": "TLS-304", "name": "West Sub-aquifer Clear Sump Level", "type": "tank_level", "zone": "zone-west", "base": 82.0, "unit": "%", "metadata": {"sensor_technology": "Ultrasonic Level Sensor", "max_head_m": 15.0}},

  # 4. Water Consumption Meters (kL/h)
  {"id": "WCM-401", "name": "Sector 1-4 Residential Bulk Meter", "type": "consumption", "zone": "zone-north", "base": 418.0, "unit": "kL/h", "metadata": {"protocol": "AMR / Wireless M-Bus", "metered_households": 28400}},
  {"id": "WCM-402", "name": "Zone 5-8 Commercial Zone AMR Meter", "type": "consumption", "zone": "zone-east", "base": 360.0, "unit": "kL/h", "metadata": {"protocol": "Cellular NB-IoT", "commercial_units": 1420}},
  {"id": "WCM-403", "name": "South Industrial High-Draw Meter", "type": "consumption", "zone": "zone-south", "base": 520.0, "unit": "kL/h", "metadata": {"protocol": "Modbus RTU over 4G", "industrial_plants": 34}},

  # 5. Pump Status Sensors (RPM)
  {"id": "PSS-501", "name": "North Lift Pump #1 VFD Monitor", "type": "pump_status", "zone": "zone-north", "base": 1450.0, "unit": "RPM", "metadata": {"power_draw_kw": 112.5, "vibration_mm_s": 1.2, "bearing_temp_c": 48.5}},
  {"id": "PSS-502", "name": "South Booster Pump #2 VFD Monitor", "type": "pump_status", "zone": "zone-south", "base": 1200.0, "unit": "RPM", "metadata": {"power_draw_kw": 85.0, "vibration_mm_s": 3.8, "bearing_temp_c": 64.0}},
]

class SimulationEngine:
    def __init__(self):
        self.is_running = True
        self.active_scenario = SimulationScenario.NORMAL
        self.tick_rate_seconds = 2.0
        self.step_counter = 0
        self.total_readings_generated = 0
        self.lock = threading.Lock()
        self.sensors: Dict[str, SensorWithHistory] = {}
        self._init_sensors()

        # Connect to MQTT or fallback
        mqtt_manager.connect()

        # Background simulation thread
        self.worker_thread = threading.Thread(target=self._run_loop, daemon=True)
        self.worker_thread.start()

    def _init_sensors(self):
        now = datetime.now(timezone.utc).isoformat()
        for cfg in INITIAL_SENSORS_CONFIG:
            history = []
            for i in range(12, 0, -1):
                hist_time = datetime.fromtimestamp(time.time() - i * 30, timezone.utc).isoformat()
                history.append(HistoricalPoint(
                    timestamp=hist_time,
                    value=round(cfg["base"] + (i % 3 - 1) * 0.4, 2),
                    status="online"
                ))

            self.sensors[cfg["id"]] = SensorWithHistory(
                sensor_id=cfg["id"],
                sensor_name=cfg["name"],
                sensor_type=cfg["type"],
                zone_id=cfg["zone"],
                timestamp=now,
                measurement_value=cfg["base"],
                unit=cfg["unit"],
                operational_status="online",
                battery_percent=94,
                signal_rssi_dbm=-68,
                anomaly_flags=[],
                metadata=cfg.get("metadata", {}),
                history=history
            )

    def _run_loop(self):
        while True:
            if self.is_running:
                self.tick()
            time.sleep(self.tick_rate_seconds)

    def tick(self):
        with self.lock:
            self.step_counter += 1
            now = datetime.now(timezone.utc).isoformat()

            for cfg in INITIAL_SENSORS_CONFIG:
                s_id = cfg["id"]
                sensor = self.sensors[s_id]
                val, status, flags = mutate_sensor_reading(
                    sensor_type=sensor.sensor_type,
                    base_val=cfg["base"],
                    scenario=self.active_scenario,
                    step_counter=self.step_counter,
                    sensor_id=s_id
                )

                sensor.measurement_value = val
                sensor.operational_status = status
                sensor.anomaly_flags = flags
                sensor.timestamp = now
                sensor.history.append(HistoricalPoint(timestamp=now, value=val, status=status))

                if len(sensor.history) > 30:
                    sensor.history.pop(0)

                self.total_readings_generated += 1

                mqtt_manager.publish_reading(
                    sensor_type=sensor.sensor_type,
                    sensor_id=sensor.sensor_id,
                    payload=sensor.model_dump()
                )

    def get_all_sensors(self) -> List[SensorWithHistory]:
        with self.lock:
            return list(self.sensors.values())

    def get_sensor_history(self, sensor_id: str) -> List[HistoricalPoint]:
        with self.lock:
            if sensor_id in self.sensors:
                return self.sensors[sensor_id].history
            return []

    def set_scenario(self, scenario: str):
        with self.lock:
            self.active_scenario = scenario

    def start(self):
        self.is_running = True

    def pause(self):
        self.is_running = False

    def reset(self):
        with self.lock:
            self.step_counter = 0
            self.active_scenario = SimulationScenario.NORMAL
            self._init_sensors()

    def get_status(self) -> SimulatorStatus:
        return SimulatorStatus(
            is_running=self.is_running,
            active_scenario=self.active_scenario,
            tick_rate_seconds=self.tick_rate_seconds,
            total_readings_generated=self.total_readings_generated,
            mqtt_connected=mqtt_manager.is_connected,
            fallback_mode=mqtt_manager.fallback_mode,
            last_tick_timestamp=datetime.now(timezone.utc).isoformat()
        )

sim_engine = SimulationEngine()
