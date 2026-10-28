import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Image } from "@/components/ui/image";
import { SOFTWARE_INFO } from "@/components/safe/SoftwareAndSafeBanner";

const DEFAULT_LOGO = "https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="app-readable min-h-screen flex flex-col justify-center items-center px-4 py-8 app-workspace-bg">
      <div className="w-full max-w-md space-y-4">
        {/* Seamless Website <-> App Top Bar */}
        <div className="flex items-center justify-between gap-2 px-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D] shadow-2xs transition hover:border-[#0072FF] hover:text-[#0072FF]"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#0072FF]" />
            <span>Back to Website</span>
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F0FF] px-2.5 py-1 text-[10.5px] font-extrabold text-[#5A00D6]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#0072FF]" />
            <span>NDIS &amp; Enterprise Security</span>
          </span>
        </div>
        {/* Symmetric Blue -> Dark Blue -> Dark Purple -> Purple -> Pink -> Purple -> Dark Purple -> Dark Blue -> Blue Header Card */}
        <div
          className="app-page-header relative overflow-hidden rounded-2xl p-6 text-white shadow-xl"
          style={{
            background: "linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)",
          }}
        >
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg ring-2 ring-white/50">
              <Image
                src={DEFAULT_LOGO}
                alt="ComplianceHR Infinity"
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-white">
                Software: {SOFTWARE_INFO.name}
              </div>

              <div className="space-y-0.5 text-sm font-extrabold leading-snug text-white">
                <div>{SOFTWARE_INFO.taglineLine1}</div>
                <div>{SOFTWARE_INFO.taglineLine2}</div>
              </div>

              <div className="space-y-0.5 rounded-lg bg-white/15 px-3 py-2 text-xs font-extrabold text-white ring-1 ring-white/25">
                <div>{SOFTWARE_INFO.sloganLine1}</div>
                <div>{SOFTWARE_INFO.sloganLine2}</div>
              </div>

              <div className="space-y-1 pt-1 text-xs font-bold text-white/95">
                <div>Developer: {SOFTWARE_INFO.developer.name}</div>
                <div>Email: {SOFTWARE_INFO.developer.email}</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-5 flex items-center gap-3 border-t border-white/25 pt-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/40">
              <Icon className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">{title}</h1>
              {subtitle && <p className="text-xs font-bold text-white/90">{subtitle}</p>}
            </div>
          </div>
        </div>

        {/* White Card with Light Border & Subtle Shadow */}
        <div
          className="relative overflow-hidden rounded-2xl border bg-white p-7 shadow-panel"
          style={{
            borderColor: "rgba(192, 132, 252, 0.55)",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-1.5"
            style={{
              background: "linear-gradient(90deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)",
            }}
          />
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm font-bold text-foreground/80">{footer}</p>
        )}
      </div>
    </div>
  );
}