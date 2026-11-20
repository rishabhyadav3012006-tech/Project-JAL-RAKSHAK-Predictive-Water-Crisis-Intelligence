"""MQTT Publisher and Ingestion Service with automatic Local Fallback Mode."""
import json
import logging
from typing import Optional, Dict, Any

try:
    import paho.mqtt.client as mqtt
    PAHO_AVAILABLE = True
except ImportError:
    PAHO_AVAILABLE = False

logger = logging.getLogger("JalRakshakMQTT")

class MQTTManager:
    """Handles MQTT publishing & subscriptions with seamless in-memory fallback."""

    def __init__(self, broker_host: str = "localhost", broker_port: int = 1883):
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.client = None
        self.is_connected = False
        self.fallback_mode = True
        self.in_memory_bus: list[Dict[str, Any]] = []

    def connect(self) -> bool:
        """Attempts connection to MQTT broker; enables fallback mode on timeout/refusal."""
        if not PAHO_AVAILABLE:
            self.fallback_mode = True
            return False

        # Fast non-blocking socket probe to prevent thread lockup if broker is offline
        import socket
        try:
            with socket.create_connection((self.broker_host, self.broker_port), timeout=0.3):
                pass
        except (socket.timeout, ConnectionRefusedError, OSError) as e:
            self.is_connected = False
            self.fallback_mode = True
            logger.info("MQTT Broker not reachable (%s). Local Fallback Mode active.", e)
            return False

        try:
            self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="jal-rakshak-sim")
            self.client.connect(self.broker_host, self.broker_port, keepalive=10)
            self.client.loop_start()
            self.is_connected = True
            self.fallback_mode = False
            logger.info("Connected successfully to MQTT broker at %s:%d", self.broker_host, self.broker_port)
            return True
        except Exception as e:
            self.is_connected = False
            self.fallback_mode = True
            logger.info("MQTT Broker connection error (%s). Local Fallback Mode active.", e)
            return False

    def publish_reading(self, sensor_type: str, sensor_id: str, payload: Dict[str, Any]):
        """Publishes sensor packet to MQTT topic or routes to local fallback bus."""
        topic = f"jalrakshak/sensors/{sensor_type}/{sensor_id}"
        message_json = json.dumps(payload)

        if self.is_connected and self.client:
            try:
                self.client.publish(topic, message_json, qos=0)
                self.client.publish("jalrakshak/sensors/all", message_json, qos=0)
            except Exception:
                self.fallback_mode = True
        else:
            # Fallback local in-memory event bus
            if len(self.in_memory_bus) > 100:
                self.in_memory_bus.pop(0)
            self.in_memory_bus.append(payload)

    def disconnect(self):
        if self.client and self.is_connected:
            try:
                self.client.loop_stop()
                self.client.disconnect()
            except Exception:
                pass
        self.is_connected = False
        self.fallback_mode = True

mqtt_manager = MQTTManager()
