import React from 'react';
import { motion } from 'framer-motion';

/**
 * GlassCard
 * Frosted translucent glass surface with light refraction border and soft layered shadow.
 */
export default function GlassCard({
  children,
  className = '',
  hoverable = false,
  variant = 'default', // 'default' | 'frosted' | 'elevated' | 'subtle' | 'tinted'
  onClick,
  ...props
}) {
  const variantStyles = {
    default: 'bg-white/75 backdrop-blur-xl border border-white/80 shadow-glass-sm',
    frosted: 'bg-white/85 backdrop-blur-2xl border border-white/90 shadow-glass-md',
    elevated: 'bg-white/90 backdrop-blur-2xl border border-white shadow-glass-lg',
    subtle: 'bg-white/60 backdrop-blur-lg border border-white/60 shadow-sm',
    tinted: 'bg-gradient-to-br from-white/90 via-sky-50/50 to-blue-50/40 backdrop-blur-xl border border-sky-100/70 shadow-glass-sm',
  };

  const Component = hoverable ? motion.div : 'div';
  const motionProps = hoverable
    ? {
        whileHover: { y: -3, transition: { duration: 0.25, ease: 'easeOut' } },
        whileTap: { y: 0 },
      }
    : {};

  return (
    <Component
      onClick={onClick}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${variantStyles[variant] || variantStyles.default} ${
        hoverable ? 'cursor-pointer hover:shadow-glass-md hover:border-sky-200/80' : ''
      } ${className}`}
      {...motionProps}
      {...props}
    >
      {/* Subtle top light reflection highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90 pointer-events-none" />
      {children}
    </Component>
  );
}
