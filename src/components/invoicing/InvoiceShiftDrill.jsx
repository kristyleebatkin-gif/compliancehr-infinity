import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Link2 } from 'lucide-react';

const money = (v) => (v == null ? '-' : `$${Number(v).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

// Invoice-to-shift drill-down (Stripe benchmark): the shifts billed on this invoice, never losing your place.
export default function InvoiceShiftDrill({ invoice }) {
  const [shifts, setShifts] = useState(null);

  useEffect(() => {
    let live = true;
    if (!invoice?.id) { setShifts([]); return () => {}; }
    base44.entities.Shift.filter({ invoice_id: invoice.id }, { sort: '-date', limit: 200 })
      .then((page) => { if (live) setShifts(page.items || []); })
      .catch(() => { if (live) setShifts([]); });
    return () => { live = false; };
  }, [invoice?.id]);

  if (!shifts) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />Loading linked shifts...
      </div>
    );
  }

  const hours = shifts.reduce((sum, s) => {
    if (!s.start_time || !s.end_time) return sum;
    const [sh, sm] = String(s.start_time).split(':').map(Number);
    const [eh, em] = String(s.end_time).split(':').map(Number);
    const mins = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0)) - (Number(s.break_minutes) || 0);
    return sum + Math.max(0, mins) / 60;
  }, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-2"><Link2 className="h-4 w-4 text-emerald-600" /></div>
          <div>
            <p className="text-sm font-bold">Shifts billed on this invoice</p>
            <p className="text-xs text-muted-foreground">
              {shifts.length ? `${shifts.length} shift${shifts.length === 1 ? '' : 's'} · ${hours.toFixed(1)} hours of support` : 'No shifts are linked to this invoice yet'}
            </p>
          </div>
        </div>
      </div>

      {shifts.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50 text-left text-muted-foreground">
                <th className="py-2 pr-3 font-semibold">Date</th>
                <th className="py-2 pr-3 font-semibold">Staff</th>
                <th className="py-2 pr-3 font-semibold">Participant</th>
                <th className="py-2 pr-3 font-semibold">Service</th>
                <th className="py-2 pr-3 text-right font-semibold">Rate</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="py-2 pr-3 tabular-nums">{String(s.date || '').slice(0, 10)}</td>
                  <td className="py-2 pr-3">{s.employee_name || '-'}</td>
                  <td className="py-2 pr-3">{s.participant_name || '-'}</td>
                  <td className="py-2 pr-3">{s.service_type || '-'}</td>
                  <td className="py-2 text-right font-medium tabular-nums">{money(s.billable_rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}