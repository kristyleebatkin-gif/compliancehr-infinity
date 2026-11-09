import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import BrandLogoLockup from "@/components/common/BrandLogoLockup";

const APP_BORDER_GRADIENT =
  "linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)";

const HEADING_TEXT_GRADIENT =
  "linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div
      className="app-readable min-h-screen flex flex-col items-center px-0 pb-10"
      style={{
        background:
          "linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)",
      }}
    >
      {/* Top White Header Area Only: Canonical 3-Line Brand Logo Lockup Inside One App Design Coloured Border */}
      <div className="w-full bg-white py-3 px-4 border-b-2 border-[#5A00D6]/25 flex flex-col items-center justify-center gap-2">
        <Link to="/" aria-label="ComplianceHR Infinity Home">
          <BrandLogoLockup size="md" theme="light" showSlogan />
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0072FF] bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D] shadow-2xs transition hover:bg-[#F5F0FF]"
            style={{ color: "#0A2B6D" }}
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#0072FF]" />
            <span>Back to Website</span>
          </Link>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#5A00D6] bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D]"
            style={{ color: "#0A2B6D" }}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#5A00D6]" />
            <span>NDIS &amp; Enterprise Security</span>
          </span>
        </div>
      </div>

      <div className="w-full max-w-lg px-4 pt-6 space-y-4">
        {/* Page Header Section: White Outside Tiles with App Design Coloured Border */}
        <div
          className="preserve-island-theme overflow-hidden rounded-2xl p-[3px] shadow-xl"
          style={{ background: APP_BORDER_GRADIENT }}
        >
          <div className="rounded-[13px] bg-white p-3.5 space-y-2">
            <div
              className="rounded-xl p-[2px]"
              style={{ background: APP_BORDER_GRADIENT }}
            >
              <div className="flex items-center gap-3 rounded-[10px] bg-white px-3.5 py-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-[#0072FF] bg-white">
                  <Icon className="h-5 w-5 text-[#0072FF]" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h1
                    className="text-lg sm:text-xl font-extrabold tracking-tight bg-clip-text text-transparent"
                    style={{ backgroundImage: HEADING_TEXT_GRADIENT }}
                  >
                    ◉ {title}
                  </h1>
                </div>
              </div>
            </div>
            {subtitle && (
              <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#5A00D6] bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D]">
                <span style={{ color: "#5A00D6" }}>◉</span>
                <span style={{ color: "#0A2B6D" }}>{subtitle}</span>
              </div>
            )}
          </div>
        </div>

        {/* White Card with App Design Coloured Gradient Border */}
        <div
          className="overflow-hidden rounded-2xl p-[3px] shadow-xl"
          style={{ background: APP_BORDER_GRADIENT }}
        >
          <div className="rounded-[13px] bg-white p-6">{children}</div>
        </div>

        {footer && (
          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-full border-2 border-[#0072FF] bg-white px-4 py-1.5 text-sm font-extrabold text-[#0A2B6D] shadow-md">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}