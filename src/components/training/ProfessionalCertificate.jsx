import React from 'react';
import { Download } from 'lucide-react';
import { downloadCertificatePdf } from '@/lib/certificatePdf';
import CertificateIdentity from '@/components/training/CertificateIdentity';
import CertificateDetails from '@/components/training/CertificateDetails';

export default function ProfessionalCertificate({ learnerName, companyName, moduleTitle, moduleNumber, group, date, score, validityMonths, certificateNumber, academyName, programName }) {
  const fmtDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const issueDate = fmtDate(date);
  const expiry = date ? new Date(new Date(date).setMonth(new Date(date).getMonth() + (validityMonths || 12))) : null;
  const expiryDate = fmtDate(expiry && expiry.toISOString().slice(0, 10));

  const downloadPdf = async () => {
    await downloadCertificatePdf(
      { learnerName, companyName, moduleTitle, moduleNumber, group, date, score, validityMonths, certificateNumber, academyName, programName },
      `Certificate_${(moduleTitle || 'Module').replace(/[^a-zA-Z]/g, '_')}_${(learnerName || 'Learner').replace(/[^a-zA-Z]/g, '_')}.pdf`
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative min-w-0 overflow-hidden rounded-xl border-2 border-primary bg-card px-5 py-6 text-center text-card-foreground shadow-sm sm:p-8">
        <div className="pointer-events-none absolute inset-2 rounded-md border border-primary/25" />
        <div className="relative">
          <CertificateIdentity {...{ companyName, academyName, programName, learnerName, moduleTitle, moduleNumber, group, score, validityMonths }} />
          <CertificateDetails {...{ issueDate, expiryDate, certificateNumber }} />
        </div>
      </div>

      <button onClick={downloadPdf} className="flex w-full items-center justify-center gap-2 rounded-lg bg-safe px-4 py-2.5 text-sm font-semibold text-white hover:bg-safe/90">
        <Download className="h-4 w-4" /> Download Certificate (PDF)
      </button>
    </div>
  );
}