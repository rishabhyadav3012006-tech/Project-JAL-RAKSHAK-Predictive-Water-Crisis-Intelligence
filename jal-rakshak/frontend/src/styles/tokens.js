/**
 * JAL-RAKSHAK Design Tokens
 * Light-Themed Glassmorphism System for Smart-City Water Intelligence SaaS
 */

export const tokens = {
  colors: {
    // Ambient Backgrounds
    background: {
      primary: '#f8fafc',
      secondary: '#f0f9ff',
      tertiary: '#e0f2fe',
      gradient: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #e0f2fe 100%)',
      subtleMesh: 'radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.1) 0px, transparent 50%)',
    },
    // Glass Surfaces
    glass: {
      standard: 'rgba(255, 255, 255, 0.75)',
      frosted: 'rgba(255, 255, 255, 0.85)',
      elevated: 'rgba(255, 255, 255, 0.92)',
      subtle: 'rgba(255, 255, 255, 0.60)',
      tinted: 'rgba(240, 249, 255, 0.75)',
      border: 'rgba(255, 255, 255, 0.8)',
      borderSubtle: 'rgba(224, 242, 254, 0.6)',
      borderActive: 'rgba(56, 189, 248, 0.5)',
    },
    // Water Brand Palettes
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      gradientPrimary: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      gradientCyan: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
      gradientDeep: 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)',
    },
    // Text Hierarchy (Optimized for light glass surfaces)
    text: {
      primary: '#0f172a',    // slate-900
      secondary: '#334155',  // slate-700
      muted: '#64748b',      // slate-500
      subtle: '#94a3b8',     // slate-400
      inverse: '#ffffff',
    },
    // Telemetry Statuses
    status: {
      normal: {
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.25)',
        text: '#047857',
        dot: '#10b981',
      },
      warning: {
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.25)',
        text: '#b45309',
        dot: '#f59e0b',
      },
      critical: {
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.25)',
        text: '#b91c1c',
        dot: '#ef4444',
      },
      info: {
        bg: 'rgba(14, 165, 233, 0.12)',
        border: 'rgba(14, 165, 233, 0.25)',
        text: '#0284c7',
        dot: '#0ea5e9',
      },
      offline: {
        bg: 'rgba(100, 116, 139, 0.12)',
        border: 'rgba(100, 116, 139, 0.25)',
        text: '#475569',
        dot: '#64748b',
      },
    },
  },
  shadows: {
    soft: '0 4px 20px -2px rgba(14, 165, 233, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
    card: '0 10px 30px -4px rgba(15, 23, 42, 0.05), 0 4px 10px -2px rgba(14, 165, 233, 0.04)',
    elevated: '0 20px 40px -6px rgba(15, 23, 42, 0.08), 0 8px 16px -4px rgba(14, 165, 233, 0.06)',
    glow: '0 0 20px rgba(14, 165, 233, 0.25)',
    modal: '0 25px 60px -12px rgba(15, 23, 42, 0.16), 0 10px 20px -5px rgba(14, 165, 233, 0.08)',
  },
  blur: {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  },
  radii: {
    sm: 'rounded-lg',     // 8px
    md: 'rounded-xl',     // 12px
    lg: 'rounded-2xl',    // 16px
    xl: 'rounded-3xl',    // 24px
    full: 'rounded-full',
  },
  transitions: {
    smooth: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    fast: 'all 0.15s ease-out',
  },
};

export default tokens;
