import React, { useState } from 'react';
import { TelemetryProvider } from './context/TelemetryContext';
import DashboardLayout from './layouts/DashboardLayout';
import CommandCentreDashboard from './pages/CommandCentreDashboard';
import DigitalTwinPage from './pages/DigitalTwinPage';
import LiveSensorsPage from './pages/LiveSensorsPage';
import AnomalyIntelligencePage from './pages/AnomalyIntelligencePage';
import AlertsManagementPage from './pages/AlertsManagementPage';
import DemandForecastingPage from './pages/DemandForecastingPage';
import WaterAvailabilityPage from './pages/WaterAvailabilityPage';
import SensorFusionPage from './pages/SensorFusionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import DesignSystemShowcase from './pages/DesignSystemShowcase';
import { GlassCard, StatusBadge, PrimaryButton } from './components';
import {
  Cpu,
  Radio,
  Gauge,
  TrendingUp,
  Droplets,
  Bell,
  BarChart3,
  Settings,
} from 'lucide-react';

export default function App() {
  const [activeNav, setActiveNav] = useState('overview');
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'showcase'

  // Dedicated view content based on sidebar selection
  const renderContent = () => {
    if (activeView === 'showcase') {
      return <DesignSystemShowcase />;
    }

    if (activeNav === 'overview') {
      return <CommandCentreDashboard />;
    }

    if (activeNav === 'digital-twin') {
      return <DigitalTwinPage />;
    }

    if (activeNav === 'live-sensors') {
      return <LiveSensorsPage />;
    }

    if (activeNav === 'leakage') {
      return <AnomalyIntelligencePage />;
    }

    if (activeNav === 'alerts') {
      return <AlertsManagementPage onNavigateToDigitalTwin={(nav) => setActiveNav(nav)} />;
    }

    if (activeNav === 'demand') {
      return <DemandForecastingPage />;
    }

    if (activeNav === 'availability') {
      return <WaterAvailabilityPage />;
    }

    if (activeNav === 'sensor-fusion') {
      return <SensorFusionPage />;
    }

    if (activeNav === 'analytics') {
      return <AnalyticsPage />;
    }

    if (activeNav === 'settings') {
      return <SettingsPage />;
    }

    // Modular placeholder views for other sidebar sections
    const sectionDetails = {
      leakage: {
        title: 'Acoustic Leakage Intelligence',
        desc: 'AI acoustic vibration models triangulating non-visible pipe fractures and pressure wave reflections.',
        icon: Gauge,
        badge: 'AI Anomaly Detection',
      },
      demand: {
        title: 'Predictive Demand Forecasting',
        desc: 'Deep learning seasonal and diurnal municipal water consumption forecast horizons.',
        icon: TrendingUp,
        badge: 'LSTM Time-Series',
      },
      availability: {
        title: 'Water Availability & Storage Horizons',
        desc: 'Multi-basin storage monitoring and municipal water security forecasts.',
        icon: Droplets,
        badge: 'Water Security',
      },
      alerts: {
        title: 'Alerts & Operational Incidents',
        desc: 'Central incident dispatch matrix and repair crew telemetry workflows.',
        icon: Bell,
        badge: 'Incident Response',
      },
      analytics: {
        title: 'Analytics & Compliance Reports',
        desc: 'Exportable municipal non-revenue water (NRW) compliance audits and distribution efficiency metrics.',
        icon: BarChart3,
        badge: 'Regulatory Reporting',
      },
      settings: {
        title: 'Platform Settings & Configurations',
        desc: 'API keys, MQTT broker parameters, notification webhooks, and hydraulic threshold calibrations.',
        icon: Settings,
        badge: 'Supervisory Control',
      },
    };

    const currentSection = sectionDetails[activeNav] || sectionDetails['leakage'];
    const Icon = currentSection.icon;

    return (
      <div className="space-y-6">
        <GlassCard variant="frosted" className="p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-sky-100">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {currentSection.title}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    {currentSection.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {currentSection.desc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PrimaryButton onClick={() => setActiveNav('live-sensors')}>
                View Live Sensors
              </PrimaryButton>
              <PrimaryButton onClick={() => setActiveNav('overview')}>
                Overview
              </PrimaryButton>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 border border-slate-100 shadow-sm text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 mx-auto flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {currentSection.title} Initialized
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              This module is connected to the common telemetry stream. View Live Sensors, Digital Twin, or Main Overview for live analytics.
            </p>
          </div>
        </GlassCard>
      </div>
    );
  };

  return (
    <TelemetryProvider>
      <DashboardLayout
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        activeView={activeView}
        onChangeView={setActiveView}
      >
        {renderContent()}
      </DashboardLayout>
    </TelemetryProvider>
  );
}
