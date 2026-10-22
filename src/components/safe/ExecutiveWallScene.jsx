import React, { useEffect, useState } from 'react';
import { Image } from '@/components/ui/image';
import { Lock, FolderLock, MessagesSquare, Inbox, Siren, History, Mail, NotebookPen, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import SilverScreenSplit from '@/components/safe/SilverScreenSplit';
import RosterMiniOverview from '@/components/communications/RosterMiniOverview';

export const SQUISHED_GRADIENT = 'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';

const DEFAULT_SOFTWARE_LOGO = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/04a0fc5c9_generated_b2aad3e7.png';

/**
 * Reusable Hanging Wall Frame — makes each screenshot look like a real framed picture
 * hanging on an office wall from a brass pin & wire.
 */
function WallHangingPictureFrame({ title, children, className = '', frameAccent = SQUISHED_GRADIENT }) {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Brass Nail & Hanging Wire on the Office Wall */}
      <div className="relative flex flex-col items-center">
        <div className="h-2 w-2 rounded-full bg-amber-400 ring-2 ring-amber-600 shadow" />
        <svg viewBox="0 0 80 14" className="h-3 w-16 -mt-0.5 overflow-visible">
          <path d="M40 0 L6 14 M40 0 L74 14" stroke="#b45309" strokeWidth="1.8" fill="none" />
        </svg>
      </div>

      {/* Outer Gallery Frame */}
      <div
        className="w-full rounded-xl p-1.5 shadow-[0_12px_28px_-6px_rgba(15,23,42,0.38)] ring-2 ring-amber-300"
        style={{ background: frameAccent }}
      >
        {/* Inner White Matboard & Screenshot Canvas */}
        <div className="h-full w-full overflow-hidden rounded-lg border-2 border-amber-200 bg-white p-2">
          {children}
        </div>
      </div>

      {/* Subtle Wall Plaque Label under Picture */}
      {title && (
        <div className="mt-1 rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-amber-950 shadow-sm">
          {title}
        </div>
      )}
    </div>
  );
}

export function ComplianceHrPhotoFrame({ logoUrl }) {
  const frameSrc = logoUrl || DEFAULT_SOFTWARE_LOGO;
  return (
    <WallHangingPictureFrame title="Picture 1 · ComplianceHR Infinity Logo">
      <div className="flex flex-col items-center justify-center bg-white p-1 text-center">
        <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg bg-white p-1">
          <Image
            src={frameSrc}
            alt="ComplianceHR Infinity Logo Screenshot"
            fittingType="fit"
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </WallHangingPictureFrame>
  );
}

export function SmallSafeVaultBar() {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-pink-400 px-2 py-1 text-white shadow-sm"
      style={{ background: SQUISHED_GRADIENT }}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded bg-white p-0.5 shadow-sm">
          <Image
            src={DEFAULT_SOFTWARE_LOGO}
            alt="ComplianceHR Infinity"
            fittingType="fit"
            className="h-full w-full object-contain"
          />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[9px] font-extrabold text-white">
            ComplianceHR Infinity Smart Vault
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Link
          to="/company-safe"
          className="inline-flex items-center gap-0.5 rounded bg-white px-1.5 py-0.5 text-[8px] font-extrabold text-blue-950 hover:bg-pink-50"
        >
          <Lock className="h-2 w-2 text-pink-600" /> Safe
        </Link>
        <Link
          to="/documents"
          className="inline-flex items-center gap-0.5 rounded bg-white px-1.5 py-0.5 text-[8px] font-extrabold text-purple-950 hover:bg-pink-50"
        >
          <FolderLock className="h-2 w-2 text-purple-700" /> Vault
        </Link>
      </div>
    </div>
  );
}

/**
 * Screenshot 4: Communication Centre & Today's Roster Overview (with Smart Vault beside Employee Log)
 */
function CommunicationCentreScreenshot({ showRosterAbove = true }) {
  const quickLinks = [
    { label: 'Alerts', icon: Siren, to: '/communications', color: '#dc2626' },
    { label: 'Auto Log', icon: History, to: '/communications', color: '#1e3a8a' },
    { label: 'Inbox', icon: Inbox, to: '/communications', color: '#0369a1' },
    { label: 'Enter Shift Notes', icon: NotebookPen, to: '/communications', color: '#d97706' },
    { label: 'Employee Log', icon: Mail, to: '/communications', color: '#c026d3' },
  ];

  return (
    <div className="space-y-1 bg-white">
      {showRosterAbove && <RosterMiniOverview />}

      <div className="rounded-lg border border-blue-300 bg-white p-1.5 space-y-1">
        <div
          className="flex items-center justify-between gap-1 rounded px-2 py-0.5 text-white"
          style={{ background: SQUISHED_GRADIENT }}
        >
          <div className="flex items-center gap-1">
            <MessagesSquare className="h-3 w-3 text-white" />
            <span className="text-[9px] font-extrabold text-white">
              Communication Centre
            </span>
          </div>
          <Link
            to="/communications"
            className="rounded bg-white px-1.5 py-0 text-[7.5px] font-extrabold text-purple-900 hover:bg-pink-50"
          >
            Open
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center gap-1 rounded border px-1 py-0.5 text-[7.5px] font-extrabold text-white"
                style={{ background: item.color, borderColor: item.color }}
              >
                <Icon className="h-2.5 w-2.5 shrink-0 text-white" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
          {/* Smart Vault beside Employee Log with ComplianceHR Infinity Logo & Colours */}
          <Link
            to="/company-safe"
            className="flex items-center gap-1 rounded border border-pink-400 px-1 py-0.5 text-[7.5px] font-extrabold text-white shadow-sm"
            style={{ background: SQUISHED_GRADIENT }}
            title="ComplianceHR Infinity Smart Vault"
          >
            <span className="flex h-3 w-3 shrink-0 items-center justify-center overflow-hidden rounded bg-white p-0.5">
              <Image
                src={DEFAULT_SOFTWARE_LOGO}
                alt="ComplianceHR Infinity"
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </span>
            <span className="truncate">Smart Vault</span>
          </Link>
        </div>

        <SmallSafeVaultBar />
      </div>
    </div>
  );
}

export default function ExecutiveWallScene({
  logoUrl,
  companyName = 'ComplianceHR Infinity',
  showRosterAbove = true,
}) {
  const frameSrc = logoUrl || DEFAULT_SOFTWARE_LOGO;

  return (
    /* OFFICE WALL SCENE — Looking straight at the office walls and framed pictures, and nothing else */
    <div className="relative overflow-hidden rounded-2xl border-4 border-purple-700 bg-white shadow-xl">
      {/* Top Ceiling Crown Moulding / Gallery Lighting Bar */}
      <div
        className="flex items-center justify-around px-4 py-1 text-white"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <span className="h-1.5 w-10 rounded-full bg-amber-200 shadow-[0_0_10px_#fde68a]" />
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-white">
          ComplianceHR Infinity · Executive Office Wall Gallery
        </span>
        <span className="h-1.5 w-10 rounded-full bg-amber-200 shadow-[0_0_10px_#fde68a]" />
      </div>

      {/* Main Office Wall Surface with Framed Screenshots Hanging on the Wall */}
      <div
        className="p-2.5 sm:p-3"
        style={{
          background:
            'linear-gradient(180deg, #ede9fe 0%, #f5f3ff 45%, #fce7f3 88%, #e0e7ff 100%)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-start">
          {/* LEFT / CENTER WALL AREA (7 cols):
              Top Row: Picture 1 (Logo Screenshot) + Picture 2 ("Compliance management, simplified end to end." with Slogan Screenshot)
              Bottom Row (Middle Tab under Business Name): Picture 3 (All 45 Modules Squashed Together Screenshot) */}
          <div className="md:col-span-7 flex flex-col gap-2">
            {/* Top Wall Row: Logo Frame + Headline & Slogan Frame */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-stretch">
              {/* PICTURE 1: Screenshot of My Logo */}
              <div className="sm:col-span-5">
                <WallHangingPictureFrame title="Logo">
                  <div className="flex h-24 w-full items-center justify-center bg-white p-1">
                    <Image
                      src={frameSrc}
                      alt="ComplianceHR Infinity Logo"
                      fittingType="fit"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </WallHangingPictureFrame>
              </div>

              {/* PICTURE 2: Screenshot of "Compliance management, simplified end to end." with Slogan */}
              <div className="sm:col-span-7">
                <WallHangingPictureFrame title="Headline & Slogan">
                  <div className="flex h-24 flex-col items-center justify-center rounded bg-gradient-to-b from-violet-50 via-white to-pink-50 px-2 py-1 text-center">
                    <div className="font-editorial text-sm sm:text-base font-bold leading-tight text-blue-950">
                      Compliance management,
                      <span className="block font-editorial-italic bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                        simplified end to end.
                      </span>
                    </div>
                    <div
                      className="mt-1.5 rounded-full px-2.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-white shadow-sm"
                      style={{ background: SQUISHED_GRADIENT }}
                    >
                      Complete Control. Greater Confidence. Brighter Success.
                    </div>
                  </div>
                </WallHangingPictureFrame>
              </div>
            </div>

            {/* PICTURE 3 (Middle Wall under Business Name): Screenshot of All 45 Modules Squashed Together */}
            <WallHangingPictureFrame title={`${companyName || 'ComplianceHR Infinity'} · All ${MODULE_DIRECTORY.length} Modules Squashed Together`}>
              <div className="space-y-1 bg-white">
                <div
                  className="flex items-center justify-between rounded px-2 py-0.5 text-white"
                  style={{ background: SQUISHED_GRADIENT }}
                >
                  <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold">
                    <LayoutGrid className="h-3 w-3" /> {companyName || 'ComplianceHR Infinity'}
                  </span>
                  <span className="text-[8px] font-extrabold">
                    {MODULE_DIRECTORY.length} Connected Modules
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                  {MODULE_DIRECTORY.map((mod) => {
                    const Icon = mod.icon;
                    const colour = moduleKeyColour(mod.key);
                    return (
                      <Link
                        key={mod.key}
                        to={mod.path}
                        className="flex items-center gap-1 rounded border bg-white px-1 py-0.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
                        style={{
                          borderColor: colour,
                          borderLeftWidth: '3px',
                        }}
                        title={mod.label}
                      >
                        <span
                          className="flex h-3 w-3 shrink-0 items-center justify-center rounded text-white"
                          style={{ background: colour }}
                        >
                          <Icon className="h-2 w-2" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[7.5px] font-extrabold text-blue-950 leading-tight">
                          {mod.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </WallHangingPictureFrame>
          </div>

          {/* OTHER SIDE OF THE OFFICE WALL (5 cols):
              Picture 4: Screenshot of Communication Centre & Today's Roster Overview
              with the Squashed Silver Screen mounted directly underneath it on the wall */}
          <div className="md:col-span-5 flex flex-col gap-2">
            {/* PICTURE 4: Screenshot of Communication Centre & Today's Roster Overview */}
            <WallHangingPictureFrame title="Communication Centre & Today's Roster">
              <CommunicationCentreScreenshot showRosterAbove={showRosterAbove} />
            </WallHangingPictureFrame>

            {/* Mounted Silver Screen directly underneath Communication Centre on the other side of the wall */}
            <WallHangingPictureFrame
              title="Silver Screen · Weather & NDIS News"
              frameAccent="linear-gradient(135deg, #64748b 0%, #cbd5e1 50%, #475569 100%)"
            >
              <SilverScreenSplit />
            </WallHangingPictureFrame>
          </div>
        </div>
      </div>

      {/* Bottom Office Wall Dado Rail / Baseboard Trim */}
      <div
        className="h-2.5 w-full border-t-2 border-amber-300"
        style={{ background: SQUISHED_GRADIENT }}
      />
    </div>
  );
}