import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, FileClock, ClipboardCheck, FileWarning, ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const today = () => new Date().toISOString().slice(0, 10);
const in60 = () => new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10);
const DAY = 86400000;

const daysLeft = (date) => Math.round((new Date(date).getTime() - Date.now()) / DAY);

// Urgency chip for an expiry date, using the semantic palette.
const urgency = (date) => {
  const d = daysLeft(date);
  if (d < 0) return { label: `Expired ${Math.abs(d)}d ago`, cls: 'bg-danger/10 text-danger' };
  if (d <= 14) return { label: `${d === 0 ? 'Today' : `${d}d left`}`, cls: 'bg-warning/10 text-warning' };
  return { label: `${d}d left`, cls: 'bg-muted text-foreground/60' };
};

// Admin feed: upcoming compliance expiry dates (staff documents + certificates)
// and participant documents awaiting review, in one central dashboard panel.
export default function ExpiryReviewFeed() {
  const [expiries, setExpiries] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [failed, setFailed] = useState(false);
  const [totals, setTotals] = useState({ urgent: 0, reviews: 0 });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const soon = new Date(Date.now() + 14 * DAY).toISOString().slice(0, 10);
        const [empDocs, certs, pending, urgentDocs, urgentCerts, pendingCount] = await Promise.all([
          base44.entities.EmployeeDocument.filter(
            { expiry_date: { $gt: '', $lte: in60() }, status: { $ne: 'Archived' } },
            { sort: 'expiry_date', limit: 15, fields: ['title', 'employee_name', 'expiry_date'] }
          ),
          base44.entities.Certificate.filter(
            { expiry_date: { $gt: '', $lte: in60() }, status: { $ne: 'Revoked' } },
            { sort: 'expiry_date', limit: 15, fields: ['module_title', 'staff_name', 'expiry_date'] }
          ),
          base44.entities.ParticipantDocument.filter(
            { review_outcome: 'Pending Review' },
            { sort: '-created_date', limit: 15, fields: ['title', 'document_type', 'participant_name', 'submitted_date'] }
          ),
          base44.entities.EmployeeDocument.count({ expiry_date: { $gt: '', $lte: soon }, status: { $ne: 'Archived' } }),
          base44.entities.Certificate.count({ expiry_date: { $gt: '', $lte: soon }, status: { $ne: 'Revoked' } }),
          base44.entities.ParticipantDocument.count({ review_outcome: 'Pending Review' }),
        ]);
        if (!alive) return;
        setTotals({ urgent: urgentDocs + urgentCerts, reviews: pendingCount });
        setExpiries([
          ...empDocs.items.map((d) => ({ key: `doc-${d.id}`, icon: FileWarning, title: d.title, sub: `${d.employee_name || ''} · Staff document`, date: d.expiry_date })),
          ...certs.items.map((c) => ({ key: `cert-${c.id}`, icon: FileClock, title: c.module_title, sub: `${c.staff_name || ''} · Certificate`, date: c.expiry_date })),
        ].sort((a, b) => (a.date || '').localeCompare(b.date || '')));
        setReviews(pending.items.map((p) => ({
          key: p.id,
          title: p.title || p.document_type,
          sub: `${p.participant_name || ''} · ${p.document_type}`,
          date: p.submitted_date,
        })));
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (failed) return null;
  if (!expiries || !reviews) {
    return <div className="h-48 animate-pulse rounded-2xl border border-border/60 bg-card" />;
  }

  const urgentCount = totals.urgent;
  const reviewCount = totals.reviews;

  const Column = ({ title, icon: Icon, href, count, countCls, items, empty, renderItem }) => (
    <div className="min-w-0 rounded-xl border border-border/60 bg-muted/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to={href} className="flex items-center gap-2 text-sm font-bold hover:underline">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand text-white shadow-md"><Icon className="h-4 w-4" /></span>
          {title}
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
        {count > 0 && <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums ${countCls}`}>{count}</span>}
      </div>
      {items.length === 0 ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-border/60 bg-card px-3 py-4 text-xs text-foreground/50">
          <ClipboardCheck className="h-4 w-4 text-safe" />{empty}
        </div>
      ) : (
        <div className="mt-3 max-h-60 space-y-1.5 overflow-y-auto pr-1">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-md">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-md"><CalendarClock className="h-5 w-5" /></span>
        <div>
          <h2 className="font-display text-lg font-bold leading-tight">Expiry &amp; review feed</h2>
          <p className="text-xs text-muted-foreground">Recent items shown below; badges count all urgent expiries and pending reviews.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Column
          title="Compliance expiry dates"
          icon={FileClock}
          href="/documents"
          count={urgentCount}
          countCls="bg-danger/10 text-danger"
          items={expiries}
          empty="Nothing expires in the next 60 days."
          renderItem={(e) => {
            const u = urgency(e.date);
            return (
              <div key={e.key} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-2.5 shadow-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger"><e.icon className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{e.title}</p>
                  <p className="truncate text-[11px] text-foreground/55">{e.sub}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-semibold tabular-nums text-foreground/60">{e.date ? e.date.slice(0, 10) : 'No date'}</p>
                  {e.date && <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${u.cls}`}>{u.label}</span>}
                </div>
              </div>
            );
          }}
        />
        <Column
          title="Pending document reviews"
          icon={ClipboardCheck}
          href="/participants"
          count={reviewCount}
          countCls="bg-warning/10 text-warning"
          items={reviews}
          empty="No participant documents waiting for review."
          renderItem={(r) => (
            <div key={r.key} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-2.5 shadow-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning"><ClipboardCheck className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{r.title}</p>
                <p className="truncate text-[11px] text-foreground/55">{r.sub}</p>
              </div>
              <span className="shrink-0 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-warning">Awaiting review</span>
            </div>
          )}
        />
      </div>
    </div>
  );
}