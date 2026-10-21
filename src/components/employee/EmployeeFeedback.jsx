import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import EmployeePersonalRecords from '@/components/employee/EmployeePersonalRecords';
export default function EmployeeFeedback({ embedded = false }) {
  return <section className="space-y-4">{!embedded && <PageHeader title="My Feedback" subtitle="Feedback you submitted or that is assigned to you." />}
    <Button variant="outline" asChild><Link to="/feedback/submit">Submit feedback</Link></Button><EmployeePersonalRecords view="feedback" />
  </section>;
}