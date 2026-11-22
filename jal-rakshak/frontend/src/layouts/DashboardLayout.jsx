import React, { useState } from 'react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardTopNav from '../components/dashboard/DashboardTopNav';
import NotificationDrawer from '../components/dashboard/NotificationDrawer';

/**
 * DashboardLayout
 * Executive layout with responsive left sidebar, frosted top navigation bar, and slide-in notifications.
 */
export default function DashboardLayout({
  children,
  activeNav,
  onSelectNav,
  activeView,
  onChangeView,
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f0f9ff]/70 to-[#e0f2fe]/40 text-slate-900 relative">
      {/* WCAG 2.4.1 Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-sky-600 focus:text-white focus:font-bold focus:text-xs focus:rounded-xl focus:shadow-xl focus:ring-2 focus:ring-white focus:outline-none transition-all"
      >
        Skip to main content
      </a>

      {/* Subtle ambient lighting glows */}
      <div className="pointer-events-none fixed -top-40 -right-40 w-96 h-96 bg-sky-200/35 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none fixed top-1/2 -left-40 w-96 h-96 bg-blue-100/35 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none fixed -bottom-40 right-1/4 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl z-0" />

      {/* Left Sidebar */}
      <DashboardSidebar
        activeNav={activeNav}
        onSelectNav={onSelectNav}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Top Navbar */}
      <DashboardTopNav
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        activeView={activeView}
        onChangeView={onChangeView}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Slide-over Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Main Workspace */}
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className={`relative z-10 pt-20 px-4 sm:px-6 lg:px-8 pb-16 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-0 md:ml-64'
        }`}
      >
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
