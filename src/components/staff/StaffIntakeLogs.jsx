import React, { useEffect, useMemo, useState } from 'react';
import { Download, ClipboardCheck, Users, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { buildCsv } from '@/lib/csvExport';

/**
 * Intake & onboarding logs for one employee, sourced from their linked
 * employee intake case: acknowledgements, referee checks and buddy shifts.
 * Every log is exportable as CSV (master list items 26-28).
 */
export default function StaffIntakeLogs({ staff }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const query = staff.email
      ? { $or: [{ related_profile_id: staff.id }, { email: staff.email }] }
      : { related_profile_id: staff.id };
    base44.entities.IntakeCase.filter({ ...query, intake_type: 'Employee' }, { sort: '-created_date', limit: 50 })
      .then((page) => { if (!cancelled) setCases(page.items || []); })
      .catch((error) => console.error(error))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [staff.id, staff.email]);

  const panels = useMemo(() => {
    const parse = (log) => String(log || '').split('\n').map((line) => line.trim()).filter(Boolean);
    return [
      { key: 'acknowledgement_log', title: 'Acknowledgements', icon: ClipboardCheck, empty: 'No acknowledgements recorded in intake.' },
      { key: 'referee_check_log', title: 'Referee Checks', icon: Users, empty: 'No referee checks recorded in intake.' },
      { key: 'buddy_shift_log', title: 'Buddy Shifts', icon: Clock, empty: 'No buddy shifts recorded in intake.' },
    ].map(({ key, title, icon, empty }) => ({
      key, title, icon, empty,
      entries: cases.flatMap((c) => parse(c[key]).map((entry) => ({ case: c.case_number || c.applicant_name, entry }))),
    }));
  }, [cases]);

  const exportLog = (panel) => {
    const columns = [
      { key: 'employee', label: 'Employee' },
      { key: 'case', label: 'Intake Case' },
      { key: 'entry', label: panel.title.replace(/s$/, '') },
    ];
    const rows = panel.entries.map((item) => ({ employee: staff.full_name, case: item.case, entry: item.entry }));
    const csv = columns.length && rows.length ? buildCsv(columns, rows) : '';
    const blob = new Blob([csv || buildCsv(columns, [{ employee: staff.full_name, case: '', entry: '' }])], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${staff.full_name || 'employee'}-${panel.key}.csv`.replace(/\s+/g, '-').toLowerCase();
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="py-4 text-center text-sm text-foreground/50">Loading intake logs...</div>;

  return (
    <div className="space-y-4">
      {cases.length === 0 && (
        <div className="py-4 text-center text-sm text-foreground/50">No employee intake case is linked to this profile yet.</div>
      )}
      {panels.map((panel) => {
        const Icon = panel.icon;
        return (
          <div key={panel.key} className="rounded-xl border border-border/60 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-foreground/60">
                <Icon className="mr-1 inline h-4 w-4" />{panel.title}
              </h3>
              <Button variant="outline" size="sm" onClick={() => exportLog(panel)} disabled={panel.entries.length === 0}>
                <Download className="h-4 w-4" />Export
              </Button>
            </div>
            {panel.entries.length === 0 ? (
              <div className="py-2 text-sm text-foreground/50">{panel.empty}</div>
            ) : (
              <ul className="space-y-1.5">
                {panel.entries.map((item, index) => (
                  <li key={index} className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-sm">
                    {item.entry}
                    <span className="ml-2 text-xs text-foreground/40">{item.case}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}