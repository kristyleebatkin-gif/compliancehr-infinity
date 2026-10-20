import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import ProfileFieldsSection from '@/components/profile/ProfileFieldsSection';
import ProfileAuditTrail from '@/components/profile/ProfileAuditTrail';
import ProfileAuditConsentCard from '@/components/profile/ProfileAuditConsentCard';
import { STAFF_PROFILE_SECTIONS as SECTIONS } from '@/lib/staffProfileFields';
import { Loader2, Save } from 'lucide-react';



export default function StaffDetailsTab({ staff, onUpdated }) {
  const { toast } = useToast();
  const [form, setForm] = useState(staff);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(staff); }, [staff.id, JSON.stringify(staff)]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const fields = SECTIONS.flatMap((section) => section.fields).filter((field) => !field.readOnly);
      const payload = Object.fromEntries(fields
        .filter((field) => (form[field.key] ?? '') !== (staff[field.key] ?? ''))
        .map((field) => [field.key, field.type === 'number' ? (form[field.key] === '' ? null : Number(form[field.key])) : form[field.key] ?? '']));
      if (Object.keys(payload).length) await base44.entities.StaffProfile.update(staff.id, payload);
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
      <ProfileAuditConsentCard profile={staff} kind="staff" onUpdated={onUpdated} />
      {SECTIONS.map((section) => <ProfileFieldsSection key={section.title} section={section} form={form} onChange={set} prefix={`staff-${staff.id}`} />)}

      <ProfileAuditTrail changeLog={staff.change_log} />
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save profile
        </Button>
      </div>
    </div>
  );
}