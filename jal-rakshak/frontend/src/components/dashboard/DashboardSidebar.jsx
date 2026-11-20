import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Radio,
  Gauge,
  TrendingUp,
  Droplets,
  Bell,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronRight,
  Database,
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

/**
 * DashboardSidebar
 * Left navigation bar for JAL-RAKSHAK platform.
 */
export default function DashboardSidebar({ activeNav, onSelectNav, isCollapsed, onToggleCollapse }) {
  const { alerts, language, t } = useTelemetry();
  const unackCount = alerts?.filter((a) => !a.acknowledged).length || 0;

  const navItems = [
    { id: 'overview', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'digital-twin', label: t('digitalTwin'), icon: Cpu, badge: 'Live Twin' },
    { id: 'live-sensors', label: t('liveSensors'), icon: Radio, count: '17' },
    { id: 'sensor-fusion', label: t('sensorFusion'), icon: Database, badge: 'Fusion' },
    { id: 'leakage', label: t('leakageIntelligence'), icon: Gauge, badge: 'AI' },
    { id: 'demand', label: t('demandForecasting'), icon: TrendingUp },
    { id: 'availability', label: t('waterAvailability'), icon: Droplets },
    { id: 'alerts', label: language === 'hi' ? 'अलर्ट्स व घटनाएं' : 'Alerts & Incidents', icon: Bell, alertCount: unackCount },
    { id: 'analytics', label: t('analytics'), icon: BarChart3 },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 bg-white/80 backdrop-blur-2xl border-r border-sky-100/90 shadow-glass-sm flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-5 border-b border-sky-100/80 gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-600 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/25 shrink-0">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="font-extrabold text-base text-slate-900 tracking-tight block">
                {t('appTitle')}
              </span>
              <span className="text-[10px] uppercase font-bold text-sky-700 tracking-wider">
                {language === 'hi' ? 'स्मार्ट जल ग्रिड' : 'Water Command Centre'}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Item List */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectNav(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-sky-50 text-sky-800 border border-sky-200/80 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-sky-600' : 'text-slate-400'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-sky-100 text-sky-700">
                        {item.badge}
                      </span>
                    )}
                    {item.count && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                        {item.count}
                      </span>
                    )}
                    {item.alertCount && (
                      <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {item.alertCount}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status & User summary */}
      <div className="p-3 border-t border-sky-100/80">
        {!isCollapsed ? (
          <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Telemetry Link
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Simulation Grid</span>
              <span className="font-mono font-bold text-slate-800">City Alpha</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}
