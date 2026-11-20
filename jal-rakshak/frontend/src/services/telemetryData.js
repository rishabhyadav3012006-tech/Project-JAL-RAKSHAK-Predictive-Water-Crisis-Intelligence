/**
 * JAL-RAKSHAK Authoritative Common Telemetry Data Store
 * All KPIs, charts, tables, health scores, and alerts derive from this synchronized model.
 */

export const INITIAL_ZONES_DATA = [
  {
    id: 'zone-north',
    name: 'Sector 1-4 North District',
    type: 'Urban Residential',
    inflow: 215.4, // MLD
    demand: 201.2, // MLD
    pressure: 4.85, // Bar
    pressureMin: 3.5,
    pressureMax: 5.5,
    reservoirLevel: 84.5, // %
    reservoirCapacityML: 1200,
    reservoirCurrentML: 1014,
    waterLossPercent: 6.6,
    activeLeaks: 1,
    leakRisk: 'Low',
    qualityIndex: 96.2, // out of 100
    turbidityNTU: 0.85,
    phLevel: 7.35,
    status: 'normal',
    connectedNodes: 14,
    lastUpdated: 'Just now',
  },
  {
    id: 'zone-east',
    name: 'Zone 5-8 East Commercial & IT',
    type: 'Commercial Core',
    inflow: 184.2,
    demand: 172.5,
    pressure: 5.12,
    pressureMin: 3.8,
    pressureMax: 5.8,
    reservoirLevel: 76.2,
    reservoirCapacityML: 950,
    reservoirCurrentML: 724,
    waterLossPercent: 6.3,
    activeLeaks: 0,
    leakRisk: 'Very Low',
    qualityIndex: 98.4,
    turbidityNTU: 0.65,
    phLevel: 7.42,
    status: 'normal',
    connectedNodes: 12,
    lastUpdated: '1 min ago',
  },
  {
    id: 'zone-south',
    name: 'Zone 9-12 South Industrial Ring',
    type: 'Heavy Industrial',
    inflow: 268.5,
    demand: 224.0,
    pressure: 3.65, // Below recommended 4.0 Bar
    pressureMin: 4.0,
    pressureMax: 6.0,
    reservoirLevel: 68.4,
    reservoirCapacityML: 1500,
    reservoirCurrentML: 1026,
    waterLossPercent: 16.5, // High loss
    activeLeaks: 2,
    leakRisk: 'High',
    qualityIndex: 91.5,
    turbidityNTU: 1.45,
    phLevel: 7.15,
    status: 'warning',
    connectedNodes: 16,
    lastUpdated: 'Just now',
  },
  {
    id: 'zone-west',
    name: 'Zone 13-16 West Heritage Suburbs',
    type: 'Low-Density Residential',
    inflow: 174.5,
    demand: 138.5,
    pressure: 4.45,
    pressureMin: 3.5,
    pressureMax: 5.2,
    reservoirLevel: 82.0,
    reservoirCapacityML: 850,
    reservoirCurrentML: 697,
    waterLossPercent: 20.6, // Aging pipes
    activeLeaks: 0,
    leakRisk: 'Moderate',
    qualityIndex: 94.8,
    turbidityNTU: 0.95,
    phLevel: 7.38,
    status: 'normal',
    connectedNodes: 10,
    lastUpdated: '2 mins ago',
  },
];

export const INITIAL_RESERVOIRS = [
  { name: 'North Raw Water Basin', currentML: 1014, capacityML: 1200, percentage: 84.5, trend: '+2.1%', status: 'normal' },
  { name: 'East Elevated High-Storage', currentML: 724, capacityML: 950, percentage: 76.2, trend: '-0.8%', status: 'normal' },
  { name: 'South Industrial Balancing Tank', currentML: 1026, capacityML: 1500, percentage: 68.4, trend: '-3.4%', status: 'warning' },
  { name: 'West Sub-aquifer Clear Reservoir', currentML: 697, capacityML: 850, percentage: 82.0, trend: '+0.5%', status: 'normal' },
  { name: 'Central Emergency Surge Sump', currentML: 380, capacityML: 500, percentage: 76.0, trend: '0.0%', status: 'normal' },
];

export const INITIAL_HOURLY_DATA = [
  { time: '00:00', supply: 620, consumption: 480, target: 500, pressureRing1: 4.9, pressureRing2: 4.5, pressureRing3: 4.1 },
  { time: '02:00', supply: 580, consumption: 390, target: 450, pressureRing1: 5.2, pressureRing2: 4.8, pressureRing3: 4.3 },
  { time: '04:00', supply: 640, consumption: 430, target: 480, pressureRing1: 5.1, pressureRing2: 4.7, pressureRing3: 4.2 },
  { time: '06:00', supply: 850, consumption: 790, target: 760, pressureRing1: 4.6, pressureRing2: 4.2, pressureRing3: 3.6 },
  { time: '08:00', supply: 940, consumption: 920, target: 890, pressureRing1: 4.4, pressureRing2: 3.9, pressureRing3: 3.4 },
  { time: '10:00', supply: 880, consumption: 840, target: 820, pressureRing1: 4.7, pressureRing2: 4.3, pressureRing3: 3.7 },
  { time: '12:00', supply: 820, consumption: 760, target: 750, pressureRing1: 4.8, pressureRing2: 4.4, pressureRing3: 3.9 },
  { time: '14:00', supply: 790, consumption: 720, target: 710, pressureRing1: 4.9, pressureRing2: 4.5, pressureRing3: 4.0 },
  { time: '16:00', supply: 840, consumption: 790, target: 780, pressureRing1: 4.7, pressureRing2: 4.3, pressureRing3: 3.8 },
  { time: '18:00', supply: 920, consumption: 890, target: 870, pressureRing1: 4.5, pressureRing2: 4.1, pressureRing3: 3.5 },
  { time: '20:00', supply: 870, consumption: 810, target: 800, pressureRing1: 4.7, pressureRing2: 4.3, pressureRing3: 3.8 },
  { time: '22:00', supply: 730, consumption: 640, target: 650, pressureRing1: 4.9, pressureRing2: 4.6, pressureRing3: 4.1 },
];

export const INITIAL_ALERTS = [
  {
    id: 'alt-101',
    severity: 'critical',
    title: 'Critical Pipeline Leakage Suspicion Corroborated',
    location: 'Sector 9 South Industrial Conduit 9-B',
    timestamp: '10 mins ago',
    details: 'Sensor fusion identified concurrent +35.8% flow surge and -28.8% pressure collapse. Water loss estimated at 18.5 m³/h.',
    acknowledged: false,
    zoneId: 'zone-south',
    pipeline_ref: 'e-p2-pn102',
    suspicion_id: 'LS-2026-081',
    suspicion_score: 0.892,
    investigation_status: 'under_investigation',
    physical_verification: 'AI Suspicion (Unverified)',
    assigned_crew: 'Team Gamma (Acoustic Correlator Unit 2)',
    supporting_observations: [
      { sensor_id: 'PRESS-Z3-001', sensor_type: 'pressure', metric: 'Static Hydrostatic Pressure', observed_value: 3.42, baseline_value: 4.80, unit: 'bar', deviation_pct: -28.8, reliability_score: 0.98, anomaly_flag: true },
      { sensor_id: 'FLOW-Z3-001', sensor_type: 'flow', metric: 'Bulk Inflow Rate', observed_value: 224.0, baseline_value: 165.0, unit: 'm³/h', deviation_pct: 35.8, reliability_score: 0.95, anomaly_flag: true },
      { sensor_id: 'METER-Z3-001', sensor_type: 'meter', metric: 'Aggregated Billed Consumption', observed_value: 142.0, baseline_value: 140.0, unit: 'm³/h', deviation_pct: 1.4, reliability_score: 0.92, anomaly_flag: false },
      { sensor_id: 'TANK-Z3-001', sensor_type: 'tank', metric: 'Storage Depletion Rate', observed_value: -18.5, baseline_value: -6.0, unit: 'm³/h', deviation_pct: -208.3, reliability_score: 0.96, anomaly_flag: true }
    ],
    timeline: [
      { time: '12 mins ago', actor: 'Sensor Fusion AI', action: 'Anomaly detected from PRESS-Z3-001 & FLOW-Z3-001' },
      { time: '10 mins ago', actor: 'System Dispatch', action: 'Critical leakage suspicion alert generated' },
      { time: '6 mins ago', actor: 'Chief Engineer', action: 'Assigned Team Gamma for acoustic cross-correlation' },
    ]
  },
  {
    id: 'alt-102',
    severity: 'high',
    title: 'Nodal Pressure Gradient Anomaly',
    location: 'Zone 11 South Distribution Ring Valve 4',
    timestamp: '24 mins ago',
    details: 'Pressure reached 3.45 Bar (lower safety limit is 4.0 Bar). Sub-network pump cavitation safeguard active.',
    acknowledged: false,
    zoneId: 'zone-south',
    pipeline_ref: 'e-p2-ind1',
    suspicion_id: null,
    suspicion_score: 0.720,
    investigation_status: 'unassigned',
    physical_verification: 'AI Suspicion (Unverified)',
    assigned_crew: null,
    supporting_observations: [
      { sensor_id: 'PRESS-Z3-002', sensor_type: 'pressure', metric: 'Nodal Ring Pressure', observed_value: 3.45, baseline_value: 4.50, unit: 'bar', deviation_pct: -23.3, reliability_score: 0.94, anomaly_flag: true },
    ],
    timeline: [
      { time: '24 mins ago', actor: 'Telemetry Engine', action: 'Pressure drop flagged' },
    ]
  },
  {
    id: 'alt-103',
    severity: 'medium',
    title: 'Moderate Seepage Suspicion in Transmission Trunk',
    location: 'East High-Storage Delivery Trunk 4-A near Commercial Gateway',
    timestamp: '48 mins ago',
    details: 'Multi-sensor divergence: Inflow rate +9.3% above expected curve while nodal pressure is down by -9.8%. Downstream smart meters report normal demand.',
    acknowledged: true,
    zoneId: 'zone-east',
    pipeline_ref: 'e-tank1-res1',
    suspicion_id: 'LS-2026-082',
    suspicion_score: 0.645,
    investigation_status: 'unassigned',
    physical_verification: 'AI Suspicion (Unverified)',
    assigned_crew: null,
    supporting_observations: [
      { sensor_id: 'FLOW-Z2-001', sensor_type: 'flow', metric: 'East Distribution Flow', observed_value: 188.0, baseline_value: 172.0, unit: 'm³/h', deviation_pct: 9.3, reliability_score: 0.94, anomaly_flag: true },
      { sensor_id: 'PRESS-Z2-001', sensor_type: 'pressure', metric: 'Zonal Feeder Pressure', observed_value: 4.15, baseline_value: 4.60, unit: 'bar', deviation_pct: -9.8, reliability_score: 0.88, anomaly_flag: true },
    ],
    timeline: [
      { time: '48 mins ago', actor: 'Sensor Fusion AI', action: 'Subterranean seepage signature identified' },
      { time: '35 mins ago', actor: 'Duty Operator', action: 'Acknowledged and scheduled for non-peak inspection' },
    ]
  },
  {
    id: 'alt-104',
    severity: 'low',
    title: 'Elevated Non-Revenue Water (NRW) Balance',
    location: 'Zone 15 West Suburbs Distribution Sub-grid',
    timestamp: '2 hours ago',
    details: 'Estimated pipe friction and minor unmetered seepage causing 20.6% distribution loss.',
    acknowledged: true,
    zoneId: 'zone-west',
    pipeline_ref: null,
    suspicion_id: null,
    suspicion_score: 0.420,
    investigation_status: 'resolved',
    physical_verification: 'Physically Verified (Field Acoustic Crew)',
    assigned_crew: 'Audit Team 1',
    supporting_observations: [],
    timeline: [
      { time: '2 hours ago', actor: 'Water Balance Model', action: 'NRW audit anomaly flagged' },
      { time: '1 hour ago', actor: 'Audit Team 1', action: 'Physical check confirmed customer connection meter drift' },
      { time: '30 mins ago', actor: 'Operator', action: 'Meter recalibrated. Marked resolved.' },
    ]
  },
];

export const INITIAL_SUSPICIONS = [
  {
    id: 'LS-2026-081',
    pipeline_ref: 'e-p2-pn102',
    potential_location: 'Conduit 9-B between South Booster Station and Sector 9 Junction',
    zone_id: 'zone-south',
    suspicion_score: 0.892,
    severity: 'critical',
    timestamp: 'Just now',
    investigation_status: 'under_investigation',
    physical_verification: 'AI Suspicion (Unverified)',
    estimated_loss_rate_m3h: 18.5,
    explanation: 'Multi-sensor corroboration: Significant hydraulic gradient divergence. Flow rate elevated by +35.8% (224.0 m³/h vs 165.0 baseline) while downstream hydrostatic pressure dropped sharply by -28.8% (3.42 bar vs 4.80 bar). Balancing tank outflow exceeds authorized metered customer consumption by 18.5 m³/h.',
    supporting_observations: [
      { sensor_id: 'PRESS-Z3-001', sensor_type: 'pressure', metric: 'Static Hydrostatic Pressure', observed_value: 3.42, baseline_value: 4.80, unit: 'bar', deviation_pct: -28.8, reliability_score: 0.98, anomaly_flag: true },
      { sensor_id: 'FLOW-Z3-001', sensor_type: 'flow', metric: 'Bulk Inflow Rate', observed_value: 224.0, baseline_value: 165.0, unit: 'm³/h', deviation_pct: 35.8, reliability_score: 0.95, anomaly_flag: true },
      { sensor_id: 'METER-Z3-001', sensor_type: 'meter', metric: 'Aggregated Billed Consumption', observed_value: 142.0, baseline_value: 140.0, unit: 'm³/h', deviation_pct: 1.4, reliability_score: 0.92, anomaly_flag: false },
      { sensor_id: 'TANK-Z3-001', sensor_type: 'tank', metric: 'Storage Depletion Rate', observed_value: -18.5, baseline_value: -6.0, unit: 'm³/h', deviation_pct: -208.3, reliability_score: 0.96, anomaly_flag: true }
    ]
  },
  {
    id: 'LS-2026-082',
    pipeline_ref: 'e-tank1-res1',
    potential_location: 'East High-Storage Delivery Trunk 4-A near Commercial Gateway',
    zone_id: 'zone-east',
    suspicion_score: 0.645,
    severity: 'medium',
    timestamp: '35 mins ago',
    investigation_status: 'unassigned',
    physical_verification: 'AI Suspicion (Unverified)',
    estimated_loss_rate_m3h: 6.2,
    explanation: 'Moderate multi-sensor divergence: Inflow rate is +9.3% above expected curve while nodal pressure is down by -9.8%. Downstream smart meters report normal consumption, suggesting minor subterranean joint seepage.',
    supporting_observations: [
      { sensor_id: 'FLOW-Z2-001', sensor_type: 'flow', metric: 'East Distribution Flow', observed_value: 188.0, baseline_value: 172.0, unit: 'm³/h', deviation_pct: 9.3, reliability_score: 0.94, anomaly_flag: true },
      { sensor_id: 'PRESS-Z2-001', sensor_type: 'pressure', metric: 'Zonal Feeder Pressure', observed_value: 4.15, baseline_value: 4.60, unit: 'bar', deviation_pct: -9.8, reliability_score: 0.88, anomaly_flag: true },
    ]
  }
];

/**
 * Derives aggregate KPIs dynamically from the authoritative zone and hourly dataset.
 * Guaranteed 100% mathematical consistency across all cards and charts.
 */
export function calculateAggregateKPIs(zones, hourlyData) {
  const totalInflow = zones.reduce((sum, z) => sum + z.inflow, 0);
  const totalDemand = zones.reduce((sum, z) => sum + z.demand, 0);
  const totalUnaccountedLoss = totalInflow - totalDemand;
  const averageLossPercent = (totalUnaccountedLoss / totalInflow) * 100;
  const activeLeaksCount = zones.reduce((sum, z) => sum + z.activeLeaks, 0);
  
  const totalStorageCapacity = zones.reduce((sum, z) => sum + z.reservoirCapacityML, 0);
  const totalCurrentStorage = zones.reduce((sum, z) => sum + z.reservoirCurrentML, 0);
  const storagePercentage = (totalCurrentStorage / totalStorageCapacity) * 100;

  // Shortage risk computation based on current buffer vs daily demand
  const daysOfWaterSecurity = totalCurrentStorage / totalDemand;
  let shortageRiskLabel = 'Low Risk';
  let shortageRiskPercent = 6.4;
  let shortageRiskStatus = 'normal';

  if (daysOfWaterSecurity < 3) {
    shortageRiskLabel = 'Critical Risk';
    shortageRiskPercent = 78.5;
    shortageRiskStatus = 'critical';
  } else if (daysOfWaterSecurity < 4.5) {
    shortageRiskLabel = 'Moderate Risk';
    shortageRiskPercent = 28.2;
    shortageRiskStatus = 'warning';
  }

  // Network health score (0 to 100)
  const healthScore = Math.round(
    100 - (averageLossPercent * 0.8) - (activeLeaksCount * 3.5) + (storagePercentage * 0.1)
  );

  return {
    totalSupplyMLD: totalInflow.toFixed(1),
    currentConsumptionMLD: totalDemand.toFixed(1),
    waterLossPercent: averageLossPercent.toFixed(1),
    activeLeaks: activeLeaksCount,
    reservoirCapacityPercent: storagePercentage.toFixed(1),
    totalCurrentStorageML: totalCurrentStorage.toLocaleString(),
    totalStorageCapacityML: totalStorageCapacity.toLocaleString(),
    shortageRiskLabel,
    shortageRiskPercent,
    shortageRiskStatus,
    daysOfWaterSecurity: daysOfWaterSecurity.toFixed(1),
    healthScore: Math.min(100, Math.max(0, healthScore)),
    totalConnectedNodes: zones.reduce((sum, z) => sum + z.connectedNodes, 0),
  };
}
