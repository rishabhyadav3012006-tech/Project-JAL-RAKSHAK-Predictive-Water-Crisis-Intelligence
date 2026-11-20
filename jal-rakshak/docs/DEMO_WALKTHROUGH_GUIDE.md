# JAL-RAKSHAK (जल रक्षक) — Official 8-Stage Hackathon Demonstration Guide

> **Step-by-step presentation script and live demonstration playbook for hackathon judges and evaluators.**
> *Execution Time: ~3 to 5 minutes.*

---

## Preparation Checklist Before Starting Demo

1. Ensure the platform is running:
   - Backend API: `http://localhost:8000/api/v1/health` (Returns `"status": "healthy"`)
   - Web Command Centre: `http://localhost:5173` (or `http://localhost`)
2. In the top bar, locate the **`Judge Tour (8 Stages)`** button.
3. Keep the browser window maximized at 1080p or 1440p resolution.

---

## 8-Stage Live Demonstration Playbook

```
+----------------------------------------------------------------------------------------------------+
|                                    8-STAGE DEMONSTRATION WORKFLOW                                  |
|                                                                                                    |
|  [Stage 1: Normal Grid]   -->   [Stage 2: Inject Anomaly]   -->   [Stage 3: AI Detection]          |
|         |                                                                    |                     |
|         v                                                                    v                     |
|  [Stage 4: Sensor Fusion] -->   [Stage 5: Demand Forecast]  -->   [Stage 6: Low Reservoir]         |
|         |                                                                    |                     |
|         v                                                                    v                     |
|  [Stage 7: Digital Twin Rationing]                      -->   [Stage 8: Shortage Triage Countdown] |
+----------------------------------------------------------------------------------------------------+
```

---

### STAGE 1: Normal Operation of the Water Distribution Network
- **Goal**: Demonstrate standard supervisory grid baseline under nominal equilibrium.
- **Presenter Action**:
  - Open the **`Overview`** workspace.
  - Point to the live **89% Network Health Score** dial.
  - Click **`Judge Tour (8 Stages)`** $\rightarrow$ Step 1: *"Verify Baseline Equilibrium"*.
- **What to Tell the Judges**:
  > *"Judges, welcome to JAL-RAKSHAK. Right now, our metropolitan water grid is operating in perfect hydraulic equilibrium. Our bulk raw intake draws 842 MLD from Sharda Sagar Reservoir. All 17 virtual IoT sensors across North, East, South, and West zones report nominal pressures (4.5 to 5.8 bar). There are zero pipe ruptures, and the system delivers 100% municipal demand satisfaction."*
- **Observed Metrics**:
  - Bulk Intake: `842.0 MLD`
  - Sector 9 Pressure: `4.85 Bar`
  - Active Leaks: `0 Confirmed`
  - Grid Health: `89.0% (GOOD / HEALTHY)`

---

### STAGE 2: Introduce an Unusual Sensor Pattern
- **Goal**: Demonstrate injection of an underground pipe rupture anomaly.
- **Presenter Action**:
  - Advance Tour to **Stage 2** $\rightarrow$ Click *"Inject Sector 9 Rupture Anomaly"*.
- **What to Tell the Judges**:
  > *"Now watch what happens when an underground 400mm pipe rupture occurs in Sector 9. Within seconds, flow meter FS-102 records an alarming +35% surge up to 238.5 m³/h. Concurrently, downstream pressure transducer PS-202 collapses from 4.85 bar down to 3.42 bar. However, customer billing meters remain completely flat at 522 kL/h. This is the classic signature of an unmetered physical rupture."*
- **Observed Metrics**:
  - Feeder Flow FS-102: `238.5 m³/h (+35%)`
  - Pressure Node PS-202: `3.42 Bar (-1.43 Bar drop)`
  - Smart Meter WCM-403: `522.0 kL/h (Flat)`
  - Telemetry Discrepancy: `High Volume Loss`

---

### STAGE 3: AI Anomaly Detection
- **Goal**: Show unsupervised multi-variate anomaly inference.
- **Presenter Action**:
  - Advance Tour to **Stage 3** $\rightarrow$ Click *"Run AI Anomaly Inference"*.
  - (Optional) Navigate to **`Anomaly AI`** sidebar tab.
- **What to Tell the Judges**:
  > *"Our dual-engine AI immediately processes this 10-dimensional telemetry vector. The Isolation Forest algorithm evaluates the sudden divergence between flow surge and pressure collapse. In just 14 milliseconds, the anomaly score spikes to 0.892, categorizing the event as CRITICAL. Notice how the system didn't wait for a human complaint or street flooding—the AI isolated the anomalous pattern autonomously at the edge."*
- **Observed Metrics**:
  - Isolation Forest Score: `0.892 / 1.0`
  - Triage Severity: `CRITICAL`
  - Detection Latency: `14.2 ms`

---

### STAGE 4: Leakage Suspicion Alert & Sensor Corroboration
- **Goal**: Demonstrate cross-sensor Bayesian false alarm suppression.
- **Presenter Action**:
  - Advance Tour to **Stage 4** $\rightarrow$ Click *"Corroborate Multi-Sensor Fusion"*.
  - Navigate to **`Sensor Fusion`** tab in sidebar.
- **What to Tell the Judges**:
  > *"Here is JAL-RAKSHAK's core breakthrough: eliminating SCADA false alarms. During morning peak hours, flow surges naturally because citizens are taking showers and cooking. A traditional SCADA siren triggers a false alarm. But look at our Cross-Sensor Fusion matrix: when morning demand surges, smart meters confirm authorized customer draw, and the alert is SUPPRESSED. However, in this Sector 9 case, because smart meters are flat and pressure collapsed, our engine corroborates an underground pipe rupture on conduit e-p2-pn102 with 94.1% physical confidence!"*
- **Observed Metrics**:
  - Target Conduit: `e-p2-pn102` (Sector 9 Feeder)
  - Corroborated Confidence: `94.1%`
  - False Alarm Suppressed: `Refuted (Confirmed Loss: 35 MLD)`

---

### STAGE 5: Predictive Demand Changes Over Time
- **Goal**: Demonstrate XGBoost diurnal consumption forecasting.
- **Presenter Action**:
  - Advance Tour to **Stage 5** $\rightarrow$ Click *"Inspect 24h & 7d Horizons"*.
  - View **`Demand Forecast`** workspace.
- **What to Tell the Judges**:
  > *"Municipal water management is fundamentally about predicting future consumption. Here in our Demand Forecasting workspace, an autoregressive XGBoost regressor with an R² of 0.9726 forecasts water demand 24 hours and 7 days ahead. Notice the morning peak at 08:30 AM (920 MLD) and evening peak at 07:30 PM. The shaded band represents our 95% confidence intervals, allowing plant engineers to pre-charge elevated balancing tanks before peak hours arrive."*
- **Observed Metrics**:
  - Peak Predicted Draw: `920.0 MLD at 08:30 AM`
  - Model Fit ($R^2$): `0.9726`
  - 95% Confidence Bounds: `± 28.5 MLD`
  - Lookahead Leakage: `0.00 (Zero Lookahead Bias)`

---

### STAGE 6: Introduce Low-Reservoir Scenario
- **Goal**: Demonstrate catchment depletion stress.
- **Presenter Action**:
  - Advance Tour to **Stage 6** $\rightarrow$ Click *"Simulate Catchment Drought Stress"*.
- **What to Tell the Judges**:
  > *"Now let's stress-test the city under drought conditions. We simulate a severe catchment shortfall: Sharda Sagar bulk reservoir volume plummets to 1,200 ML, and incoming canal supply is throttled down to 410 MLD. Our gross target municipal demand is 707 MLD. This triggers an immediate, acute supply-demand deficit of -297.7 MLD."*
- **Observed Metrics**:
  - Reservoir Volume: `1,200.0 ML (26.6% Capacity)`
  - Available Supply: `410.0 MLD`
  - Municipal Deficit: `-297.7 MLD`

---

### STAGE 7: Digital Twin Simulation & Zone Distribution
- **Goal**: Show computational mass-conservation and municipal priority rationing.
- **Presenter Action**:
  - Advance Tour to **Stage 7** $\rightarrow$ Click *"Execute Digital Twin Rationing"*.
  - View **`Digital Twin`** canvas.
- **What to Tell the Judges**:
  > *"Our Digital Twin is not merely an animated diagram—it is a functional hydraulic and mass-conservation simulation engine. Watch how the React Flow canvas updates in real time. Under our municipal priority rationing policy, North Residential drinking water is 100% protected. To absorb the 297 MLD deficit, the system automatically throttles East Commercial by 27% and curtails South Industrial and Peri-Urban Agricultural canals. Conduits turn amber and crimson, showing exact flow and head drops across the network."*
- **Observed Metrics**:
  - Residential Zone: `100.0% Allocation (Protected Priority)`
  - Commercial Zone: `72.5% Allocation (Moderate Rationing)`
  - Industrial Zone: `35.0% Allocation (Severe Curtailment)`
  - Agricultural Canal: `0.0% (Standby Isolation)`

---

### STAGE 8: Identify At-Risk Zones & Shortage Countdown
- **Goal**: Demonstrate explainable shortage risk scoring and reserve depletion timeline.
- **Presenter Action**:
  - Advance Tour to **Stage 8** $\rightarrow$ Click *"Display Executive Shortage Triage"*.
  - View **`Shortage Risk`** table.
- **What to Tell the Judges**:
  > *"Finally, the platform answers the most critical question for city administrators: 'When will water taps run dry?' Our transparent 3-term shortage model calculates that Sector 9 has exactly 14.5 hours of balancing storage remaining before dry taps occur. Rather than leaving operators stranded, the system delivers automated operational mitigation advisories: 'Throttle PRV-09 by 1.2 bar, interconnect the East balancing line, and dispatch municipal water tankers.' Everything can be exported with one click into official IWA compliance reports."*
- **Observed Metrics**:
  - Critical Zone: `Sector 9 Industrial`
  - Storage Reserve Duration: `14.5 Hours Remaining`
  - Shortage Risk Index: `0.842 / 1.0 (Critical)`
  - Automated Action: `Throttle PRV-09 & Activate Tanker Dispatch`

---

## Conclusion & Demo Wrap-Up
1. Click **`Reset Tour`** to return the grid to baseline.
2. Direct the judges' attention to:
   - **One-Click Export**: Click `Export Package` in top bar to demonstrate CSV/JSON audit generation.
   - **Bilingual Support**: Click `हिन्दी / English` pill to show full localization for Indian state water boards.
   - **Open Source Standards**: 83/83 automated tests passing, 100% Python/FastAPI/React architecture.
