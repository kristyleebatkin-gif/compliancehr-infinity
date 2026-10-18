import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import { downloadAuditPackPdf } from '@/lib/auditPackPdf';
import { downloadCsv } from '@/lib/csvExport';
import { FileDown, Loader2, Package } from 'lucide-react';
import { format } from 'date-fns';

const AUDIT_TYPES = ['NDIS Certification Audit', 'NDIS Verification Audit', 'Mid-Term Audit', 'Internal Audit', 'Other'];

const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export default function AuditPackButton({ variant = 'default' }) {
  const { user } = useRole();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [auditType, setAuditType] = useState(AUDIT_TYPES[0]);
  const [generatedBy, setGeneratedBy] = useState('');
  const [building, setBuilding] = useState(false);

  const openDialog = () => {
    setGeneratedBy(user?.full_name || '');
    setOpen(true);
  };

  const generate = async () => {
    setBuilding(true);
    try {
      const today = dateOffset(0);
      const in90 = dateOffset(90);
      const [empExpired, empExpiring, partExpired, partExpiring, corrective, training, incidents, checklists, policies, requirements, staffCount, participantCount] = await Promise.all([
        base44.entities.EmployeeDocument.filter({ expiry_date: { $lt: today }, status: { $ne: 'Archived' } }, { sort: 'expiry_date', limit: 200, fields: ['title', 'employee_name', 'document_type', 'expiry_date'] }),
        base44.entities.EmployeeDocument.filter({ expiry_date: { $gte: today, $lte: in90 }, status: { $ne: 'Archived' } }, { sort: 'expiry_date', limit: 200, fields: ['title', 'employee_name', 'document_type', 'expiry_date'] }),
        base44.entities.ParticipantDocument.filter({ expiry_date: { $lt: today } }, { sort: 'expiry_date', limit: 200, fields: ['title', 'participant_name', 'document_type', 'expiry_date'] }),
        base44.entities.ParticipantDocument.filter({ expiry_date: { $gte: today, $lte: in90 } }, { sort: 'expiry_date', limit: 200, fields: ['title', 'participant_name', 'document_type', 'expiry_date'] }),
        base44.entities.QualityItem.filter({ type: 'Corrective Action', status: { $in: ['New', 'In Progress'] } }, { sort: 'target_date', limit: 200, fields: ['title', 'owner', 'nominated_to', 'priority', 'target_date'] }),
        base44.entities.TrainingCompletion.filter({ expiry_date: { $lte: in90 } }, { sort: 'expiry_date', limit: 200, fields: ['learner_name', 'module_title', 'expiry_date', 'certificate_number'] }),
        base44.entities.Incident.filter({ status: { $in: ['Reported', 'Under Investigation', 'Action Required'] } }, { sort: '-date_occurred', limit: 100, fields: ['incident_id', 'title', 'participant_name', 'severity', 'status', 'date_occurred'] }),
        base44.entities.ComplianceChecklistEntry.filter({}, { sort: '-completed_date', limit: 30, fields: ['title', 'completed_by', 'completed_date'] }),
        base44.entities.Policy.filter({ review_date: { $lte: in90 } }, { sort: 'review_date', limit: 100, fields: ['document_name', 'review_date'] }),
        base44.entities.LegalRequirement.filter({ next_review: { $lte: in90 } }, { sort: 'next_review', limit: 100, fields: ['title', 'next_review'] }),
        base44.entities.StaffProfile.count({ status: 'Active' }),
        base44.entities.ParticipantProfile.count({ status: 'Active' }),
      ]);

      const trainingLines = training.items.map((t) => {
        const expired = t.expiry_date && t.expiry_date < today;
        return `${t.module_title} — ${t.learner_name || 'Unassigned'} (${expired ? 'expired' : 'expires'} ${t.expiry_date})`;
      });

      const sections = [
        { title: 'Expired staff documents', status: 'At Risk', unit: 'expired', items: empExpired.items.map((d) => `${d.document_type || 'Document'}: ${d.title || 'Untitled'} — ${d.employee_name || 'Unassigned'} (expired ${d.expiry_date})`) },
        { title: 'Staff documents expiring in 90 days', status: 'Needs Attention', unit: 'expiring', items: empExpiring.items.map((d) => `${d.document_type || 'Document'}: ${d.title || 'Untitled'} — ${d.employee_name || 'Unassigned'} (expires ${d.expiry_date})`) },
        { title: 'Expired participant documents', status: 'At Risk', unit: 'expired', items: partExpired.items.map((d) => `${d.document_type || 'Document'}: ${d.title || 'Untitled'} — ${d.participant_name || 'Unassigned'} (expired ${d.expiry_date})`) },
        { title: 'Participant documents expiring in 90 days', status: 'Needs Attention', unit: 'expiring', items: partExpiring.items.map((d) => `${d.document_type || 'Document'}: ${d.title || 'Untitled'} — ${d.participant_name || 'Unassigned'} (expires ${d.expiry_date})`) },
        { title: 'Open corrective actions', status: 'Needs Attention', unit: 'actions', items: corrective.items.map((c) => `${c.title} — ${c.nominated_to || c.owner || 'Unassigned'} (${c.priority || 'Medium'} priority, target ${c.target_date || 'not set'})`) },
        { title: 'Training expiring or expired', status: 'Needs Attention', unit: 'records', items: trainingLines },
        { title: 'Open incidents', status: 'Needs Attention', unit: 'incidents', items: incidents.items.map((i) => `${i.incident_id || i.title} — ${i.participant_name || 'General'} (${i.severity || 'Medium'}, ${i.status}, ${i.date_occurred || 'date not set'})`) },
        { title: 'Recent checklist completions', status: 'Info', unit: 'records', items: checklists.items.map((c) => `${c.title} — completed ${c.completed_date || ''} by ${c.completed_by || 'staff'}`) },
        { title: 'Policy reviews due', status: 'Needs Attention', unit: 'policies', items: policies.items.map((p) => `${p.document_name || 'Untitled policy'} — review due ${p.review_date || 'not set'}`) },
        { title: 'Legal requirement reviews due', status: 'Needs Attention', unit: 'requirements', items: requirements.items.map((r) => `${r.title || 'Untitled'} — next review ${r.next_review || 'not set'}`) },
      ];

      const expiredTotal = empExpired.items.length + partExpired.items.length;
      const pack = {
        auditType,
        generatedAt: format(new Date(), "d MMM yyyy, h:mma"),
        generatedBy,
        overview: [
          { label: 'Active staff', value: staffCount },
          { label: 'Active participants', value: participantCount },
          { label: 'Expired documents', value: expiredTotal },
          { label: 'Expiring in 90 days', value: empExpiring.items.length + partExpiring.items.length },
          { label: 'Open corrective actions', value: corrective.items.length },
          { label: 'Open incidents', value: incidents.items.length },
          { label: 'Training expiring/expired', value: training.items.length },
          { label: 'Reviews due (policies + legal)', value: policies.items.length + requirements.items.length },
        ],
        sections,
      };
      downloadAuditPackPdf(pack);

      const csvRows = [
        ...corrective.items.map((c) => ({ section: 'Corrective Action', detail: c.title, person: c.nominated_to || c.owner || '', status: `${c.priority || 'Medium'} priority`, date: c.target_date || '' })),
        ...empExpired.items.map((d) => ({ section: 'Expired Staff Document', detail: `${d.document_type || ''}: ${d.title || ''}`, person: d.employee_name || '', status: 'Expired', date: d.expiry_date || '' })),
        ...empExpiring.items.map((d) => ({ section: 'Expiring Staff Document', detail: `${d.document_type || ''}: ${d.title || ''}`, person: d.employee_name || '', status: 'Expiring', date: d.expiry_date || '' })),
        ...partExpired.items.map((d) => ({ section: 'Expired Participant Document', detail: `${d.document_type || ''}: ${d.title || ''}`, person: d.participant_name || '', status: 'Expired', date: d.expiry_date || '' })),
        ...partExpiring.items.map((d) => ({ section: 'Expiring Participant Document', detail: `${d.document_type || ''}: ${d.title || ''}`, person: d.participant_name || '', status: 'Expiring', date: d.expiry_date || '' })),
        ...training.items.map((t) => ({ section: 'Training', detail: t.module_title || '', person: t.learner_name || '', status: t.expiry_date < today ? 'Expired' : 'Expiring', date: t.expiry_date || '' })),
      ];
      downloadCsv(`audit-pack-${new Date().toISOString().slice(0, 10)}.csv`, [
        { key: 'section', label: 'Section' },
        { key: 'detail', label: 'Item' },
        { key: 'person', label: 'Person Responsible' },
        { key: 'status', label: 'Status' },
        { key: 'date', label: 'Target / Expiry Date' },
      ], csvRows);

      setOpen(false);
      toast({ title: 'Audit pack ready', description: 'PDF and CSV registers downloaded.' });
    } finally {
      setBuilding(false);
    }
  };

  return (
    <>
      <Button variant={variant} onClick={openDialog}>
        <Package className="mr-2 h-4 w-4" /> Generate audit pack
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate audit pack</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Audit type</Label>
              <Select value={auditType} onValueChange={setAuditType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{AUDIT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Prepared by</Label>
              <Input value={generatedBy} onChange={(e) => setGeneratedBy(e.target.value)} placeholder="Your name" />
            </div>
            <p className="text-xs text-muted-foreground">
              Compiles document expiries, corrective actions, training, incidents, checklists and review dates into one branded PDF, plus a CSV register.
            </p>
            <Button onClick={generate} disabled={building}>
              {building ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              {building ? 'Building pack…' : 'Generate PDF + CSV'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}