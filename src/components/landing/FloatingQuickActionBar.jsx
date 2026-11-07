import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot, Calendar, ClipboardCheck, Activity, ArrowUp,
} from 'lucide-react';
import InlineAiQuickAskPopup from '@/components/assistant/InlineAiQuickAskPopup';

export default function FloatingQuickActionBar({ onBookDemo, inline = false }) {
  const [aiPopupOpen, setAiPopupOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!inline) {
    return null;
  }

  return (
    <div
      aria-label="AI Quick Action Bar"
      className="relative flex w-full flex-col items-center justify-center bg-black px-3 pb-1.5"
    >
      <div
        className="rounded-full p-[1.5px] shadow-md"
        style={{
          background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
        }}
      >
        <div
          className="flex flex-wrap items-center justify-center gap-1.5 rounded-full bg-black px-2.5 py-1 text-white"
        >
          {/* Primary Action 1: Inline AI Quick-Ask Popup Toggle */}
          <button
            type="button"
            onClick={() => setAiPopupOpen((v) => !v)}
            aria-expanded={aiPopupOpen}
            className="inline-flex h-[22px] items-center gap-1 rounded-full px-2.5 text-[10px] font-extrabold text-white shadow-2xs transition hover:opacity-95"
            style={{
              background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
            }}
          >
            <Bot className="h-3 w-3 text-white shrink-0" />
            <span>{aiPopupOpen ? 'Close AI Ask' : 'AI Quick Ask'}</span>
          </button>

          {/* Primary Action 2: Book Executive Demo */}
          <button
            type="button"
            onClick={() => onBookDemo && onBookDemo('Executive Platform Demo')}
            className="inline-flex h-[22px] items-center gap-1 rounded-full border border-[#00C6FF]/50 bg-[#081018] px-2.5 text-[10px] font-extrabold text-white transition hover:border-[#00C6FF]"
          >
            <Calendar className="h-3 w-3 text-[#00C6FF] shrink-0" />
            <span>Book Demo</span>
          </button>

          {/* Secondary Quick Launch: Auditor Portal */}
          <Link
            to="/auditor-portal"
            title="Open External Auditor Portal"
            className="inline-flex h-[22px] items-center gap-1 rounded-full border border-white/20 bg-[#081018] px-2.5 text-[10px] font-bold text-white transition hover:border-[#00C6FF]"
          >
            <ClipboardCheck className="h-3 w-3 text-[#00C6FF] shrink-0" />
            <span>Auditor View</span>
          </Link>

          {/* Secondary Quick Launch: 60s Frontline Express */}
          <Link
            to="/frontline-hub"
            title="Open 60-Second Frontline Express Hub"
            className="inline-flex h-[22px] items-center gap-1 rounded-full border border-white/20 bg-[#081018] px-2.5 text-[10px] font-bold text-white transition hover:border-[#A855F7]"
          >
            <Activity className="h-3 w-3 text-[#A855F7] shrink-0" />
            <span>60s Field Bar</span>
          </Link>

          {/* Scroll Back to Top */}
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            title="Scroll to top"
            className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border border-white/20 bg-[#081018] text-white transition hover:border-[#00C6FF]"
          >
            <ArrowUp className="h-3 w-3 text-[#00C6FF]" />
          </button>
        </div>
      </div>

      {aiPopupOpen && (
        <div className="absolute top-full z-50 mt-1.5">
          <InlineAiQuickAskPopup onClose={() => setAiPopupOpen(false)} />
        </div>
      )}
    </div>
  );
}