import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EMPLOYEE_DOC_TYPES } from '@/lib/employeeDocuments';
import { FileCheck2, Loader2 } from 'lucide-react';

const CHECKLIST_PREFIX = 'staff-file-checklist-';
const pctTone = (p) => (p >= 80 ? 'bg-safe/10 text-safe' : p >= 50 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger');
const barTone = (p) => (p >= 80 ? 'bg-safe' : p >= 50 ? 'bg-warning' : 'bg-danger');

// Staff file completeness widget: percentage of required employee documents
// on file for each staff member, so missing files surface quickly.
export default function StaffFileCompletenessWidget() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [staffPage, docsPage, checklistPage] = await Promise.all([
          base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 200, fields: ['full_name', 'status', 'employee_number'] }),
          base44.entities.EmployeeDocument.filter({ status: { $ne: 'Archived' } }, { limit: 1000, fields: ['employee_name', 'employee_id', 'document_type'] }),
          base44.entities.ComplianceChecklistEntry.filter({ checklist_key: { $regex: `^${CHECKLIST_PREFIX}` } }, { limit: 500, fields: ['checklist_key', 'answers'] }),
        ]);
        if (cancelled) return;
        const staff = staffPage.items || [];
        const docs = docsPage.items || [];
        const checklists = checklistPage.items || [];

        const checklistByStaff = {};
        for (const c of checklists) {
          const staffId = String(c.checklist_key || '').replace(CHECKLIST_PREFIX, '');
          if (staffId) {
            try { checklistByStaff[staffId] = JSON.parse(c.answers || '{}'); } catch { checklistByStaff[staffId] = {}; }
          }
        }

        const docsByStaff = {};
        for (const d of docs) {
          const key = d.employee_id || d.employee_name;
          if (!key) continue;
          docsByStaff[key] = docsByStaff[key] || new Set();
          docsByStaff[key].add(d.document_type);
        }

        const computed = staff.map((s) => {
          const merged = new Set(docsByStaff[s.employee_number || s.full_name] || []);
          for (const [docType, answer] of Object.entries(checklistByStaff[s.id] || {})) {
            if (answer?.on_file) merged.add(docType);
          }
          const onFile = EMPLOYEE_DOC_TYPES.filter((t) => merged.has(t));
          const missing = EMPLOYEE_DOC_TYPES.filter((t) => !merged.has(t));
          return {
            id: s.id,
            name: s.full_name,
            status: s.status || 'Active',
            pct: Math.round((onFile.length / EMPLOYEE_DOC_TYPES.length) * 100),
            onFile: onFile.length,
            total: EMPLOYEE_DOC_TYPES.length,
            missing: missing.slice(0, 3),
            missingCount: missing.length,
          };
        }).sort((a, b) => a.pct - b.pct || a.name.localeCompare(b.name));
        setRows(computed);
      } catch (e) {
        console.error(e);
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const summary = useMemo(() => {
    if (!rows || rows.length === 0) return { avg: 0, complete: 0 };
    const avg = Math.round(rows.reduce((sum, r) => sum + r.pct, 0) / rows.length);
    const complete = rows.filter((r) => r.pct === 100).length;
    return { avg, complete };
  }, [rows]);

  if (loading) {
    return <Card><CardContent className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Calculating staff file completeness...</CardContent></Card>;
  }
  if (!rows || rows.length === 0) {
    return <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No staff profiles yet, so file completeness cannot be calculated.</CardContent></Card>;
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"><FileCheck2 className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{summary.avg}%</p><p className="text-xs text-muted-foreground">Average file completeness across {rows.length} staff</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"><FileCheck2 className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{summary.complete}</p><p className="text-xs text-muted-foreground">Staff with every required document on file</p></div>
        </CardContent></Card>
      </div>
      <Card><CardContent className="p-4">
        <p className="mb-3 text-sm font-semibold">Required documents on file ({EMPLOYEE_DOC_TYPES.length} required types per staff file)</p>
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.id}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  {r.status !== 'Active' && <Badge variant="outline" className="shrink-0 text-[10px]">{r.status}</Badge>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">{r.onFile}/{r.total} on file</span>
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${pctTone(r.pct)}`}>{r.pct}%</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-primary/20">
                <div className={`h-full rounded-full transition-all ${barTone(r.pct)}`} style={{ width: `${r.pct}%` }} />
              </div>
              {r.missing.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">Missing: {r.missing.join(', ')}{r.missingCount > r.missing.length ? ` and ${r.missingCount - r.missing.length} more` : ''}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent></Card>
    </div>
  );
}