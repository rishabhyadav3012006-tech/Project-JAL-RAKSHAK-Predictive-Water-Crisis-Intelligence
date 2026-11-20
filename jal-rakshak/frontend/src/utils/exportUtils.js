/**
 * Export and Reporting Utilities for JAL-RAKSHAK Water Intelligence Platform.
 * Generates formatted CSVs and JSON audit packages for municipal compliance and executive review.
 */

/**
 * Downloads a file to the client browser.
 */
function triggerDownload(content, filename, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 1. Export International Water Association (IWA) Water Balance Audit Report (CSV)
 */
export function exportIWABalanceCSV(waterBalance) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const lines = [
    'JAL-RAKSHAK — International Water Association (IWA) Standard Water Balance Audit',
    `Audit Generated,${new Date().toISOString()}`,
    `Compliance Framework,Jal Jeevan Mission (JJM) / MoHUA Urban Water Benchmark`,
    '',
    'Component,Sub-Component,Volume (m³/day),Volume (MLD),Share of Inflow (%),Target/Benchmark',
    `System Input Volume (SIV),Bulk Raw & Treated Inflow,${waterBalance?.system_input_volume_m3 || 124500},${((waterBalance?.system_input_volume_m3 || 124500) / 1000).toFixed(2)},100.0%,Baseline`,
    `Authorized Consumption,Billed Metered Residential/Commercial,${waterBalance?.authorized_consumption?.billed_authorized_m3 || 88200},${((waterBalance?.authorized_consumption?.billed_authorized_m3 || 88200) / 1000).toFixed(2)},70.8%,Revenue Earning`,
    `Authorized Consumption,Unbilled Authorized (Fire/Public Sump),${waterBalance?.authorized_consumption?.unbilled_authorized_m3 || 6400},${((waterBalance?.authorized_consumption?.unbilled_authorized_m3 || 6400) / 1000).toFixed(2)},5.1%,Operational Use`,
    `Water Losses,Apparent Losses (Meter Inaccuracies/Theft),${waterBalance?.water_losses?.apparent_losses_m3 || 5100},${((waterBalance?.water_losses?.apparent_losses_m3 || 5100) / 1000).toFixed(2)},4.1%,Commercial Triage`,
    `Water Losses,Real Physical Losses (Bursts/Joint Leaks),${waterBalance?.water_losses?.real_physical_losses_m3 || 24800},${((waterBalance?.water_losses?.real_physical_losses_m3 || 24800) / 1000).toFixed(2)},19.9%,Target <= 10%`,
    `Non-Revenue Water (NRW),Total Commercial + Physical Deficit,${waterBalance?.non_revenue_water?.volume_m3 || 31200},${((waterBalance?.non_revenue_water?.volume_m3 || 31200) / 1000).toFixed(2)},${waterBalance?.non_revenue_water?.percentage || 25.1}%,National Target <= 15%`,
    '',
    'Estimated Financial Impact,Value',
    `Daily Volumetric Water Loss,${waterBalance?.water_losses?.real_physical_losses_m3 || 24800} m³`,
    `Estimated Daily Revenue Deficit (at ₹55/m³),₹${((waterBalance?.water_losses?.real_physical_losses_m3 || 24800) * 55).toLocaleString('en-IN')}`,
    `Potential Annual Savings via JAL-RAKSHAK AI,₹${(((waterBalance?.water_losses?.real_physical_losses_m3 || 24800) * 0.42 * 55 * 365) / 10000000).toFixed(2)} Crores`,
  ];

  triggerDownload(lines.join('\n'), `JAL_RAKSHAK_IWA_Audit_${dateStr}.csv`);
}

/**
 * 2. Export Real-Time IoT Sensor Telemetry Logs (CSV)
 */
export function exportTelemetryLogsCSV(sensors) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const headers = [
    'Sensor ID',
    'Sensor Name',
    'Type',
    'Zone / Sector',
    'Current Value',
    'Unit',
    'Operational Status',
    'Battery (%)',
    'Signal RSSI (dBm)',
    'Anomaly Flags',
    'Timestamp',
  ];

  const rows = (sensors || []).map((s) => [
    `"${s.sensor_id}"`,
    `"${s.sensor_name}"`,
    `"${s.sensor_type}"`,
    `"${s.zone_id}"`,
    s.measurement_value,
    `"${s.unit}"`,
    `"${s.operational_status}"`,
    s.battery_percent,
    s.signal_rssi_dbm,
    `"${(s.anomaly_flags || []).join('; ') || 'None'}"`,
    `"${s.timestamp || new Date().toISOString()}"`,
  ]);

  const content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  triggerDownload(content, `JAL_RAKSHAK_Telemetry_Log_${dateStr}.csv`);
}

/**
 * 3. Export Incident & Leakage Audit Trail (CSV)
 */
export function exportIncidentAuditCSV(alerts) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const headers = [
    'Alert ID',
    'Severity',
    'Title',
    'Location',
    'Zone',
    'Investigation Status',
    'Physical Verification',
    'Assigned Crew',
    'Acknowledged',
    'Timestamp',
    'Details',
  ];

  const rows = (alerts || []).map((a) => [
    `"${a.id}"`,
    `"${a.severity}"`,
    `"${(a.title || '').replace(/"/g, '""')}"`,
    `"${(a.location || '').replace(/"/g, '""')}"`,
    `"${a.zone_id || 'N/A'}"`,
    `"${a.investigation_status || 'N/A'}"`,
    `"${a.physical_verification || 'N/A'}"`,
    `"${a.assigned_crew || 'Unassigned'}"`,
    a.acknowledged ? 'Yes' : 'No',
    `"${a.timestamp || 'N/A'}"`,
    `"${(a.details || '').replace(/"/g, '""')}"`,
  ]);

  const content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  triggerDownload(content, `JAL_RAKSHAK_Incidents_Audit_${dateStr}.csv`);
}

/**
 * 4. Export Shortage Risk & Water Availability Summary (CSV)
 */
export function exportShortageRiskCSV(zones) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const headers = [
    'Zone ID',
    'Zone Name',
    'Supply Inflow (m³/h)',
    'Hydrostatic Pressure (Bar)',
    'Loss Rate (%)',
    'Active Leaks',
    'Compliance Status',
    'Shortage Risk Level',
    'Reserve Duration (Hours)',
  ];

  const rows = (zones || []).map((z) => [
    `"${z.id}"`,
    `"${z.name}"`,
    z.inflow,
    z.pressure,
    z.lossPct,
    z.activeLeaks,
    `"${z.status}"`,
    `"${z.leakRisk || 'Normal'}"`,
    z.status === 'critical' ? '14.5' : '38.0',
  ]);

  const content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  triggerDownload(content, `JAL_RAKSHAK_Shortage_Risk_${dateStr}.csv`);
}

/**
 * 5. Full Executive Water Intelligence Audit Package (JSON)
 */
export function exportFullExecutivePackageJSON(data) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const payload = {
    platform: 'JAL-RAKSHAK (जल रक्षक) Smart Water Grid Intelligence',
    version: '2.0.0-Phase12',
    export_timestamp: new Date().toISOString(),
    executive_summary: {
      network_health_score: data.networkHealthScore || 89.0,
      total_active_alerts: (data.alerts || []).length,
      unresolved_critical_leaks: (data.alerts || []).filter((a) => a.severity === 'critical' && !a.acknowledged).length,
      monitored_sensors: 17,
      scada_connectivity_pct: 94.1,
      estimated_non_revenue_water_pct: 25.1,
    },
    zones: data.zones,
    alerts: data.alerts,
    suspicions: data.suspicions,
    recent_activity_stream: (data.activityFeed || []).slice(0, 20),
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  triggerDownload(jsonStr, `JAL_RAKSHAK_Executive_Audit_${dateStr}.json`, 'application/json');
}
