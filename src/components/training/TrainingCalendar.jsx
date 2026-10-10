import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, AlertTriangle, CheckCircle2, Award } from 'lucide-react';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function ymd(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt)) return null;
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

function deadlineStatus(expiry) {
  if (!expiry) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiry);
  exp.setHours(0, 0, 0, 0);
  if (exp < today) return 'expired';
  if ((exp - today) / 86400000 <= 30) return 'soon';
  return 'current';
}

export default function TrainingCalendar({ completions }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selected, setSelected] = useState(() => ymd(new Date()));

  const events = useMemo(() => {
    const map = {};
    const add = (date, ev) => {
      const k = ymd(date);
      if (!k) return;
      (map[k] = map[k] || []).push(ev);
    };
    completions.forEach((c) => {
      if (c.completed_date) add(c.completed_date, { type: 'completed', title: c.module_title, raw: c });
      if (c.expiry_date) {
        add(c.expiry_date, { type: 'deadline', title: c.module_title, status: deadlineStatus(c.expiry_date), raw: c });
      }
    });
    return map;
  }, [completions]);

  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startDay = (first.getDay() + 6) % 7; // Monday-first
    const start = new Date(year, month, 1 - startDay);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push(d);
    }
    return cells;
  }, [cursor]);

  const todayKey = ymd(new Date());
  const selectedEvents = events[selected] || [];

  const counts = useMemo(() => {
    let deadlines = 0, soon = 0, expired = 0, completed = 0;
    completions.forEach((c) => {
      if (c.completed_date) completed++;
      const s = deadlineStatus(c.expiry_date);
      if (s === 'current') deadlines++;
      else if (s === 'soon') { deadlines++; soon++; }
      else if (s === 'expired') { deadlines++; expired++; }
    });
    return { deadlines, soon, expired, completed };
  }, [completions]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand"><CalendarDays className="h-5 w-5" /></div>
          <div>
            <div className="text-sm font-semibold">Training &amp; Certification Calendar</div>
            <div className="text-xs text-foreground/50">Scheduled renewals and certification deadlines</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))} className="rounded-lg p-1.5 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
          <div className="min-w-[140px] text-center text-sm font-semibold">{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</div>
          <button onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))} className="rounded-lg p-1.5 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
          <button onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); setSelected(ymd(new Date())); }} className="ml-1 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-medium hover:bg-muted">Today</button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        <LegendDot tone="safe" icon={Award} label={`${counts.deadlines} deadlines`} />
        <LegendDot tone="warning" icon={Clock} label={`${counts.soon} expiring soon`} />
        <LegendDot tone="danger" icon={AlertTriangle} label={`${counts.expired} expired`} />
        <LegendDot tone="brand" icon={CheckCircle2} label={`${counts.completed} completed`} />
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-foreground/40">{w}</div>
        ))}
        {grid.map((d, i) => {
          const k = ymd(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const dayEvents = events[k] || [];
          const isToday = k === todayKey;
          const isSel = k === selected;
          const dots = dayEvents.slice(0, 3);
          return (
            <button
              key={i}
              onClick={() => setSelected(k)}
              className={`flex min-h-[64px] flex-col items-start rounded-lg border p-1.5 text-left transition-colors sm:min-h-[80px] ${
                isSel ? 'border-brand bg-brand/5' : 'border-transparent hover:bg-muted'
              } ${inMonth ? '' : 'opacity-40'}`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${isToday ? 'bg-brand text-white' : 'text-foreground/70'}`}>{d.getDate()}</span>
              <div className="mt-1 flex w-full flex-col gap-0.5">
                {dots.map((ev, idx) => (
                  <span key={idx} className={`flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-[9px] font-medium ${eventCls(ev)}`}>
                    <span className="truncate">{ev.title}</span>
                  </span>
                ))}
                {dayEvents.length > 3 && <span className="px-1 text-[9px] text-foreground/40">+{dayEvents.length - 3} more</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold text-foreground/70">
            {selected ? new Date(selected).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }) : 'Select a day'}
          </div>
          <div className="text-[11px] text-foreground/40">{selectedEvents.length} event(s)</div>
        </div>
        {selectedEvents.length === 0 ? (
          <div className="py-4 text-center text-xs text-foreground/40">No training events scheduled on this day.</div>
        ) : (
          <div className="space-y-1.5">
            {selectedEvents.map((ev, idx) => (
              <div key={idx} className="flex items-start gap-2.5 rounded-lg bg-card p-2.5">
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${eventIconCls(ev)}`}>
                  {ev.type === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : ev.status === 'expired' ? <AlertTriangle className="h-4 w-4" /> : ev.status === 'soon' ? <Clock className="h-4 w-4" /> : <Award className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{ev.title}</div>
                  <div className="text-[11px] text-foreground/50">
                    {ev.type === 'completed' ? 'Training completed' : `Certification ${ev.status === 'expired' ? 'expired' : ev.status === 'soon' ? 'expires soon' : 'expires'}`}
                    {ev.raw?.score != null && ` · Score ${ev.raw.score}%`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function eventCls(ev) {
  if (ev.type === 'completed') return 'bg-brand/10 text-brand';
  if (ev.status === 'expired') return 'bg-danger/10 text-danger';
  if (ev.status === 'soon') return 'bg-warning/10 text-warning';
  return 'bg-safe/10 text-safe';
}

function eventIconCls(ev) {
  if (ev.type === 'completed') return 'bg-brand/10 text-brand';
  if (ev.status === 'expired') return 'bg-danger/10 text-danger';
  if (ev.status === 'soon') return 'bg-warning/10 text-warning';
  return 'bg-safe/10 text-safe';
}

function LegendDot({ tone, icon: Icon, label }) {
  const cls = {
    safe: 'bg-safe/10 text-safe',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    brand: 'bg-brand/10 text-brand',
  }[tone];
  return (
    <div className="flex items-center gap-1.5">
      <span className={`flex h-5 w-5 items-center justify-center rounded ${cls}`}><Icon className="h-3 w-3" /></span>
      <span className="text-foreground/60">{label}</span>
    </div>
  );
}