import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { contractDutiesDefault, pdDefaults } from '@/lib/hrPaperworkTemplates';
import { downloadContractPdf, downloadPositionDescriptionPdf } from '@/lib/hrPaperworkPdf';
import { toast } from '@/components/ui/use-toast';

const EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Casual', 'Fixed Term', 'Contractor'];
const DEFAULT_AWARD = 'Social, Community, Home Care and Disability Services Industry Award 2010 (SCHADS)';

const empty = {
  staff_profile_id: '', employee_id: '', employee_name: '', position_title: '',
  employment_type: 'Part Time', classification: '', industrial_instrument: DEFAULT_AWARD,
  manager_name: '', commencement_date: '', probation_end_date: '', ordinary_weekly_hours: '',
  hourly_rate: '', end_date: '', position_duties: '', reports_to: '', position_purpose: '',
  key_responsibilities: '', essential_requirements: '', qualifications_experience: '', performance_measures: '',
};

export default function HrPaperworkDialog({ open, onOpenChange, staff, business, userName, onSaved }) {
  const [kind, setKind] = useState('contract');
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const pickStaff = (id) => {
    const s = staff.find((x) => x.id === id);
    if (!s) { setForm(empty); return; }
    const pd = pdDefaults(s.role, s.position);
    setForm({
      ...empty,
      staff_profile_id: s.id,
      employee_id: s.employee_number || '',
      employee_name: s.full_name,
      position_title: s.position || '',
      employment_type: s.role === 'Support Worker' ? 'Casual' : 'Part Time',
      classification: s.position_level || '',
      manager_name: s.supervisor || '',
      reports_to: s.supervisor || '',
      commencement_date: s.start_date || '',
      hourly_rate: s.hourly_rate || '',
      position_duties: contractDutiesDefault(s.role),
      position_purpose: pd.position_purpose,
      key_responsibilities: pd.key_responsibilities,
      essential_requirements: pd.essential_requirements,
      qualifications_experience: pd.qualifications_experience,
      performance_measures: pd.performance_measures,
    });
  };

  const save = async () => {
    if (!form.employee_name || !form.position_title) {
      toast({ title: 'Employee name and position title are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = kind === 'contract' ? {
        staff_profile_id: form.staff_profile_id || '',
        employee_id: form.employee_id,
        employee_name: form.employee_name,
        position_title: form.position_title,
        employment_type: form.employment_type,
        classification: form.classification,
        industrial_instrument: form.industrial_instrument,
        manager_name: form.manager_name,
        commencement_date: form.commencement_date,
        end_date: form.end_date,
        probation_end_date: form.probation_end_date,
        ordinary_weekly_hours: form.ordinary_weekly_hours ? Number(form.ordinary_weekly_hours) : undefined,
        hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : undefined,
        position_duties: form.position_duties,
        contract_status: 'Sent',
        completed_date: new Date().toISOString().slice(0, 10),
        completed_by: userName,
      } : {
        staff_profile_id: form.staff_profile_id || '',
        employee_id: form.employee_id,
        employee_name: form.employee_name,
        position_title: form.position_title,
        reports_to: form.reports_to,
        employment_type: form.employment_type,
        position_purpose: form.position_purpose,
        key_responsibilities: form.key_responsibilities,
        essential_requirements: form.essential_requirements,
        qualifications_experience: form.qualifications_experience,
        performance_measures: form.performance_measures,
        status: 'Issued',
      };
      const res = await base44.functions.invoke('hrPaperwork', { action: 'create', kind, data: payload });
      const record = res.data.record;
      if (kind === 'contract') downloadContractPdf(record, business, userName);
      else downloadPositionDescriptionPdf(record, business, userName);
      toast({ title: 'Document saved and PDF downloaded' });
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast({ title: 'Could not save document', description: e?.response?.data?.error || e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prepare HR paperwork</DialogTitle>
          <DialogDescription>Pick a staff member to prefill their details, edit the professional wording as needed, then save and download the branded document.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Document type</Label>
              <Select value={kind} onValueChange={(v) => setKind(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Employment Contract</SelectItem>
                  <SelectItem value="position">Position Description</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Staff member (prefills the form)</Label>
              <Select value={form.staff_profile_id} onValueChange={pickStaff}>
                <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                <SelectContent>
                  {staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}{s.position ? ` - ${s.position}` : ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5"><Label>Employee name *</Label><Input value={form.employee_name} onChange={(e) => setF('employee_name', e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Position title *</Label><Input value={form.position_title} onChange={(e) => setF('position_title', e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Employment type</Label>
              <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={form.employment_type} onChange={(e) => setF('employment_type', e.target.value)}>
                {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5"><Label>Classification / level</Label><Input value={form.classification} onChange={(e) => setF('classification', e.target.value)} placeholder="e.g. SCHADS Level 2.1" /></div>
            <div className="grid gap-1.5 sm:col-span-2"><Label>Award / agreement</Label><Input value={form.industrial_instrument} onChange={(e) => setF('industrial_instrument', e.target.value)} /></div>
          </div>

          {kind === 'contract' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5"><Label>Manager / supervisor</Label><Input value={form.manager_name} onChange={(e) => setF('manager_name', e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Commencement date</Label><Input type="date" value={form.commencement_date} onChange={(e) => setF('commencement_date', e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Probation end date</Label><Input type="date" value={form.probation_end_date} onChange={(e) => setF('probation_end_date', e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>End date (fixed term only)</Label><Input type="date" value={form.end_date} onChange={(e) => setF('end_date', e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Ordinary weekly hours</Label><Input type="number" step="0.5" value={form.ordinary_weekly_hours} onChange={(e) => setF('ordinary_weekly_hours', e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Hourly rate ($)</Label><Input type="number" step="0.01" value={form.hourly_rate} onChange={(e) => setF('hourly_rate', e.target.value)} /></div>
              <div className="grid gap-1.5 sm:col-span-2"><Label>Position duties (one per line)</Label><Textarea rows={6} value={form.position_duties} onChange={(e) => setF('position_duties', e.target.value)} /></div>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Reports to</Label><Input value={form.reports_to} onChange={(e) => setF('reports_to', e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Position purpose</Label><Textarea rows={3} value={form.position_purpose} onChange={(e) => setF('position_purpose', e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Key responsibilities (one per line)</Label><Textarea rows={7} value={form.key_responsibilities} onChange={(e) => setF('key_responsibilities', e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Essential requirements (one per line)</Label><Textarea rows={4} value={form.essential_requirements} onChange={(e) => setF('essential_requirements', e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Qualifications and experience</Label><Textarea rows={3} value={form.qualifications_experience} onChange={(e) => setF('qualifications_experience', e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Performance measures (one per line)</Label><Textarea rows={4} value={form.performance_measures} onChange={(e) => setF('performance_measures', e.target.value)} /></div>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save & download PDF'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}