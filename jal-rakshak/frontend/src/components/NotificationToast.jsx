import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

/**
 * NotificationToast
 * Floating light frosted glass notifications with auto-dismiss and animated slide.
 */
export default function NotificationToast({
  toasts = [],
  onDismiss,
  position = 'bottom-right', // 'bottom-right' | 'top-right'
}) {
  const icons = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
    info: Info,
  };

  const styles = {
    success: {
      bg: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/80',
      icon: 'text-emerald-600',
    },
    warning: {
      bg: 'bg-amber-50/90 text-amber-800 border-amber-200/80',
      icon: 'text-amber-600',
    },
    error: {
      bg: 'bg-rose-50/90 text-rose-800 border-rose-200/80',
      icon: 'text-rose-600',
    },
    info: {
      bg: 'bg-sky-50/90 text-sky-800 border-sky-200/80',
      icon: 'text-sky-600',
    },
  };

  const posClass =
    position === 'top-right'
      ? 'top-4 right-4'
      : 'bottom-4 right-4';

  return (
    <div className={`fixed ${posClass} z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none`}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const type = toast.type || 'info';
          const Icon = icons[type] || Info;
          const currentStyle = styles[type] || styles.info;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className={`pointer-events-auto p-4 rounded-2xl backdrop-blur-xl border shadow-glass-md flex items-start gap-3 ${currentStyle.bg}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${currentStyle.icon}`} />
              <div className="flex-1 pr-1">
                {toast.title && (
                  <h4 className="text-xs font-bold tracking-tight mb-0.5">
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs leading-relaxed opacity-90">
                  {toast.message}
                </p>
              </div>
              {onDismiss && (
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
                  aria-label="Dismiss toast"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
