import React from 'react';
import { Award, Download, ShieldCheck } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { downloadCertificatePdf, SIGNATURE_IMAGE_URL, NAVY, GOLD, TEAL_HEX } from '@/lib/certificatePdf';

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
      <div className="relative overflow-hidden rounded-xl bg-white p-8 text-center shadow-lg" style={{ border: `2px solid ${NAVY}` }}>
        {/* Inner gold border */}
        <div className="pointer-events-none absolute inset-2 rounded-md" style={{ border: `1px solid ${GOLD}` }} />
        {/* Top accent bar */}
        <div className="absolute inset-x-2 top-2 h-1" style={{ background: NAVY }} />
        <div className="absolute inset-x-2 top-3 h-0.5" style={{ background: GOLD }} />

        <div className="relative">
          {/* App logo crest */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white" style={{ border: `2px solid ${GOLD}`, boxShadow: `inset 0 0 0 2px ${NAVY}` }}>
            <Image src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/e772c8399_logo.jpg" alt="App logo" fittingType="fit" className="h-12 w-12 object-contain" />
          </div>

          <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: NAVY }}>{companyName || 'ComplianceHR'}</div>
          <div className="text-xs font-medium" style={{ color: NAVY }}>{academyName || 'ComplianceHR Training Hub'}</div>
          <div className="text-xs text-teal font-medium">{programName || 'Professional Development Program'}</div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <Award className="h-6 w-6" style={{ color: NAVY }} />
            <h3 className="text-3xl font-bold font-display" style={{ color: NAVY, fontFamily: 'Georgia, serif' }}>Certificate of Completion</h3>
          </div>
          <div className="mx-auto mt-2 h-px w-28" style={{ background: GOLD }} />

          <div className="mt-4 text-xs text-foreground/50">This certificate is proudly presented to</div>
          <div className="mt-1 text-4xl font-bold" style={{ color: NAVY, fontFamily: 'Georgia, serif' }}>{learnerName || 'Learner'}</div>
          <div className="mx-auto mt-1 h-px w-64" style={{ background: GOLD }} />

          <div className="mt-3 text-xs text-foreground/50">for successfully completing the training module</div>
          <div className="mt-1 text-lg font-semibold text-foreground" style={{ fontFamily: 'Georgia, serif' }}>{moduleTitle}</div>
          <div className="text-xs text-teal font-medium">Module {moduleNumber} · {group}</div>

          <div className="mt-2 text-xs text-foreground/60">
            Achieved a competency score of {score}% · Valid for {validityMonths || 12} months
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center items-end">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-foreground/40">Date Issued</div>
              <div className="mt-2 text-sm font-semibold" style={{ fontFamily: 'Georgia, serif', color: NAVY }}>{issueDate}</div>
              <div className="mx-auto mt-1.5 h-px w-24" style={{ background: '#777' }} />
            </div>
            <div className="flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: TEAL_HEX }}>
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-foreground/40">Valid Until</div>
              <div className="mt-2 text-sm font-semibold" style={{ fontFamily: 'Georgia, serif', color: NAVY }}>{expiryDate}</div>
              <div className="mx-auto mt-1.5 h-px w-24" style={{ background: '#777' }} />
            </div>
          </div>

          {/* Single signature block */}
          <div className="mt-7 flex flex-col items-center">
            <div className="h-16 w-56">
              <Image src={SIGNATURE_IMAGE_URL} alt="Signature" fittingType="fit" className="h-16 w-56 object-contain" />
            </div>
            <div className="h-px w-56" style={{ background: GOLD }} />
            <div className="mt-1.5 text-sm font-bold tracking-wide" style={{ color: NAVY }}>KRISTY WHELAN</div>
            <div className="text-[11px] font-medium text-foreground/60">FOUNDER &amp; DIRECTOR</div>
            <div className="text-[10px] text-foreground/45">ComplianceHR Infinity</div>
          </div>

          <div className="mt-4 text-[10px] text-foreground/40">Certificate No: {certificateNumber}</div>
        </div>
      </div>

      <button onClick={downloadPdf} className="flex w-full items-center justify-center gap-2 rounded-lg bg-safe px-4 py-2.5 text-sm font-semibold text-white hover:bg-safe/90">
        <Download className="h-4 w-4" /> Download Certificate (PDF)
      </button>
    </div>
  );
}