import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import ProfileAuditConsentCard from '@/components/profile/ProfileAuditConsentCard';
import ParticipantAuthorisationCard from '@/components/participants/ParticipantAuthorisationCard';
import ProfileFieldsSection from '@/components/profile/ProfileFieldsSection';
import ProfileAuditTrail from '@/components/profile/ProfileAuditTrail';
import { PARTICIPANT_PROFILE_SECTIONS as SECTIONS } from '@/lib/participantProfileFields';
import { Loader2 } from 'lucide-react';



export default function ParticipantDetailsTab({ participant, onUpdated }) {
  const { toast } = useToast();
  const [form, setForm] = useState(participant);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(participant); }, [participant.id, JSON.stringify(participant)]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const fields = SECTIONS.flatMap((section) => section.fields).filter((field) => !field.readOnly);
      const payload = Object.fromEntries(fields
        .filter((field) => (form[field.key] ?? '') !== (participant[field.key] ?? ''))
        .map((field) => [field.key, form[field.key] ?? '']));
      if (Object.keys(payload).length) await base44.entities.ParticipantProfile.update(participant.id, payload);
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
      <ProfileAuditConsentCard profile={participant} kind="participant" onUpdated={onUpdated} />
      <ParticipantAuthorisationCard participant={participant} type="sharing" onUpdated={onUpdated} />
      <ParticipantAuthorisationCard participant={participant} type="advocacy" onUpdated={onUpdated} />

      {SECTIONS.map((section) => <ProfileFieldsSection key={section.title} section={section} form={form} onChange={set} prefix={`participant-${participant.id}`} />)}

      <ProfileAuditTrail changeLog={participant.change_log} />

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save profile
        </Button>
      </div>
    </div>
  );
}