import React from 'react';

/**
 * PageContainer
 * Responsive page container with light glassmorphism backdrop, subtle ambient cyan/blue glows,
 * and smart-city water intelligence aesthetics.
 */
export default function PageContainer({
  children,
  className = '',
  maxWidth = '7xl', // '5xl' | '6xl' | '7xl' | 'full'
  header,
}) {
  const maxWStyles = {
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f0f9ff]/70 to-[#e0f2fe]/40 text-slate-900 relative overflow-x-hidden">
      {/* Subtle ambient light glows */}
      <div className="pointer-events-none fixed -top-40 -right-40 w-96 h-96 bg-sky-200/35 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 -left-40 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 right-1/4 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl" />

      {/* Header if provided */}
      {header}

      {/* Main Container */}
      <main className={`relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 ${maxWStyles[maxWidth] || maxWStyles['7xl']} ${className}`}>
        {children}
      </main>
    </div>
  );
}
