import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot, SendHorizontal, Sparkles, X, Loader2, ShieldCheck, CalendarClock, ReceiptText, ArrowUpRight,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const QUICK_AGENTS = [
  { id: 'compliance_agent', label: 'Compliance', icon: ShieldCheck },
  { id: 'personal_assistant_agent', label: 'Daily Work', icon: Sparkles },
  { id: 'roster_assistant_agent', label: 'Rostering', icon: CalendarClock },
  { id: 'receipt_finder_agent', label: 'Finance', icon: ReceiptText },
];

const QUICK_PROMPTS = [
  'Live compliance & incident snapshot',
  'NDIS 24h & 5-day reportable rules',
  'Aged Care SIRS Priority 1 vs Priority 2',
  '100-Point Worker Screening gate rules',
];

function buildRegulatoryFallback(question, liveStats) {
  const q = question.toLowerCase();
  const statsLine = liveStats
    ? `Live Register Telemetry: ${liveStats.openIncidents} open incidents · ${liveStats.expiringDocs} expiring/expired staff documents · ${liveStats.pendingTasks} pending tasks · ${liveStats.unfilledShifts} unfilled shifts.`
    : null;

  if (q.includes('24h') || q.includes('5-day') || q.includes('reportable') || q.includes('incident')) {
    return {
      title: 'NDIS Reportable Incidents Statutory Timeframes',
      body: 'Under the NDIS Quality & Safeguards Commission rules, the 6 reportable incident types (Death, Serious injury, Abuse/neglect, Unlawful sexual/physical contact, Sexual misconduct, and Unauthorised restrictive practice) must be notified within 24 hours of key personnel becoming aware (except Unauthorised restrictive practice where there is no immediate harm, which requires notification within 5 business days), followed by the mandatory 5-business-day follow-up report.',
      statsLine,
      actionLabel: 'Open Incident Clinic',
      actionPath: '/incidents',
    };
  }

  if (q.includes('sirs') || q.includes('aged care') || q.includes('priority 1') || q.includes('priority 2')) {
    return {
      title: 'Strengthened Aged Care Standards & SIRS Rules',
      body: 'Under the Aged Care Act 2024 (7 Strengthened Quality Standards), Priority 1 SIRS incidents (unlawful sexual contact, unreasonable use of force, unexpected death, or serious injury/medical treatment) must be reported to the Commission within 24 hours. Priority 2 SIRS incidents must be reported within 30 calendar days.',
      statsLine,
      actionLabel: 'Open Compliance Hub',
      actionPath: '/compliance',
    };
  }

  if (q.includes('screening') || q.includes('roster') || q.includes('clearance') || q.includes('shift')) {
    return {
      title: 'NDIS Worker Screening & Roster Guardrail',
      body: 'Every risk-assessed role requires a verified NDIS Worker Screening Clearance before shift allocation. If an employee receives an interim bar, suspension, or expiry, the Rostering Guardrail flags the worker immediately and blocks unverified assignment.',
      statsLine,
      actionLabel: 'Open Smart Rostering',
      actionPath: '/rostering',
    };
  }

  return {
    title: 'ComplianceHR Infinity AI Copilot Summary',
    body: 'ComplianceHR Infinity connects 46 enterprise modules, 45 self-maintaining master registers, and 356 NDIS & Aged Care checkpoints into a single audit-ready operating system.',
    statsLine,
    actionLabel: 'Open Full AI Assistant',
    actionPath: '/assistant',
  };
}

export default function InlineAiQuickAskPopup({ onClose }) {
  const [selectedAgent, setSelectedAgent] = useState('compliance_agent');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    {
      role: 'assistant',
      title: 'AI Copilot Ready',
      body: 'Ask about live compliance telemetry, NDIS 24h/5d incident rules, Aged Care SIRS, worker screening, or any module.',
      actionLabel: 'Open Full AI Hub',
      actionPath: '/assistant',
    },
  ]);

  const askQuestion = async (rawText) => {
    const text = (rawText ?? question).trim();
    if (!text || loading) return;
    setQuestion('');
    setHistory((prev) => [...prev, { role: 'user', body: text }]);
    setLoading(true);

    try {
      let liveStats = null;
      const isAuthed = await base44.auth.isAuthenticated().catch(() => false);

      if (isAuthed) {
        const [openIncidents, expiringDocs, pendingTasks, unfilledShifts] = await Promise.all([
          base44.entities.Incident.count({ status: { $nin: ['Resolved', 'Closed'] } }).catch(() => 0),
          base44.entities.EmployeeDocument.count({ status: { $in: ['Expired', 'Expiring Soon'] } }).catch(() => 0),
          base44.entities.TodoTask.count({ status: { $in: ['Pending', 'Overdue', 'In Progress'] } }).catch(() => 0),
          base44.entities.Shift.count({ employee_name: null }).catch(() => 0),
        ]);
        liveStats = { openIncidents, expiringDocs, pendingTasks, unfilledShifts };
      }

      const answer = buildRegulatoryFallback(text, liveStats);
      setHistory((prev) => [...prev, { role: 'assistant', ...answer }]);
    } catch {
      const fallback = buildRegulatoryFallback(text, null);
      setHistory((prev) => [...prev, { role: 'assistant', ...fallback }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Inline AI Quick-Ask Assistant"
      className="w-[340px] sm:w-[380px] overflow-hidden rounded-2xl p-[2px] shadow-2xl"
      style={{
        background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 35%, #5A00D6 70%, #FF2E9A 100%)',
      }}
    >
      <div className="rounded-[14px] bg-white text-[#0A2B6D]">
        {/* Header */}
        <div
          className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-white"
          style={{
            background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0072FF]/30 border border-[#00C6FF]/40">
              <Bot className="h-4 w-4 text-[#00C6FF]" />
            </span>
            <div>
              <div className="text-xs font-extrabold tracking-tight text-white">
                AI Copilot Quick-Ask
              </div>
              <div className="text-[10px] font-semibold text-[#00C6FF]">
                Live Register Telemetry &amp; NDIS/SIRS Rules
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link
              to="/assistant"
              className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-bold text-white hover:bg-white/20"
            >
              <span>Full Hub</span>
              <ArrowUpRight className="h-3 w-3 text-[#00C6FF]" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close AI Quick-Ask popup"
              className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-white/80 hover:bg-white/15 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Agent Mode Selector */}
        <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-2.5 py-1.5">
          {QUICK_AGENTS.map((ag) => {
            const Icon = ag.icon;
            const active = selectedAgent === ag.id;
            return (
              <button
                key={ag.id}
                type="button"
                onClick={() => setSelectedAgent(ag.id)}
                className={`inline-flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1 text-[10px] font-extrabold transition ${
                  active
                    ? 'bg-[#0A2B6D] text-white shadow-2xs'
                    : 'text-[#0A2B6D]/75 hover:bg-white hover:text-[#0072FF]'
                }`}
              >
                <Icon className="h-3 w-3 shrink-0" />
                <span className="truncate">{ag.label}</span>
              </button>
            );
          })}
        </div>

        {/* Conversation Feed */}
        <div className="max-h-60 space-y-2.5 overflow-y-auto p-3 text-xs">
          {history.map((msg, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-2.5 ${
                msg.role === 'user'
                  ? 'ml-6 bg-[#0A2B6D] text-white font-semibold'
                  : 'mr-2 border border-sky-200 bg-[#F8FAFC] text-[#0A2B6D]'
              }`}
            >
              {msg.title && (
                <div className="mb-1 text-xs font-extrabold text-[#0072FF]">
                  {msg.title}
                </div>
              )}
              <p className="leading-relaxed">{msg.body}</p>
              {msg.statsLine && (
                <div className="mt-2 rounded-lg border border-sky-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#0A2B6D]">
                  {msg.statsLine}
                </div>
              )}
              {msg.actionPath && (
                <div className="mt-2">
                  <Link
                    to={msg.actionPath}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 rounded-md bg-[#0072FF] px-2.5 py-1 text-[10px] font-extrabold text-white hover:bg-[#0A2B6D]"
                  >
                    <span>{msg.actionLabel || 'Open Workspace'}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-[#0A2B6D]">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0072FF]" />
              <span>Checking live registers &amp; regulatory rules…</span>
            </div>
          )}
        </div>

        {/* Quick Prompt Chips */}
        <div className="flex flex-wrap gap-1 border-t border-slate-100 bg-slate-50/70 px-3 py-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => askQuestion(prompt)}
              className="rounded-full border border-sky-200 bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#0A2B6D] transition hover:border-[#0072FF] hover:bg-[#F0F7FF]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            askQuestion();
          }}
          className="flex items-center gap-1.5 border-t border-slate-200 bg-white p-2.5"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask AI Copilot anything…"
            className="h-9 min-w-0 flex-1 rounded-xl border border-slate-200 bg-[#F8FAFC] px-3 text-xs font-semibold text-[#0A2B6D] placeholder:text-slate-400 focus:border-[#0072FF] focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            aria-label="Send quick question"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition disabled:opacity-40"
            style={{
              background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
            }}
          >
            <SendHorizontal className="h-4 w-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}