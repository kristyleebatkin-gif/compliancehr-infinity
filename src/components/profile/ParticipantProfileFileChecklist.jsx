import React from 'react';
import IntakeCaseWorkflow from '@/components/intake/IntakeCaseWorkflow';

export default function ParticipantProfileFileChecklist({ participant }) {
  return <div className="space-y-4">
    <IntakeCaseWorkflow intakeType="Participant" profile={participant} profileView="documents" />
  </div>;
}