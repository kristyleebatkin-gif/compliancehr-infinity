import React from "react";
import { Image } from "@/components/ui/image";
import { SOFTWARE_INFO } from "@/components/safe/SoftwareAndSafeBanner";

const DEFAULT_LOGO = "https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/8f4f0ca87_generated_image.png";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="app-readable min-h-screen flex flex-col justify-center items-center px-4 py-8 app-workspace-bg">
      <div className="w-full max-w-md space-y-5">
        {/* Bright Blue, Purple, Pink Header Card with Company Safe Business Name, Logo & Slogan */}
        <div
          className="app-page-header relative overflow-hidden rounded-2xl p-5 text-white shadow-xl"
          style={{
            background: "linear-gradient(120deg, #2563eb 0%, #7c3aed 52%, #ec4899 100%)",
          }}
        >
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg ring-2 ring-white/50">
              <Image
                src={DEFAULT_LOGO}
                alt={SOFTWARE_INFO.business.business_name}
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/95">
                {SOFTWARE_INFO.name}
              </div>
              <div className="truncate text-base sm:text-lg font-extrabold text-white">
                {SOFTWARE_INFO.business.business_name}
              </div>
              <div className="text-xs font-bold text-white/95">
                {SOFTWARE_INFO.slogan}
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-4 flex items-center gap-3 border-t border-white/25 pt-3">
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