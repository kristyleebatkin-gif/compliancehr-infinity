import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import AssistantChat from '@/components/assistant/AssistantChat';
import { ShieldCheck, Sparkles, ReceiptText, CalendarClock, Bot } from 'lucide-react';

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