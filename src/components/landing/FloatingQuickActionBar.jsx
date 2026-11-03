import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot, Calendar, ClipboardCheck, Activity, ArrowUp, ChevronDown, ChevronUp, Sparkles,
} from 'lucide-react';
import InlineAiQuickAskPopup from '@/components/assistant/InlineAiQuickAskPopup';

export default function FloatingQuickActionBar({ onBookDemo }) {
  const [collapsed, setCollapsed] = useState(false);
  const [aiPopupOpen, setAiPopupOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside
      aria-label="Floating Enterprise Quick-Action Bar"
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
    >
      {aiPopupOpen && !collapsed && (
        <InlineAiQuickAskPopup onClose={() => setAiPopupOpen(false)} />
      )}

      {!collapsed && (
        <div
          className="rounded-2xl p-[2px] shadow-2xl"
          style={{
            background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
          }}
        >
          <div
            className="flex flex-wrap items-center gap-1.5 rounded-[14px] px-2.5 py-2 text-white"
            style={{
              background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
            }}
          >
            {/* Primary Action 1: Inline AI Quick-Ask Popup Toggle */}
            <button
              type="button"
              onClick={() => setAiPopupOpen((v) => !v)}
              aria-expanded={aiPopupOpen}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold text-white shadow-sm transition hover:opacity-95"
              style={{
                background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
              }}
            >
              <Bot className="h-4 w-4 text-white shrink-0" />
              <span>{aiPopupOpen ? 'Close AI Ask' : 'AI Quick Ask'}</span>
            </button>

            {/* Primary Action 2: Book Executive Demo */}
            <button
              type="button"
              onClick={() => onBookDemo && onBookDemo('Executive Platform Demo')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white px-3 py-2 text-xs font-extrabold text-[#0A2B6D] shadow-sm transition hover:bg-sky-50"
            >
              <Calendar className="h-3.5 w-3.5 text-[#0072FF] shrink-0" />
              <span>Book Demo</span>
            </button>

            {/* Secondary Quick Launch: Auditor Portal */}
            <Link
              to="/auditor-portal"
              title="Open External Auditor Portal"
              className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 text-xs font-bold text-white transition hover:border-[#00C6FF] hover:bg-white/20"
            >
              <ClipboardCheck className="h-3.5 w-3.5 text-[#00C6FF] shrink-0" />
              <span>Auditor View</span>
            </Link>

            {/* Secondary Quick Launch: 60s Frontline Express */}
            <Link
              to="/frontline-hub"
              title="Open 60-Second Frontline Express Hub"
              className="hidden md:inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 text-xs font-bold text-white transition hover:border-emerald-400 hover:bg-white/20"
            >
              <Activity className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>60s Field Bar</span>
            </Link>

            {/* Scroll Back to Top */}
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll to top"
              title="Scroll to top"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:border-[#00C6FF] hover:bg-white/20"
            >
              <ArrowUp className="h-3.5 w-3.5 text-[#00C6FF]" />
            </button>

            {/* Minimise Dock */}
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Minimise quick-action bar"
              title="Minimise quick-action bar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Expand quick-action bar"
          className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-4 py-2.5 text-xs font-extrabold text-white shadow-2xl transition hover:scale-105"
          style={{
            background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
          }}
        >
          <Sparkles className="h-4 w-4 text-white" />
          <span>AI &amp; Demo Dock</span>
          <ChevronUp className="h-3.5 w-3.5 text-white" />
        </button>
      )}
    </aside>
  );
}