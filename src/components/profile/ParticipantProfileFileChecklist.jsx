import React from 'react';
import IntakeCaseWorkflow from '@/components/intake/IntakeCaseWorkflow';
import ParticipantDocumentsTab from '@/components/participants/ParticipantDocumentsTab';

export default function ParticipantProfileFileChecklist({ participant }) {
  return <div className="space-y-4">
    <IntakeCaseWorkflow intakeType="Participant" profile={participant} profileView="readiness" />
    <ParticipantDocumentsTab participant={participant} />
  </div>;
}