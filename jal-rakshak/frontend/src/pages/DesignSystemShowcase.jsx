import React, { useState } from 'react';
import {
  GlassCard,
  GlassButton,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  MetricCard,
  SectionHeader,
  GlassModal,
  GlassDropdown,
  SearchBar,
  LoadingSkeleton,
  EmptyState,
  NotificationToast,
  HealthCard,
} from '../components';
import {
  Droplets,
  Activity,
  Gauge,
  Waves,
  AlertTriangle,
  Radio,
  Layers,
  Sparkles,
  ExternalLink,
  Plus,
  Bell,
  CheckCircle2,
  Filter,
  Sliders,
  Database,
  Cpu,
  RefreshCw,
  Send,
} from 'lucide-react';

export default function DesignSystemShowcase() {
  // Interactive Component State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('zone-north');
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState('components');
  const [skeletonLoading, setSkeletonLoading] = useState(false);

  // Toast Helper
  const triggerToast = (type, title, message) => {
    const id = Date.now();
    const newToast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const zoneOptions = [
    { value: 'zone-north', label: 'Sector 4 North Treatment Plant', description: 'Flow: 450 m³/h • Normal', icon: Droplets },
    { value: 'zone-east', label: 'Zone 7 East Booster Reservoir', description: 'Flow: 310 m³/h • Standby', icon: Waves },
    { value: 'zone-south', label: 'South Industrial Distribution Hub', description: 'Pressure: 4.8 Bar • Warning', icon: Gauge },
    { value: 'zone-west', label: 'West Sub-aquifer Borewell Cluster', description: 'Turbidity: 1.2 NTU • Normal', icon: Radio },
  ];

  return (
    <div className="space-y-12">
      {/* Toast Notification Container */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} position="top-right" />

      {/* Top Hero / Intro Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/90 p-8 sm:p-10 shadow-glass-md">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              Phase 2 Design System
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              Smart-City Water Intelligence SaaS
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Premium Light <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">Glassmorphism</span> Design System
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
            A specialized design system for JAL-RAKSHAK. Engineered with frosted glass surfaces, soft layered cyan shadows, translucent borders, accessible typography, and smooth micro-interactions.
          </p>

          {/* Quick interactive test buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <PrimaryButton
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              Open Glass Modal
            </PrimaryButton>
            <SecondaryButton
              icon={Bell}
              onClick={() => triggerToast('info', 'Telemetry Update', 'Zone 4 sensor calibration synchronized.')}
            >
              Trigger Toast
            </SecondaryButton>
            <GlassButton
              variant="tinted"
              icon={RefreshCw}
              onClick={() => {
                setSkeletonLoading(true);
                setTimeout(() => setSkeletonLoading(false), 1200);
              }}
            >
              Toggle Skeleton ({skeletonLoading ? 'Active' : 'Idle'})
            </GlassButton>
          </div>
        </div>

        {/* Ambient background decorative water ripples */}
        <div className="pointer-events-none absolute -bottom-16 -right-16 w-80 h-80 bg-gradient-to-tr from-sky-300/30 to-blue-400/20 rounded-full blur-2xl" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
        <button
          onClick={() => setActiveTab('components')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'components'
              ? 'bg-white text-sky-700 shadow-glass-sm border border-sky-100'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Reusable Components Showcase
        </button>
        <button
          onClick={() => setActiveTab('tokens')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'tokens'
              ? 'bg-white text-sky-700 shadow-glass-sm border border-sky-100'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Design Tokens & Specs
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'health'
              ? 'bg-white text-sky-700 shadow-glass-sm border border-sky-100'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Backend API Integration
        </button>
      </div>

      {activeTab === 'components' && (
        <div className="space-y-12">
          {/* SECTION 1: Metric Cards */}
          <section className="space-y-5">
            <SectionHeader
              badge="Component 1"
              title="MetricCard — Live Telemetry Statistics"
              description="Water network telemetry metrics featuring frosted glass cards, dynamic trend indicators, and status glow borders."
              action={
                <StatusBadge status="normal" label="Live Telemetry Feed" />
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Municipal Flow Rate"
                value="142.8"
                unit="m³/h"
                trend="+4.2%"
                trendType="up"
                trendLabel="vs last hour"
                icon={Droplets}
                status="normal"
                subtitle="Main Intake Conduit 01"
                loading={skeletonLoading}
              />
              <MetricCard
                title="Reservoir Water Level"
                value="88.4"
                unit="%"
                trend="-1.5%"
                trendType="down"
                trendLabel="depletion rate"
                icon={Waves}
                status="info"
                subtitle="Northern Storage Basin"
                loading={skeletonLoading}
              />
              <MetricCard
                title="Grid Hydraulic Pressure"
                value="5.62"
                unit="Bar"
                trend="Within Limits"
                trendType="neutral"
                trendLabel="stabilized"
                icon={Gauge}
                status="warning"
                subtitle="Zone 3 Distribution Ring"
                loading={skeletonLoading}
              />
              <MetricCard
                title="Active Leak Alerts"
                value="0"
                unit="anomalies"
                trend="0 Detected"
                trendType="up"
                trendLabel="AI model active"
                icon={AlertTriangle}
                status="normal"
                subtitle="Real-time acoustic analysis"
                loading={skeletonLoading}
              />
            </div>
          </section>

          {/* SECTION 2: Buttons & States */}
          <section className="space-y-5">
            <SectionHeader
              badge="Component 2, 3, 4"
              title="Buttons & Interactive Controls"
              description="PrimaryButton, SecondaryButton, and GlassButton in various sizes, variants, loading states, and hover configurations."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Buttons */}
              <GlassCard variant="frosted" className="p-6 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">PrimaryButton (Water Cyan Gradient)</h3>
                  <p className="text-xs text-slate-500">High-emphasis call to action</p>
                </div>
                <div className="flex flex-col gap-3">
                  <PrimaryButton size="lg" icon={Send}>
                    Large Action Button
                  </PrimaryButton>
                  <PrimaryButton size="md" icon={Plus}>
                    Medium Standard Button
                  </PrimaryButton>
                  <PrimaryButton size="sm">
                    Small Compact Button
                  </PrimaryButton>
                  <PrimaryButton size="md" loading>
                    Loading Button
                  </PrimaryButton>
                  <PrimaryButton size="md" disabled>
                    Disabled State
                  </PrimaryButton>
                </div>
              </GlassCard>

              {/* Secondary Buttons */}
              <GlassCard variant="frosted" className="p-6 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">SecondaryButton (Frosted Glass)</h3>
                  <p className="text-xs text-slate-500">Subtle elevation and slate-700 contrast</p>
                </div>
                <div className="flex flex-col gap-3">
                  <SecondaryButton size="lg" icon={ExternalLink}>
                    View Telemetry Logs
                  </SecondaryButton>
                  <SecondaryButton size="md" icon={Filter}>
                    Filter Sensor Data
                  </SecondaryButton>
                  <SecondaryButton size="sm">
                    Quick Reset
                  </SecondaryButton>
                  <SecondaryButton size="md" loading>
                    Synchronizing
                  </SecondaryButton>
                  <SecondaryButton size="md" disabled>
                    Unavailable Button
                  </SecondaryButton>
                </div>
              </GlassCard>

              {/* Glass Buttons */}
              <GlassCard variant="frosted" className="p-6 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">GlassButton (Translucent Styles)</h3>
                  <p className="text-xs text-slate-500">Frosted translucent variants with subtle tints</p>
                </div>
                <div className="flex flex-col gap-3">
                  <GlassButton variant="default" icon={Sliders}>
                    Default Translucent
                  </GlassButton>
                  <GlassButton variant="tinted" icon={Droplets}>
                    Tinted Cyan Glass
                  </GlassButton>
                  <GlassButton variant="success" icon={CheckCircle2}>
                    Success Glass Variant
                  </GlassButton>
                  <GlassButton variant="danger" icon={AlertTriangle}>
                    Emergency Shutoff
                  </GlassButton>
                  <GlassButton variant="default" disabled>
                    Disabled Glass
                  </GlassButton>
                </div>
              </GlassCard>
            </div>
          </section>

          {/* SECTION 3: Status Badges */}
          <section className="space-y-5">
            <SectionHeader
              badge="Component 5"
              title="StatusBadge — Telemetry Indicators"
              description="Translucent badges with animated glowing pulse dots indicating sub-system health, sensor connectivity, and warnings."
            />

            <GlassCard variant="frosted" className="p-6">
              <div className="space-y-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  All Telemetry States
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status="normal" label="Normal Operation" />
                  <StatusBadge status="online" label="Sensor Online" />
                  <StatusBadge status="info" label="Calibrating Model" />
                  <StatusBadge status="warning" label="High Flow Warning" />
                  <StatusBadge status="critical" label="Pressure Surge Detected" />
                  <StatusBadge status="standby" label="Auxiliary Pump Standby" />
                  <StatusBadge status="offline" label="Node Offline" />
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  <span className="text-xs text-slate-500 mr-2">Small size variant:</span>
                  <StatusBadge size="sm" status="normal" label="Grid Stable" />
                  <StatusBadge size="sm" status="warning" label="Leak Alert" />
                  <StatusBadge size="sm" status="critical" label="Crisis" />
                  <StatusBadge size="sm" status="offline" label="Muted" />
                </div>
              </div>
            </GlassCard>
          </section>

          {/* SECTION 4: Glass Card Variants */}
          <section className="space-y-5">
            <SectionHeader
              badge="Component 6"
              title="GlassCard Surface Variants"
              description="Different glass opacity and elevation surfaces tailored for layered hierarchy."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <GlassCard variant="default" hoverable className="p-5">
                <span className="text-xs font-mono font-semibold text-sky-600 block mb-1">variant="default"</span>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Standard Glass</h4>
                <p className="text-xs text-slate-500">75% opacity with 16px backdrop blur.</p>
              </GlassCard>

              <GlassCard variant="frosted" hoverable className="p-5">
                <span className="text-xs font-mono font-semibold text-sky-600 block mb-1">variant="frosted"</span>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Frosted Heavy</h4>
                <p className="text-xs text-slate-500">85% opacity with 24px backdrop blur.</p>
              </GlassCard>

              <GlassCard variant="elevated" hoverable className="p-5">
                <span className="text-xs font-mono font-semibold text-sky-600 block mb-1">variant="elevated"</span>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Elevated Surface</h4>
                <p className="text-xs text-slate-500">90% opacity with deeper layered shadow.</p>
              </GlassCard>

              <GlassCard variant="subtle" hoverable className="p-5">
                <span className="text-xs font-mono font-semibold text-sky-600 block mb-1">variant="subtle"</span>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Subtle Glass</h4>
                <p className="text-xs text-slate-500">60% translucent glass for background grouping.</p>
              </GlassCard>

              <GlassCard variant="tinted" hoverable className="p-5">
                <span className="text-xs font-mono font-semibold text-sky-600 block mb-1">variant="tinted"</span>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Tinted Water Glass</h4>
                <p className="text-xs text-slate-500">Subtle sky-50 gradient with translucent cyan border.</p>
              </GlassCard>
            </div>
          </section>

          {/* SECTION 5: Form & Filter Controls (SearchBar & GlassDropdown) */}
          <section className="space-y-5">
            <SectionHeader
              badge="Component 7, 8"
              title="Form & Search Controls"
              description="Frosted SearchBar with clear trigger and keyboard shortcut, alongside the custom animated GlassDropdown."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard variant="frosted" className="p-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Interactive SearchBar</h3>
                <SearchBar
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  placeholder="Search sensors, reservoirs, valve telemetry..."
                />
                {searchQuery && (
                  <p className="text-xs text-slate-600 bg-sky-50 p-2.5 rounded-xl border border-sky-100">
                    Live query preview: <strong className="text-sky-800 font-mono">{searchQuery}</strong>
                  </p>
                )}
              </GlassCard>

              <GlassCard variant="frosted" className="p-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Interactive GlassDropdown</h3>
                <GlassDropdown
                  label="Select Municipal Water Facility / Hub"
                  options={zoneOptions}
                  value={selectedZone}
                  onChange={setSelectedZone}
                />
              </GlassCard>
            </div>
          </section>

          {/* SECTION 6: Toast Triggers & Notifications */}
          <section className="space-y-5">
            <SectionHeader
              badge="Component 9"
              title="NotificationToast — Floating Glass Alerts"
              description="Floating frosted glass feedback toasts featuring auto-dismiss, progress indicators, and status icons."
            />

            <GlassCard variant="frosted" className="p-6 space-y-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Trigger Real-Time Feedback Toasts
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <PrimaryButton
                  size="sm"
                  onClick={() => triggerToast('success', 'Telemetry Stream Established', 'Connected to MQTT broker at 1883 with 0 packet loss.')}
                >
                  Success Toast
                </PrimaryButton>
                <GlassButton
                  variant="tinted"
                  size="sm"
                  onClick={() => triggerToast('info', 'AI Model Re-indexed', 'Demand forecasting model retrained with past 24hr flow telemetry.')}
                >
                  Info Toast
                </GlassButton>
                <GlassButton
                  variant="default"
                  size="sm"
                  onClick={() => triggerToast('warning', 'Pressure Deviation', 'Zone 7 pressure dropped below 2.8 Bar threshold.')}
                >
                  Warning Toast
                </GlassButton>
                <GlassButton
                  variant="danger"
                  size="sm"
                  onClick={() => triggerToast('error', 'Acoustic Leak Detected', 'Pipeline rupture detected at Sector 9 North Junction.')}
                >
                  Error Toast
                </GlassButton>
              </div>
            </GlassCard>
          </section>

          {/* SECTION 7: Loading Skeletons & Empty State */}
          <section className="space-y-5">
            <SectionHeader
              badge="Component 10, 11"
              title="Loading Skeletons & EmptyState"
              description="Gentle light-shimmer skeletons for async states and water-themed empty states."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard variant="frosted" className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">Loading Skeletons</h3>
                  <span className="text-xs text-sky-600 font-mono">Shimmer Effect</span>
                </div>
                <div className="space-y-4">
                  <LoadingSkeleton type="metric" />
                  <LoadingSkeleton type="text" lines={2} />
                </div>
              </GlassCard>

              <EmptyState
                icon={Droplets}
                title="No Sensor Anomaly Detected"
                description="All 48 smart telemetry probes across Municipal Water Ring 3 are operating within baseline parameters."
                actionText="Simulate Pipeline Leak"
                onAction={() => triggerToast('warning', 'Simulation Initialized', 'Simulated 1.4 Bar pressure drop in digital twin.')}
              />
            </div>
          </section>
        </div>
      )}

      {activeTab === 'tokens' && (
        <div className="space-y-8">
          <SectionHeader
            badge="Design Tokens"
            title="Design System Token Specifications"
            description="The foundational color palettes, typography scales, glass opacities, and shadow depths powering JAL-RAKSHAK."
          />

          {/* Color Palettes */}
          <GlassCard variant="frosted" className="p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Water Intelligence Brand Colors</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-[#f0f9ff] border border-sky-200">
                <span className="text-xs font-mono font-bold text-slate-800 block">brand-50</span>
                <span className="text-[11px] text-slate-500">#f0f9ff (Canvas)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#e0f2fe] border border-sky-300">
                <span className="text-xs font-mono font-bold text-slate-800 block">brand-100</span>
                <span className="text-[11px] text-slate-500">#e0f2fe (Tint)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#38bdf8] text-white">
                <span className="text-xs font-mono font-bold block">brand-400</span>
                <span className="text-[11px] text-sky-100">#38bdf8 (Cyan)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0ea5e9] text-white">
                <span className="text-xs font-mono font-bold block">brand-500</span>
                <span className="text-[11px] text-sky-100">#0ea5e9 (Core Brand)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0284c7] text-white">
                <span className="text-xs font-mono font-bold block">brand-600</span>
                <span className="text-[11px] text-sky-100">#0284c7 (Gradient End)</span>
              </div>
            </div>
          </GlassCard>

          {/* Shadows and Blurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard variant="frosted" className="p-6 space-y-3">
              <h3 className="font-bold text-slate-900 text-base">Soft Layered Shadows</h3>
              <p className="text-xs text-slate-500">Custom shadows with subtle sky-tinted ambient glow.</p>
              <ul className="text-xs space-y-2 text-slate-600 font-mono">
                <li>• <strong>shadow-glass-sm</strong>: 0 4px 20px -2px rgba(14,165,233,0.05)</li>
                <li>• <strong>shadow-glass-md</strong>: 0 10px 30px -4px rgba(15,23,42,0.05)</li>
                <li>• <strong>shadow-glass-lg</strong>: 0 20px 40px -6px rgba(15,23,42,0.07)</li>
                <li>• <strong>shadow-glass-modal</strong>: 0 25px 60px -12px rgba(15,23,42,0.15)</li>
              </ul>
            </GlassCard>

            <GlassCard variant="frosted" className="p-6 space-y-3">
              <h3 className="font-bold text-slate-900 text-base">Frosted Glass Backdrops</h3>
              <p className="text-xs text-slate-500">Hardware-accelerated backdrops for clean optical refraction.</p>
              <ul className="text-xs space-y-2 text-slate-600 font-mono">
                <li>• <strong>backdrop-blur-md</strong>: 12px blur for buttons & badges</li>
                <li>• <strong>backdrop-blur-xl</strong>: 20px blur for standard glass cards</li>
                <li>• <strong>backdrop-blur-2xl</strong>: 24px blur for modal cards & hero</li>
                <li>• <strong>border-white/90</strong>: 90% white translucent light edge</li>
              </ul>
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div className="space-y-6">
          <SectionHeader
            badge="API Health Monitor"
            title="FastAPI System Telemetry Link"
            description="Live health check communication verifying the end-to-end integration between the React frontend and FastAPI backend."
          />
          <HealthCard />
        </div>
      )}

      {/* GlassModal Preview Instance */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Simulate Pipeline Crisis Scenario"
        subtitle="Digital Twin Hydraulic Stress Testing"
        icon={Gauge}
        footer={
          <>
            <SecondaryButton onClick={() => setIsModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={() => {
                setIsModalOpen(false);
                triggerToast('warning', 'Simulation Executed', 'High-pressure wave propagated through Sector 4 node.');
              }}
            >
              Execute Stress Test
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Executing a digital twin simulation isolates the selected pipeline segment and recalculates nodal hydraulic pressure across the municipal water distribution graph.
          </p>
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-center gap-3">
            <Droplets className="w-5 h-5 text-sky-600 shrink-0" />
            <div className="text-xs text-slate-700">
              Target node: <strong>Zone 4 North Booster Pump</strong> • Max pressure: <strong>6.5 Bar</strong>
            </div>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
