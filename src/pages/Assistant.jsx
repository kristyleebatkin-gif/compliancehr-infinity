import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import AssistantChat from '@/components/assistant/AssistantChat';
import { ShieldCheck, Sparkles, ReceiptText, CalendarClock, Bot } from 'lucide-react';

const AGENTS = [
  {
    name: 'compliance_agent', label: 'Compliance Agent', tagline: 'Audits, policies, incidents, certificates and NDIS readiness, answered from live app data.', icon: ShieldCheck, from: '#6366f1', to: '#8b5cf6',
    suggestions: [
      'How many open incidents do we have?',
      'Are any NDIS deadlines overdue?',
      'Which policies need updating?',
      'What risks are currently active?',
      'Is our staff training up to date?',
      'Are any certificates expiring soon?',
      'What complaints are unresolved?',
      'Are there overdue improvement actions?',
      'What did the last audit find?',
      'Which investigations are still open?',
    ],
  },
  {
    name: 'personal_assistant_agent', label: 'Personal Assistant', tagline: 'Everyday help: tasks, notes, reminders and quick answers.', icon: Sparkles, from: '#06b6d4', to: '#3b82f6',
    suggestions: [
      'What tasks need my attention today?',
      'How do I complete this compliance task?',
      'What evidence should I upload here?',
      'When is this task due?',
      'What are my next steps?',
      'How do I review this notification?',
      'What documents are missing for compliance?',
      'Who needs to sign off on this?',
      'How do I track my pending tasks?',
      'What follow-up actions should I take?',
    ],
  },
  {
    name: 'receipt_finder_agent', label: 'Receipt Finder', tagline: 'Locate receipts, reconcile expenses and track purchases.', icon: ReceiptText, from: '#10b981', to: '#14b8a6',
    suggestions: [
      'What receipts do we have from a supplier?',
      'Which receipts were entered by a specific employee?',
      'Find receipts for a specific participant.',
      'What receipts were recorded on a date?',
      'Find receipts matching a specific amount.',
      'Look up a receipt by its number.',
      'Find receipts by transaction reference.',
      'Which receipts are unreconciled or pending?',
      'Find receipts between two dates.',
      'Find receipts near an approximate amount.',
    ],
  },
  {
    name: 'roster_assistant_agent', label: 'Roster Assistant', tagline: 'Shift coverage, roster gaps and rostering questions.', icon: CalendarClock, from: '#f59e0b', to: '#f97316',
    suggestions: [
      'Which shifts are unassigned this week?',
      'Are there any double-booked shifts?',
      'Which participants have missing shift details?',
      'What shifts lack required instructions?',
      'Which rosters have coverage gaps?',
      'Can you compare this week to last week?',
      'Which teams have unassigned roster slots?',
      'Are any participants missing from the roster?',
      'Which shifts have no participant matched?',
      'What needs fixing before publishing the roster?',
    ],
  },
];

export default function Assistant() {
  const [agent, setAgent] = useState(null);

  if (agent) return <AssistantChat agent={agent} onBack={() => setAgent(null)} />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="AI Assistant"
        subtitle="One home for all four AI assistants. Each one reads your live app data to answer, check and summarise."
        icon={Bot}
        showCompliance={false}
        showAudit={false}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {AGENTS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.name}
              onClick={() => setAgent(a)}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-35" style={{ backgroundColor: a.to }} />
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md" style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-foreground">{a.label}</div>
                  <div className="mt-1 text-sm leading-5 text-foreground/55">{a.tagline}</div>
                  <div className="mt-2 text-xs font-bold" style={{ color: a.from }}>Start chatting →</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}