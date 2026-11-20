import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTelemetry } from '../context/TelemetryContext';
import { GlassCard, StatusBadge, PrimaryButton } from '../components';
import {
  exportIWABalanceCSV,
  exportTelemetryLogsCSV,
  exportIncidentAuditCSV,
  exportFullExecutivePackageJSON,
} from '../utils/exportUtils';
import {
  BarChart3,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Droplets,
  Layers,
  Building2,
  Sparkles,
  ChevronDown,
  FileSpreadsheet,
  Moon,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Percent,
  Clock,
  MapPin,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Fallback Mock Data for Standalone Mode
const FALLBACK_BENCHMARKS = {
  framework: 'MoHUA / AMRUT 2.0 Urban Water Service Level Benchmarks (SLB)',
  overall_slb_score_pct: 91.8,
  benchmarks: [
    {
      benchmark_name: 'Coverage of Water Supply Network',
      mohua_target: 100.0,
      achieved_value: 94.2,
      unit: '%',
      status: 'SATISFACTORY',
      description: 'Proportion of urban households with direct metered household piped tap connections.',
    },
    {
      benchmark_name: 'Per Capita Water Supply (135 LPCD)',
      mohua_target: 135.0,
      achieved_value: 138.5,
      unit: 'LPCD',
      status: 'COMPLIANT',
      description: 'Average daily volume of potable water delivered per resident across all 5 municipal zones.',
    },
    {
      benchmark_name: 'Extent of Non-Revenue Water (NRW)',
      mohua_target: 20.0,
      achieved_value: 25.1,
      unit: '%',
      status: 'ACTION_REQUIRED',
      description: 'AMRUT 2.0 mandates reduction of total NRW to under 20% (Current losses: 25.1%).',
    },
    {
      benchmark_name: 'Continuity of Water Supply',
      mohua_target: 24.0,
      achieved_value: 20.4,
      unit: 'Hours/Day',
      status: 'IMPROVING',
      description: 'Shift from intermittent rationing toward continuous 24x7 pressurized network supply.',
    },
    {
      benchmark_name: 'Quality of Water Supplied (BIS 10500)',
      mohua_target: 100.0,
      achieved_value: 98.2,
      unit: '%',
      status: 'COMPLIANT',
      description: 'Percentage of samples tested conforming to Bureau of Indian Standards (BIS 10500:2012).',
    },
  ],
};

const FALLBACK_MNF = {
  analysis_window: '02:00 AM - 04:00 AM Nocturnal Minimum Window',
  methodology: 'IWA / AWWA Minimum Night Flow (MNF) Telemetry Analysis',
  total_grid_night_flow_m3h: 865.0,
  average_daytime_flow_m3h: 5180.0,
  grid_night_to_day_ratio_pct: 16.7,
  estimated_excess_physical_leakage_m3h: 419.0,
  estimated_daily_wastage_m3: 10056.0,
  financial_waste_daily_inr: 186036.0,
  zonal_breakdown: [
    { zone_id: 'ZONE_1', name: 'North Municipal District', daytime_peak_m3h: 1450.0, night_flow_m3h: 112.0, night_day_ratio_pct: 7.7, unavoidable_background_loss_m3h: 95.0, excess_leakage_flow_m3h: 17.0, leak_probability_pct: 14.2, status: 'NORMAL' },
    { zone_id: 'ZONE_2', name: 'East Industrial Park', daytime_peak_m3h: 980.0, night_flow_m3h: 85.0, night_day_ratio_pct: 8.6, unavoidable_background_loss_m3h: 75.0, excess_leakage_flow_m3h: 10.0, leak_probability_pct: 11.5, status: 'NORMAL' },
    { zone_id: 'ZONE_3', name: 'South Residential Colony (Sector 9)', daytime_peak_m3h: 1620.0, night_flow_m3h: 485.0, night_day_ratio_pct: 29.9, unavoidable_background_loss_m3h: 110.0, excess_leakage_flow_m3h: 375.0, leak_probability_pct: 94.1, status: 'CRITICAL_LEAK_CONFIRMED' },
    { zone_id: 'ZONE_4', name: 'West Hillside Suburb', daytime_peak_m3h: 890.0, night_flow_m3h: 72.0, night_day_ratio_pct: 8.1, unavoidable_background_loss_m3h: 65.0, excess_leakage_flow_m3h: 7.0, leak_probability_pct: 8.9, status: 'NORMAL' },
    { zone_id: 'ZONE_5', name: 'Central Heritage Core', daytime_peak_m3h: 1240.0, night_flow_m3h: 98.0, night_day_ratio_pct: 7.9, unavoidable_background_loss_m3h: 88.0, excess_leakage_flow_m3h: 10.0, leak_probability_pct: 10.2, status: 'NORMAL' },
  ],
};

export default function AnalyticsPage() {
  const { liveSensors, alerts, suspicions, zones, networkHealthScore, activityFeed } = useTelemetry();
  const [waterBalance, setWaterBalance] = useState(null);
  const [complianceReport, setComplianceReport] = useState(null);
  const [benchmarks, setBenchmarks] = useState(FALLBACK_BENCHMARKS);
  const [mnfData, setMnfData] = useState(FALLBACK_MNF);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('water-balance'); // 'water-balance' | 'compliance' | 'night-flow'
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [wbRes, compRes, slbRes, mnfRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/analytics/water-balance`, { timeout: 4000 }),
        axios.get(`${API_BASE_URL}/analytics/compliance-report`, { timeout: 4000 }),
        axios.get(`${API_BASE_URL}/analytics/service-level-benchmarks`, { timeout: 4000 }),
        axios.get(`${API_BASE_URL}/analytics/minimum-night-flow`, { timeout: 4000 }),
      ]);
      if (wbRes.status === 'fulfilled' && wbRes.value.data) setWaterBalance(wbRes.value.data);
      if (compRes.status === 'fulfilled' && compRes.value.data) setComplianceReport(compRes.value.data);
      if (slbRes.status === 'fulfilled' && slbRes.value.data) setBenchmarks(slbRes.value.data);
      if (mnfRes.status === 'fulfilled' && mnfRes.value.data) setMnfData(mnfRes.value.data);
    } catch {
      // Graceful local fallbacks retained
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-sky-100 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 shadow-sm">
              <BarChart3 className="w-3.5 h-3.5 text-sky-500" />
              MoHUA & AMRUT 2.0 Audit Module
            </span>
            <StatusBadge
              status="normal"
              label="IWA / CPHEEO 135 LPCD Standard"
              size="sm"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Analytics & Regulatory Compliance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            IWA standard water balance, 135 LPCD per-capita equity audit, and 02:00–04:00 AM Minimum Night Flow telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-center">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
            Refresh Audit
          </button>

          {/* Multi-Format Export Dropdown */}
          <div className="relative">
            <PrimaryButton onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span>Export Reports</span>
              <ChevronDown className="w-3 h-3 ml-1 text-sky-200" />
            </PrimaryButton>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-sky-100 shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 border-b border-slate-100 font-bold text-slate-400 uppercase text-[10px]">
                  Select Export Document
                </div>
                <button
                  onClick={() => { setIsExportMenuOpen(false); exportIWABalanceCSV(waterBalance); }}
                  className="w-full px-3 py-2 text-left hover:bg-sky-50 text-slate-700 hover:text-sky-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
                  <span>IWA Standard Water Balance (CSV)</span>
                </button>
                <button
                  onClick={() => { setIsExportMenuOpen(false); exportTelemetryLogsCSV(liveSensors); }}
                  className="w-full px-3 py-2 text-left hover:bg-sky-50 text-slate-700 hover:text-sky-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>IoT Sensor Telemetry Log (CSV)</span>
                </button>
                <button
                  onClick={() => { setIsExportMenuOpen(false); exportIncidentAuditCSV(alerts); }}
                  className="w-full px-3 py-2 text-left hover:bg-sky-50 text-slate-700 hover:text-sky-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Incident Investigation Trail (CSV)</span>
                </button>
                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    exportFullExecutivePackageJSON({
                      networkHealthScore,
                      zones,
                      alerts,
                      suspicions,
                      activityFeed,
                    });
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-sky-50 text-slate-700 hover:text-sky-800 flex items-center gap-2 transition-colors border-t border-slate-100 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Full Executive Package (JSON)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('water-balance')}
          className={`pb-2.5 px-1 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'water-balance'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Droplets className="w-4 h-4" />
          IWA Water Balance Matrix
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`pb-2.5 px-1 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'compliance'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          135 LPCD Zonal Equity Audit
        </button>
        <button
          onClick={() => setActiveTab('night-flow')}
          className={`pb-2.5 px-1 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'night-flow'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Moon className="w-4 h-4 text-purple-500" />
          Minimum Night Flow & MoHUA Benchmarks
        </button>
      </div>

      {/* Tab 1: IWA Water Balance Matrix */}
      {activeTab === 'water-balance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard variant="frosted" className="p-4 border-l-4 border-l-sky-500">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                System Input Volume
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {(waterBalance?.system_input_volume_m3 || 124500).toLocaleString()} <span className="text-sm font-semibold text-slate-400">m³/day</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Total bulk transmission into grid</p>
            </GlassCard>

            <GlassCard variant="frosted" className="p-4 border-l-4 border-l-emerald-500">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Billed Authorized Revenue
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {(waterBalance?.authorized_consumption?.billed_authorized_m3 || 88200).toLocaleString()} <span className="text-sm font-semibold text-slate-400">m³/day</span>
              </div>
              <p className="text-[11px] text-emerald-600 mt-1 font-semibold">70.8% revenue collection rate</p>
            </GlassCard>

            <GlassCard variant="frosted" className="p-4 border-l-4 border-l-amber-500">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Non-Revenue Water (NRW)
              </span>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {waterBalance?.non_revenue_water?.percentage ?? 25.1}%
              </div>
              <p className="text-[11px] text-amber-600 mt-1 font-semibold">
                AMRUT 2.0 Target: &le; 20.0%
              </p>
            </GlassCard>

            <GlassCard variant="frosted" className="p-4 border-l-4 border-l-rose-500">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Daily Revenue Loss
              </span>
              <div className="text-2xl font-black text-rose-700 mt-1">
                ₹{(waterBalance?.non_revenue_water?.financial_loss_inr || 577200).toLocaleString()}
              </div>
              <p className="text-[11px] text-rose-500 mt-1">At ₹18.5 / m³ municipal bulk tariff</p>
            </GlassCard>
          </div>

          {/* IWA Matrix Table */}
          <GlassCard variant="frosted" className="p-6">
            <h3 className="font-extrabold text-base text-slate-900 mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Standard International Water Association (IWA) Audit Matrix
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Structural breakdown isolating legitimate billed consumption from underground physical pipe bursts and commercial drift.
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">System Inflow</th>
                    <th className="p-3">Primary Category</th>
                    <th className="p-3">Component Description</th>
                    <th className="p-3 text-right">Daily Volume (m³)</th>
                    <th className="p-3 text-right">Share (%)</th>
                    <th className="p-3">Audit Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr className="bg-emerald-50/40">
                    <td rowSpan={2} className="p-3 font-bold border-r border-slate-200 align-top text-slate-900">
                      System Input Volume<br />
                      <span className="text-[11px] text-slate-500 font-normal">124,500 m³/day</span>
                    </td>
                    <td rowSpan={2} className="p-3 font-semibold text-emerald-800 border-r border-slate-200 align-top">
                      Authorized Consumption (75.9%)
                    </td>
                    <td className="p-3">Billed Authorized Metered Domestic, Commercial & Industrial</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">88,200</td>
                    <td className="p-3 text-right font-mono">70.8%</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Revenue Generating</span></td>
                  </tr>
                  <tr className="bg-emerald-50/20">
                    <td className="p-3">Unbilled Authorized (Fire hydrant flushing, municipal parks, civic centers)</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-700">6,400</td>
                    <td className="p-3 text-right font-mono">5.1%</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Authorized Non-Revenue</span></td>
                  </tr>

                  <tr className="bg-amber-50/40">
                    <td rowSpan={2} className="p-3 font-bold border-r border-slate-200 align-top text-slate-900">
                      Water Losses<br />
                      <span className="text-[11px] text-slate-500 font-normal">29,900 m³/day</span>
                    </td>
                    <td rowSpan={2} className="p-3 font-semibold text-rose-800 border-r border-slate-200 align-top">
                      Water Losses (24.1%)
                    </td>
                    <td className="p-3">Apparent Commercial Losses (Ultrasonic meter inaccuracies & billing drift)</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-700">5,100</td>
                    <td className="p-3 text-right font-mono">4.1%</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Commercial Drift</span></td>
                  </tr>
                  <tr className="bg-rose-50/40">
                    <td className="p-3">Real Physical Losses (Underground pipe ruptures, joint seepage, overflow)</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-700">24,800</td>
                    <td className="p-3 text-right font-mono">19.9%</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">Physical Fracture</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab 2: 135 LPCD Zonal Equity Audit */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <GlassCard variant="frosted" className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sky-100 gap-2 mb-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  MoHUA 135 LPCD Per Capita Equity Audit
                </h3>
                <p className="text-xs text-slate-500">
                  Benchmarked against CPHEEO Standards &bull; Jal Jeevan Mission Urban Piped Supply Matrix
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 self-start sm:self-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {complianceReport?.compliance_summary?.overall_status || 'COMPLIANT (138.5 LPCD AVERAGE)'}
              </span>
            </div>

            {/* Zonal 135 LPCD Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Zone / Municipal Sector</th>
                    <th className="p-3 text-right">Population</th>
                    <th className="p-3 text-right">Daily Supply (m³)</th>
                    <th className="p-3 text-right">Actual LPCD</th>
                    <th className="p-3 text-right">MoHUA Standard</th>
                    <th className="p-3">Equity Status</th>
                    <th className="p-3">Operating Pressure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {(complianceReport?.zonal_audits || [
                    { zone_id: 'ZONE_1', name: 'North Municipal District', population: 185000, daily_supply_m3: 26200, per_capita_lpcd: 141.6, standard_lpcd: 135, compliance_status: 'SURPLUS', pressure_compliance: 'Satisfactory (4.50 bar)' },
                    { zone_id: 'ZONE_2', name: 'East Industrial & Commercial Park', population: 95000, daily_supply_m3: 17800, per_capita_lpcd: 187.4, standard_lpcd: 135, compliance_status: 'SURPLUS', pressure_compliance: 'Satisfactory (4.60 bar)' },
                    { zone_id: 'ZONE_3', name: 'South Residential Colony (Sector 9)', population: 210000, daily_supply_m3: 24800, per_capita_lpcd: 118.1, standard_lpcd: 135, compliance_status: 'DEFICIT', deficit_lpcd: 16.9, pressure_compliance: 'Action Required (3.42 bar)' },
                    { zone_id: 'ZONE_4', name: 'West Hillside Suburb', population: 120000, daily_supply_m3: 16900, per_capita_lpcd: 140.8, standard_lpcd: 135, compliance_status: 'COMPLIANT', pressure_compliance: 'Satisfactory (4.15 bar)' },
                    { zone_id: 'ZONE_5', name: 'Central Heritage Core', population: 160000, daily_supply_m3: 22500, per_capita_lpcd: 140.6, standard_lpcd: 135, compliance_status: 'COMPLIANT', pressure_compliance: 'Satisfactory (4.45 bar)' },
                  ]).map((z) => (
                    <tr key={z.zone_id} className={z.compliance_status === 'DEFICIT' ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}>
                      <td className="p-3 font-bold text-slate-900">{z.name}</td>
                      <td className="p-3 text-right font-mono">{z.population.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono">{z.daily_supply_m3.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {z.per_capita_lpcd} <span className="text-[10px] text-slate-400 font-normal">L/day</span>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">{z.standard_lpcd || 135.0}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          z.compliance_status === 'DEFICIT'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {z.compliance_status === 'DEFICIT' ? `Deficit (-${z.deficit_lpcd || 16.9} LPCD)` : 'Compliant / Surplus'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">{z.pressure_compliance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">AMRUT 2.0 Equity Advisory:</span>
                Sector 9 is experiencing a 16.9 LPCD deficit due to localized hydraulic throttling on Conduit `e-p2-pn102`. Priority redistribution from North Zone surplus (+6.6 LPCD) is recommended during evening replenishment.
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab 3: Minimum Night Flow (MNF) & MoHUA Benchmarks */}
      {activeTab === 'night-flow' && (
        <div className="space-y-6">
          {/* MNF Top Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard variant="frosted" className="p-4 border-l-4 border-l-purple-500">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Nocturnal Grid Flow (02:00-04:00 AM)
              </span>
              <div className="text-2xl font-black text-purple-900 mt-1">
                {mnfData.total_grid_night_flow_m3h} <span className="text-sm font-semibold text-slate-400">m³/h</span>
              </div>
              <p className="text-[11px] text-purple-700 mt-1 font-semibold">
                Night-to-Day Ratio: {mnfData.grid_night_to_day_ratio_pct}% (IWA Target &lt; 10%)
              </p>
            </GlassCard>

            <GlassCard variant="frosted" className="p-4 border-l-4 border-l-rose-500">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Excess Physical Leakage
              </span>
              <div className="text-2xl font-black text-rose-700 mt-1">
                {mnfData.estimated_excess_physical_leakage_m3h} <span className="text-sm font-semibold text-slate-400">m³/h</span>
              </div>
              <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                Estimated {(mnfData.estimated_daily_wastage_m3).toLocaleString()} m³/day lost
              </p>
            </GlassCard>

            <GlassCard variant="frosted" className="p-4 border-l-4 border-l-amber-500">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Daily Financial Waste
              </span>
              <div className="text-2xl font-black text-amber-800 mt-1">
                ₹{(mnfData.financial_waste_daily_inr).toLocaleString()}
              </div>
              <p className="text-[11px] text-amber-700 mt-1">Annualized: ₹6.79 Crore loss</p>
            </GlassCard>

            <GlassCard variant="frosted" className="p-4 border-l-4 border-l-emerald-500">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Overall MoHUA SLB Score
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {benchmarks.overall_slb_score_pct}%
              </div>
              <p className="text-[11px] text-emerald-600 mt-1 font-semibold">4 of 5 National Pillars Met</p>
            </GlassCard>
          </div>

          {/* MoHUA 5-Pillar SLB Progress Bars */}
          <GlassCard variant="frosted" className="p-6">
            <h3 className="font-extrabold text-base text-slate-900 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Ministry of Housing & Urban Affairs (MoHUA) — 5-Pillar Service Level Benchmarks
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              National performance standards for smart water grids under AMRUT 2.0 and Jal Jeevan Mission Urban.
            </p>

            <div className="space-y-4">
              {benchmarks.benchmarks.map((b, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-2 gap-1">
                    <span className="font-bold text-slate-900">{b.benchmark_name}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-500">Target: {b.mohua_target} {b.unit}</span>
                      <span className="font-bold text-slate-900">| Achieved: {b.achieved_value} {b.unit}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        b.status === 'COMPLIANT' || b.status === 'SATISFACTORY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        b.status === 'COMPLIANT' || b.status === 'SATISFACTORY' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{
                        width: `${Math.min(100, b.unit === '%' && b.mohua_target === 20 ? (b.mohua_target / b.achieved_value) * 100 : (b.achieved_value / b.mohua_target) * 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">{b.description}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Minimum Night Flow Zonal Breakdown */}
          <GlassCard variant="frosted" className="p-6">
            <h3 className="font-extrabold text-base text-slate-900 mb-1 flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-600" />
              Zonal Minimum Night Flow (02:00–04:00 AM) Acoustic Leak Isolation
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              At night, domestic consumption is negligible (&lt;5%). Any night-to-day ratio exceeding 10% mathematically proves sub-surface pipe rupture.
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Zone / Sector</th>
                    <th className="p-3 text-right">Daytime Peak (m³/h)</th>
                    <th className="p-3 text-right">Night Flow (m³/h)</th>
                    <th className="p-3 text-right">Night/Day Ratio</th>
                    <th className="p-3 text-right">Excess Loss (m³/h)</th>
                    <th className="p-3 text-right">Leak Probability</th>
                    <th className="p-3">Acoustic Triage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {mnfData.zonal_breakdown.map((z) => (
                    <tr key={z.zone_id} className={z.status === 'CRITICAL_LEAK_CONFIRMED' ? 'bg-rose-50/50' : 'hover:bg-slate-50/50'}>
                      <td className="p-3 font-bold text-slate-900">{z.name}</td>
                      <td className="p-3 text-right font-mono">{z.daytime_peak_m3h}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{z.night_flow_m3h}</td>
                      <td className="p-3 text-right font-mono">
                        <span className={`font-bold ${z.night_day_ratio_pct > 15 ? 'text-rose-600' : 'text-slate-600'}`}>
                          {z.night_day_ratio_pct}%
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-700">{z.excess_leakage_flow_m3h}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{z.leak_probability_pct}%</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          z.status === 'CRITICAL_LEAK_CONFIRMED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {z.status === 'CRITICAL_LEAK_CONFIRMED' ? 'UNDERGROUND RUPTURE' : 'ACOUSTIC NORMAL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
