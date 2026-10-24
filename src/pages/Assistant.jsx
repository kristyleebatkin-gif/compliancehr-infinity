import React, { useState } from 'react';
import ModuleShell from '@/components/module/ModuleShell';
import AssistantChat from '@/components/assistant/AssistantChat';
import { ShieldCheck, Sparkles, ReceiptText, CalendarClock, Bot, CheckCircle2, ClipboardList, Wallet, Users2 } from 'lucide-react';
import AssistantHints from '@/components/assistant/AssistantHints';
import AdvancedIntelligenceAndToolsSuite from '@/components/operations/AdvancedIntelligenceAndToolsSuite';

const AGENTS = [
  {
    name: 'compliance_agent', label: 'Compliance Agent', tagline: 'Audits, policies, incidents, certificates and NDIS readiness, answered from live app data.', icon: ShieldCheck, from: '#6366f1', to: '#8b5cf6',
    suggestions: [
      'How many open incidents are there currently?',
      'What are our top-rated risks right now?',
      'Which investigations are still in progress?',
      "Who hasn't completed their mandatory training?",
      'Which certificates are expiring soon?',
      'Are all policies up to date?',
      'What NDIS deadlines are coming up next?',
      'When was the last internal audit completed?',
      'Which improvement actions are overdue?',
      'What were recent participant review outcomes?',
      'How many complaints are currently unresolved?',
      'What feedback trends have emerged recently?',
      'What was recently logged in audit trails?',
      'Which KPIs are currently missing targets?',
      'Which assets are due for maintenance or review?',
    ],
  },
  {
    name: 'personal_assistant_agent', label: 'Personal Assistant', tagline: 'Everyday help: tasks, notes, reminders and quick answers.', icon: Sparkles, from: '#06b6d4', to: '#3b82f6',
    suggestions: [
      'What tasks are currently assigned to me?',
      'What notifications need my attention?',
      'What compliance gaps need addressing first?',
      'How do I onboard a new employee?',
      'What NDIS obligations apply here?',
      'Are our employment contracts up to date?',
      'Is our privacy policy compliant?',
      'What WHS hazards need reviewing?',
      'What documents should I upload?',
      'Which staff training is overdue?',
      'How do I prepare for an audit?',
      'How do I report a workplace incident?',
      'Do we have valid participant consents?',
      'Which approvals are still pending?',
      'What review dates are coming up?',
    ],
  },
  {
    name: 'receipt_finder_agent', label: 'Receipt Finder', tagline: 'Locate receipts, reconcile expenses and track purchases.', icon: ReceiptText, from: '#10b981', to: '#14b8a6',
    suggestions: [
      'What receipts came from a specific supplier?',
      'Which receipts were entered on a certain date?',
      'Can you find receipts by entered employee name?',
      'How do I locate receipts for a participant?',
      'Can you search receipts by exact or approximate amount?',
      'What receipt matches this receipt number?',
      'Can you find a receipt by transaction reference?',
      "What is a receipt's current reconciliation status?",
    ],
  },
  {
    name: 'roster_assistant_agent', label: 'Roster Assistant', tagline: 'Shift coverage, roster gaps and rostering questions.', icon: CalendarClock, from: '#f59e0b', to: '#f97316',
    suggestions: [
      'How many shifts are unassigned this week?',
      'Which shift details have no matching shift?',
      'Which teams have coverage gaps this week?',
      'Which shifts lack participant shift details?',
      'Is any participant double-booked on any shift?',
      'Which shift details are missing required instructions?',
      "Can you copy last week's roster forward?",
      "Which participant details don't match any shift?",
      'Which shifts have no participant assigned?',
      'How many participants are on each roster team?',
    ],
  },
];

export default function Assistant() {
  const [agent, setAgent] = useState(null);

  if (agent) return <AssistantChat agent={agent} onBack={() => setAgent(null)} />;

  return (
    <div className="compact-module space-y-2">
      <ModuleShell
        title="AI Assistant"
        subtitle="One home for all four AI assistants. Each one reads your live app data to answer, check and summarise."
        icon={Bot}
        moduleKey="assistant"
      />
      <AdvancedIntelligenceAndToolsSuite />
      <AssistantHints />
      <div className="grid gap-2 sm:grid-cols-2">
        {AGENTS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.name}
              onClick={() => setAgent(a)}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-2.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-35" style={{ backgroundColor: a.to }} />
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-md" style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground">{a.label}</div>
                  <div className="mt-0.5 text-[11px] leading-4 text-foreground/55">{a.tagline}</div>
                  <div className="mt-1 text-[11px] font-bold text-foreground">Start chatting →</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* What the assistants can complete */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 p-4 text-white">
          <p className="flex items-center gap-2 text-sm font-bold"><ClipboardList className="h-4 w-4" />What the AI assistants can complete for you</p>
          <p className="mt-0.5 text-xs opacity-90">Every assistant reads your live app data, so answers are always based on real registers.</p>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          {[
            { icon: ShieldCheck, tone: 'text-indigo-600', title: 'Compliance & governance', items: ['Summarise audits, policies, incidents and investigations', 'List certificates, screenings and policies expiring soon', 'Track NDIS deadlines, KPIs and improvement actions', 'Check audit trails, consents and complaint status'] },
            { icon: Sparkles, tone: 'text-cyan-600', title: 'Your daily work', items: ['Show your allocated tasks and what is overdue', 'Draft notes, updates, letters and sign-offs', 'Write polite reminders and follow-up messages', 'Explain policies, checklists and how a process works'] },
            { icon: Wallet, tone: 'text-emerald-600', title: 'Finance & receipts', items: ['Find receipts by supplier, date, employee or amount', 'Check reconciliation status and match transactions', 'Locate receipts for a participant or receipt number'] },
            { icon: Users2, tone: 'text-amber-600', title: 'Rostering & shifts', items: ['Find unassigned shifts and coverage gaps this week', 'Spot double-booked participants and missing details', "Check whether last week's roster can copy forward"] },
          ].map((g) => (
            <div key={g.title} className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <p className={`flex items-center gap-1.5 text-xs font-bold ${g.tone}`}><g.icon className="h-3.5 w-3.5" />{g.title}</p>
              <ul className="mt-1 space-y-1">
                {g.items.map((x) => <li key={x} className="flex items-start gap-1.5 text-[11px] leading-4 text-foreground/75"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-brand" />{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}