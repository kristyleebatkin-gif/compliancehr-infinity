import React from 'react';
import { FileText } from 'lucide-react';
import BoardReportButton from '@/components/compliance/BoardReportButton';

const APP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

export default function ManagementReviewReport() {
  return (
    <section
      className="management-review-report preserve-island-theme overflow-hidden rounded-2xl p-[3px] shadow-md"
      style={{ background: APP_BORDER_GRADIENT }}
    >
      <div
        className="rounded-[13px] p-3"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        <div
          className="rounded-2xl p-[2px]"
          style={{ background: APP_BORDER_GRADIENT }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-white px-3.5 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#0072FF]"
                style={{
                  border: '2px solid transparent',
                  background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                }}
              >
                <FileText className="h-4 w-4 text-[#0072FF]" />
              </span>
              <div>
                <h2 className="font-display text-sm font-extrabold text-[#0A2B6D]" style={{ color: '#0A2B6D' }}>
                  <span style={{ color: '#5A00D6' }}>◉</span> Management review report
                </h2>
                <p className="mt-0.5 text-[11px] font-bold leading-4 text-[#0A2B6D]" style={{ color: '#0A2B6D' }}>
                  Export the current risk and compliance status as a PDF summary for management.
                </p>
              </div>
            </div>
            <div className="management-review-actions flex flex-wrap items-center gap-2">
              <BoardReportButton />
              <BoardReportButton checklist />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}