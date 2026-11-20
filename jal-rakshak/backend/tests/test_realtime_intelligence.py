"""Phase 12 Real-Time Intelligence, MQTT Ingestion & WebSocket Test Suite."""
from app.services.realtime_processor import realtime_processor
from app.websocket.manager import ws_manager
from simulation.engine import sim_engine
from app.api.routers.realtime import (
    get_activity_feed,
    get_ws_statistics,
    TriggerRealtimeEventRequest,
)

def test_activity_feed_hydration_endpoint():
    """Verifies that the activity feed endpoint returns recent events with expected schema."""
    feed = get_activity_feed(limit=10)
    assert isinstance(feed, list)
    assert len(feed) >= 1
    first_event = feed[0]
    assert "id" in first_event
    assert "type" in first_event
    assert "title" in first_event
    assert "description" in first_event
    assert "severity" in first_event
    assert "timestamp" in first_event

def test_ws_statistics_endpoint():
    """Verifies WebSocket manager statistics endpoint."""
    stats = get_ws_statistics()
    assert "active_clients" in stats
    assert "total_messages_broadcast" in stats
    assert isinstance(stats["active_clients"], int)

def test_realtime_processor_add_activity():
    """Verifies that realtime_processor appends and formats new events correctly."""
    event = realtime_processor.add_activity(
        event_type="LEAKAGE_SUSPICION",
        title="Sector 9 Secondary Feeder Rupture Corroborated",
        description="Cross-sensor physical law engine confirmed flow surge (+35%) and pressure drop.",
        severity="CRITICAL",
        zone_id="zone-south",
        sensor_id="PIPE-SEC-09",
    )
    assert event["title"] == "Sector 9 Secondary Feeder Rupture Corroborated"
    assert event["severity"] == "CRITICAL"
    assert event["zone_id"] == "zone-south"

    # Verify event is in feed
    feed = realtime_processor.get_recent_activity()
    assert feed[0]["id"] == event["id"]
    assert feed[0]["title"] == event["title"]

def test_realtime_processor_feed_buffer_limit():
    """Verifies that activity feed strictly enforces max buffer capacity."""
    for i in range(10):
        realtime_processor.add_activity(
            event_type="TEST_TICK",
            title=f"Test Buffer Event {i}",
            description="Testing max limit",
            severity="NORMAL",
        )
    feed = realtime_processor.get_recent_activity()
    assert len(feed) <= realtime_processor.max_feed_size

def test_mqtt_reading_ingestion():
    """Verifies that MQTT reading ingestion extracts anomaly flags and adds activity events."""
    reading_payload = {
        "sensor_id": "PS-202",
        "zone_id": "zone-south",
        "anomaly_flags": ["critical_negative_gradient"],
        "measurement_value": 3.10,
    }
    realtime_processor.ingest_mqtt_reading(reading_payload)
    latest_event = realtime_processor.activity_feed[0]
    assert latest_event["type"] == "ANOMALY_EVENT"
    assert "PS-202" in latest_event["title"]
    assert latest_event["severity"] == "HIGH"

def test_websocket_manager_lifecycle():
    """Verifies WebSocket manager connection stats and broadcast state tracking."""
    initial_stats = ws_manager.get_stats()
    assert "active_clients" in initial_stats
    assert initial_stats["active_clients"] >= 0

def test_sensor_connectivity_computation():
    """Verifies that sensor connectivity metrics are accurately calculated from active sensors."""
    sensors = sim_engine.get_all_sensors()
    assert len(sensors) == 17
    total_sensors = len(sensors)
    online_count = sum(1 for s in sensors if s.operational_status == "online")
    warning_count = sum(1 for s in sensors if s.operational_status in ["warning", "degraded"])
    offline_count = sum(1 for s in sensors if s.operational_status in ["critical", "offline"])
    connectivity_rate = round(((online_count + warning_count) / max(total_sensors, 1)) * 100, 1)

    assert connectivity_rate >= 80.0
    assert total_sensors == 17
