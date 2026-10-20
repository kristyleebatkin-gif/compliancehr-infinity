import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TaskAssistantCard({ compact = false, inline = false }) {
  return <Card className="min-w-0 overflow-hidden"><CardContent className={inline ? 'grid gap-0 p-0 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]' : 'p-0'}>
    <div className={compact ? 'bg-primary/10 p-1.5 text-primary' : 'bg-primary p-3 text-primary-foreground'}>
      <h2 className={compact ? 'flex items-start gap-1 text-[11px] font-bold leading-tight' : 'flex items-start gap-2 text-sm font-bold'}><Bot className={compact ? 'h-3 w-3 shrink-0' : 'mt-0.5 h-4 w-4 shrink-0'} />AI assistants - your task helpers</h2>
      <p className={compact ? 'mt-1 text-[9px] leading-tight' : 'mt-1 text-xs'}>Open the AI Assistant from the sidebar and it will work alongside you on any task.</p>
    </div>
    <div className={compact ? 'p-1.5' : 'p-3'}>
      <ul className={compact ? 'grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] leading-tight' : 'grid gap-2 text-xs'}>
        {[
          'Break a big task into clear steps and a plan',
          'Draft professional notes, updates and sign-offs',
          'Write polite reminders and follow-up messages',
          'Summarise overdue work for your manager',
          'Explain the policy or checklist behind a task',
          'Proofread and lift the quality of your writing',
        ].map((text) => <li key={text} className="flex items-start gap-1.5"><Sparkles className={compact ? 'h-2.5 w-2.5 shrink-0 text-primary' : 'mt-0.5 h-3.5 w-3.5 shrink-0 text-primary'} />{text}</li>)}
      </ul>
      <Link to="/assistant" className={compact ? 'mt-1 inline-flex rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary hover:bg-primary/20' : 'mt-3 inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90'}>Open AI Assistant</Link>
    </div>
  </CardContent></Card>;
}