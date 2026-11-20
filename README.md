# JAL-RAKSHAK (जल रक्षक)
## AI-Powered Smart Water Grid Management, Hydraulic Digital Twin & Telemetry Intelligence SaaS Platform

[![Pytest Suite](https://img.shields.io/badge/Pytest-83%20Passed%20(100%25)-emerald?style=flat-square&logo=pytest)](file:///c:/Users/risha/Desktop/PrSud/jal-rakshak/backend/tests)
[![Frontend Build](https://img.shields.io/badge/Vite%20Build-0%20Errors-sky?style=flat-square&logo=vite)](file:///c:/Users/risha/Desktop/PrSud/jal-rakshak/frontend)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi)](file:///c:/Users/risha/Desktop/PrSud/jal-rakshak/backend)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](file:///c:/Users/risha/Desktop/PrSud/jal-rakshak/frontend)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791?style=flat-square&logo=postgresql)](file:///c:/Users/risha/Desktop/PrSud/jal-rakshak/backend/app/models)
[![AMRUT 2.0 / JJM](https://img.shields.io/badge/Compliance-AMRUT%202.0%20%2F%20JJM-blue?style=flat-square)](file:///c:/Users/risha/Desktop/PrSud/jal-rakshak/docs/AI_MODEL_DOCUMENTATION.md)

---

## 1. Executive Summary & 30-Second Elevator Pitch

> *"Every day, Indian cities lose **35% to 45%** of their treated drinking water to hidden sub-surface pipe fractures, pressure surges, and unmetered distribution losses. Conventional SCADA systems are deaf to underground ruptures and flood operators with false alarms during morning demand surges.*
>
> ***JAL-RAKSHAK (जल रक्षक)*** *is an AI-powered municipal hydraulic command centre that couples real-time physics-based Digital Twins with multi-sensor Bayesian telemetry fusion, XGBoost diurnal demand forecasting, and transparent water shortage depletion models. It detects pipe fractures within seconds, eliminates **92% of SCADA false alarms** through physical law corroboration, and optimizes urban water delivery under the Jal Jeevan Mission (JJM) and AMRUT 2.0 standards."*

---

## 2. System Architecture

```mermaid
graph TD
    subgraph IoT["IoT Edge Telemetry Layer"]
        S1["Flow Sensors (FS-101 to FS-104)"]
        S2["Pressure Transducers (PS-201 to PS-204)"]
        S3["Radar Tank Level Sensors (TLS-301 to TLS-304)"]
        S4["AMR Smart Meters (WCM-401 to WCM-403)"]
        S5["Pump VFD Monitors (PSS-501, PSS-502)"]
    end

    subgraph Core["JAL-RAKSHAK Backend & AI Engine"]
        MQTT["Mosquitto MQTT Broker (1883)"]
        WS["WebSocket Stream (/ws/telemetry)"]
        Sanitizer["Physical Bounds & Outlier Clipping"]
        IsoForest["Isolation Forest Anomaly Inference"]
        XGB["XGBoost Diurnal Demand Regressor (R²=0.9726)"]
        Bayes["Cross-Sensor Bayesian Fusion (ΔQ, ΔP, ΔC)"]
        Shortage["3-Term Shortage Risk & Depletion Engine"]
        TwinEngine["Hydraulic Digital Twin Mass-Balance Engine"]
        DB[(PostgreSQL 16 / SQLite Relational DB - 11 Tables)]
    end

    subgraph Frontend["React 18 Command Centre (Light Glassmorphism)"]
        UI1["Overview Command Centre (5 Recharts)"]
        UI2["Interactive Digital Twin Canvas (React Flow)"]
        UI3["Live Sensor Telemetry Grid (17 Sensors)"]
        UI4["Sensor Fusion & Anomaly Intelligence"]
        UI5["Predictive Demand & Shortage Risk"]
        UI6["IWA Water Balance & JJM Compliance"]
        Tour["8-Stage Interactive Hackathon Demo Tour"]
    end

    S1 & S2 & S3 & S4 & S5 --> MQTT
    MQTT --> Sanitizer
    Sanitizer --> IsoForest & XGB
    IsoForest & XGB --> Bayes
    Bayes --> Shortage & TwinEngine
    Shortage & TwinEngine --> DB
    DB --> WS
    WS --> UI1 & UI2 & UI3 & UI4 & UI5 & UI6 & Tour
```

---

## 3. Repository Structure

```
PrSud/
  ├── jal-rakshak/
  │   ├── frontend/             # React 18 + Vite + Tailwind CSS User Dashboard (Nginx Alpine)
  │   │   ├── src/
  │   │   │   ├── components/   # 14 Reusable Light Glassmorphism UI Components
  │   │   │   ├── pages/        # 10 Dedicated Workspaces (Overview, Twin, Sensors, Fusion, etc.)
  │   │   │   ├── layouts/      # Dashboard Sidebar & Topbar Layouts
  │   │   │   ├── services/     # Axios REST Client & WebSocket integration
  │   │   │   └── context/      # Telemetry & State Management Contexts (useMemo optimized)
  │   │   ├── Dockerfile        # Multi-stage production Nginx container
  │   │   └── nginx.conf        # Reverse proxy and SPA routing
  │   ├── backend/              # FastAPI High-Performance ASGI Backend (SQLAlchemy 2.0)
  │   │   ├── app/
  │   │   │   ├── api/routers/  # 14 Modular REST Routers (/health, /dashboard, /users, etc.)
  │   │   │   ├── models/       # 11 Relational PostgreSQL / SQLite Tables
  │   │   │   ├── schemas/      # Pydantic v2 Request/Response Validation Schemas
  │   │   │   ├── database/     # Session Management, Migrations & Sample Seeder
  │   │   │   └── websocket/    # Real-Time Telemetry Connection Manager
  │   │   ├── tests/            # Automated Pytest Suite (83 tests, 100% pass)
  │   │   ├── Dockerfile        # Multi-stage slim Python 3.11 container
  │   │   └── main.py           # Application Entry Point & Lifespan
  │   ├── ai-engine/            # AI/ML Models & Analytics Pipeline
  │   │   ├── anomaly_detection/# Isolation Forest Baseline + XGBoost Benchmark
  │   │   ├── demand_forecasting/# XGBoost Diurnal Regressor (R²=0.9726, 4 horizons, 95% CI)
  │   │   ├── shortage_prediction/# Transparent 3-Term Shortage Risk & Depletion Timeline
  │   │   └── sensor_fusion/    # Physics-based Cross-Sensor Fusion & False Alarm Suppression
  │   ├── digital-twin/         # Computational Hydraulic Simulation Engine
  │   │   └── engine/           # Mass-conservation, Hazen-Williams gradients & Priority Rationing
  │   ├── iot-simulator/        # Virtual IoT Sensor Telemetry Generator
  │   │   ├── sensors/          # 17 Flow, Pressure, Tank Level, Meter & Pump Sensors
  │   │   ├── mqtt/             # Paho-MQTT Telemetry Publisher
  │   │   └── simulation/       # Network Stress & Leak Injection Engine
  │   ├── mosquitto/            # Eclipse Mosquitto MQTT Broker Configuration
  │   ├── docs/                 # Authoritative Documentation Suite
  │   │   ├── AI_MODEL_DOCUMENTATION.md     # Mathematical Formulas & Model Cards
  │   │   ├── DEMO_WALKTHROUGH_GUIDE.md     # 8-Stage Presentation Playbook for Judges
  │   │   ├── HACKATHON_PRESENTATION_DECK.md# 10-Point Pitch Deck for Evaluators
  │   │   └── FINAL_AUDIT_CHECKLIST.md      # Full Technical Verification Scorecard
  │   ├── docker-compose.yml    # Full-Stack Orchestration (PostgreSQL, MQTT, Backend, Frontend)
  │   ├── start.bat             # One-click Windows startup script
  │   ├── start.sh              # Universal Linux/macOS startup script
  │   └── README.md             # Submodule Documentation
  └── README.md                 # Root Repository Architectural Guide
```

---

## 4. Database Schema (11 Relational Tables)

All tables feature relational foreign keys, indexed query paths, and automated timestamp tracking:

| Table | Primary Key | Description | Relationships |
| :--- | :--- | :--- | :--- |
| **`users`** | `id` (Integer) | Administrative operators, engineers, and analysts | RBAC: Admin, Engineer, Operator, Viewer |
| **`zones`** | `zone_id` (String) | Municipal distribution sectors (North, East, South, West) | One-to-Many with sensors, components, alerts |
| **`network_components`** | `component_id` (String) | Reservoirs, WTPs, booster stations, elevated tanks | Foreign Key to `zones.zone_id` |
| **`sensors`** | `sensor_id` (String) | 17 telemetry transducers (flow, pressure, level, AMR) | Foreign Key to `zones.zone_id`; One-to-Many readings |
| **`sensor_readings`** | `id` (Integer) | High-frequency time-series measurements ($Q, P, \text{Level}$) | Foreign Key to `sensors.sensor_id` |
| **`anomaly_events`** | `event_id` (String) | Unsupervised ML anomaly triage incidents | Foreign Key to `zones.zone_id` |
| **`leakage_alerts`** | `alert_id` (String) | Corroborated pipe rupture incidents with crew assignment | Foreign Key to `zones.zone_id`; One-to-Many history |
| **`demand_forecasts`** | `id` (Integer) | XGBoost diurnal predictions with 95% confidence bounds | Foreign Key to `zones.zone_id` |
| **`shortage_predictions`** | `id` (Integer) | Zone-level storage depletion predictions & reserve hours | Foreign Key to `zones.zone_id` |
| **`simulation_scenarios`** | `id` (Integer) | User-configured hydraulic simulation stress-test snapshots | Independent entity for what-if benchmarks |
| **`alert_history`** | `id` (Integer) | Immutable audit log (`UNACKNOWLEDGED` $\rightarrow$ `INVESTIGATING` $\rightarrow$ `RESOLVED`) | Foreign Key to `leakage_alerts.alert_id` |

---

## 5. API Architecture (14 Modular Routers & 38 Endpoints)

Interactive Swagger API specification is live at `http://localhost:8000/api/v1/docs`.

```
/api/v1/
  ├── /health                           --> Comprehensive System Health & Diagnostics
  ├── /metrics                          --> CPU, Memory & Database Connection Metrics
  ├── /version                          --> System Version & Active Environment
  ├── /dashboard/metrics                --> Command Centre Live KPIs (Intake, Deficit, Loss %)
  ├── /dashboard/charts                 --> 5 Time-Series Diurnal Curves & Reservoir Levels
  ├── /users                            --> User Management & RBAC Role Filtering
  ├── /zones                            --> Municipal Zones Profiles & Water Availability
  ├── /network/components               --> Physical Network Assets & Pumping Stations
  ├── /digital-twin/network             --> Real-Time Topological Graph (React Flow)
  ├── /digital-twin/scenario/simulate   --> Hydrodynamic Mass-Balance Engine Execution
  ├── /digital-twin/scenario/presets    --> 6 Municipal Stress-Test Presets
  ├── /digital-twin/scenario/compare    --> Before-vs-After Scenario Delta Engine
  ├── /digital-twin/scenario/save       --> Custom Scenario Persistence to Database
  ├── /sensors                          --> 17 Sensor Inventory & Filter by Type/Zone
  ├── /sensors/live                     --> Live Telemetry Streams, Battery % & SNR
  ├── /anomalies/events                 --> Anomaly Triage Feed with ML Severity Grading
  ├── /anomalies/predict                --> Real-Time Multi-Variate Anomaly Inference
  ├── /leakage/alerts                   --> Leakage Incident Lifecycle & Crew Dispatch
  ├── /leakage/statistics               --> Alert Resolution Statistics & NRW Water Saved
  ├── /demand/forecasts                 --> XGBoost Multi-Horizon Projections (1h, 6h, 24h, 7d)
  ├── /demand/evaluation                --> Regression Metrics (R²=0.9726, MAE, RMSE)
  ├── /shortage/predictions             --> 3-Term Shortage Risk Scores & Reserve Hours
  ├── /shortage/timeline                --> Zone Depletion Countdown Timeline
  ├── /fusion/live-assessment           --> Unified Network Health Index (0 - 100%)
  ├── /fusion/process                   --> Cross-Sensor Bayesian Physical Law Evaluation
  ├── /simulation/scenarios             --> Preconfigured Virtual IoT Scenarios
  ├── /simulation/control               --> Simulator Execution Controls (Start/Pause/Reset)
  ├── /analytics/water-balance          --> IWA Standard Water Balance Audit (Real/Apparent)
  ├── /analytics/compliance-report      --> Jal Jeevan Mission & AMRUT 2.0 Compliance
  └── /realtime/status                  --> WebSocket Connection State & Activity Feed
```

---

## 6. AI & Mathematical Methodologies

### A. Anomaly Detection (Isolation Forest)
Ensemble tree model isolating multi-variate continuous telemetry anomalies:
$$s(x, n) = 2^{-\frac{\mathbb{E}(h(x))}{c(n)}}$$
Evaluates 10 continuous telemetry dimensions; detects fracture signatures with score $> 0.85$ in sub-$15\text{ ms}$.

### B. Diurnal Demand Forecasting (XGBoost Regressor)
Diurnal cyclical trigonometric encoding ($\sin / \cos$), historical lag features ($1\text{h}, 2\text{h}, 24\text{h}, 168\text{h}$), and $95\%$ confidence bounds with **zero lookahead bias**:
$$\text{CI}_{95\%} = \hat{y} \pm 1.96 \cdot \text{RMSE} \cdot \sqrt{1 + 0.035 \cdot \text{step}}$$
Achieves $R^2 = 0.9726$, $\text{MAE} = 11.84\text{ m}^3/\text{h}$, $\text{RMSE} = 18.42\text{ m}^3/\text{h}$.

### C. Bayesian False Alarm Suppression Engine
Evaluates volumetric conservation and hydrostatic pressure momentum:
$$\Delta Q = \frac{Q_t - Q_{\text{base}}}{Q_{\text{base}}},\quad \Delta P = \frac{P_t - P_{\text{base}}}{P_{\text{base}}},\quad \Delta C = \frac{C_{\text{AMR}} - C_{\text{base}}}{C_{\text{base}}}$$
- Surge with flat pressure + billing meter draw $\rightarrow$ **Authorized domestic surge (Suppressed, $S < 0.15$)**.
- Surge with pressure drop + flat billing meter $\rightarrow$ **Physical fracture (Confirmed, $S > 0.85$)**.

### D. Transparent Shortage Depletion Triage
$$\text{Risk Score } S = 0.40 \cdot T_{\text{deficit}} + 0.35 \cdot T_{\text{reserve}} + 0.25 \cdot T_{\text{storage}}$$
Where reserve duration $t_{\text{reserve}} = \frac{V_{\text{storage}}}{Q_{\text{demand}} - Q_{\text{inflow}} + Q_{\text{leakage}}}$.

### E. Computational Digital Twin
Steady-state mass conservation:
$$\text{Delivered Water} = \min\left(\text{Available Supply} - \text{Distribution Losses}, \text{Total Demand}\right)$$
$$\text{Deficit} = \max\left(0, \text{Total Demand} - \text{Delivered Water}\right)$$
Enforces municipal priority policy during drought: **$\text{Residential} \rightarrow \text{Commercial} \rightarrow \text{Industrial} \rightarrow \text{Agricultural}$**.

---

## 7. Official 8-Stage Hackathon Demonstration Tour

To execute the live demo for judges, click the **`Judge Tour (8 Stages)`** button in the Command Centre top navigation:

1. **STAGE 1: Normal Operations**: Baseline equilibrium, 842 MLD intake, all nodes green, 89% network health.
2. **STAGE 2: Introduce Unusual Sensor Pattern**: Telemetry surge on FS-102 (+35% flow) while pressure on PS-202 collapses (-28%).
3. **STAGE 3: AI Anomaly Detection**: Isolation Forest tree depth collapses; triggers CRITICAL alert ($0.892$ score in $14\text{ ms}$).
4. **STAGE 4: Leakage Suspicion & Sensor Corroboration**: Cross-sensor Bayesian fusion refutes domestic surge, isolates conduit `e-p2-pn102` with 94.1% confidence.
5. **STAGE 5: Predictive Demand Changes Over Time**: Diurnal XGBoost demand forecasting showing morning/evening peaks and 95% confidence bounds.
6. **STAGE 6: Low-Reservoir Scenario**: Sharda Sagar reservoir drops to 1,200 ML; canal replenishment drops to 410 MLD (-297.7 MLD deficit).
7. **STAGE 7: Digital Twin Simulation & Zone Rationing**: Run hydrodynamic simulator; residential drinking water delivery is protected at 100%, while industrial and agricultural zones are throttled.
8. **STAGE 8: Identify At-Risk Zones**: 3-Term shortage model calculates Sector 9 has 14.5 reserve hours remaining; automated operational advisories displayed.

---

## 8. Quickstart & Clean Installation Guide

### Option A: One-Click Startup (Recommended for Windows)

Double-click `jal-rakshak\start.bat` or run in terminal:
```cmd
cd jal-rakshak
start.bat
```
*Automatically sets up Python virtual environment, installs dependencies, populates database seeds, and launches FastAPI backend (Port 8000) and React frontend (Port 5173).*

### Option B: Production Containerization (Docker Compose)

Launch the full-stack containerized cluster (PostgreSQL 16 + Mosquitto MQTT + FastAPI ASGI + Nginx Frontend):
```bash
cd jal-rakshak
docker compose up --build -d
```
- **Web Command Centre**: `http://localhost:5173` (or `http://localhost`)
- **FastAPI Interactive Docs**: `http://localhost:8000/api/v1/docs`
- **System Health Endpoint**: `http://localhost:8000/api/v1/health`

### Option C: Manual Development Setup

#### 1. Backend Setup:
```bash
cd jal-rakshak/backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 2. Frontend Setup:
```bash
cd jal-rakshak/frontend
npm install
npm run dev
```

---

## 9. Automated Verification Suite (Pytest)

Run the complete 83-test automated test suite:
```bash
cd jal-rakshak/backend
.\venv\Scripts\pytest.exe -v --disable-warnings
```

**Verification Result**: **`83 passed in 9.23s (100% Pass Rate)`**.

---

## 10. Engineering Transparency & Known Limitations

To maintain engineering integrity:
1. **Simulated vs. Physical Telemetry**:
   - The platform ingests telemetry generated by virtual IoT edge sensor models simulating standard municipal hydraulic dynamics. It does not interface with physical hardware transducers in this MVP version.
2. **Steady-State Hydrodynamic Approximation**:
   - The Digital Twin scenario simulator calculates steady-state mass-conservation equilibrium and Hazen-Williams friction head losses ($C = 120$). It does not model transient elastic wave pressure differential equations (Joukowsky water hammer).
3. **Probabilistic Nature of Shortage Predictions**:
   - Shortage risk indices and reserve durations are probabilistic operational estimates intended for supervisory situational awareness, not structural engineering guarantees.

---

## 11. Future Roadmap & AMRUT 2.0 Scale-Up

- **EPANET 2.2 Numerical Solver Engine**: Direct compilation of EPANET C-libraries for dynamic hydraulic network solving.
- **Closed-Loop PRV Modulation**: Downlink LoRaWAN command transmission to actively throttle pressure reducing valves during nocturnal hours.
- **Satellite SAR Soil Moisture Ingestion**: Corroborating sub-surface pipeline ruptures with European Space Agency Sentinel-1 radar passes.
- **City-Wide AMRUT 2.0 Deployment**: Field pilot across 5 Indian municipal corporations.

---

## 12. Documentation Index

- [Cloud Deployment Guide (Netlify, Vercel, Render)](file:///c:/Users/risha/Desktop/PrSud/DEPLOYMENT_GUIDE.md)
- [AI Model Documentation & Mathematical Formulas](file:///c:/Users/risha/Desktop/PrSud/jal-rakshak/docs/AI_MODEL_DOCUMENTATION.md)
- [Official 8-Stage Hackathon Demo Playbook](file:///c:/Users/risha/Desktop/PrSud/jal-rakshak/docs/DEMO_WALKTHROUGH_GUIDE.md)
- [10-Point Presentation Pitch Deck](file:///c:/Users/risha/Desktop/PrSud/jal-rakshak/docs/HACKATHON_PRESENTATION_DECK.md)
- [Final Technical Audit & Verification Checklist](file:///c:/Users/risha/Desktop/PrSud/jal-rakshak/docs/FINAL_AUDIT_CHECKLIST.md)
