import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';

const APP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

export default function StaffBadgePreview({ branding, staff, compact = false }) {
  return (
    <div
      className={
        compact
          ? 'w-full min-w-0 overflow-hidden rounded-xl p-[2px] shadow-sm'
          : 'w-[268px] shrink-0 overflow-hidden rounded-xl p-[2px] shadow-md'
      }
      style={{ background: APP_BORDER_GRADIENT }}
    >
      <div className="overflow-hidden rounded-[10px] bg-white">
        <div
          className={
            compact
              ? 'flex items-center gap-2 bg-white px-2.5 py-1.5'
              : 'flex items-center gap-2.5 bg-white px-4 pb-2.5 pt-3'
          }
        >
          <div
            className={
              compact
                ? 'flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-[#0072FF] bg-white'
                : 'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-[#0072FF] bg-white'
            }
          >
            {branding.logoDataUrl || branding.logoUrl ? (
              <Image
                src={branding.logoDataUrl || branding.logoUrl}
                alt="Logo"
                className="h-full w-full"
                fittingType="fit"
              />
            ) : (
              <Badge variant="outline" className="text-[8px]">
                Logo
              </Badge>
            )}
          </div>
          <div className="min-w-0">
            <p
              className={
                compact
                  ? 'truncate text-[11px] font-extrabold text-[#0A2B6D]'
                  : 'truncate text-sm font-extrabold text-[#0A2B6D]'
              }
            >
              {branding.companyName || 'ComplianceHR Infinity'}
            </p>
            <p className="break-words text-[7.5px] font-bold leading-tight text-[#5A00D6]">
              {branding.slogan || ''}
            </p>
          </div>
        </div>
        <div className="h-1 w-full" style={{ background: APP_BORDER_GRADIENT }} />
        <div
          className={
            compact
              ? 'flex items-start justify-between gap-2 bg-white px-2.5 py-2'
              : 'flex items-start justify-between gap-2 bg-white px-4 pb-4 pt-3'
          }
        >
          <div className="min-w-0 space-y-1">
            <p
              className={
                compact
                  ? 'inline-flex items-center gap-1 rounded-full border-2 border-[#0072FF] bg-white px-2 py-0.5 text-xs font-extrabold text-[#0A2B6D]'
                  : 'inline-flex items-center gap-1 rounded-full border-2 border-[#0072FF] bg-white px-2.5 py-0.5 text-base font-extrabold text-[#0A2B6D]'
              }
            >
              <span style={{ color: '#0072FF' }}>◉</span> {staff?.full_name || 'Staff member'}
            </p>
            <p className="text-xs font-bold text-[#5A00D6]">
              {staff?.position || 'Support Worker'}
            </p>
            <p
              className={
                compact
                  ? 'text-[9px] font-bold text-[#0A2B6D]'
                  : 'text-[10px] font-bold text-[#0A2B6D]'
              }
            >
              Employee No. {staff?.employee_number || '-'}
            </p>
          </div>
          <div
            className={
              compact
                ? 'flex h-10 w-9 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-[#5A00D6] bg-white'
                : 'flex h-16 w-14 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-[#5A00D6] bg-white'
            }
          >
            <span className="text-[7px] font-extrabold text-[#5A00D6]">PHOTO</span>
          </div>
        </div>
        <div
          className={
            compact
              ? 'flex flex-wrap items-center justify-between gap-0.5 border-t border-[#5A00D6]/25 bg-white px-2.5 py-1 text-[7px] font-bold text-[#0A2B6D]'
              : 'flex flex-wrap items-center justify-between gap-1 border-t border-[#5A00D6]/25 bg-white px-4 py-2 text-[7.5px] font-bold text-[#0A2B6D]'
          }
        >
          <span className="font-extrabold text-[#5A00D6]">
            {branding.companyName || 'ComplianceHR Infinity'}
          </span>
          <span>This badge remains the property of the business.</span>
        </div>
      </div>
    </div>
  );
}