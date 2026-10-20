import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import SectionCard from '@/components/SectionCard';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

// Flags rostered staff whose NDIS worker screening is expired, due soon or not tracked.
export default function RosterScreeningAlerts({ shifts }) {
  const [deadlines, setDeadlines] = useState([]);
  const [ownShifts, setOwnShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // When no shifts are passed, the panel loads upcoming shifts itself so it
  // can also live outside the rostering module (e.g. compliance).
  useEffect(() => {
    const calls = [
      base44.entities.NDISComplianceDeadline.filter({ deadline_type: 'Worker Screening' }, { limit: 200 }),
    ];
    if (shifts === undefined) {
      const today = new Date().toISOString().slice(0, 10);
      const in14 = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
      calls.push(base44.entities.Shift.filter({ date: { $gte: today, $lte: in14 } }, { limit: 300 }));
    }
    Promise.all(calls)
      .then(([p, s]) => { setDeadlines(p.items || []); if (s) setOwnShifts(s.items || []); })
      .catch(() => setDeadlines([]))
      .finally(() => setLoading(false));
  }, [shifts]);

  if (loading) return null;

  const effectiveShifts = shifts === undefined ? ownShifts : shifts;
  const rosteredStaff = Array.from(new Set(effectiveShifts.filter((s) => s.status !== 'Cancelled' && s.employee_name).map((s) => s.employee_name)));
  if (rosteredStaff.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const matched = [];
  const trackedLower = new Set();
  for (const name of rosteredStaff) {
    const rec = deadlines.find((d) => (d.owner || '').trim().toLowerCase() === name.trim().toLowerCase());
    if (rec) {
      trackedLower.add(name.trim().toLowerCase());
      if (rec.due_date) matched.push({ name, due: rec.due_date, status: rec.status });
    }
  }
  const untracked = rosteredStaff.filter((n) => !trackedLower.has(n.trim().toLowerCase()));
  const expired = matched.filter((m) => m.due < today);
  const soon = matched.filter((m) => m.due >= today && m.due <= in30);

  if (expired.length === 0 && soon.length === 0 && untracked.length === 0) {
    return (
      <SectionCard title="Worker screening checks">
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <ShieldCheck className="h-4 w-4 text-safe" />
          Worker screening current for all tracked rostered staff.
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Worker screening checks" description="NDIS worker screening status for staff rostered this week">
      <div className="space-y-2">
        {[...expired, ...soon].map((m) => (
          <div key={m.name} className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 p-2.5 text-sm">
            <ShieldAlert className={`h-4 w-4 ${expired.includes(m) ? 'text-danger' : 'text-warning'}`} />
            <span className="font-medium">{m.name}</span>
            <span className="text-foreground/60">due {m.due}</span>
            <Badge className={expired.includes(m) ? 'border-transparent bg-danger/10 text-danger' : 'border-transparent bg-warning/10 text-warning'}>
              {expired.includes(m) ? 'Expired / overdue' : 'Due within 30 days'}
            </Badge>
          </div>
        ))}
        {untracked.length > 0 && (
          <div className="rounded-lg border border-border/60 p-2.5 text-xs text-foreground/60">
            No worker screening record tracked for: <span className="font-medium text-foreground">{untracked.join(', ')}</span>
          </div>
        )}
      </div>
    </SectionCard>
  );
}