import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2, Save, Sparkles, UploadCloud } from 'lucide-react';
import { STAFF_FILLABLE_FORMS } from '@/lib/staffFillableForms';
import { buildStaffAutofilledAnswers } from '@/lib/staffAutofill';
import { downloadFilledFormPdf } from '@/lib/participantFormPdf';
import { routeDocument } from '@/lib/documentRouting';
import OnlineDocumentFields from '@/components/documents/OnlineDocumentFields';
import ManagementSignoffSection from '@/components/documents/ManagementSignoffSection';
import { loadEmployeeForm, syncEmployeeRecord } from '@/lib/employeeRecordBridge';

export default function StaffFillableForms({ staff }) {
  const { toast } = useToast();
  const [formKey, setFormKey] = useState(STAFF_FILLABLE_FORMS[0].key);
  const [answers, setAnswers] = useState({});
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const definition = STAFF_FILLABLE_FORMS.find((f) => f.key === formKey);

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.StaffFormEntry.filter(
        { staff_id: staff.id, form_type: formKey },
        { sort: '-updated_date', limit: 1 },
      );
      const existing = page.items[0] || null;
      setEntry(existing);
      const base = buildStaffAutofilledAnswers(definition.fields, staff);
      let saved = {};
      if (existing?.answers) {
        try { saved = JSON.parse(existing.answers); } catch { saved = {}; }
      }
      const shared = await loadEmployeeForm({ profileId: staff.id, title: formKey });
      const defaults = Object.fromEntries(definition.fields.filter((field) => shared.defaults?.[field.label] !== undefined).map((field) => [field.label, shared.defaults[field.label]]));
      setAnswers({ ...base, ...defaults, ...saved, ...shared.answers });
      setEntry(shared.entry || existing);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [formKey, staff.id]);

  const autofill = () => {
    setAnswers({ ...answers, ...buildStaffAutofilledAnswers(definition.fields, staff) });
    toast({ title: 'Known details filled in' });
  };

  const save = async () => {
    setSaving(true);
    try {
      const user = await base44.auth.me();
      const payload = {
        staff_name: staff.full_name,
        form_code: definition.code,
        answers: JSON.stringify(answers),
        completed_by: user?.full_name || user?.email || '',
        completed_date: new Date().toISOString().slice(0, 10),
      };
      const savedEntry = entry ? await base44.entities.StaffFormEntry.update(entry.id, payload) : await base44.entities.StaffFormEntry.create({ ...payload, staff_id: staff.id, form_type: formKey });
      setEntry(savedEntry);
      await syncEmployeeRecord('StaffFormEntry', savedEntry.id);
      toast({ title: `${definition.key} saved` });
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const download = () => {
    downloadFilledFormPdf({
      title: definition.key,
      code: definition.code,
      subtitle: `${definition.key} - ${staff.full_name}`,
      fields: definition.fields,
      values: answers,
      managementSignoff: answers.__managementSignoff,
      completedBy: '',
    });
  };

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const user = await base44.auth.me();
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const record = await base44.entities.FormsLibraryDocument.create({
        library: `staff-${staff.id}`,
        document_type: formKey,
        title: file.name,
        file_name: file.name,
        file_uri,
        uploaded_date: new Date().toISOString().slice(0, 10),
        uploaded_by: user?.full_name || user?.email || '',
      });
      routeDocument(record, { person_name: staff.full_name, person_type: 'Employee' });
      toast({ title: `${formKey} uploaded to this staff member's record` });
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full max-w-sm space-y-1.5">
          <Label>Form</Label>
          <Select value={formKey} onValueChange={setFormKey}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STAFF_FILLABLE_FORMS.map((f) => (
                <SelectItem key={f.key} value={f.key}>{f.code} - {f.key}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={autofill}><Sparkles className="h-3.5 w-3.5" />Auto-fill details</Button>
          <Button size="sm" variant="outline" onClick={download}><Download className="h-3.5 w-3.5" />Download PDF</Button>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input bg-transparent px-3 h-8 text-xs font-semibold hover:bg-accent">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}Upload completed
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Save
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="mt-5">
          <OnlineDocumentFields fields={definition.fields} answers={answers} onChange={(label, value) => setAnswers((current) => ({ ...current, [label]: value }))} disabled={saving} />
          <ManagementSignoffSection value={answers.__managementSignoff} onChange={(signoff) => setAnswers((current) => ({ ...current, __managementSignoff: signoff }))} disabled={saving} />
        </div>
      )}
    </div>
  );
}