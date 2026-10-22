import React from "react";
import { Image } from "@/components/ui/image";
import { SOFTWARE_INFO } from "@/components/safe/SoftwareAndSafeBanner";

const DEFAULT_LOGO = "https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/8f4f0ca87_generated_image.png";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="app-readable min-h-screen flex flex-col justify-center items-center px-4 py-8 app-workspace-bg">
      <div className="w-full max-w-md space-y-5">
        {/* Bright Blue, Purple, Pink Header Card with Generous Spacing */}
        <div
          className="app-page-header relative overflow-hidden rounded-2xl p-6 text-white shadow-xl"
          style={{
            background: "linear-gradient(120deg, #2563eb 0%, #7c3aed 52%, #ec4899 100%)",
          }}
        >
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg ring-2 ring-white/50">
              <Image
                src={DEFAULT_LOGO}
                alt="Choices North Queensland (Choices NQ)"
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

              <div className="space-y-0.5 pt-1 text-xs font-extrabold text-white">
                <div>Business Use: Choices North Queensland</div>
                <div>Choices NQ</div>
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

        {/* Vibrant Multi-Colour Card */}
        <div
          className="relative overflow-hidden rounded-2xl border-2 bg-card p-7 shadow-panel"
          style={{
            borderColor: "#7c3aed55",
            background: "linear-gradient(165deg, rgba(124,58,237,0.10) 0%, rgba(236,72,153,0.08) 48%, #ffffff 90%)",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-1.5"
            style={{ background: "linear-gradient(90deg, #2563eb, #7c3aed 52%, #ec4899)" }}
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