import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';

export default function EmployeeRiskReports({ embedded = false }) {
  return <section className="space-y-4">
    {!embedded && <PageHeader title="Risk Reporting" subtitle="Report a risk or raise an issue with management." showCompliance={false} showAudit={false} showAlerts={false} />}
    <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4">
      <Button asChild variant="outline"><Link to="/risks/submit">Report a risk</Link></Button>
      <Button asChild variant="outline"><Link to="/issues/submit">Report issues and concerns</Link></Button>
    </div>
  </section>;
}