import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ASSISTANT_ABILITIES } from '@/lib/helpCentreExtras';
import { Bot, Sparkles, Receipt, CalendarDays, CheckCircle2, MessageCircleQuestion } from 'lucide-react';

const ICONS = { bot: Bot, sparkles: Sparkles, receipt: Receipt, calendar: CalendarDays };

export default function AssistantsGuide() {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-purple-300/50 bg-gradient-to-r from-purple-700 via-violet-600 to-purple-700 p-5 text-white shadow-panel">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-fuchsia-400/30 blur-2xl" />
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/15 p-2.5"><Bot className="h-6 w-6" /></div>
          <div>
            <p className="text-lg font-bold">Your personal assistants</p>
            <p className="text-xs text-purple-200">Open any of them from the Personal Assistant button in the top bar, or the AI Assistant page in the sidebar. They answer in chat, instantly.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {ASSISTANT_ABILITIES.map((a) => {
          const Icon = ICONS[a.icon] || Bot;
          return (
            <Card key={a.key} className="overflow-hidden">
              <div className={`flex items-center gap-3 bg-gradient-to-r ${a.tone} p-4 text-white`}>
                <div className="rounded-lg bg-white/20 p-2"><Icon className="h-5 w-5" /></div>
                <div>
                  <p className="font-bold leading-tight">{a.name}</p>
                  <p className="text-xs opacity-90">{a.tagline}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">It can answer</p>
                <ul className="mt-2 space-y-1.5">
                  {a.can.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />{c}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Ask it things like</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {a.examples.map((e, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] text-brand"><MessageCircleQuestion className="h-3 w-3" />{e}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-4 text-xs text-foreground/70">
        <p className="font-semibold text-foreground">Safe by design</p>
        <p className="mt-1">Assistants only ever see the records you are allowed to see. They never create, edit, delete or approve anything — they guide, you act. They do not give legal advice; for interpretation, check the official NDIS Commission, Fair Work, privacy or WHS sources.</p>
      </div>
    </div>
  );
}