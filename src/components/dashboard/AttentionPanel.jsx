import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, ShieldAlert, FileClock, CheckCircle2, Loader2 } from 'lucide-react';

const now = () => Date.now();
const withinDays = (d, n) => { const t = new Date(d); return d && !isNaN(t) && t.getTime() <= now() + n * 86400000; };
const isOpenIncident = (incident) => !['Resolved', 'Closed'].includes(String(incident?.status || '').trim());
const isHighCriticalRisk = (risk) => String(risk?.impact || '') === 'High' && String(risk?.likelihood || '') !== 'Low';

export default function AttentionPanel() {
  const [data, setData] = useState({
    groups: [],
    top: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [incidents, risks, eDocs] = await Promise.all([
          base44.entities.Incident.filter({}, { sort: '-incident_date', limit: 500 }),
          base44.entities.Risk.filter({}, { sort: '-created_date', limit: 500 }),
          base44.entities.EmployeeDocument.filter({}, { sort: '-created_date', limit: 500 }),
        ]);
        if (!alive) return;
        const incidentsList = incidents.items || [];
        const risksList = risks.items || [];
        const eDocsList = eDocs.items || [];

        const openInc = incidentsList.filter(isOpenIncident);
        const urgentInc = openInc.filter((i) => ['High', 'Critical'].includes(i.severity));
        const openHighRisks = risksList.filter(isHighCriticalRisk);

        const expiringDocs = eDocsList.filter((d) => d.expiry_date && withinDays(d.expiry_date, 30));

        // Top urgent items (oldest first)
        const top = [
          ...urgentInc.map((i) => ({ label: i.title || 'Untitled incident', to: '/incidents', tone: 'danger', date: i.incident_date })),
          ...openHighRisks.map((r) => ({ label: r.title || 'High risk', to: '/risks', tone: 'danger', date: r.review_date || r.created_date })),
        ]
          .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
          .slice(0, 6);

        setData({
          groups: [
            { key: 'incidents', label: 'Open incidents', count: openInc.length, urgent: urgentInc.length, to: '/incidents', Icon: AlertTriangle, tone: 'orange' },
            { key: 'risks', label: 'Open high / critical risks', count: openHighRisks.length, to: '/risks', Icon: ShieldAlert, tone: 'red' },
            { key: 'docs', label: 'Expiring documents (30d)', count: expiringDocs.length, to: '/documents', Icon: FileClock, tone: 'warning' },
          ],
          top,
          total: openInc.length + openHighRisks.length + expiringDocs.length,
        });
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const toneCls = {
    orange: 'border-orange-300 bg-gradient-to-br from-orange-100 to-amber-50 text-orange-800 dark:border-orange-800 dark:from-orange-950/40 dark:to-amber-950/20 dark:text-orange-300',
    green: 'border-emerald-300 bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-800 dark:border-emerald-800 dark:from-emerald-950/40 dark:to-teal-950/20 dark:text-emerald-300',
    yellow: 'border-yellow-300 bg-gradient-to-br from-yellow-100 to-amber-50 text-yellow-800 dark:border-yellow-800 dark:from-yellow-950/40 dark:to-amber-950/20 dark:text-yellow-300',
    red: 'border-rose-300 bg-gradient-to-br from-rose-100 to-red-50 text-rose-800 dark:border-rose-800 dark:from-rose-950/40 dark:to-red-950/20 dark:text-rose-300',
    warning: 'border-fuchsia-300 bg-gradient-to-br from-fuchsia-100 to-pink-50 text-fuchsia-800 dark:border-fuchsia-800 dark:from-fuchsia-950/40 dark:to-pink-950/20 dark:text-fuchsia-300',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-violet-50 p-5 shadow-lg shadow-orange-500/5 dark:border-orange-900 dark:from-orange-950/20 dark:via-card dark:to-violet-950/20">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600" />
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md">
              <AlertTriangle className="h-4 w-4" />
            </span>
            What needs your attention
          </div>
          <div className="text-xs text-foreground/50">Overdue and due-soon items across your compliance registers</div>
        </div>
        {data && !loading && data.total > 0 && (
          <span className="rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
            {data.total} item{data.total === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-foreground/40">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : data.total === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg"><CheckCircle2 className="h-6 w-6" /></div>
          <div className="text-sm font-medium">You're all caught up</div>
          <div className="mt-0.5 text-xs text-foreground/50">No overdue or expiring compliance items right now.</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.groups.map((g) => (
              <Link key={g.key} to={g.to} className={`rounded-xl border p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${g.count === 0 ? 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/40' : toneCls[g.tone]}`}>
                <div className="flex items-center gap-1.5">
                  <g.Icon className="h-3.5 w-3.5" />
                  <span className="text-2xl font-bold font-display leading-none">{g.count}</span>
                </div>
                <div className="mt-1.5 text-[11px] font-medium leading-tight">{g.label}</div>
                {g.urgent > 0 && <div className="mt-0.5 text-[10px] font-semibold text-danger">{g.urgent} urgent</div>}
              </Link>
            ))}
          </div>

          {data.top.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold text-foreground/50">Most urgent</div>
              <div className="space-y-1.5">
                {data.top.map((t, i) => (
                  <Link key={i} to={t.to} className="flex items-center justify-between rounded-lg border border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50 px-3 py-2 transition-all hover:-translate-y-0.5 hover:shadow-sm dark:border-rose-900 dark:from-rose-950/20 dark:to-orange-950/20">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${t.tone === 'danger' ? 'bg-danger' : 'bg-warning'}`} />
                      <span className="text-sm text-foreground/80 line-clamp-1">{t.label}</span>
                    </div>
                    {t.date && <span className="text-xs text-foreground/40">{t.date}</span>}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}