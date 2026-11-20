import React from 'react';
import { motion } from 'framer-motion';

/**
 * GlassButton
 * Pure light glassmorphic button with frosted blur and soft translucent border.
 */
export default function GlassButton({
  children,
  onClick,
  disabled = false,
  variant = 'default', // 'default' | 'tinted' | 'danger' | 'success'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  className = '',
  type = 'button',
  ...props
}) {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm font-medium rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-base font-medium rounded-xl gap-2.5',
  };

  const variantStyles = {
    default: 'bg-white/60 hover:bg-white/80 text-slate-700 hover:text-slate-900 border border-white/90 shadow-glass-sm hover:shadow-glass-md',
    tinted: 'bg-sky-50/60 hover:bg-sky-100/70 text-sky-700 hover:text-sky-900 border border-sky-200/60 shadow-glass-sm',
    danger: 'bg-rose-50/60 hover:bg-rose-100/80 text-rose-700 hover:text-rose-900 border border-rose-200/60 shadow-sm',
    success: 'bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-700 hover:text-emerald-900 border border-emerald-200/60 shadow-sm',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`inline-flex items-center justify-center backdrop-blur-md transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </motion.button>
  );
}
