import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import IntakeCaseWorkflow from '@/components/intake/IntakeCaseWorkflow';

export default function ParticipantIntake() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <Link to="/intake" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Intake Centre
      </Link>
      <PageHeader title="Participant Intake" subtitle="Complete participant details and securely upload every required intake record." />
      <IntakeCaseWorkflow intakeType="Participant" />
    </div>
  );
}