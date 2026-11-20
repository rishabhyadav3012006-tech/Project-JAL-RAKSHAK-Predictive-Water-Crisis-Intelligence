"""Sample database seed script for JAL-RAKSHAK.
Populates realistic smart-city water grid telemetry, infrastructure, and user accounts.
"""

import os
import sys

# Ensure backend root is on sys.path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from datetime import datetime, timezone, timedelta
from app.database.session import SessionLocal, init_db
from app.models.entities import (
    User,
    Zone,
    NetworkComponent,
    Sensor,
    SensorReading,
    AnomalyEvent,
    LeakageAlert,
    DemandForecast,
    ShortagePrediction,
    SimulationScenario,
    AlertHistory,
)

def seed_database():
    """Populate database with sample municipal water grid data if empty."""
    init_db()
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Zone).first():
            print("[Database Seed] Data already present. Skipping initial seed.")
            return

        print("[Database Seed] Starting database initialization and seeding...")
        now = datetime.now(timezone.utc)

        # -------------------------------------------------------------
        # 1. Users
        # -------------------------------------------------------------
        users = [
            User(
                username="admin_rajesh",
                email="rajesh.verma@jalrakshak.gov.in",
                full_name="Rajesh Verma",
                role="admin",
                department="Supervisory Municipal Command",
                is_active=True,
            ),
            User(
                username="engineer_suresh",
                email="suresh.k@jalrakshak.gov.in",
                full_name="Suresh Kumar",
                role="engineer",
                department="Hydraulic Infrastructure Engineering",
                is_active=True,
            ),
            User(
                username="operator_anita",
                email="anita.p@jalrakshak.gov.in",
                full_name="Anita Patel",
                role="operator",
                department="24x7 Real-Time Telemetry Desk",
                is_active=True,
            ),
            User(
                username="technician_vikram",
                email="vikram.s@jalrakshak.gov.in",
                full_name="Vikram Singh",
                role="operator",
                department="Emergency Leak Repair Unit 4",
                is_active=True,
            ),
        ]
        db.add_all(users)
        db.flush()

        # -------------------------------------------------------------
        # 2. Zones
        # -------------------------------------------------------------
        zones = [
            Zone(
                zone_id="ZONE_1",
                name="North Municipal District",
                description="High-density residential and commercial mixed zone",
                area_km2=14.2,
                population_served=68000,
                target_pressure_bar=4.5,
                baseline_flow_m3h=175.0,
                current_flow_m3h=178.0,
                current_pressure_bar=4.52,
                status="NORMAL",
            ),
            Zone(
                zone_id="ZONE_2",
                name="East Industrial Park",
                description="Heavy manufacturing, processing plants, and logistics terminals",
                area_km2=18.5,
                population_served=45000,
                target_pressure_bar=4.8,
                baseline_flow_m3h=210.0,
                current_flow_m3h=215.0,
                current_pressure_bar=4.60,
                status="NORMAL",
            ),
            Zone(
                zone_id="ZONE_3",
                name="South Residential Colony (Sector 9)",
                description="Residential apartments with ongoing AI-flagged sub-surface pressure dip",
                area_km2=16.0,
                population_served=82000,
                target_pressure_bar=4.8,
                baseline_flow_m3h=165.0,
                current_flow_m3h=224.0,
                current_pressure_bar=3.42,
                status="LEAK_SUSPECTED",
            ),
            Zone(
                zone_id="ZONE_4",
                name="West Hillside Suburb",
                description="Elevated suburban terrain requiring pressure booster pumping",
                area_km2=11.8,
                population_served=39000,
                target_pressure_bar=4.2,
                baseline_flow_m3h=130.0,
                current_flow_m3h=128.0,
                current_pressure_bar=4.15,
                status="NORMAL",
            ),
            Zone(
                zone_id="ZONE_5",
                name="Central Heritage Core",
                description="Government offices, historic town center, and central hospital campus",
                area_km2=13.0,
                population_served=74000,
                target_pressure_bar=4.5,
                baseline_flow_m3h=190.0,
                current_flow_m3h=192.0,
                current_pressure_bar=4.45,
                status="NORMAL",
            ),
        ]
        db.add_all(zones)
        db.flush()

        # -------------------------------------------------------------
        # 3. Network Components
        # -------------------------------------------------------------
        components = [
            NetworkComponent(
                component_id="RES-01",
                name="Indravati Bulk Reservoir",
                component_type="reservoir",
                zone_id=None,
                capacity_m3=500000.0,
                current_level_pct=79.3,
                pressure_bar=5.8,
                flow_rate_m3h=880.0,
                status="OPERATIONAL",
                coordinates_json={"x": 100, "y": 150},
            ),
            NetworkComponent(
                component_id="WTP-01",
                name="Central Water Treatment Plant",
                component_type="treatment_plant",
                zone_id=None,
                capacity_m3=300000.0,
                current_level_pct=85.0,
                pressure_bar=5.2,
                flow_rate_m3h=850.0,
                status="OPERATIONAL",
                coordinates_json={"x": 300, "y": 150},
            ),
            NetworkComponent(
                component_id="PUMP-01",
                name="North Booster Pumping Station",
                component_type="pump_station",
                zone_id="ZONE_1",
                capacity_m3=0.0,
                current_level_pct=100.0,
                pressure_bar=5.4,
                flow_rate_m3h=240.0,
                status="OPERATIONAL",
                coordinates_json={"x": 500, "y": 80},
            ),
            NetworkComponent(
                component_id="PUMP-02",
                name="South High-Lift Pump Station",
                component_type="pump_station",
                zone_id="ZONE_3",
                capacity_m3=0.0,
                current_level_pct=100.0,
                pressure_bar=4.2,
                flow_rate_m3h=280.0,
                status="OPERATIONAL",
                coordinates_json={"x": 500, "y": 280},
            ),
            NetworkComponent(
                component_id="TANK-01",
                name="North Elevated Balancing Tank",
                component_type="tank",
                zone_id="ZONE_1",
                capacity_m3=120000.0,
                current_level_pct=82.4,
                pressure_bar=4.5,
                flow_rate_m3h=178.0,
                status="OPERATIONAL",
                coordinates_json={"x": 700, "y": 60},
            ),
            NetworkComponent(
                component_id="TANK-02",
                name="South Sector 9 Intermediate Tank",
                component_type="tank",
                zone_id="ZONE_3",
                capacity_m3=95000.0,
                current_level_pct=64.0,
                pressure_bar=3.4,
                flow_rate_m3h=224.0,
                status="DEGRADED",
                coordinates_json={"x": 700, "y": 300},
            ),
            NetworkComponent(
                component_id="PIPE-SEC-09",
                name="Sector 9 Distribution Feeder Line",
                component_type="pipeline",
                zone_id="ZONE_3",
                capacity_m3=0.0,
                current_level_pct=100.0,
                pressure_bar=3.42,
                flow_rate_m3h=224.0,
                status="LEAK_SUSPECTED",
                coordinates_json={"from": "PUMP-02", "to": "TANK-02"},
            ),
        ]
        db.add_all(components)
        db.flush()

        # -------------------------------------------------------------
        # 4. Sensors (17 Edge IoT Sensors)
        # -------------------------------------------------------------
        sensors = [
            # Flow Sensors
            Sensor(sensor_id="FLOW-Z1-001", zone_id="ZONE_1", component_id="PUMP-01", sensor_type="flow", unit="m3/h", uptime_pct=99.0, packet_loss_pct=2.0, snr_db=38.0, reliability_score=0.979),
            Sensor(sensor_id="FLOW-Z2-001", zone_id="ZONE_2", component_id=None, sensor_type="flow", unit="m3/h", uptime_pct=98.0, packet_loss_pct=4.0, snr_db=35.0, reliability_score=0.954),
            Sensor(sensor_id="FLOW-Z3-001", zone_id="ZONE_3", component_id="PIPE-SEC-09", sensor_type="flow", unit="m3/h", uptime_pct=99.0, packet_loss_pct=1.0, snr_db=41.0, reliability_score=0.985),
            Sensor(sensor_id="FLOW-Z4-001", zone_id="ZONE_4", component_id=None, sensor_type="flow", unit="m3/h", uptime_pct=94.0, packet_loss_pct=8.0, snr_db=29.0, reliability_score=0.885),
            Sensor(sensor_id="FLOW-Z5-001", zone_id="ZONE_5", component_id=None, sensor_type="flow", unit="m3/h", uptime_pct=99.0, packet_loss_pct=1.0, snr_db=42.0, reliability_score=0.987),
            # Pressure Sensors
            Sensor(sensor_id="PRESS-Z1-001", zone_id="ZONE_1", component_id="TANK-01", sensor_type="pressure", unit="bar", uptime_pct=98.0, packet_loss_pct=3.0, snr_db=36.0, reliability_score=0.962),
            Sensor(sensor_id="PRESS-Z2-001", zone_id="ZONE_2", component_id=None, sensor_type="pressure", unit="bar", uptime_pct=92.0, packet_loss_pct=11.0, snr_db=26.0, reliability_score=0.844),
            Sensor(sensor_id="PRESS-Z3-001", zone_id="ZONE_3", component_id="TANK-02", sensor_type="pressure", unit="bar", uptime_pct=99.0, packet_loss_pct=1.0, snr_db=44.0, reliability_score=0.988),
            Sensor(sensor_id="PRESS-Z4-001", zone_id="ZONE_4", component_id=None, sensor_type="pressure", unit="bar", uptime_pct=96.0, packet_loss_pct=5.0, snr_db=32.0, reliability_score=0.921),
            Sensor(sensor_id="PRESS-Z5-001", zone_id="ZONE_5", component_id=None, sensor_type="pressure", unit="bar", uptime_pct=99.0, packet_loss_pct=1.0, snr_db=43.0, reliability_score=0.987),
            # Tank Levels
            Sensor(sensor_id="TANK-Z1-001", zone_id="ZONE_1", component_id="TANK-01", sensor_type="tank", unit="%", uptime_pct=99.0, packet_loss_pct=2.0, snr_db=39.0, reliability_score=0.981),
            Sensor(sensor_id="TANK-Z2-001", zone_id="ZONE_2", component_id=None, sensor_type="tank", unit="%", uptime_pct=97.0, packet_loss_pct=4.0, snr_db=34.0, reliability_score=0.948),
            Sensor(sensor_id="TANK-Z3-001", zone_id="ZONE_3", component_id="TANK-02", sensor_type="tank", unit="%", uptime_pct=98.0, packet_loss_pct=2.0, snr_db=38.0, reliability_score=0.973),
            # Consumption Meters
            Sensor(sensor_id="METER-Z1-001", zone_id="ZONE_1", component_id=None, sensor_type="meter", unit="m3/h", uptime_pct=97.0, packet_loss_pct=4.0, snr_db=33.0, reliability_score=0.944),
            Sensor(sensor_id="METER-Z3-001", zone_id="ZONE_3", component_id=None, sensor_type="meter", unit="m3/h", uptime_pct=96.0, packet_loss_pct=5.0, snr_db=35.0, reliability_score=0.941),
            # Pump Status
            Sensor(sensor_id="PUMP-ST-001", zone_id="ZONE_1", component_id="PUMP-01", sensor_type="pump", unit="rpm", uptime_pct=99.0, packet_loss_pct=1.0, snr_db=45.0, reliability_score=0.993),
            Sensor(sensor_id="PUMP-ST-002", zone_id="ZONE_3", component_id="PUMP-02", sensor_type="pump", unit="rpm", uptime_pct=99.0, packet_loss_pct=1.0, snr_db=44.0, reliability_score=0.993),
        ]
        db.add_all(sensors)
        db.flush()

        # -------------------------------------------------------------
        # 5. Sensor Readings (Sample historical series)
        # -------------------------------------------------------------
        readings = []
        for i in range(12):
            t = now - timedelta(minutes=15 * (11 - i))
            readings.extend([
                SensorReading(sensor_id="FLOW-Z3-001", timestamp=t, value=round(165.0 + (i * 5.0) + (10.0 if i > 8 else 0.0), 1), unit="m3/h", is_valid=True),
                SensorReading(sensor_id="PRESS-Z3-001", timestamp=t, value=round(4.8 - (i * 0.12), 2), unit="bar", is_valid=True),
                SensorReading(sensor_id="TANK-Z3-001", timestamp=t, value=round(75.0 - (i * 0.9), 1), unit="%", is_valid=True),
                SensorReading(sensor_id="FLOW-Z1-001", timestamp=t, value=round(175.0 + (i % 3), 1), unit="m3/h", is_valid=True),
                SensorReading(sensor_id="PRESS-Z1-001", timestamp=t, value=4.52, unit="bar", is_valid=True),
            ])
        db.add_all(readings)

        # -------------------------------------------------------------
        # 6. Anomaly Events
        # -------------------------------------------------------------
        anomalies = [
            AnomalyEvent(
                event_id="EVT-2026-001",
                zone_id="ZONE_3",
                sensor_id="PRESS-Z3-001",
                detection_timestamp=now - timedelta(minutes=24),
                anomaly_score=0.88,
                severity="HIGH",
                archetype="sudden_pressure_deviation",
                explanation="Hydrostatic pressure dropped by -28% (3.42 Bar vs 4.80 Bar baseline) while inflow increased.",
                acknowledged=True,
                resolved=False,
            ),
            AnomalyEvent(
                event_id="EVT-2026-002",
                zone_id="ZONE_2",
                sensor_id="FLOW-Z2-001",
                detection_timestamp=now - timedelta(hours=2),
                anomaly_score=0.62,
                severity="MEDIUM",
                archetype="unexpected_high_flow",
                explanation="Inflow exceeded 95th percentile baseline during off-peak industrial shift change.",
                acknowledged=False,
                resolved=False,
            ),
            AnomalyEvent(
                event_id="EVT-2026-003",
                zone_id="ZONE_4",
                sensor_id="PRESS-Z4-001",
                detection_timestamp=now - timedelta(hours=5),
                anomaly_score=0.45,
                severity="LOW",
                archetype="abnormal_flow_pressure_relationship",
                explanation="Minor transient fluctuation during pump switchover. Stabilized within 8 minutes.",
                acknowledged=True,
                resolved=True,
            ),
        ]
        db.add_all(anomalies)

        # -------------------------------------------------------------
        # 7. Leakage Alerts & Alert History
        # -------------------------------------------------------------
        alerts = [
            LeakageAlert(
                alert_id="ALT-2026-001",
                zone_id="ZONE_3",
                pipeline_id="PIPE-SEC-09",
                suspicion_score=0.941,
                severity="Critical",
                status="UNACKNOWLEDGED",
                timestamp=now - timedelta(minutes=18),
                supporting_sensors_json={
                    "flow_surge": "+35.8% (FLOW-Z3-001)",
                    "pressure_collapse": "-28.8% (PRESS-Z3-001)",
                    "customer_meters": "+1.4% normal (METER-Z3-001)",
                    "tank_depletion": "-4.8 m3/h unmetered"
                },
                explanation="High-confidence pipe rupture in Sector 9. Simultaneous pressure loss and flow spike corroborated by multi-sensor physical law engine.",
                assigned_crew=None,
            ),
            LeakageAlert(
                alert_id="ALT-2026-002",
                zone_id="ZONE_2",
                pipeline_id="PIPE-IND-04",
                suspicion_score=0.68,
                severity="Medium",
                status="INVESTIGATING",
                timestamp=now - timedelta(hours=3),
                supporting_sensors_json={"flow_deviation": "+12.4%", "pressure_dip": "-8.2%"},
                explanation="Localized joint seepage suspected along 300mm industrial transmission line.",
                assigned_crew="Field Unit Alpha-2",
            ),
            LeakageAlert(
                alert_id="ALT-2026-003",
                zone_id="ZONE_1",
                pipeline_id="PIPE-VALVE-01",
                suspicion_score=0.35,
                severity="Low",
                status="RESOLVED",
                timestamp=now - timedelta(hours=14),
                supporting_sensors_json={"valve_vibration": "Elevated"},
                explanation="Air release valve cavitation corrected by technician. Hydraulic pressure normalized.",
                assigned_crew="Vikram Singh",
                resolution_notes="Replaced faulty air release gasket. Pressure holding steady at 4.52 bar.",
            ),
        ]
        db.add_all(alerts)
        db.flush()

        history_items = [
            AlertHistory(
                alert_id="ALT-2026-002",
                timestamp=now - timedelta(hours=2, minutes=30),
                previous_status="UNACKNOWLEDGED",
                new_status="INVESTIGATING",
                updated_by="Anita Patel (Control Centre)",
                notes="Dispatched Field Unit Alpha-2 with acoustic correlation logger.",
            ),
            AlertHistory(
                alert_id="ALT-2026-003",
                timestamp=now - timedelta(hours=12),
                previous_status="INVESTIGATING",
                new_status="RESOLVED",
                updated_by="Vikram Singh (Field Engineer)",
                notes="Valve gasket replacement verified with ultrasonic leak detector.",
            ),
        ]
        db.add_all(history_items)

        # -------------------------------------------------------------
        # 8. Demand Forecasts
        # -------------------------------------------------------------
        forecasts = []
        for z in ["ZONE_1", "ZONE_2", "ZONE_3", "ZONE_4", "ZONE_5"]:
            forecasts.extend([
                DemandForecast(
                    zone_id=z,
                    forecast_horizon="1h",
                    target_timestamp=now + timedelta(hours=1),
                    predicted_demand_m3h=184.2,
                    confidence_lower_m3h=176.0,
                    confidence_upper_m3h=192.4,
                    weather_condition="Clear (28°C)",
                    is_peak_hour=True,
                ),
                DemandForecast(
                    zone_id=z,
                    forecast_horizon="6h",
                    target_timestamp=now + timedelta(hours=6),
                    predicted_demand_m3h=142.0,
                    confidence_lower_m3h=132.5,
                    confidence_upper_m3h=151.5,
                    weather_condition="Partly Cloudy (26°C)",
                    is_peak_hour=False,
                ),
                DemandForecast(
                    zone_id=z,
                    forecast_horizon="24h",
                    target_timestamp=now + timedelta(hours=24),
                    predicted_demand_m3h=195.0,
                    confidence_lower_m3h=182.0,
                    confidence_upper_m3h=208.0,
                    weather_condition="Sunny (31°C)",
                    is_peak_hour=True,
                ),
            ])
        db.add_all(forecasts)

        # -------------------------------------------------------------
        # 9. Shortage Predictions
        # -------------------------------------------------------------
        shortages = [
            ShortagePrediction(
                zone_id="ZONE_3",
                current_storage_m3=60800.0,
                projected_deficit_m3h=59.0,
                reserve_hours=14.5,
                risk_category="High Risk",
                risk_score=0.74,
                recommended_action="Activate emergency cross-zone interconnect from Zone 1 balancing tank and isolate Sector 9 leak.",
            ),
            ShortagePrediction(
                zone_id="ZONE_1",
                current_storage_m3=98880.0,
                projected_deficit_m3h=0.0,
                reserve_hours=28.0,
                risk_category="Normal",
                risk_score=0.18,
                recommended_action="Maintain scheduled pumping cycles. Inflow headroom sufficient at +12%.",
            ),
            ShortagePrediction(
                zone_id="ZONE_2",
                current_storage_m3=114750.0,
                projected_deficit_m3h=15.0,
                reserve_hours=21.2,
                risk_category="Low Risk",
                risk_score=0.34,
                recommended_action="Review evening industrial batch filling quotas.",
            ),
            ShortagePrediction(
                zone_id="ZONE_4",
                current_storage_m3=45200.0,
                projected_deficit_m3h=8.0,
                reserve_hours=22.8,
                risk_category="Low Risk",
                risk_score=0.31,
                recommended_action="Maintain booster pump schedule.",
            ),
            ShortagePrediction(
                zone_id="ZONE_5",
                current_storage_m3=85000.0,
                projected_deficit_m3h=0.0,
                reserve_hours=26.4,
                risk_category="Normal",
                risk_score=0.16,
                recommended_action="Optimal supply balance across civic hospitals and administrative core.",
            ),
        ]
        db.add_all(shortages)

        # -------------------------------------------------------------
        # 10. Simulation Scenarios
        # -------------------------------------------------------------
        scenarios = [
            SimulationScenario(
                scenario_key="NORMAL",
                title="Normal Operating Baseline",
                description="Nominal diurnal consumer demand with balanced pressure and standard pumping curves.",
                parameters_json={"leak_flow": 0.0, "pressure_delta": 0.0, "pump_speed_pct": 100},
                is_active=False,
            ),
            SimulationScenario(
                scenario_key="PIPE_BURST",
                title="Sector 9 Underground Pipeline Fracture",
                description="Simulates major rupture in 400mm feeder: flow spikes +35%, pressure collapses -28%.",
                parameters_json={"leak_flow": 59.0, "pressure_delta": -1.38, "zone": "ZONE_3"},
                is_active=True,
            ),
            SimulationScenario(
                scenario_key="PEAK_DEMAND",
                title="Morning Rush-Hour Peak Surge",
                description="City-wide surge at 08:30 AM: legitimate domestic consumption spikes by +32%.",
                parameters_json={"demand_multiplier": 1.32, "pump_speed_pct": 115},
                is_active=False,
            ),
            SimulationScenario(
                scenario_key="PUMP_TRIP",
                title="Booster Pump Electrical Trip Event",
                description="Unplanned shutdown of North Booster Pump PUMP-01 causing localized pressure loss.",
                parameters_json={"pump_offline": "PUMP-01", "pressure_drop_bar": -2.2},
                is_active=False,
            ),
        ]
        db.add_all(scenarios)

        db.commit()
        print("[Database Seed] Successfully seeded all 11 tables with realistic smart-city water data!")

    except Exception as e:
        db.rollback()
        print(f"[Database Seed Error] Failed to seed database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
