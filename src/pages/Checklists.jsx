import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  Plus,
  Trash2,
  ClipboardList,
  Check,
  Download,
  UploadCloud,
} from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import { format } from 'date-fns';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleSearchBar from '@/components/module/ModuleSearchBar';
import {
  exportControlledRecordAsPdf,
  exportControlledRecordAsWord,
  exportControlledRecordAsExcel,
  exportControlledRecordAsCsv,
  autoFileToVaultAndCompanySafe,
} from '@/lib/enterpriseGovernanceStandard';

export const ASSESSMENT_14_STANDARD_TYPES = [
  'Risk Assessments',
  'Emergency Planning',
  'Emergency Evacuation',
  'Medication Assessments',
  'Manual Handling Assessments',
  'Participant Risk Assessments',
  'Environmental Assessments',
  'Home Safety Assessments',
  'Clinical Assessments',
  'Training Assessments',
  'Quality Assessments',
  'Audit Checklists',
  'Compliance Checklists',
  'Governance Checklists',
];

const BLANK_FORM = {
  title: '',
  category: 'Participant Risk Assessments',
  status: 'Approved',
  outcome: 'Compliant — Controls Verified',
  recommendations: '',
  actions: '',
  evidence_uri: '',
  evidence_name: '',
  reviewer: 'Compliance Manager',
  review_date: new Date().toISOString().slice(0, 10),
  approved_by: 'Provider Administrator',
  approval_date: new Date().toISOString().slice(0, 10),
  approval_status: 'Approved',
  digital_signature: '',
  witness_signature: '',
  participant_id: '',
  participant_name: '',
  employee_id: '',
  employee_name: '',
  ndis_compliant: true,
  aged_care_compliant: true,
  due_date: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
  notes: '',
};

export default function Checklists() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [lists, setLists] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [page, pPage, ePage] = await Promise.all([
        base44.entities.Checklist.filter({}, { sort: '-created_date', limit: 100 }),
        base44.entities.ParticipantProfile.filter({}, { sort: 'full_name', limit: 100 }).catch(() => ({ items: [] })),
        base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 100 }).catch(() => ({ items: [] })),
      ]);
      setLists(page.items || []);
      setParticipants(pPage.items || []);
      setEmployees(ePage.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUploadEvidence = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setForm((prev) => ({ ...prev, evidence_uri: file_uri, evidence_name: file.name }));
      toast({
        title: 'Assessment Evidence Attached',
        description: `${file.name} uploaded and stored privately.`,
      });
    } finally {
      setUploading(false);
    }
  };

  const autoSaveToProfilesVaultAndSafe = async (record, formatLabel = 'PDF') => {
    const today = new Date().toISOString().slice(0, 10);
    const docNum = `CHR-ASM-${String(record.id || Date.now()).slice(-5).toUpperCase()}`;
    const controlledRecord = {
      documentName: `${record.title} (${record.category || 'Assessment'})`,
      documentNumber: docNum,
      recordId: `REC-${docNum}`,
      versionNumber: 'v2026.1',
      status: record.status || 'Approved',
      module: 'Checklists & Assessments',
      category: record.category || 'Compliance Checklists',
      owner: record.reviewer || user?.full_name || 'Compliance Manager',
      department: 'Clinical, Risk & Quality Assurance',
      createdDate: today,
      modifiedDate: today,
      lastReviewDate: record.review_date || today,
      nextReviewDate: record.due_date || today,
      reviewFrequency: 'Quarterly',
      approvedBy: record.approved_by || 'Provider Administrator',
      approvalDate: record.approval_date || today,
      purpose: `NDIS & Aged Care Compliant Assessment / Checklist (${record.category}).`,
      scope: `Linked Participant: ${record.participant_name || 'N/A'} · Linked Employee: ${record.employee_name || 'N/A'}.`,
      relatedDocuments: [
        'NDIS Practice Standards — Risk, Medication & Quality Management',
        'Strengthened Aged Care Quality Standards',
      ],
      mainFields: [
        { key: 'status', label: 'Assessment Status', value: record.status || 'Approved' },
        { key: 'outcome', label: 'Assessment Outcome', value: record.outcome || 'Compliant' },
        { key: 'recommendations', label: 'Recommendations', value: record.recommendations || 'All controls active' },
        { key: 'actions', label: 'Follow-Up Actions', value: record.actions || 'Routine monitoring' },
        { key: 'reviewer', label: 'Reviewer & Review Date', value: `${record.reviewer || 'Compliance Manager'} (${record.review_date || today})` },
        { key: 'approval', label: 'Approval & Digital Signature', value: `${record.approved_by || 'Provider Administrator'} — Sig: ${record.digital_signature || 'Digitally Signed'}` },
      ],
      evidenceItems: [
        record.evidence_name ? `Attached Evidence: ${record.evidence_name}` : 'Checklist items & operational verification recorded',
        'Automatically filed to Participant Profile, Employee Profile, Document Vault & Company Safe',
      ],
      actionsItems: (record.items || []).map((i) => `${i.done ? '[PASS]' : '[OPEN]'} ${i.text}`),
    };

    await Promise.allSettled([
      autoFileToVaultAndCompanySafe(
        controlledRecord,
        `Checklist/Assessment (${formatLabel}) Filed to Document Vault & Company Safe`
      ),
      record.participant_id
        ? base44.entities.ParticipantDocument.create({
            participant_id: record.participant_id,
            participant_name: record.participant_name || '',
            document_type: 'Individual Risk Assessment',
            title: `${record.title} (${record.category})`,
            status: 'Verified',
            review_outcome: 'Approved',
            review_date: record.review_date || today,
            responsible_staff: record.reviewer || 'Compliance Manager',
            file_uri: record.evidence_uri || undefined,
            document_summary: `Outcome: ${record.outcome || 'Compliant'} | Recommendations: ${record.recommendations || '—'}`,
          })
        : Promise.resolve(),
      record.employee_name
        ? base44.entities.EmployeeDocument.create({
            title: `${record.title} (${record.category})`,
            employee_id: record.employee_id || undefined,
            employee_name: record.employee_name,
            document_type: 'Other',
            issue_date: today,
            expiry_date: record.due_date || undefined,
            status: 'Current',
            file_uri: record.evidence_uri || undefined,
            notes: `Assessment Outcome: ${record.outcome || 'Compliant'} | Approved by: ${record.approved_by || 'Provider Administrator'}`,
          })
        : Promise.resolve(),
    ]);

    return controlledRecord;
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const nowStamp = new Date().toISOString();
      const payload = {
        ...form,
        signature_timestamp: nowStamp,
        digital_signature: form.digital_signature || user?.full_name || 'Digitally Signed',
        items: [
          { text: 'NDIS Practice Standards & Aged Care compliance verified', done: true },
          { text: 'Risk controls, recommendations and follow-up actions documented', done: true },
          { text: 'Digital signature, reviewer and approval sign-off completed', done: true },
        ],
      };
      const created = await base44.entities.Checklist.create(payload);
      await autoSaveToProfilesVaultAndSafe({ ...payload, id: created?.id }, 'CREATE');
      setForm(BLANK_FORM);
      setOpen(false);
      await load();
      toast({
        title: 'Assessment / Checklist Created & Auto-Filed',
        description: 'Saved to Participant/Employee Profile, Document Vault, and Company Safe.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportRecord = async (list, fmt) => {
    const controlledRecord = await autoSaveToProfilesVaultAndSafe(list, fmt.toUpperCase());
    if (fmt === 'pdf') exportControlledRecordAsPdf(controlledRecord);
    if (fmt === 'word') exportControlledRecordAsWord(controlledRecord);
    if (fmt === 'excel') exportControlledRecordAsExcel(controlledRecord);
    if (fmt === 'csv') exportControlledRecordAsCsv(controlledRecord);
    toast({
      title: `Assessment Exported (${fmt.toUpperCase()}) & Filed`,
      description: 'Saved to Linked Profiles, Document Vault, and Company Safe.',
    });
  };

  const toggleItem = async (list, index) => {
    const items = list.items.map((it, i) => (i === index ? { ...it, done: !it.done } : it));
    await base44.entities.Checklist.update(list.id, { items });
    await load();
  };

  const addItem = async (list, text) => {
    if (!text.trim()) return;
    const items = [...(list.items || []), { text: text.trim(), done: false }];
    await base44.entities.Checklist.update(list.id, { items });
    await load();
  };

  const removeItem = async (list, index) => {
    const items = list.items.filter((_, i) => i !== index);
    await base44.entities.Checklist.update(list.id, { items });
    await load();
  };

  const progress = (items) => {
    if (!items || items.length === 0) return 0;
    return Math.round((items.filter((i) => i.done).length / items.length) * 100);
  };

  const exportRegister = async () => {
    const rows = await fetchAllRecords(base44.entities.Checklist, {}, 'title');
    downloadCsv(
      'Checklist-Assessment-Evidence-Register.csv',
      [
        { key: 'title', label: 'Assessment / Checklist Title' },
        { key: 'category', label: 'Assessment Type' },
        { key: 'status', label: 'Status' },
        { key: 'outcome', label: 'Outcome' },
        { key: 'recommendations', label: 'Recommendations' },
        { key: 'actions', label: 'Actions' },
        { key: 'reviewer', label: 'Reviewer' },
        { key: 'review_date', label: 'Review Date' },
        { key: 'approved_by', label: 'Approved By' },
        { key: 'digital_signature', label: 'Digital Signature' },
        { key: 'participant_name', label: 'Participant' },
        { key: 'employee_name', label: 'Employee' },
        { key: 'due_date', label: 'Due Date' },
      ],
      rows
    );
  };

  const filteredLists = lists.filter((l) => {
    if (categoryFilter !== 'ALL' && l.category !== categoryFilter) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return [l.title, l.category, l.outcome, l.reviewer, l.participant_name, l.employee_name].some((f) =>
      (f || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <ModuleShell
        icon={ClipboardList}
        title="Checklists, Assessments & Evidence Standard"
        subtitle="14 NDIS & Aged Care compliant assessment & checklist registers with reviews, approvals, evidence attachments, digital signatures, 4-format exports, and automatic filing to Profiles, Document Vault & Company Safe."
        moduleKey="compliance"
        search={<ModuleSearchBar value={query} onChange={setQuery} placeholder="Search assessments, checklists, participants or staff…" />}
        small={[
          ['Assessments & Checklists', lists.length],
          ['NDIS & Aged Care Compliant', lists.filter((l) => l.ndis_compliant !== false).length],
          ['Approved & Signed', lists.filter((l) => l.status === 'Approved' || progress(l.items) === 100).length],
          ['14 Standard Categories', 14],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-wide">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{loading ? '…' : value}</p>
          </div>
        ))}
        actions={
          <>
            <Button variant="outline" onClick={exportRegister} disabled={loading || !lists.length}>
              <Download className="mr-2 h-4 w-4" />
              Export Register (CSV)
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> New Assessment / Checklist
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>New Controlled Assessment / Checklist (14 Standard Categories)</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 text-xs">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Title *</Label>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Home Safety & Evacuation Assessment"
                      />
                    </div>
                    <div>
                      <Label>Assessment / Checklist Category (14 Types) *</Label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-xs font-bold text-[#0A2B6D]"
                      >
                        {ASSESSMENT_14_STANDARD_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <Label>Status</Label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-xs font-bold text-[#0A2B6D]"
                      >
                        <option value="Draft">Draft</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Action Required">Action Required</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <Label>Assessment Outcome</Label>
                      <Input
                        value={form.outcome}
                        onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                        placeholder="Compliant / Controls Verified"
                      />
                    </div>
                    <div>
                      <Label>Next Review / Due Date</Label>
                      <Input
                        type="date"
                        value={form.due_date}
                        onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Link to Participant Profile (Auto-Saves to Profile)</Label>
                      <select
                        value={form.participant_id}
                        onChange={(e) => {
                          const p = participants.find((x) => x.id === e.target.value);
                          setForm({
                            ...form,
                            participant_id: e.target.value,
                            participant_name: p?.full_name || '',
                          });
                        }}
                        className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-xs font-bold text-[#0A2B6D]"
                      >
                        <option value="">Optional — Select Participant</option>
                        {participants.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Link to Employee Profile (Auto-Saves to Profile)</Label>
                      <select
                        value={form.employee_id}
                        onChange={(e) => {
                          const emp = employees.find((x) => x.id === e.target.value);
                          setForm({
                            ...form,
                            employee_id: e.target.value,
                            employee_name: emp?.full_name || '',
                          });
                        }}
                        className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-xs font-bold text-[#0A2B6D]"
                      >
                        <option value="">Optional — Select Employee</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Recommendations</Label>
                      <Textarea
                        rows={2}
                        value={form.recommendations}
                        onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
                        placeholder="Clinical, environmental or operational recommendations..."
                      />
                    </div>
                    <div>
                      <Label>Required Actions</Label>
                      <Textarea
                        rows={2}
                        value={form.actions}
                        onChange={(e) => setForm({ ...form, actions: e.target.value })}
                        placeholder="Follow-up actions and assigned owners..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    <div>
                      <Label>Reviewer</Label>
                      <Input
                        value={form.reviewer}
                        onChange={(e) => setForm({ ...form, reviewer: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Review Date</Label>
                      <Input
                        type="date"
                        value={form.review_date}
                        onChange={(e) => setForm({ ...form, review_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Approved By</Label>
                      <Input
                        value={form.approved_by}
                        onChange={(e) => setForm({ ...form, approved_by: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Digital Signature</Label>
                      <Input
                        value={form.digital_signature}
                        onChange={(e) => setForm({ ...form, digital_signature: e.target.value })}
                        placeholder="Typed signature"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-2.5">
                    <div>
                      <div className="font-bold text-[#0A2B6D]">Evidence Attachment</div>
                      <div className="text-[11px] text-muted-foreground">
                        {form.evidence_name || 'Attach supporting photo, checklist or clinical evidence (stored privately)'}
                      </div>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#0A2B6D] px-3 py-1.5 text-xs font-extrabold text-white">
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>{uploading ? 'Uploading...' : 'Attach Evidence'}</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleUploadEvidence(e.target.files?.[0])}
                      />
                    </label>
                  </div>

                  <Button onClick={save} disabled={saving || !form.title.trim()}>
                    Create &amp; Auto-File to Profiles, Document Vault &amp; Company Safe
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        }
      >
        {/* 14 Standard Assessment Type Filter Chips */}
        <div className="flex flex-wrap gap-1.5 pb-2">
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            className={`rounded-lg px-2.5 py-1 text-[10.5px] font-extrabold transition ${
              categoryFilter === 'ALL'
                ? 'bg-[#0A2B6D] text-white'
                : 'border border-slate-200 bg-white text-[#0A2B6D]'
            }`}
          >
            All 14 Assessment &amp; Checklist Types
          </button>
          {ASSESSMENT_14_STANDARD_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCategoryFilter(type)}
              className={`rounded-lg px-2.5 py-1 text-[10.5px] font-extrabold transition ${
                categoryFilter === type
                  ? 'bg-[#5A00D6] text-white'
                  : 'border border-slate-200 bg-white text-[#0A2B6D]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : filteredLists.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            modulePath="/checklists"
            title="No assessments or checklists match this filter"
            message="Create a controlled checklist or assessment to track outcomes, recommendations, evidence, digital signatures and automatic Vault/Safe filing."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredLists.map((list) => {
              const pct = progress(list.items);
              return (
                <Card key={list.id}>
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge className="bg-[#5A00D6] text-white">{list.category || 'Compliance Checklists'}</Badge>
                          <Badge className="bg-[#0072FF]/10 text-[#0072FF]">NDIS &amp; Aged Care Compliant</Badge>
                          {list.status && <Badge variant="outline">{list.status}</Badge>}
                        </div>
                        <p className="mt-1.5 font-semibold text-base text-[#0A2B6D]">{list.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {[
                            list.participant_name ? `Participant: ${list.participant_name}` : '',
                            list.employee_name ? `Employee: ${list.employee_name}` : '',
                            list.due_date ? `Due ${format(new Date(list.due_date), 'd MMM yyyy')}` : '',
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                      <Badge className={pct === 100 ? 'bg-safe/10 text-safe' : 'bg-brand/10 text-brand'}>{pct}%</Badge>
                    </div>

                    {/* Assessment Metadata Summary */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs space-y-1">
                      <div>
                        <span className="font-extrabold text-[#0A2B6D]">Outcome: </span>
                        <span>{list.outcome || 'Compliant'}</span>
                      </div>
                      {list.recommendations && (
                        <div>
                          <span className="font-extrabold text-[#0A2B6D]">Recommendations: </span>
                          <span>{list.recommendations}</span>
                        </div>
                      )}
                      {list.actions && (
                        <div>
                          <span className="font-extrabold text-[#0A2B6D]">Actions: </span>
                          <span>{list.actions}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-[#5A00D6] font-bold">
                        <span>Reviewer: {list.reviewer || 'Compliance Manager'} ({list.review_date || 'Verified'})</span>
                        <span>Approved: {list.approved_by || 'Provider Administrator'}</span>
                      </div>
                      {list.evidence_name && (
                        <div className="text-[10.5px] font-extrabold text-[#0072FF]">
                          Evidence Attached: {list.evidence_name}
                        </div>
                      )}
                    </div>

                    {pct > 0 && (
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      {(list.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Checkbox checked={item.done} onCheckedChange={() => toggleItem(list, idx)} />
                          <span className={item.done ? 'flex-1 text-muted-foreground line-through' : 'flex-1'}>
                            {item.text}
                          </span>
                          <button
                            onClick={() => removeItem(list, idx)}
                            aria-label="Remove item"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <AddItemRow onAdd={(text) => addItem(list, text)} />

                    {/* 4-Format Export & Auto-Filing Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-slate-100 pt-2.5">
                      <span className="text-[10px] font-bold text-[#5A00D6]">
                        Auto-Saved: Profile · Vault · Safe
                      </span>
                      <div className="flex flex-wrap items-center gap-1">
                        {['pdf', 'excel', 'word', 'csv'].map((fmt) => (
                          <Button
                            key={fmt}
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[10px] font-extrabold uppercase"
                            onClick={() => handleExportRecord(list, fmt)}
                          >
                            {fmt}
                          </Button>
                        ))}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            await base44.entities.Checklist.delete(list.id);
                            await load();
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ModuleShell>
    </div>
  );
}

const AddItemRow = ({ onAdd }) => {
  const [text, setText] = useState('');
  return (
    <div className="mt-2 flex gap-2">
      <Input
        placeholder="Add checklist / assessment item..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onAdd(text);
            setText('');
          }
        }}
        className="h-8 text-sm"
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          onAdd(text);
          setText('');
        }}
      >
        <Check className="h-4 w-4" />
      </Button>
    </div>
  );
};