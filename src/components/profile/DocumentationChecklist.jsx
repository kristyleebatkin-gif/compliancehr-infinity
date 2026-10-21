import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import { Button } from '@/components/ui/button';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';
import { sectionsFor, CADENCE_MONTHS, addMonths, itemStatus } from '@/lib/documentationChecklists';
import { buildDocumentationChecklistPdf, buildDocumentationAuditReportPdf } from '@/lib/documentationAuditPdf';
import { Download, FileUp, ClipboardCheck } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

function nowDateTime() {
  const d = new Date();
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }),
  };
}

function itemKeyOf(entry) {
  try {
    return JSON.parse(entry.answers || '{}').item_key || entry.title;
  } catch {
    return entry.title;
  }
}

export default function DocumentationChecklist({ profile, kind }) {
  const checklistKey = `doc-${kind}-${profile.id}`;
  const { user } = useRole();
  const { toast } = useToast();
  const query = useQuery({
    queryKey: ['doc-checklist', checklistKey],
    queryFn: async () => (await base44.entities.ComplianceChecklistEntry.filter(
      { checklist_key: checklistKey },
      { sort: '-created_date', limit: 500 },
    )).items,
  });

  // Live sync: checklist re-reads the moment any entry is recorded anywhere.
  useEffect(() => {
    const unsub = base44.entities.ComplianceChecklistEntry.subscribe(() => query.refetch());
    return () => unsub();
  }, [checklistKey, query.refetch]);

  const entries = query.data || [];
  const sections = sectionsFor(kind);

  const latestByKey = useMemo(() => {
    const map = new Map();
    entries.forEach((entry) => {
      const key = itemKeyOf(entry);
      if (!map.has(key)) map.set(key, entry);
    });
    return map;
  }, [entries]);

  const historyByKey = useMemo(() => {
    const map = new Map();
    entries.forEach((entry) => {
      const key = itemKeyOf(entry);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(entry);
    });
    return map;
  }, [entries]);

  const stats = useMemo(() => {
    const allItems = sections.flatMap((s) => s.items);
    let current = 0;
    let overdue = 0;
    let logged = 0;
    allItems.forEach((item) => {
      const status = itemStatus(latestByKey.get(item.key));
      if (status.label === 'Overdue') overdue += 1;
      else if (status.label === 'Current') current += 1;
      if (latestByKey.has(item.key)) logged += 1;
    });
    return { total: allItems.length, current, overdue, notLogged: allItems.length - logged };
  }, [sections, latestByKey]);

  const logComplete = async (item, section) => {
    const { date, time } = nowDateTime();
    const months = CADENCE_MONTHS[item.cadence] || 0;
    const nextDue = months ? addMonths(date, months) : '';
    try {
      await base44.entities.ComplianceChecklistEntry.create({
        title: item.title,
        checklist_key: checklistKey,
        section: section.title,
        answers: JSON.stringify({ item_key: item.key, cadence: item.cadence }),
        completed_by: user?.full_name || user?.email || 'ComplianceHR user',
        completed_date: date,
        completed_time: time,
        next_due_date: nextDue,
      });
      toast({
        title: `${item.title} logged`,
        description: nextDue ? `Recorded for ${profile.full_name}. Next due ${nextDue}.` : `Recorded for ${profile.full_name}.`,
      });
    } catch (error) {
      toast({ title: 'Unable to log the checklist item', description: error.message, variant: 'destructive' });
    }
  };

  const [busyAction, setBusyAction] = useState('');
  const vaultEntity = kind === 'participant' ? base44.entities.ParticipantDocument : base44.entities.EmployeeDocument;

  const savePdfToVault = async (doc, filename, title) => {
    doc.save(filename);
    const blob = doc.output('blob');
    const file = new File([blob], filename, { type: 'application/pdf' });
    const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
    const vaultData = kind === 'participant'
      ? { title, participant_id: profile.id, participant_name: profile.full_name, document_type: 'Participant File Audit Checklist', status: 'Completed', file_uri, file_name: filename, uploaded_date: today(), submission_method: 'Online', notes: 'Generated from the Documentation & Compliance Checklist.' }
      : { title, employee_id: profile.id, employee_name: profile.full_name, ...(profile.email ? { employee_email: profile.email } : {}), document_type: 'Other', status: 'Current', file_uri, file_name: filename, issue_date: today(), notes: 'Generated from the Documentation & Compliance Checklist.' };
    await vaultEntity.create(vaultData);
  };

  const downloadChecklist = async () => {
    setBusyAction('checklist');
    try {
      const filename = `documentation-audit-checklist-${today()}.pdf`;
      const doc = buildDocumentationChecklistPdf({ profile, kind, sections, latestByKey, generatedBy: user?.full_name || user?.email || '' });
      await savePdfToVault(doc, filename, `Documentation & Compliance Audit Checklist (${today()})`);
      toast({ title: 'Audit checklist downloaded', description: 'A copy was saved to the document vault.' });
    } catch (error) {
      toast({ title: 'Unable to generate the audit checklist', description: error.message, variant: 'destructive' });
    } finally {
      setBusyAction('');
    }
  };

  const generateReport = async () => {
    setBusyAction('report');
    try {
      const filename = `documentation-audit-report-${today()}.pdf`;
      const doc = buildDocumentationAuditReportPdf({ profile, kind, sections, latestByKey, generatedBy: user?.full_name || user?.email || '' });
      await savePdfToVault(doc, filename, `Documentation & Compliance Audit Report (${today()})`);
      toast({ title: 'Audit report generated', description: 'Downloaded and saved to the document vault.' });
    } catch (error) {
      toast({ title: 'Unable to generate the audit report', description: error.message, variant: 'destructive' });
    } finally {
      setBusyAction('');
    }
  };

  const uploadCompleted = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusyAction('upload');
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const vaultData = kind === 'participant'
        ? { title: file.name.replace(/\.[^.]+$/, ''), participant_id: profile.id, participant_name: profile.full_name, document_type: 'Participant File Audit Checklist', status: 'Received', file_uri, file_name: file.name, uploaded_date: today(), submission_method: 'Upload', notes: 'Completed audit checklist uploaded from the Documentation tab.' }
        : { title: file.name.replace(/\.[^.]+$/, ''), employee_id: profile.id, employee_name: profile.full_name, ...(profile.email ? { employee_email: profile.email } : {}), document_type: 'Other', status: 'Current', file_uri, file_name: file.name, issue_date: today(), notes: 'Completed audit checklist uploaded from the Documentation tab.' };
      await vaultEntity.create(vaultData);
      toast({ title: 'Completed checklist uploaded', description: 'Saved to the document vault (stored privately).' });
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setBusyAction('');
    }
  };

  if (query.isLoading) return <div role="status" className="py-8 text-sm text-muted-foreground">Loading documentation checklist…</div>;
  if (query.isError) return <div role="alert" className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">Unable to load the documentation checklist: {query.error.message}</div>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-card p-3 text-xs font-semibold shadow-sm">
        <span className="text-sm">Documentation &amp; Compliance Checklist</span>
        <span className="rounded-full bg-safe/15 px-2.5 py-1 text-safe">{stats.current}/{stats.total} current</span>
        {stats.overdue > 0 && <span className="rounded-full bg-danger/15 px-2.5 py-1 text-danger">{stats.overdue} overdue</span>}
        {stats.notLogged > 0 && <span className="rounded-full bg-warning/15 px-2.5 py-1 text-warning">{stats.notLogged} not yet logged</span>}
        <span className="ml-auto text-[11px] font-medium text-muted-foreground">Every item is logged and recorded with who, when and next due.</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-card p-2 text-xs shadow-sm">
        <span className="font-semibold">Audit checklist</span>
        <Button size="sm" variant="outline" disabled={busyAction !== ''} onClick={downloadChecklist}><Download /> {busyAction === 'checklist' ? 'Preparing…' : 'Download checklist (PDF)'}</Button>
        <Button size="sm" variant="outline" disabled={busyAction !== ''} onClick={generateReport}><ClipboardCheck /> {busyAction === 'report' ? 'Generating…' : 'Generate audit report (PDF)'}</Button>
        <label className="inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-md border border-input bg-transparent px-3 text-xs font-medium shadow-sm hover:bg-accent">
          <FileUp className="h-3.5 w-3.5" /> {busyAction === 'upload' ? 'Uploading…' : 'Upload completed checklist'}
          <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.docx" className="hidden" disabled={busyAction !== ''} onChange={uploadCompleted} />
        </label>
        <span className="text-[11px] text-muted-foreground">The checklist and audit report are saved to the document vault automatically.</span>
      </div>

      {sections.map((section) => {
        const sectionCurrent = section.items.filter((item) => itemStatus(latestByKey.get(item.key)).label === 'Current').length;
        return (
          <EmployeeProfileSection
            key={section.key}
            title={`${section.title} — ${sectionCurrent}/${section.items.length} current`}
            tone={section.tone}
          >
            <div className="space-y-1">
              {section.items.map((item) => {
                const latest = latestByKey.get(item.key);
                const status = itemStatus(latest);
                const history = historyByKey.get(item.key) || [];
                return (
                  <div key={item.key} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-2 text-[11px] text-black">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-[10px] opacity-70">{item.note}</p>
                      <p className="text-[10px] opacity-70">
                        {latest
                          ? `Last logged ${latest.completed_date} by ${latest.completed_by}${latest.next_due_date ? ` · next due ${latest.next_due_date}` : ''}`
                          : 'Not yet logged'}
                      </p>
                      {history.length > 1 && (
                        <details className="mt-0.5 text-[10px] opacity-80">
                          <summary className="cursor-pointer">History ({history.length})</summary>
                          <ul className="mt-0.5 space-y-0.5">
                            {history.map((entry) => (
                              <li key={entry.id}>{entry.completed_date} · {entry.completed_by} · next due {entry.next_due_date || 'n/a'}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold">{item.cadence}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status.className}`}>{status.label}</span>
                      <Button size="sm" variant="outline" onClick={() => logComplete(item, section)}>Log complete</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </EmployeeProfileSection>
        );
      })}
    </div>
  );
}