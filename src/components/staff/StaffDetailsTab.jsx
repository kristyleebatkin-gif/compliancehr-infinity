import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';

const SECTIONS = [
  {
    title: 'Employment',
    fields: [
      { key: 'employee_number', label: 'Employee number' },
      { key: 'position', label: 'Position' },
      { key: 'position_level', label: 'Position level' },
      { key: 'hourly_rate', label: 'Hourly rate ($)' },
      { key: 'start_date', label: 'Start date', type: 'date' },
      { key: 'end_date', label: 'End date', type: 'date' },
      { key: 'exit_reason', label: 'Exit reason' },
      { key: 'induction_date', label: 'Induction date', type: 'date' },
      { key: 'supervisor', label: 'Supervisor' },
    ],
  },
  {
    title: 'Personal & Contacts',
    fields: [
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Address' },
      { key: 'date_of_birth', label: 'Date of birth', type: 'date' },
      { key: 'emergency_contact', label: 'Emergency contact' },
      { key: 'emergency_contact_phone', label: 'Emergency contact phone' },
    ],
  },
  {
    title: 'Payroll, Tax & Vehicle',
    fields: [
      { key: 'banking_details', label: 'Banking details (account name, BSB, account number, bank)', multiline: true },
      { key: 'superannuation_details', label: 'Superannuation details (fund, USI, member number)', multiline: true },
      { key: 'tax_file_number', label: 'Tax file number' },
      { key: 'car_rego', label: 'Car registration (rego)' },
    ],
  },
];

export default function StaffDetailsTab({ staff, onUpdated }) {
  const { toast } = useToast();
  const [form, setForm] = useState(staff);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(staff); }, [staff.id, JSON.stringify(staff)]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = Object.fromEntries(SECTIONS.flatMap((s) => s.fields.map((f) => [f.key, form[f.key] ?? ''])));
      payload.hourly_rate = form.hourly_rate ? Number(form.hourly_rate) : null;
      payload.notes = form.notes || '';
      await base44.entities.StaffProfile.update(staff.id, payload);
      toast({ title: 'Profile saved' });
      onUpdated();
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {SECTIONS.map((section) => (
        <div key={section.title} className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="mb-3 text-sm font-semibold">{section.title}</div>
          <div className="grid gap-3 md:grid-cols-2">
            {section.fields.map((f) => (
              <div key={f.key} className={f.multiline ? 'md:col-span-2 grid gap-1.5' : 'grid gap-1.5'}>
                <Label>{f.label}</Label>
                {f.multiline
                  ? <Textarea rows={3} value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />
                  : <Input type={f.type || 'text'} value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save profile
        </Button>
      </div>
    </div>
  );
}