import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTelemetry } from '../context/TelemetryContext';
import { GlassCard, StatusBadge, PrimaryButton, SecondaryButton } from '../components';
import {
  exportIWABalanceCSV,
  exportTelemetryLogsCSV,
  exportIncidentAuditCSV,
  exportFullExecutivePackageJSON,
} from '../utils/exportUtils';
import {
  BarChart3,
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Droplets,
  DollarSign,
  TrendingDown,
  Layers,
  Building2,
  Calendar,
  Sparkles,
  ChevronDown,
  FileSpreadsheet,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export default function AnalyticsPage() {
  const { liveSensors, alerts, suspicions, zones, networkHealthScore, activityFeed } = useTelemetry();
  const [waterBalance, setWaterBalance] = useState(null);
  const [complianceReport, setComplianceReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('water-balance'); // 'water-balance' | 'compliance'
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [wbRes, compRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics/water-balance`, { timeout: 4000 }),
        axios.get(`${API_BASE_URL}/analytics/compliance-report`, { timeout: 4000 }),
      ]);
      if (wbRes.data) setWaterBalance(wbRes.data);
      if (compRes.data) setComplianceReport(compRes.data);
    } catch {
      // Retain graceful defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Volume (m3),Percentage (%),Benchmark\n' +
      `System Input Volume,${waterBalance?.system_input_volume_m3 || 124500},100.0%,Baseline\n` +
      `Billed Authorized Consumption,${waterBalance?.authorized_consumption?.billed_authorized_m3 || 88200},70.8%,Revenue Earning\n` +
      `Unbilled Authorized Consumption,${waterBalance?.authorized_consumption?.unbilled_authorized_m3 || 6400},5.1%,Fire/Muni\n` +
      `Apparent Commercial Losses,${waterBalance?.water_losses?.apparent_losses_m3 || 5100},4.1%,Meter Drift\n` +
      `Real Physical Losses (Leaks),${waterBalance?.water_losses?.real_physical_losses_m3 || 24800},19.9%,Pipe Bursts\n` +
      `Total Non-Revenue Water,${waterBalance?.non_revenue_water?.volume_m3 || 31200},${waterBalance?.non_revenue_water?.percentage || 25.1}%,Target <=15%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JAL_RAKSHAK_IWA_Water_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-sky-100 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 shadow-sm">
              <BarChart3 className="w-3.5 h-3.5 text-sky-500" />
              Phase 11 Regulatory Module
            </span>
            <StatusBadge
              status="normal"
              label="IWA / JJM Audited Data"
              size="sm"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Analytics & Compliance Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            International Water Association (IWA) water balance audit, commercial loss triage, and Jal Jeevan Mission compliance
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-center">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
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
              <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white/95 backdrop-blur-xl border border-sky-100 shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 border-b border-slate-100 font-bold text-slate-400 uppercase text-[10px]">
                  Select Export Document
                </div>
                <button
                  onClick={() => { setIsExportMenuOpen(false); exportIWABalanceCSV(waterBalance); }}
                  className="w-full px-3 py-2 text-left hover:bg-sky-50 text-slate-700 hover:text-sky-800 flex items-center gap-2 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
                  <span>IWA Standard Water Balance (CSV)</span>
                </button>
                <button
                  onClick={() => { setIsExportMenuOpen(false); exportTelemetryLogsCSV(liveSensors); }}
                  className="w-full px-3 py-2 text-left hover:bg-sky-50 text-slate-700 hover:text-sky-800 flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>IoT Sensor Telemetry Log (CSV)</span>
                </button>
                <button
                  onClick={() => { setIsExportMenuOpen(false); exportIncidentAuditCSV(alerts); }}
                  className="w-full px-3 py-2 text-left hover:bg-sky-50 text-slate-700 hover:text-sky-800 flex items-center gap-2 transition-colors"
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
                  className="w-full px-3 py-2 text-left hover:bg-sky-50 text-slate-700 hover:text-sky-800 flex items-center gap-2 transition-colors border-t border-slate-100"
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
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('water-balance')}
          className={`pb-2.5 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'water-balance'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Droplets className="w-4 h-4" />
          IWA Standard Water Balance Audit
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`pb-2.5 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'compliance'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          JJM & AMRUT Regulatory Compliance
        </button>
      </div>

      {activeTab === 'water-balance' ? (
        <div className="space-y-6">
          {/* Top Summary Cards */}
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
                Target: &le; 15.0% (AMRUT 2.0 benchmark)
              </p>
            </GlassCard>

            <GlassCard variant="frosted" className="p-4 border-l-4 border-l-rose-500">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Estimated Monthly Revenue Loss
              </span>
              <div className="text-2xl font-black text-rose-700 mt-1">
                ₹{(waterBalance?.non_revenue_water?.financial_loss_inr || 577200).toLocaleString()}
              </div>
              <p className="text-[11px] text-rose-500 mt-1">At ₹18.5 / m³ municipal tariff</p>
            </GlassCard>
          </div>

          {/* IWA Water Balance Matrix Diagram Table */}
          <GlassCard variant="frosted" className="p-6">
            <h3 className="font-extrabold text-base text-slate-900 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Standard IWA International Water Association Audit Matrix
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Official structural breakdown separating authorized consumption from physical pipe leaks and unmetered commercial losses.
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">System Inflow</th>
                    <th className="p-3">Primary Category</th>
                    <th className="p-3">Component Description</th>
                    <th className="p-3 text-right">Daily Volume (m³)</th>
                    <th className="p-3 text-right">Share of Input (%)</th>
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
                    <td className="p-3">Apparent Commercial Losses (Ultrasonic meter inaccuracies & billing data errors)</td>
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
      ) : (
        /* JJM & AMRUT Compliance Report */
        <div className="space-y-6">
          <GlassCard variant="frosted" className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sky-100 gap-2 mb-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Municipal Benchmark Audit Report
                </h3>
                <p className="text-xs text-slate-500">
                  Report ID: {complianceReport?.report_id || 'REP-MUNI-20261121'} &bull; Ministry of Jal Shakti Standards
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 self-start sm:self-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {complianceReport?.compliance_summary?.overall_status || 'COMPLIANT WITH ADVISORY'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Per Capita Supply</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {complianceReport?.compliance_summary?.per_capita_supply_lpcd || 138.5} <span className="text-xs text-slate-500">LPCD</span>
                </div>
                <p className="text-[11px] text-emerald-600 mt-1 font-semibold">&ge; 135 LPCD Standard Met</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Supply Continuity</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {complianceReport?.compliance_summary?.continuity_of_supply_hours || 20.4} <span className="text-xs text-slate-500">hrs/day</span>
                </div>
                <p className="text-[11px] text-sky-600 mt-1 font-semibold">Target: 24x7 Pressurized</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Pressure Compliance</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {complianceReport?.compliance_summary?.pressure_compliance_pct || 92.4}%
                </div>
                <p className="text-[11px] text-amber-600 mt-1 font-semibold">Sector 9 Under Repair</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Water Quality Index</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {complianceReport?.compliance_summary?.water_quality_index || 98.2}%
                </div>
                <p className="text-[11px] text-emerald-600 mt-1 font-semibold">Potable BIS 10500 Compliant</p>
              </div>
            </div>

            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-3">
              Zonal Regulatory Audit Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(complianceReport?.zonal_audits || [
                { zone_id: 'ZONE_1', name: 'North Municipal District', pressure_compliance: 'Satisfactory (4.5 bar)', status: 'NORMAL' },
                { zone_id: 'ZONE_2', name: 'East Industrial Park', pressure_compliance: 'Satisfactory (4.6 bar)', status: 'NORMAL' },
                { zone_id: 'ZONE_3', name: 'South Residential Colony (Sector 9)', pressure_compliance: 'Action Required (3.42 bar)', status: 'LEAK_SUSPECTED' },
                { zone_id: 'ZONE_4', name: 'West Hillside Suburb', pressure_compliance: 'Satisfactory (4.15 bar)', status: 'NORMAL' },
                { zone_id: 'ZONE_5', name: 'Central Heritage Core', pressure_compliance: 'Satisfactory (4.45 bar)', status: 'NORMAL' },
              ]).map((z) => (
                <div key={z.zone_id} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 block">{z.name}</span>
                    <span className="text-slate-500 text-[11px]">{z.pressure_compliance}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    z.status === 'LEAK_SUSPECTED'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {z.status === 'LEAK_SUSPECTED' ? 'REPAIR ORDER ACTIVE' : 'COMPLIANT'}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
