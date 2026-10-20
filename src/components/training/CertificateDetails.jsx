import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { SIGNATURE_IMAGE_URL } from '@/lib/certificatePdf';

export default function CertificateDetails({ issueDate, expiryDate, certificateNumber }) {
  return <div className="mt-6 space-y-5">
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
      <div className="min-w-0 border-b border-border pb-2"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Date issued</p><p className="mt-1 break-words text-xs font-semibold leading-relaxed sm:text-sm">{issueDate}</p></div>
      <ShieldCheck className="h-8 w-8 shrink-0 text-primary" />
      <div className="min-w-0 border-b border-border pb-2"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Valid until</p><p className="mt-1 break-words text-xs font-semibold leading-relaxed sm:text-sm">{expiryDate}</p></div>
    </div>
    <div className="mx-auto w-full max-w-48 space-y-1">
      <Image src={SIGNATURE_IMAGE_URL} alt="Signature" fittingType="fit" className="h-12 w-full" />
      <p className="border-t border-primary/30 pt-2 text-xs font-bold tracking-wide text-primary">KRISTY WHELAN</p>
      <p className="text-[10px] font-medium text-muted-foreground">FOUNDER &amp; DIRECTOR</p>
      <p className="text-[10px] text-muted-foreground">ComplianceHR Infinity</p>
    </div>
    <p className="break-all border-t border-border pt-3 text-[10px] leading-relaxed text-muted-foreground">Certificate No: {certificateNumber}</p>
  </div>;
}