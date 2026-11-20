# JAL-RAKSHAK System Architecture

## Overview
JAL-RAKSHAK is an intelligent, AI-augmented water distribution grid management and digital twin system.

## Modular Component Map
- `frontend`: React 18 + Vite + Tailwind CSS dashboard for telemetry, digital twin visualization, and alerts.
- `backend`: FastAPI async REST API and WebSockets manager for high-throughput streaming.
- `ai-engine`: Machine learning pipelines for anomaly detection, demand forecasting, and sensor fusion.
- `iot-simulator`: Virtual sensor generators streaming telemetry over MQTT / WebSockets.
- `digital-twin`: Hydraulic simulation engine executing what-if stress scenarios.
- `docs`: Architecture, API specification, and deployment documentation.
