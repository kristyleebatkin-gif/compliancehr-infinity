import React from 'react';
import { PARTICIPANT_PROFILE_SECTIONS } from '@/lib/participantProfileFields';

export default function ParticipantReadOnlyDetails({ participant }) {
  const sections = [{ title: 'About me', fields: [{ key: 'about_me', label: 'About me' }] }, ...PARTICIPANT_PROFILE_SECTIONS];
  return <div className="space-y-4">
    <p className="text-sm text-muted-foreground">View only. Shared participant profiles can only be updated by admins and managers.</p>
    {sections.map((section) => <section key={section.title} className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 font-semibold">{section.title}</h3>
      <dl className="grid gap-3 sm:grid-cols-2">
        {section.fields.map((field) => <div key={field.key} className={field.multiline ? 'sm:col-span-2' : ''}>
          <dt className="text-xs text-muted-foreground">{field.label}</dt>
          <dd className="whitespace-pre-wrap break-words text-sm">{participant[field.key] ?? 'Not recorded'}</dd>
        </div>)}
      </dl>
    </section>)}
  </div>;
}