import React from 'react';
import { Award } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function CertificateIdentity({ companyName, academyName, programName, learnerName, moduleTitle, moduleNumber, group, score, validityMonths }) {
  return <div className="mx-auto min-w-0 max-w-2xl space-y-5">
    <div className="space-y-1.5">
      <Image src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/e772c8399_logo.jpg" alt="App logo" fittingType="fit" className="mx-auto mb-3 h-14 w-14 rounded-full border border-primary/30" />
      <p className="break-words text-xs font-bold uppercase leading-relaxed tracking-wider text-primary">{companyName || 'ComplianceHR'}</p>
      <p className="break-words text-xs font-medium leading-relaxed">{academyName || 'ComplianceHR Training Hub'}</p>
      <p className="break-words text-[11px] leading-relaxed text-muted-foreground">{programName || 'Professional Development Program'}</p>
    </div>
    <div className="space-y-2 border-y border-primary/20 py-4">
      <Award className="mx-auto h-6 w-6 text-primary" />
      <h3 className="text-2xl font-bold leading-tight text-primary sm:text-3xl">Certificate of Completion</h3>
    </div>
    <div className="space-y-2">
      <p className="text-xs leading-relaxed text-muted-foreground">This certificate is proudly presented to</p>
      <p className="mx-auto max-w-xl break-words text-2xl font-bold leading-tight text-primary sm:text-4xl">{learnerName || 'Learner'}</p>
    </div>
    <div className="space-y-2">
      <p className="text-xs leading-relaxed text-muted-foreground">for successfully completing the training module</p>
      <p className="mx-auto max-w-xl break-words text-lg font-semibold leading-snug sm:text-xl">{moduleTitle}</p>
      <p className="break-words text-xs leading-relaxed text-muted-foreground">Module {moduleNumber} · {group}</p>
      <p className="pt-1 text-xs leading-relaxed text-muted-foreground">Achieved a competency score of {score}%<br />Valid for {validityMonths || 12} months</p>
    </div>
  </div>;
}