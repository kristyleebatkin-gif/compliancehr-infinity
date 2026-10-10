import React, { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import SectionCard from '@/components/SectionCard';
import ScoreRing from '@/components/ScoreRing';
import { Users, BadgeCheck, Clock, AlertTriangle } from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';

const Tile = ({ icon: Icon, label, value, tone }) => (
  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
    <div className={`rounded-lg p-2 ${tone}`}><Icon className="h-4 w-4" /></div>
    <div>
      <p className="text-xl font-bold leading-tight">{value}</p>
      <p className="text-xs font-semibold text-foreground/60">{label}</p>
    </div>
  </div>
);

export default function ComplianceReadiness() {
  const [staff, setStaff] = useState([]);
  const [modules, setModules] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [staffPage, modulePage, completionPage, certPage] = await Promise.all([
        base44.entities.StaffProfile.filter({ status: 'Active' }, { limit: 500 }),
        base44.entities.TrainingModule.filter({ status: 'Active' }, { limit: 200 }),
        base44.entities.TrainingCompletion.filter({ learner_type: 'Employee', status: { $ne: 'Archived' } }, { limit: 500 }),
        base44.entities.Certificate.filter({}, { limit: 500 }),
      ]);
      setStaff(staffPage.items || []);
      setModules(modulePage.items || []);
      const certs = (certPage.items || []).filter((c) => c.status !== 'Revoked');
      setRecords([...(completionPage.items || []), ...certs]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Latest expiry per staff+module pair
  const pairMap = new Map();
  for (const rec of records) {
    const staffName = rec.employee_name || rec.staff_name || rec.learner_name;
    const moduleTitle = rec.module_title;
    if (!staffName || !moduleTitle) continue;
    const expiry = rec.expiry_date || '';
    const key = `${String(staffName).toLowerCase()}|${moduleTitle}`;
    const existing = pairMap.get(key);
    if (!existing || expiry > existing.expiry_date) pairMap.set(key, { staffName, moduleTitle, expiry_date: expiry });
  }
  const pairs = [...pairMap.values()];
  const currentPairs = pairs.filter((p) => !p.expiry_date || p.expiry_date >= todayStr);
  const expiredPairs = pairs.filter((p) => p.expiry_date && p.expiry_date < todayStr);
  const expiring = currentPairs
    .filter((p) => p.expiry_date && differenceInCalendarDays(new Date(p.expiry_date + 'T00:00:00'), today) <= 60)
    .sort((a, b) => a.expiry_date.localeCompare(b.expiry_date));

  const staffCount = staff.length;
  const moduleCount = modules.length;
  const possible = staffCount * moduleCount;
  const readiness = possible > 0 ? Math.min(100, (currentPairs.length / possible) * 100) : 0;

  const moduleProgress = modules.map((m) => {
    const done = currentPairs.filter((p) => p.moduleTitle === m.title).length;
    const pct = staffCount > 0 ? (done / staffCount) * 100 : 0;
    return { ...m, done, pct };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          <SectionCard
            title="Compliance Readiness"
            description="Training progress and certification currency for all active staff at a glance"
          >
            <div className="flex flex-col items-center gap-6 lg:flex-row">
              <ScoreRing value={readiness} label="Readiness" />
              <div className="grid w-full flex-1 gap-3 sm:grid-cols-2">
                <Tile icon={Users} label="Active staff" value={staffCount} tone="bg-brand/10 text-brand" />
                <Tile icon={BadgeCheck} label="Current certifications" value={currentPairs.length} tone="bg-safe/15 text-safe" />
                <Tile icon={Clock} label="Expiring in 60 days" value={expiring.length} tone="bg-warning/15 text-warning" />
                <Tile icon={AlertTriangle} label="Expired certifications" value={expiredPairs.length} tone="bg-red-600/15 text-red-600" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Training Module Progress" description="Share of active staff holding a current completion for each module">
            {moduleCount === 0 ? (
              <p className="text-sm text-muted-foreground">No active training modules yet.</p>
            ) : (
              <div className="space-y-3">
                {moduleProgress.map((m) => (
                  <div key={m.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold">{m.title}</span>
                      <span className="text-foreground/60">{m.done}/{staffCount} staff ({Math.round(m.pct)}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${m.pct >= 85 ? 'bg-safe' : m.pct >= 50 ? 'bg-warning' : 'bg-red-600'}`}
                        style={{ width: `${Math.max(m.pct, m.done > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Upcoming Certification Expiries" description="Current certifications expiring within the next 60 days, soonest first">
            {expiring.length === 0 ? (
              <p className="text-sm text-muted-foreground">No certifications expiring in the next 60 days.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {expiring.map((p, idx) => {
                  const days = differenceInCalendarDays(new Date(p.expiry_date + 'T00:00:00'), today);
                  const urgent = days <= 14;
                  return (
                    <div key={idx} className="flex items-center justify-between gap-2 rounded-xl border border-border/60 p-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{p.staffName}</div>
                        <div className="truncate text-[11px] text-foreground/50">{p.moduleTitle}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={`rounded-full px-2 py-0.5 text-xs font-semibold ${urgent ? 'bg-red-600/15 text-red-600' : 'bg-warning/15 text-warning'}`}>
                          {days <= 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'}`}
                        </div>
                        <div className="mt-0.5 text-[11px] text-foreground/40">{format(new Date(p.expiry_date + 'T00:00:00'), 'd MMM yyyy')}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}