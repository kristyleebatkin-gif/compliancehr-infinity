import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';

export default function StaffBadgePreview({ branding, staff, compact = false }) {
  return (
    <div className={compact ? 'w-full min-w-0 overflow-hidden rounded-lg border border-border bg-card shadow-sm' : 'w-[268px] shrink-0 overflow-hidden rounded-xl border border-border bg-white shadow-md'}>
      <div className={compact ? 'flex items-center gap-2 bg-card px-2 py-1.5' : 'flex items-center gap-2.5 bg-white px-4 pb-2.5 pt-3'}>
        <div className={compact ? 'flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted' : 'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted'}>
          {branding.logoDataUrl || branding.logoUrl
            ? <Image src={branding.logoDataUrl || branding.logoUrl} alt="Logo" className="h-full w-full" fittingType="fit" />
            : <Badge variant="outline" className="text-[8px]">Logo</Badge>}
        </div>
        <div className="min-w-0">
          <p className={compact ? 'truncate text-[11px] font-bold text-foreground' : 'truncate text-sm font-bold text-foreground'}>{branding.companyName || 'ComplianceHR'}</p>
          <p className="break-words text-[7.5px] leading-tight text-muted-foreground">{branding.slogan || ''}</p>
        </div>
      </div>
      <div className="flex h-1 w-full">
        <div className="flex-1 bg-[#2563eb]" />
        <div className="flex-1 bg-[#7c3aed]" />
        <div className="flex-1 bg-[#ec4899]" />
      </div>
      <div className={compact ? 'flex items-start justify-between gap-2 bg-muted/30 px-2 py-1.5' : 'flex items-start justify-between gap-2 bg-muted/30 px-4 pb-4 pt-3'}>
        <div className="min-w-0">
          <p className={compact ? 'truncate text-xs font-bold text-foreground' : 'truncate text-base font-bold text-foreground'}>{staff?.full_name || 'Staff member'}</p>
          <p className="text-xs text-muted-foreground">{staff?.position || 'Support Worker'}</p>
          <p className={compact ? 'mt-1 text-[9px] text-muted-foreground' : 'mt-2 text-[10px] text-muted-foreground'}>Employee No. {staff?.employee_number || '-'}</p>
          <div className={compact ? 'mt-1 h-0.5 w-8 rounded bg-primary' : 'mt-2 h-0.5 w-10 rounded bg-primary'} />
        </div>
        <div className={compact ? 'flex h-10 w-9 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-card' : 'flex h-16 w-14 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-white'}>
          <span className="text-[7px] text-muted-foreground">PHOTO</span>
        </div>
      </div>
      <div className={compact ? 'flex flex-wrap items-center justify-between gap-0.5 border-t border-border/60 bg-card px-2 py-1 text-[7px] text-muted-foreground' : 'flex flex-wrap items-center justify-between gap-1 border-t border-border/60 bg-white px-4 py-2 text-[7.5px] text-muted-foreground'}>
        <span className="font-semibold text-foreground/70">{branding.companyName || 'ComplianceHR'}</span>
        <span>This badge remains the property of the business.</span>
      </div>
    </div>
  );
}