import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { MetricCard } from '../index';
import { Droplets, Waves, AlertTriangle, Gauge, Database, ShieldAlert, ShieldCheck } from 'lucide-react';

/**
 * KPIGrid
 * Displays the 6 core water intelligence KPIs dynamically connected to common telemetry data.
 */
export default function KPIGrid() {
  const { kpis, isSimulationMode } = useTelemetry();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Total Water Supply */}
      <MetricCard
        title="Total Water Supply"
        value={kpis.totalSupplyMLD}
        unit="MLD"
        trend="+3.8%"
        trendType="up"
        trendLabel="intake volume"
        icon={Droplets}
        status="normal"
        subtitle="Across 4 main treatment plants"
      />

      {/* 2. Current Water Consumption */}
      <MetricCard
        title="Current Consumption"
        value={kpis.currentConsumptionMLD}
        unit="MLD"
        trend="+2.1%"
        trendType="up"
        trendLabel="peak morning draw"
        icon={Waves}
        status="info"
        subtitle="Municipal metered demand"
      />

      {/* 3. Water Loss Percentage */}
      <MetricCard
        title="Water Loss (NRW)"
        value={kpis.waterLossPercent}
        unit="%"
        trend={+kpis.waterLossPercent > 15 ? '+2.4% above avg' : 'Within NRW target'}
        trendType={+kpis.waterLossPercent > 15 ? 'down' : 'neutral'}
        trendLabel="unaccounted loss"
        icon={AlertTriangle}
        status={+kpis.waterLossPercent > 15 ? 'warning' : 'normal'}
        subtitle="Unmetered & pipe friction"
      />

      {/* 4. Active Leak Suspicions */}
      <MetricCard
        title="Active Leak Suspicions"
        value={kpis.activeLeaks}
        unit="flagged"
        trend={kpis.activeLeaks > 0 ? `${kpis.activeLeaks} Critical alerts` : 'Zero acoustic alarms'}
        trendType={kpis.activeLeaks > 0 ? 'down' : 'up'}
        trendLabel="acoustic AI"
        icon={Gauge}
        status={kpis.activeLeaks > 0 ? 'critical' : 'normal'}
        subtitle="AI acoustic gradient scan"
      />

      {/* 5. Available Reservoir Capacity */}
      <MetricCard
        title="Reservoir Storage"
        value={kpis.reservoirCapacityPercent}
        unit="%"
        trend={`${kpis.totalCurrentStorageML} ML`}
        trendType="up"
        trendLabel="available buffer"
        icon={Database}
        status={+kpis.reservoirCapacityPercent < 60 ? 'warning' : 'normal'}
        subtitle={`Max cap: ${kpis.totalStorageCapacityML} ML`}
      />

      {/* 6. Predicted Shortage Risk */}
      <MetricCard
        title="Shortage Risk Horizon"
        value={kpis.shortageRiskLabel}
        unit=""
        trend={`${kpis.daysOfWaterSecurity} Days`}
        trendType={kpis.shortageRiskStatus === 'normal' ? 'up' : 'down'}
        trendLabel="security buffer"
        icon={kpis.shortageRiskStatus === 'normal' ? ShieldCheck : ShieldAlert}
        status={kpis.shortageRiskStatus}
        subtitle="LSTM 14-day forecast model"
      />
    </div>
  );
}
