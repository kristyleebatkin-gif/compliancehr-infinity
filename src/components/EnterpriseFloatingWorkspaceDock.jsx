import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot, ClipboardCheck, Activity, ShieldCheck, ArrowUp,
} from 'lucide-react';
import InlineAiQuickAskPopup from '@/components/assistant/InlineAiQuickAskPopup';

export default function EnterpriseFloatingWorkspaceDock({ inline = false }) {
  const [aiPopupOpen, setAiPopupOpen] = useState(false);

  const scrollToTop = () => {
    const mainEl = document.getElementById('main-workspace-content');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!inline) {
    return null;
  }

  return (
    <div
      aria-label="Workspace AI Quick-Action Bar"
      className="relative flex flex-col items-center justify-center"
    >
      <div
        className="rounded-full p-[1.5px] shadow-[0_0_12px_rgba(0,198,255,0.45)]"
        style={{
          background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
        }}
      >
        <div className="flex flex-nowrap items-center justify-center gap-1 rounded-full bg-black px-1.5 py-0.5 text-white whitespace-nowrap">
          <button
            type="button"
            onClick={() => setAiPopupOpen((v) => !v)}
            aria-expanded={aiPopupOpen}
            className="inline-flex h-[19px] items-center gap-1 rounded-full px-2 text-[9px] font-extrabold text-white shadow-2xs transition hover:opacity-95 whitespace-nowrap"
            style={{
              background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
            }}
          >
            <Bot className="h-2.5 w-2.5 text-[#00C6FF] shrink-0" />
            <span>{aiPopupOpen ? 'Close AI Ask' : 'AI Quick Ask'}</span>
          </button>

          <Link
            to="/frontline-hub"
            className="inline-flex h-[19px] items-center gap-1 rounded-full border border-[#A855F7] bg-[#5A00D6] px-2 text-[9px] font-extrabold text-white transition hover:opacity-90 whitespace-nowrap"
          >
            <Activity className="h-2.5 w-2.5 text-[#00C6FF] shrink-0" />
            <span>60s Field Bar</span>
          </Link>

          <Link
            to="/auditor-portal"
            className="inline-flex h-[19px] items-center gap-1 rounded-full border border-[#00C6FF] bg-[#0072FF] px-2 text-[9px] font-extrabold text-white transition hover:opacity-90 whitespace-nowrap"
          >
            <ClipboardCheck className="h-2.5 w-2.5 text-white shrink-0" />
            <span>Auditor View</span>
          </Link>

          <Link
            to="/compliance"
            className="inline-flex h-[19px] items-center gap-1 rounded-full border border-white/30 bg-[#FF2E9A] px-2 text-[9px] font-extrabold text-white transition hover:opacity-90 whitespace-nowrap"
          >
            <ShieldCheck className="h-2.5 w-2.5 text-white shrink-0" />
            <span>Audit Ready</span>
          </Link>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            title="Scroll to top"
            className="inline-flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border border-white/30 bg-[#00C6FF] text-black transition hover:opacity-90"
          >
            <ArrowUp className="h-2.5 w-2.5 text-black" />
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