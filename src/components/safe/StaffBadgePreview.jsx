import React from 'react';
import { Badge } from '@/components/ui/badge';

export default function StaffBadgePreview({ branding, staff }) {
  return (
    <div className="w-[268px] shrink-0 overflow-hidden rounded-xl border border-border bg-white shadow-md">
      <div className="flex items-center gap-2.5 bg-white px-4 pb-2.5 pt-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted">
          {branding.logoDataUrl || branding.logoUrl
            ? <img src={branding.logoDataUrl || branding.logoUrl} alt="Logo" className="h-full w-full object-contain" />
            : <Badge variant="outline" className="text-[8px]">Logo</Badge>}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{branding.companyName || 'ComplianceHR'}</p>
          <p className="break-words text-[7.5px] leading-tight text-muted-foreground">{branding.slogan || ''}</p>
        </div>
      </div>
      <div className="flex h-1 w-full">
        <div className="flex-1 bg-[#2563eb]" />
        <div className="flex-1 bg-[#7c3aed]" />
        <div className="flex-1 bg-[#ec4899]" />
      </div>
      <div className="flex items-start justify-between gap-2 bg-muted/30 px-4 pb-4 pt-3">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-foreground">{staff?.full_name || 'Staff member'}</p>
          <p className="text-xs text-muted-foreground">{staff?.position || 'Support Worker'}</p>
          <p className="mt-2 text-[10px] text-muted-foreground">Employee No. {staff?.employee_number || '-'}</p>
          <div className="mt-2 h-0.5 w-10 rounded bg-[#7c3aed]" />
        </div>
        <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-white">
          <span className="text-[7px] text-muted-foreground">PHOTO</span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border/60 bg-white px-4 py-2 text-[7.5px] text-muted-foreground">
        <span className="font-semibold text-foreground/70">{branding.companyName || 'ComplianceHR'}</span>
        <span>This badge remains the property of the business.</span>
      </div>
    </div>
  );
}