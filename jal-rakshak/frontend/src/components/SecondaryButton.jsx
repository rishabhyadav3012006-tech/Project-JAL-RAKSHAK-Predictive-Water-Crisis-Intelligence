import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * SecondaryButton
 * Light frosted glass secondary button with slate-700 typography and subtle hover elevation.
 */
export default function SecondaryButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  size = 'md', // 'sm' | 'md' | 'lg'
  variant = 'glass', // 'glass' | 'white' | 'subtle'
  className = '',
  type = 'button',
  ...props
}) {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm font-semibold rounded-xl gap-2',
    lg: 'px-6 py-2.5 text-base font-semibold rounded-xl gap-2.5',
  };

  const variantStyles = {
    glass: 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300 backdrop-blur-md shadow-sm hover:shadow-glass-sm',
    white: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm hover:shadow',
    subtle: 'bg-transparent hover:bg-sky-50/70 text-slate-600 hover:text-sky-700 border border-transparent hover:border-sky-100',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-500 shrink-0" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </motion.button>
  );
}
