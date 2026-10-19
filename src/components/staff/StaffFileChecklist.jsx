import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { statusTone } from '@/lib/statusStyles';
import { EMPLOYEE_FILE_SECTIONS } from '@/lib/employeeDocuments';
import { cn } from '@/lib/utils';
import { logUserAction } from '@/lib/actionLog';
import { FileCheck2, Loader2, Paperclip, Save, Search, Upload } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const CHECKLIST_PREFIX = 'staff-file-checklist-';

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  try {
    return Math.round((parseISO(dateStr) - new Date()) / 86400000);
  } catch {
    return null;
  }
};

export default function StaffFileChecklist({ staff }) {
  const { toast } = useToast();
  const [entry, setEntry] = useState(null);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState('');
  const [openingDoc, setOpeningDoc] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const page = await base44.entities.ComplianceChecklistEntry.filter(
          { checklist_key: `${CHECKLIST_PREFIX}${staff.id}` },
          { sort: '-created_date', limit: 1 },
        );
        if (cancelled) return;
        const found = page.items?.[0] || null;
        setEntry(found);
        setAnswers(found?.answers ? JSON.parse(found.answers) : {});
        setNotes(found?.notes || '');
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [staff.id]);

  const docTypes = useMemo(() => EMPLOYEE_FILE_SECTIONS.flatMap((s) => s.docs), []);

  const summary = useMemo(() => {
    const onFile = docTypes.filter((d) => answers[d]?.on_file).length;
    const expiring = docTypes.filter((d) => {
      const days = daysUntil(answers[d]?.expiry);
      return answers[d]?.on_file && days !== null && days <= 90;
    }).length;
    return { onFile, expiring, total: docTypes.length };
  }, [answers, docTypes]);

  const setDoc = (docType, patch) => {
    setAnswers((prev) => ({ ...prev, [docType]: { ...(prev[docType] || { on_file: false }), ...patch } }));
  };

  const uploadDoc = async (docType, file) => {
    if (!file) return;
    setUploadingDoc(docType);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setDoc(docType, { file_uri, file_name: file.name, on_file: true });
      toast({ title: 'Document uploaded (stored privately)' });
    } catch (error) {
      toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' });
      console.error(error);
    } finally {
      setUploadingDoc('');
    }
  };

  const openDoc = async (docType) => {
    const record = answers[docType];
    if (!record?.file_uri) return;
    setOpeningDoc(docType);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: record.file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      console.error(error);
    } finally {
      setOpeningDoc('');
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const time = format(new Date(), 'HH:mm');
      const prev = entry ? (entry.answers ? JSON.parse(entry.answers) : {}) : {};
      const person = { profile_type: 'employee', profile_id: staff.id, profile_name: staff.full_name };
      const payload = {
        title: `Staff File Checklist – ${staff.full_name}`,
        checklist_key: `${CHECKLIST_PREFIX}${staff.id}`,
        section: 'Human Resource Register',
        answers: JSON.stringify(answers),
        notes,
        completed_by: staff.full_name,
        completed_date: today,
        completed_time: time,
      };
      if (entry) await base44.entities.ComplianceChecklistEntry.update(entry.id, payload);
      else {
        const created = await base44.entities.ComplianceChecklistEntry.create(payload);
        setEntry(created);
      }
      // Detailed per-profile log: record each compliance item newly marked
      // complete (or outstanding) and each newly attached document.
      docTypes.filter((d) => !!(prev[d]?.on_file) !== !!(answers[d]?.on_file)).forEach((docType) => {
        logUserAction(answers[docType]?.on_file ? 'Compliance Item Marked Complete' : 'Compliance Item Marked Outstanding', 'Staff File Checklist', {
          record_title: docType, details: `Staff file checklist - ${staff.full_name}`, person,
        });
      });
      docTypes.filter((d) => answers[d]?.file_uri && answers[d]?.file_uri !== prev[d]?.file_uri).forEach((docType) => {
        logUserAction('Document Uploaded', 'Employee Document', {
          record_title: `${docType} - ${staff.full_name}`, details: 'Attached via the staff file checklist', person,
        });
      });
      toast({ title: 'Checklist saved' });
    } catch (error) {
      toast({ title: 'Could not save checklist', description: 'Please try again.', variant: 'destructive' });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const removeFile = (docType) => setDoc(docType, { file_uri: '', file_name: '' });

  const term = search.trim().toLowerCase();
  const sections = EMPLOYEE_FILE_SECTIONS.map((section) => ({
    ...section,
    docs: section.docs.filter((d) => d.toLowerCase().includes(term)),
  })).filter((s) => s.docs.length > 0);

  if (loading) {
    return <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 px-5 py-3 dark:from-teal-950/30 dark:via-cyan-950/30 dark:to-blue-950/30">
          <div className="flex items-center gap-2">
            <span className="gradient-brand flex h-7 w-7 items-center justify-center rounded-lg text-white"><FileCheck2 className="h-4 w-4" /></span>
            <span className="text-sm font-bold">Staff file checklist (online)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusTone(summary.expiring > 0 ? 'Expiring Soon' : 'Current')}>
              {summary.expiring > 0 ? `${summary.expiring} expiring / expired` : 'No expiring documents'}
            </Badge>
            <Badge className={statusTone(summary.onFile === summary.total ? 'Current' : 'Expiring Soon')}>
              {summary.onFile} of {summary.total} on file
            </Badge>
          </div>
        </div>
        <div className="p-5">
          <Progress value={summary.total ? (summary.onFile / summary.total) * 100 : 0} className="mb-4 h-2" />
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search documents…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save checklist
            </Button>
          </div>
          {entry && (
            <p className="mb-4 text-xs text-muted-foreground">
              Last saved {entry.completed_date || '—'}{entry.completed_time ? ` at ${entry.completed_time}` : ''}{entry.completed_by ? ` by ${entry.completed_by}` : ''}
            </p>
          )}
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.name} className="rounded-xl border border-border/60">
                <div className="border-b border-border/60 bg-muted/30 px-4 py-2 text-sm font-semibold">{section.name}</div>
                <div className="divide-y divide-border/40">
                  {section.docs.map((docType) => {
                    const record = answers[docType] || {};
                    const days = daysUntil(record.expiry);
                    const expired = record.on_file && days !== null && days < 0;
                    const expiring = record.on_file && days !== null && days >= 0 && days <= 90;
                    return (
                      <div key={docType} className={cn('p-3', expired && 'bg-red-50/60 dark:bg-red-950/20', expiring && 'bg-amber-50/60 dark:bg-amber-950/20')}>
                        <div className="flex flex-wrap items-center gap-3">
                          <Checkbox
                            checked={!!record.on_file}
                            onCheckedChange={(checked) => setDoc(docType, { on_file: !!checked })}
                            aria-label={`Mark ${docType} on file`}
                          />
                          <span className={cn('min-w-0 flex-1 truncate text-sm font-medium', record.on_file && 'text-muted-foreground line-through decoration-primary/40')}>{docType}</span>
                          {expired && <Badge className={statusTone('Expired')}>Expired</Badge>}
                          {expiring && <Badge className={statusTone('Expiring Soon')}>{days} days left</Badge>}
                          <div className="flex items-center gap-2">
                            <label className={cn('inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-transparent px-3 text-xs font-semibold hover:bg-accent', uploadingDoc === docType && 'pointer-events-none opacity-60')}>
                              {uploadingDoc === docType ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}Upload
                              <input type="file" className="hidden" onChange={(e) => { uploadDoc(docType, e.target.files?.[0]); e.target.value = ''; }} />
                            </label>
                            {record.file_uri && (
                              <Button variant="outline" size="sm" className="h-8" onClick={() => openDoc(docType)} disabled={openingDoc === docType}>
                                {openingDoc === docType ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}{record.file_name || 'View file'}
                              </Button>
                            )}
                          </div>
                        </div>
                        {record.on_file && (
                          <div className="mt-2 grid gap-2 pl-0 sm:grid-cols-4">
                            <div className="grid gap-1">
                              <Label className="text-xs text-muted-foreground">Date sighted</Label>
                              <Input type="date" value={record.date_sighted || ''} onChange={(e) => setDoc(docType, { date_sighted: e.target.value })} />
                            </div>
                            <div className="grid gap-1">
                              <Label className="text-xs text-muted-foreground">Expiry (if any)</Label>
                              <Input type="date" value={record.expiry || ''} onChange={(e) => setDoc(docType, { expiry: e.target.value })} />
                            </div>
                            <div className="grid gap-1">
                              <Label className="text-xs text-muted-foreground">Verified by</Label>
                              <Input placeholder="Name" value={record.verified_by || ''} onChange={(e) => setDoc(docType, { verified_by: e.target.value })} />
                            </div>
                            <div className="grid gap-1">
                              <Label className="text-xs text-muted-foreground">Attachment</Label>
                              {record.file_uri ? (
                                <Button variant="ghost" size="sm" className="justify-start" onClick={() => removeFile(docType)}>Remove file</Button>
                              ) : (
                                <p className="text-xs text-muted-foreground">No file uploaded</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {sections.length === 0 && <p className="text-sm text-muted-foreground">No documents match "{search}".</p>}
          </div>
          <div className="mt-4 grid gap-1">
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea rows={2} placeholder="Anything outstanding or comments on this employee's file" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}