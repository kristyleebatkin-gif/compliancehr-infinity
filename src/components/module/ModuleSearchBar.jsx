import React, { useId } from 'react';
import { Search, X } from 'lucide-react';

export default function ModuleSearchBar({ value, onChange, placeholder = 'Search this module…', label = 'Search this module' }) {
  const inputId = useId();
  return (
    <div className="relative min-w-0">
      <label htmlFor={inputId} className="sr-only">{label}</label>
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A00D6]" />
      <input
        id={inputId}
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[44px] w-full rounded-xl border border-[#C084FC] bg-white py-2 pl-10 pr-12 text-base text-[#0A2B6D] outline-none transition-colors placeholder:text-[#5A00D6] focus:border-[#0072FF] focus:ring-2 focus:ring-[#0072FF] focus:ring-offset-2 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          aria-label={`Clear ${label.toLowerCase()}`}
          onClick={() => { onChange(''); document.getElementById(inputId)?.focus(); }}
          className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-[#5A00D6] hover:bg-[#F6F0FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072FF]"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}