"""Simulation scenarios generating time-dependent realistic water telemetry variations."""
import math
import random
from datetime import datetime, timezone

class SimulationScenario:
    NORMAL = "normal"
    INCREASED_DEMAND = "increased_demand"
    FLOW_ANOMALY = "flow_anomaly"
    PRESSURE_FLUCTUATION = "pressure_fluctuation"
    GRADUAL_DEPLETION = "gradual_depletion"
    SENSOR_DISCONNECTION = "sensor_disconnection"

def calculate_time_factor(step_counter: int) -> float:
    """Calculates diurnal consumption curve: baseline + morning/evening demand peaks."""
    # Simulates an accelerated 24-hour cycle every 120 steps
    time_of_day_rad = (step_counter % 120) * (2 * math.pi / 120)
    # Peak at step 40 (08:00) and step 90 (18:00)
    diurnal = 0.85 + 0.35 * math.sin(time_of_day_rad - math.pi / 3) ** 2
    return max(0.6, min(1.4, diurnal))

def mutate_sensor_reading(
    sensor_type: str,
    base_val: float,
    scenario: str,
    step_counter: int,
    sensor_id: str,
) -> tuple[float, str, list[str]]:
    """
    Computes measurement value, status, and anomaly flags based on active scenario.
    Returns: (measurement_value, operational_status, anomaly_flags)
    """
    time_factor = calculate_time_factor(step_counter)
    noise = (random.random() - 0.5) * 0.05
    flags = []
    status = "online"
    val = base_val

    # Scenario: Sensor Disconnection / Dropout
    if scenario == SimulationScenario.SENSOR_DISCONNECTION and sensor_id in ["PS-202", "FS-103"]:
        if step_counter % 6 in [0, 1, 2]:
            return base_val, "disconnected", ["Telemetry Packet Dropout", "Missing Gateway Heartbeat"]

    if sensor_type == "flow":
        val = base_val * time_factor * (1.0 + noise)
        if scenario == SimulationScenario.INCREASED_DEMAND:
            val *= 1.38
            flags.append("Surge Demand Peak Draw")
        elif scenario == SimulationScenario.FLOW_ANOMALY and sensor_id == "FS-102":
            val *= 2.25
            status = "critical"
            flags.append("Acoustic Pipe Rupture Flow Surge")

    elif sensor_type == "pressure":
        # Inverse hydraulic relationship: high flow -> minor head loss
        val = base_val - (time_factor - 1.0) * 0.4 + noise * 2.0
        if scenario == SimulationScenario.FLOW_ANOMALY and sensor_id in ["PS-202", "PS-203"]:
            val = max(1.8, val - 1.65)
            status = "critical"
            flags.append("Negative Pressure Gradient (-1.6 Bar)")
        elif scenario == SimulationScenario.PRESSURE_FLUCTUATION:
            oscillation = math.sin(step_counter * 0.6) * 1.4
            val = max(1.5, base_val + oscillation)
            if val < 3.2:
                status = "warning"
                flags.append("Hydrostatic Oscillating Underpressure")

    elif sensor_type == "tank_level":
        if scenario == SimulationScenario.GRADUAL_DEPLETION:
            depletion_factor = max(15.0, base_val - (step_counter % 60) * 1.2)
            val = depletion_factor
            if val < 40.0:
                status = "warning"
                flags.append("Reservoir Low Buffer Depletion")
        else:
            val = max(30.0, min(99.0, base_val - (time_factor - 1.0) * 6.0 + noise * 4.0))

    elif sensor_type == "consumption":
        val = base_val * time_factor * (1.0 + noise * 1.5)
        if scenario == SimulationScenario.INCREASED_DEMAND:
            val *= 1.42
            flags.append("Industrial Peak Quota Surge")

    elif sensor_type == "pump_status":
        if scenario == SimulationScenario.FLOW_ANOMALY and sensor_id == "PSS-502":
            val = 0.0  # Tripped
            status = "critical"
            flags.append("Emergency Low-Pressure Pump Trip")
        else:
            val = base_val + random.randint(-25, 25)

    return round(val, 2), status, flags
