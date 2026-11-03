import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot, ClipboardCheck, Activity, ShieldCheck, ChevronDown, ChevronUp, Sparkles,
} from 'lucide-react';
import InlineAiQuickAskPopup from '@/components/assistant/InlineAiQuickAskPopup';

export default function EnterpriseFloatingWorkspaceDock() {
  const [collapsed, setCollapsed] = useState(false);
  const [aiPopupOpen, setAiPopupOpen] = useState(false);

  return (
    <aside
      aria-label="Workspace Floating Quick-Action Bar"
      className="fixed bottom-16 right-4 z-40 hidden md:flex flex-col items-end gap-2 md:bottom-4"
    >
      {aiPopupOpen && !collapsed && (
        <InlineAiQuickAskPopup onClose={() => setAiPopupOpen(false)} />
      )}

      {!collapsed ? (
        <div
          className="rounded-2xl p-[2px] shadow-2xl"
          style={{
            background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
          }}
        >
          <div
            className="flex items-center gap-1.5 rounded-[14px] px-2.5 py-1.5 text-white"
            style={{
              background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
            }}
          >
            <button
              type="button"
              onClick={() => setAiPopupOpen((v) => !v)}
              aria-expanded={aiPopupOpen}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold text-white shadow-sm transition hover:opacity-95"
              style={{
                background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
              }}
            >
              <Bot className="h-3.5 w-3.5 text-white shrink-0" />
              <span>{aiPopupOpen ? 'Close AI Ask' : 'AI Quick Ask'}</span>
            </button>

            <Link
              to="/frontline-hub"
              className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-bold text-white transition hover:border-emerald-400 hover:bg-white/20"
            >
              <Activity className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>60s Field Bar</span>
            </Link>

            <Link
              to="/auditor-portal"
              className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-bold text-white transition hover:border-[#00C6FF] hover:bg-white/20"
            >
              <ClipboardCheck className="h-3.5 w-3.5 text-[#00C6FF] shrink-0" />
              <span>Auditor View</span>
            </Link>

            <Link
              to="/compliance"
              className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-bold text-white transition hover:border-[#00C6FF] hover:bg-white/20"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#00C6FF] shrink-0" />
              <span>Audit Ready</span>
            </Link>

            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Minimise workspace quick-action dock"
              title="Minimise dock"
              className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Expand workspace quick-action dock"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-white/30 px-3.5 py-2 text-xs font-extrabold text-white shadow-xl transition hover:scale-105"
          style={{
            background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
          }}
        >
          <Sparkles className="h-3.5 w-3.5 text-white" />
          <span>Quick Actions</span>
          <ChevronUp className="h-3.5 w-3.5 text-white" />
        </button>
      )}
    </aside>
  );
}