import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchBar
 * Frosted light glass search input with icon, clear button, and focus ring.
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search telemetry, sensors, nodes...',
  onClear,
  shortcut = '⌘K',
  className = '',
  autoFocus = false,
  ...props
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full pl-10 pr-16 py-2 text-sm bg-white/80 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200/90 rounded-xl shadow-sm backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400"
        {...props}
      />
      <div className="absolute right-3 flex items-center gap-1.5">
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {shortcut && (
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
            {shortcut}
          </kbd>
        )}
      </div>
    </div>
  );
}
