import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';

const APP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

const GRADIENT_BORDER_STYLE = {
  border: '2px solid transparent',
  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
  color: '#0A2B6D',
};

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
                ? 'flex aspect-[13/7] w-12 shrink-0 items-center justify-center overflow-hidden rounded-md'
                : 'flex aspect-[13/7] w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg'
            }
            style={GRADIENT_BORDER_STYLE}
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
          <div className="flex min-w-0 flex-col items-start gap-1">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold text-[#0A2B6D]"
              style={GRADIENT_BORDER_STYLE}
            >
              <span style={{ color: '#0072FF' }}>◉</span>{' '}
              {branding.companyName || 'ComplianceHR Infinity'}
            </span>
            {branding.slogan && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[7.5px] font-extrabold leading-tight text-[#0A2B6D]"
                style={GRADIENT_BORDER_STYLE}
              >
                {branding.slogan}
              </span>
            )}
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
          <div className="flex min-w-0 flex-col items-start gap-1">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold text-[#0A2B6D]"
              style={GRADIENT_BORDER_STYLE}
            >
              <span style={{ color: '#0072FF' }}>◉</span> {staff?.full_name || 'Staff member'}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold text-[#0A2B6D]"
              style={GRADIENT_BORDER_STYLE}
            >
              <span style={{ color: '#5A00D6' }}>◉</span> {staff?.position || 'Support Worker'}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold text-[#0A2B6D]"
              style={GRADIENT_BORDER_STYLE}
            >
              <span style={{ color: '#FF2E9A' }}>◉</span> Employee No. {staff?.employee_number || '-'}
            </span>
          </div>
          <div
            className={
              compact
                ? 'flex h-10 w-9 shrink-0 items-center justify-center rounded-md'
                : 'flex h-16 w-14 shrink-0 items-center justify-center rounded-md'
            }
            style={GRADIENT_BORDER_STYLE}
          >
            <span className="text-[7px] font-extrabold text-[#0A2B6D]">PHOTO</span>
          </div>
        </div>
        <div
          className={
            compact
              ? 'flex flex-wrap items-center justify-between gap-1 bg-white px-2.5 py-1.5 text-[7.5px] font-bold text-[#0A2B6D]'
              : 'flex flex-wrap items-center justify-between gap-1 bg-white px-4 py-2 text-[8px] font-bold text-[#0A2B6D]'
          }
        >
          <span
            className="rounded-full px-2 py-0.5 font-extrabold text-[#0A2B6D]"
            style={GRADIENT_BORDER_STYLE}
          >
            {branding.companyName || 'ComplianceHR Infinity'}
          </span>
          <span
            className="rounded-full px-2 py-0.5 font-extrabold text-[#0A2B6D]"
            style={GRADIENT_BORDER_STYLE}
          >
            This badge remains the property of the business.
          </span>
        </div>
      </div>
    </div>
  );
}