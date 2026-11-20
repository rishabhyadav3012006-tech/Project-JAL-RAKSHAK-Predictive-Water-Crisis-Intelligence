import React, { useState } from 'react';
import CrisisDemoModal from './CrisisDemoModal';
import HackathonDemoTourModal from './HackathonDemoTourModal';
import {
  Search,
  Bell,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  User,
  Sliders,
  Check,
  Flame,
  Languages,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import {
  exportIWABalanceCSV,
  exportTelemetryLogsCSV,
  exportIncidentAuditCSV,
  exportFullExecutivePackageJSON,
} from '../../utils/exportUtils';

/**
 * DashboardTopNav
 * Top navigation bar with global search, live clock, notification trigger, and user profile.
 */
export default function DashboardTopNav({
  onOpenNotifications,
  activeView,
  onChangeView,
  isSidebarCollapsed,
}) {
  const {
    alerts,
    suspicions,
    zones,
    liveSensors,
    activityFeed,
    networkHealthScore,
    isRefreshing,
    refreshTelemetry,
    isSimulationMode,
    toggleLeakSimulation,
    lastRefreshedAt,
    language,
    toggleLanguage,
    t,
  } = useTelemetry();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const unreadAlerts = alerts.filter((a) => !a.acknowledged).length;

  const handleExport = (type) => {
    setIsExportMenuOpen(false);
    if (type === 'iwa') {
      exportIWABalanceCSV();
    } else if (type === 'telemetry') {
      exportTelemetryLogsCSV(liveSensors);
    } else if (type === 'incidents') {
      exportIncidentAuditCSV(alerts);
    } else if (type === 'json') {
      exportFullExecutivePackageJSON({
        networkHealthScore,
        zones,
        alerts,
        suspicions,
        activityFeed,
      });
    }
  };

  return (
    <header
      className={`h-16 fixed top-0 right-0 z-20 border-b border-sky-100/80 bg-white/75 backdrop-blur-xl transition-all duration-300 ${
        isSidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Global Search & Breadcrumb */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-12 py-1.5 text-xs bg-white/80 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
            />
            <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Bilingual Language Switcher (EN | हिन्दी) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50/80 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition-all shadow-sm"
            title="Toggle English / Hindi language"
          >
            <Languages className="w-3.5 h-3.5 text-sky-600" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Export Package Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>{t('exportPackage')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/95 backdrop-blur-xl border border-sky-100 shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 border-b border-slate-100 font-bold text-slate-400 uppercase text-[10px]">
                  Download Reports & Audits
                </div>
                <button
                  onClick={() => handleExport('iwa')}
                  className="w-full px-3 py-2 text-left hover:bg-sky-50 text-slate-700 hover:text-sky-800 flex items-center gap-2 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
                  <span>IWA Water Balance (CSV)</span>
                </button>
                <button
                  onClick={() => handleExport('telemetry')}
                  className="w-full px-3 py-2 text-left hover:bg-sky-50 text-slate-700 hover:text-sky-800 flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>IoT Sensor Logs (CSV)</span>
                </button>
                <button
                  onClick={() => handleExport('incidents')}
                  className="w-full px-3 py-2 text-left hover:bg-sky-50 text-slate-700 hover:text-sky-800 flex items-center gap-2 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Incident Audit Trail (CSV)</span>
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-3 py-2 text-left hover:bg-sky-50 text-slate-700 hover:text-sky-800 flex items-center gap-2 transition-colors border-t border-slate-100"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Executive Audit Package (JSON)</span>
                </button>
              </div>
            )}
          </div>

          {/* Hackathon Judge 8-Stage Demo Tour Button */}
          <button
            onClick={() => setIsTourModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-sm shadow-sky-500/25 transition-all"
            title="Launch 8-Stage Hackathon Demo Tour for Judges"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Judge Tour (8 Stages)</span>
          </button>

          {/* Live Crisis Demo Button */}
          <button
            onClick={() => setIsCrisisModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-sm shadow-rose-500/25 transition-all"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{t('crisisDemo')}</span>
          </button>

          {/* Simulation Mode Indicator Pill */}
          <button
            onClick={() => toggleLeakSimulation('zone-south')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              isSimulationMode
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isSimulationMode ? 'Simulating Leak' : 'Simulation Mode'}</span>
          </button>

          {/* Quick Refresh Telemetry Button */}
          <button
            onClick={refreshTelemetry}
            disabled={isRefreshing}
            title={`Last refreshed at ${lastRefreshedAt}`}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/80 shadow-sm transition-all flex items-center gap-1 text-xs"
          >
            <RefreshCw
              className={`w-4 h-4 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/80 shadow-sm transition-all"
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* User Profile Section */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 shadow-sm transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                RY
              </div>
              <div className="hidden lg:block text-left text-xs leading-tight">
                <span className="font-bold text-slate-900 block">Eng. Rishabh Yadav</span>
                <span className="text-[10px] text-slate-500">Chief Water Engineer</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Popup */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white shadow-glass-md p-2 z-30 text-xs">
                <div className="p-2.5 border-b border-slate-100">
                  <span className="font-bold text-slate-900 block">Rishabh Yadav</span>
                  <span className="text-slate-500 text-[11px]">rishabh@jalrakshak.gov.in</span>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-semibold">
                    Metro Water Grid Control
                  </span>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    System Preferences
                  </button>
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    Audit & Incident Logs
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Crisis Simulation Walkthrough Modal */}
      <CrisisDemoModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
        onNavigateToTwin={() => onChangeView && onChangeView('dashboard')}
      />

      {/* Official 8-Stage Hackathon Demo Tour for Judges */}
      <HackathonDemoTourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        onNavigate={onChangeView}
      />
    </header>
  );
}
