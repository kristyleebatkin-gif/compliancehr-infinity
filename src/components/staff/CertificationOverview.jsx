import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, parseISO, format } from 'date-fns';
import { ShieldCheck, AlertTriangle, Clock, Users } from 'lucide-react';

const SOON_DAYS = 60;

const daysLeft = (expiry) => differenceInDays(parseISO(expiry), new Date());
const certState = (expiry) => {
  if (!expiry) return 'valid'; // no expiry = stays current
  const d = daysLeft(expiry);
  if (d < 0) return 'expired';
  if (d <= SOON_DAYS) return 'soon';
  return 'valid';
};

export default function CertificationOverview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [staffPage, compsAll] = await Promise.all([
          base44.entities.StaffProfile.filter({ status: 'Active' }, { sort: 'full_name', limit: 200, fields: ['full_name', 'role'] }),
          (async () => {
            const out = [];
            let cursor;
            do {
              const page = await base44.entities.TrainingCompletion.filter(
                { status: 'Completed', learner_type: 'Employee' },
                { limit: 200, cursor, fields: ['employee_name', 'module_title', 'completed_date', 'expiry_date'] },
              );
              out.push(...(page.items || []));
              cursor = page.has_more ? page.next_cursor : undefined;
            } while (cursor);
            return out;
          })(),
        ]);
        const staffList = staffPage.items || [];
        const byStaff = {};
        (compsAll || []).forEach((c) => {
          if (!byStaff[c.employee_name]) byStaff[c.employee_name] = [];
          byStaff[c.employee_name].push(c);
        });
        const rows = staffList.map((s) => {
          const certs = (byStaff[s.full_name] || []).map((c) => ({ ...c, state: certState(c.expiry_date) }));
          return {
            ...s,
            certs,
            counts: {
              valid: certs.filter((c) => c.state === 'valid').length,
              soon: certs.filter((c) => c.state === 'soon').length,
              expired: certs.filter((c) => c.state === 'expired').length,
            },
          };
        });
        // all certs needing attention, soonest expiry first
        const attention = rows
          .flatMap((r) => r.certs.filter((c) => c.state !== 'valid').map((c) => ({ ...c, staff_name: r.full_name, role: r.role })))
          .sort((a, b) => (a.expiry_date || '9999').localeCompare(b.expiry_date || '9999'));
        setData({ rows, attention });
      } catch (e) { console.error(e); setData({ rows: [], attention: [] }); }
    })();
  }, []);

  if (!data) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  const { rows, attention } = data;
  const totals = rows.reduce(
    (acc, r) => ({ valid: acc.valid + r.counts.valid, soon: acc.soon + r.counts.soon, expired: acc.expired + r.counts.expired }),
    { valid: 0, soon: 0, expired: 0 },
  );
  const fullyCompliant = rows.filter((r) => r.counts.expired === 0 && r.counts.soon === 0).length;

  const tiles = [
    { label: 'Current certifications', value: totals.valid, icon: ShieldCheck, cls: 'bg-safe/10 text-safe' },
    { label: `Expiring within ${SOON_DAYS} days`, value: totals.soon, icon: Clock, cls: 'bg-warning/10 text-warning' },
    { label: 'Expired', value: totals.expired, icon: AlertTriangle, cls: 'bg-destructive/10 text-destructive' },
    { label: 'Staff fully current', value: fullyCompliant, icon: Users, cls: 'bg-brand/10 text-brand' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label}><CardContent className="flex items-center gap-3 p-4">
            <div className={`rounded-lg p-2 ${t.cls}`}><t.icon className="h-4 w-4" /></div>
            <div className="min-w-0">
              <p className="text-xl font-bold leading-tight">{t.value}</p>
              <p className="truncate text-xs text-muted-foreground">{t.label}</p>
            </div>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <p className="font-semibold">Needs attention — expired &amp; upcoming expiries</p>
          </div>
          {attention.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nothing expiring in the next {SOON_DAYS} days — everyone is current.</p>
          ) : (
            <div className="divide-y divide-border/70">
              {attention.map((c, i) => {
                const d = c.expiry_date ? daysLeft(c.expiry_date) : null;
                return (
                  <div key={`${c.employee_name}-${c.module_title}-${i}`} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.staff_name} <span className="text-muted-foreground">· {c.module_title}</span></p>
                      <p className="text-xs text-muted-foreground">{c.role || 'Staff'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.expiry_date && <span className="text-xs text-muted-foreground">Exp. {format(parseISO(c.expiry_date), 'd MMM yyyy')}</span>}
                      {c.state === 'expired' ? (
                        <Badge className="border-transparent bg-destructive/15 text-destructive">Expired {Math.abs(d)} day{Math.abs(d) === 1 ? '' : 's'} ago</Badge>
                      ) : (
                        <Badge className="border-transparent bg-warning/15 text-warning">{d === 0 ? 'Expires today' : `${d} day${d === 1 ? '' : 's'} left`}</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="font-semibold">Certification status by staff member</p>
          {rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No active staff found.</p>
          ) : (
            <div className="divide-y divide-border/70">
              {rows.map((r) => (
                <div key={r.full_name} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.full_name}</p>
                    <p className="text-xs text-muted-foreground">{r.role || 'Staff'} · {r.certs.length} module{r.certs.length === 1 ? '' : 's'} recorded</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {r.counts.expired > 0 && <Badge className="border-transparent bg-destructive/15 text-destructive">{r.counts.expired} expired</Badge>}
                    {r.counts.soon > 0 && <Badge className="border-transparent bg-warning/15 text-warning">{r.counts.soon} expiring soon</Badge>}
                    {r.counts.expired === 0 && r.counts.soon === 0 && (
                      <Badge className="border-transparent bg-safe/15 text-safe"><ShieldCheck className="mr-1 h-3 w-3" />{r.counts.valid} current</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}