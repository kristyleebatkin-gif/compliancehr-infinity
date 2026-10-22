import React, { useEffect, useState } from 'react';
import { Image } from '@/components/ui/image';
import { Clock, Sparkles, Armchair, Frame, UserCheck } from 'lucide-react';

export default function ExecutiveWallScene({ logoUrl, companyName, sloganLine1, sloganLine2 }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('en-AU', {
    timeZone: 'Australia/Sydney',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateStr = now.toLocaleDateString('en-AU', {
    timeZone: 'Australia/Sydney',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="relative overflow-hidden rounded-2xl border-2 p-5 shadow-md"
      style={{
        borderColor: '#7c3aed66',
        background:
          'linear-gradient(180deg, rgba(37,99,235,0.14) 0%, rgba(124,58,237,0.14) 58%, rgba(236,72,153,0.18) 59%, rgba(254,243,199,0.35) 100%)',
      }}
    >
      {/* Top Wall Moulding Bar in Blue - Purple - Pink */}
      <div
        className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-2 text-white shadow-sm"
        style={{ background: 'linear-gradient(120deg, #2563eb 0%, #7c3aed 52%, #ec4899 100%)' }}
      >
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider">
          <Frame className="h-3.5 w-3.5" /> Executive Office Wall &amp; Smart Workspace
        </span>
        <span className="text-[11px] font-bold text-white/95">
          Framed Logo Above Corner Chair · Smart Clock Between You &amp; Wall
        </span>
      </div>

      {/* Main Wall + Floor Grid */}
      <div className="grid gap-5 md:grid-cols-3 items-stretch">
        {/* LEFT COLUMN (Front Corner: Framed Logo on Top of Wall in Line with Chair on Floor) */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border-2 border-violet-300/80 bg-white/90 p-4 shadow-sm">
          {/* Picture Frame on the Wall (Directly Above Chair) */}
          <div className="flex flex-col items-center text-center">
            <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-violet-800">
              <Frame className="h-3 w-3" /> Top of Wall · Framed Logo
            </span>
            <div
              className="w-full rounded-2xl border-4 p-3 shadow-lg"
              style={{
                borderColor: '#7c3aed',
                background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #fdf2f8 100%)',
              }}
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-pink-300 bg-white p-1.5 shadow">
                <Image
                  src={logoUrl}
                  alt={companyName}
                  fittingType="fit"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="mt-2 text-xs font-extrabold text-violet-950">{companyName}</div>
              <div className="mt-0.5 text-[10px] font-extrabold text-pink-700">{sloganLine1}</div>
              <div className="text-[10px] font-extrabold text-pink-700">{sloganLine2}</div>
            </div>
          </div>

          {/* Vertical Alignment Line showing Logo is in line with Chair */}
          <div className="mx-auto h-4 w-0.5 bg-gradient-to-b from-violet-500 to-pink-500" />

          {/* Chair on the Floor in the Front Corner (Aligned Under Framed Logo) */}
          <div
            className="flex flex-col items-center rounded-xl border-2 p-3 text-center shadow-sm"
            style={{
              borderColor: '#ec489966',
              background: 'linear-gradient(145deg, rgba(236,72,153,0.16), rgba(124,58,237,0.10), #ffffff)',
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed 55%, #ec4899)' }}
            >
              <Armchair className="h-6 w-6" />
            </div>
            <div className="mt-1.5 text-xs font-extrabold text-pink-950">
              Front Corner Floor Chair
            </div>
            <div className="text-[11px] font-bold text-foreground/80">
              Seated on the floor in line under the framed wall logo, beside you &amp; I
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN (Smart Clock Between You and the Wall) */}
        <div
          className="flex flex-col items-center justify-center rounded-2xl border-2 p-5 text-center shadow-sm"
          style={{
            borderColor: '#2563eb66',
            background: 'linear-gradient(145deg, rgba(37,99,235,0.16) 0%, rgba(124,58,237,0.12) 55%, #ffffff 100%)',
          }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-800">
            <Clock className="h-3.5 w-3.5" /> Smart Clock · Between You &amp; Wall
          </span>

          <div
            className="my-4 w-full rounded-2xl border-2 px-4 py-5 text-white shadow-lg"
            style={{
              borderColor: '#ffffff66',
              background: 'linear-gradient(120deg, #2563eb 0%, #7c3aed 52%, #ec4899 100%)',
            }}
          >
            <div className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {timeStr}
            </div>
            <div className="mt-1.5 text-xs font-extrabold uppercase tracking-wider text-white/95">
              {dateStr}
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              Live Smart Sync · AEST
            </div>
          </div>

          <p className="text-xs font-extrabold text-blue-950">
            Positioned in between you and the wall for instant compliance time-tracking
          </p>
        </div>

        {/* RIGHT COLUMN (Beside Me & You — Shared Floor Seating & Active Workspace) */}
        <div
          className="flex flex-col justify-between gap-4 rounded-2xl border-2 p-4 shadow-sm"
          style={{
            borderColor: '#0d948866',
            background: 'linear-gradient(145deg, rgba(13,148,136,0.15) 0%, rgba(236,72,153,0.10) 55%, #ffffff 100%)',
          }}
        >
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-teal-800">
              <UserCheck className="h-3.5 w-3.5" /> Beside You &amp; I · Floor Workspace
            </span>
            <h4 className="text-sm font-extrabold text-teal-950">
              ComplianceHR INFINITY Collaborative Space
            </h4>
            <p className="text-xs font-bold leading-relaxed text-foreground/85">
              Your chair is placed down on the floor beside you and I in the front corner, aligned with the framed business logo on the top of the wall and the live Smart Clock.
            </p>
          </div>

          <div
            className="flex items-center gap-3 rounded-xl border-2 p-3"
            style={{
              borderColor: '#7c3aed55',
              background: 'linear-gradient(120deg, rgba(37,99,235,0.10), rgba(124,58,237,0.12), rgba(236,72,153,0.12))',
            }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow"
              style={{ background: 'linear-gradient(135deg, #ec4899, #7c3aed)' }}
            >
              <Armchair className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-violet-950">Chair Seated Beside You &amp; I</div>
              <div className="text-[11px] font-bold text-pink-800">
                Complete Control. Greater Confidence. Brighter Success.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-violet-50 px-3 py-2 text-[11px] font-extrabold text-violet-900 border border-violet-200">
            <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-pink-600" /> Choices North Queensland</span>
            <span>Choices NQ</span>
          </div>
        </div>
      </div>
    </div>
  );
}