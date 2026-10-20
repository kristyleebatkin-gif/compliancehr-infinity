import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import IntakeCaseWorkflow from '@/components/intake/IntakeCaseWorkflow';

export default function EmployeeIntake() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-3 md:p-5">
      <Link to="/intake" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Intake Centre
      </Link>
      <PageHeader title="Employee Intake" subtitle="Employee details, intake information and intake forms, in one guided profile." />
      <RegisterInsights module="intake" />
      <IntakeCaseWorkflow intakeType="Employee" />
    </div>
  );
}