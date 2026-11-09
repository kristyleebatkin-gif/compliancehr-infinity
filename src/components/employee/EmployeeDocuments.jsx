import React from 'react';
import PageHeader from '@/components/PageHeader';
import EmployeeDocumentForm from '@/components/employee/EmployeeDocumentForm';
import EmployeePersonalRecords from '@/components/employee/EmployeePersonalRecords';
import ReportGenerator from '@/components/reports/ReportGenerator';
export default function EmployeeDocuments({ embedded = false }) {
  return <section className="space-y-4">
    {!embedded && <PageHeader title="My Document Vault" subtitle="Your documents and new uploads to your own employee file." />}
    {!embedded && <ReportGenerator area="documents" />}
    <EmployeeDocumentForm /><EmployeePersonalRecords view="documents" />
  </section>;
}