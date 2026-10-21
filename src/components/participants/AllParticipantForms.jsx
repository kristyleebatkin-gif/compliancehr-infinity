import React from 'react';
import { INTAKE_REQUIREMENTS } from '@/lib/intakeCases';
import { PARTICIPANT_FILLABLE_FORMS } from '@/lib/participantFillableForms';
import ParticipantFormSection from '@/components/participants/ParticipantFormSection';

const required = new Set(INTAKE_REQUIREMENTS.Participant);
const formsByKey = Object.fromEntries(PARTICIPANT_FILLABLE_FORMS.map((form) => [form.key, form]));
const requiredForms = INTAKE_REQUIREMENTS.Participant.map((key) => formsByKey[key]).filter(Boolean);
const additionalForms = PARTICIPANT_FILLABLE_FORMS.filter((form) => !required.has(form.key));

export default function AllParticipantForms({ participant }) {
  return <div className="space-y-3">
    <h3 className="text-base font-semibold">Required participant intake forms</h3>
    <p className="text-sm text-muted-foreground">Every required intake form is listed in intake order. Open a form to edit its saved answers, download it or view its linked documents.</p>
    {requiredForms.map((form) => <ParticipantFormSection key={form.key} participant={participant} form={form} required />)}
    <h3 className="pt-3 text-base font-semibold">Additional participant forms & registers</h3>
    {additionalForms.map((form) => <ParticipantFormSection key={form.key} participant={participant} form={form} />)}
  </div>;
}