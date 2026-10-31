import React, { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import SectionCard from '@/components/SectionCard';
import ScoreRing from '@/components/ScoreRing';
import { Users, BadgeCheck, Clock, AlertTriangle } from 'lucide-react';
import { addMonths, format, differenceInCalendarDays } from 'date-fns';

const PAGE_SIZE = 500;
const MAX_PAGES = 200;

function normaliseName(value) {
  return String(value || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

async function fetchAllRecords(entity, query) {
  const all = [];
  let skip = 0;
  for (let pageNumber = 0; pageNumber < MAX_PAGES; pageNumber += 1) {
    const response = await entity.filter(query, '-created_date', PAGE_SIZE, skip);
    const page = Array.isArray(response) ? response : response?.items;
    if (!Array.isArray(page)) throw new Error('The data source returned an unsupported page format.');
    all.push(...page);
    if (page.length < PAGE_SIZE) return all;
    skip += page.length;
  }
  throw new Error('The record list exceeded the safe pagination limit.');
}

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
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [activeStaff, activeModules, completions, certificates] = await Promise.all([
        fetchAllRecords(base44.entities.StaffProfile, { status: 'Active' }),
        fetchAllRecords(base44.entities.TrainingModule, { status: 'Active' }),
        fetchAllRecords(base44.entities.TrainingCompletion, {
          learner_type: 'Employee',
          status: { $ne: 'Archived' },
        }),
        fetchAllRecords(base44.entities.Certificate, {}),
      ]);
      setStaff(activeStaff);
      setModules(activeModules);
      setRecords([
        ...completions,
        ...certificates.filter((record) => record.status !== 'Revoked'),
      ]);
    } catch (error) {
      console.error('Unable to load training readiness records:', error);
      setLoadError('Training and certification records could not be loaded completely. Coverage is withheld until all source data loads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const staffIds = new Set(staff.map((person) => person.id).filter(Boolean));
  const modulesById = new Map(modules.filter((module) => module.id).map((module) => [module.id, module]));
  const staffByName = new Map();
  for (const person of staff) {
    const key = normaliseName(person.full_name);
    if (!key) continue;
    staffByName.set(key, [...(staffByName.get(key) || []), person.id]);
  }
  const modulesByTitle = new Map();
  for (const module of modules) {
    const key = normaliseName(module.title);
    if (!key) continue;
    modulesByTitle.set(key, [...(modulesByTitle.get(key) || []), module]);
  }

  const pairMap = new Map();
  let unlinkedRecords = 0;
  for (const record of records) {
    const staffKey = [record.employee_id, record.staff_id, record.learner_id].find((id) => id && staffIds.has(id))
      || (() => {
        const candidates = staffByName.get(normaliseName(record.employee_name || record.staff_name || record.learner_name)) || [];
        return candidates.length === 1 ? candidates[0] : null;
      })();
    const moduleById = record.training_module_id ? modulesById.get(record.training_module_id) : null;
    const moduleCandidates = modulesByTitle.get(normaliseName(record.module_title)) || [];
    const module = moduleById || (moduleCandidates.length === 1 ? moduleCandidates[0] : null);
    if (!staffKey || !module?.id) {
      unlinkedRecords += 1;
      continue;
    }

    const startDate = record.completed_date || record.issue_date || record.created_date;
    const validityMonths = Number(module.validity_months);
    let derivedExpiry = '';
    if (startDate && validityMonths > 0) {
      const start = new Date(`${startDate}T00:00:00`);
      if (!Number.isNaN(start.getTime())) derivedExpiry = format(addMonths(start, validityMonths), 'yyyy-MM-dd');
    }
    const expiryDate = record.expiry_date || derivedExpiry;
    const pairKey = `${staffKey}|${module.id}`;
    const existing = pairMap.get(pairKey);
    const recordDate = record.completed_date || record.issue_date || record.created_date || '';
    if (!existing || recordDate > existing.recordDate) {
      pairMap.set(pairKey, {
        staffId: staffKey,
        staffName: staff.find((person) => person.id === staffKey)?.full_name || 'Staff member',
        moduleId: module.id,
        moduleTitle: module.title,
        expiry_date: expiryDate,
        recordDate,
        explicitlyExpired: record.status === 'Expired',
      });
    }
  }

  const latestPairs = [...pairMap.values()];
  const currentPairs = latestPairs.filter((pair) => !pair.explicitlyExpired && pair.expiry_date && pair.expiry_date >= todayStr);
  const expiredPairs = latestPairs.filter((pair) => pair.explicitlyExpired || (pair.expiry_date && pair.expiry_date < todayStr));
  const unverifiedPairs = latestPairs.filter((pair) => !pair.explicitlyExpired && !pair.expiry_date);
  const expiring = currentPairs
    .filter((pair) => differenceInCalendarDays(new Date(`${pair.expiry_date}T00:00:00`), today) <= 60)
    .sort((a, b) => a.expiry_date.localeCompare(b.expiry_date));

  const staffCount = staff.length;
  const moduleCount = modules.length;
  const possible = staffCount * moduleCount;
  const readiness = possible > 0 ? Math.min(100, (currentPairs.length / possible) * 100) : null;

  const moduleProgress = modules.map((module) => {
    const done = currentPairs.filter((pair) => pair.moduleId === module.id).length;
    const pct = staffCount > 0 ? (done / staffCount) * 100 : 0;
    return { ...module, done, pct };
  }).sort((a, b) => b.pct - a.pct);
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-foreground" />
        </div>
      ) : loadError ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p>{loadError}</p>
          <button type="button" onClick={load} className="mt-3 rounded-lg border border-border px-3 py-2 font-semibold">Retry loading</button>
        </div>
      ) : (
        <div className="space-y-4">
          <SectionCard
            title="Training & Certification Coverage"
            description="Coverage is current linked records divided by active staff × active modules. Assignment-specific requirements are not modelled, so this is not a complete workforce compliance decision."
          >
            <div className="flex flex-col items-center gap-4 lg:flex-row">
              {readiness === null ? (
                <div role="status" className="rounded-xl border border-border/60 p-4 text-sm text-muted-foreground">
                  Coverage cannot be calculated until there are active staff and active training modules.
                </div>
              ) : <ScoreRing value={readiness} label="Verified coverage" />}
              <div className="grid w-full flex-1 gap-3 sm:grid-cols-2">
                <Tile icon={Users} label="Active staff" value={staffCount} tone="bg-brand/10 text-brand" />
                <Tile icon={BadgeCheck} label="Current linked records" value={currentPairs.length} tone="bg-safe/15 text-safe" />
                <Tile icon={Clock} label="Expiry not recorded" value={unverifiedPairs.length} tone="bg-warning/15 text-warning" />
                <Tile icon={Clock} label="Expiring in 60 days" value={expiring.length} tone="bg-warning/15 text-warning" />
                <Tile icon={AlertTriangle} label="Expired training records" value={expiredPairs.length} tone="bg-red-600/15 text-red-600 dark:text-red-300" />
              </div>
            </div>
            {unlinkedRecords > 0 && (
              <p role="status" className="mt-3 text-xs text-warning">
                {unlinkedRecords} training or certificate record(s) could not be linked to one unique active staff member and module; they are excluded from coverage.
              </p>
            )}
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
                      <span className="text-foreground/60">{staffCount > 0 ? `${m.done}/${staffCount} staff (${Math.round(m.pct)}%)` : 'Not calculable — no active staff'}</span>
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
                        <div className={`rounded-full px-2 py-0.5 text-xs font-semibold ${urgent ? 'bg-red-600/15 text-red-600 dark:text-red-300' : 'bg-warning/15 text-warning'}`}>
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