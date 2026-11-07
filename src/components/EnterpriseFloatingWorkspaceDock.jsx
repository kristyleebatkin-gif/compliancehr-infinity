import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot, ClipboardCheck, Activity, ShieldCheck,
} from 'lucide-react';
import InlineAiQuickAskPopup from '@/components/assistant/InlineAiQuickAskPopup';

export default function EnterpriseFloatingWorkspaceDock({ inline = false }) {
  const [aiPopupOpen, setAiPopupOpen] = useState(false);

  if (!inline) {
    return null;
  }

  return (
    <div
      aria-label="Workspace AI Quick-Action Bar"
      className="relative flex w-full flex-col items-center justify-center bg-black px-3 pb-1.5"
    >
      <div
        className="rounded-full p-[1.5px] shadow-md"
        style={{
          background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
        }}
      >
        <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-full bg-black px-2.5 py-1 text-white">
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

          <Link
            to="/frontline-hub"
            className="inline-flex h-[22px] items-center gap-1 rounded-full border border-white/20 bg-[#081018] px-2.5 text-[10px] font-bold text-white transition hover:border-[#A855F7]"
          >
            <Activity className="h-3 w-3 text-[#A855F7] shrink-0" />
            <span>60s Field Bar</span>
          </Link>

          <Link
            to="/auditor-portal"
            className="inline-flex h-[22px] items-center gap-1 rounded-full border border-white/20 bg-[#081018] px-2.5 text-[10px] font-bold text-white transition hover:border-[#00C6FF]"
          >
            <ClipboardCheck className="h-3 w-3 text-[#00C6FF] shrink-0" />
            <span>Auditor View</span>
          </Link>

          <Link
            to="/compliance"
            className="inline-flex h-[22px] items-center gap-1 rounded-full border border-white/20 bg-[#081018] px-2.5 text-[10px] font-bold text-white transition hover:border-[#FF2E9A]"
          >
            <ShieldCheck className="h-3 w-3 text-[#FF2E9A] shrink-0" />
            <span>Audit Ready</span>
          </Link>
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