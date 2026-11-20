# JAL-RAKSHAK API Specification

## Base URL
`/api/v1`

## Endpoints
### 1. Root
- **GET** `/` — Root welcome message and documentation links.

### 2. Health & Status
- **GET** `/api/v1/health` — Complete platform service health check.
- **GET** `/api/v1/status` — Lightweight uptime ping.

### 3. WebSockets
- **WS** `/ws/telemetry` — Live bidirectional sensor and digital twin streaming.

### 4. Interactive OpenAPI Docs
- **Swagger UI**: `http://localhost:8000/api/v1/docs`
- **ReDoc**: `http://localhost:8000/api/v1/redoc`
