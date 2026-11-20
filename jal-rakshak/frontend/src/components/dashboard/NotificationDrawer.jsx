import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { StatusBadge } from '../index';

/**
 * NotificationDrawer
 * Slide-over frosted glass notification panel for active network incidents.
 */
export default function NotificationDrawer({ isOpen, onClose }) {
  const { alerts, acknowledgeAlert } = useTelemetry();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm"
          />

          {/* Drawer Card */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white/95 backdrop-blur-3xl border-l border-white shadow-2xl h-full flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-5 border-b border-sky-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Incidents & Notifications
                  </h3>
                  <p className="text-xs text-slate-500">
                    {alerts.filter((a) => !a.acknowledged).length} unacknowledged events
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No active incidents or alarms.
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-2xl border transition-all text-xs ${
                      alert.acknowledged
                        ? 'bg-slate-50/70 border-slate-200/60 opacity-60'
                        : alert.severity === 'critical'
                        ? 'bg-rose-50/80 border-rose-200'
                        : 'bg-amber-50/80 border-amber-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-bold text-slate-900">
                        {alert.title}
                      </h4>
                      <StatusBadge
                        status={alert.severity}
                        label={alert.severity.toUpperCase()}
                        size="sm"
                      />
                    </div>
                    <p className="text-slate-600 mb-2 leading-relaxed">
                      {alert.details}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>{alert.timestamp}</span>
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="font-semibold text-sky-600 hover:text-sky-800"
                        >
                          Mark Acknowledged
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-sky-100 bg-slate-50/50 text-center">
              <span className="text-[11px] text-slate-400">
                Connected to MQTT Incident Dispatch Broker
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
