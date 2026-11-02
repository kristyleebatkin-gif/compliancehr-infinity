import React from 'react';
import { Image } from '@/components/ui/image';

export const DEFAULT_BRAND_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

export const BRAND_SLOGAN_TEXT =
  'Complete Control. Greater Confidence. Brighter Success.';

/**
 * Canonical ComplianceHR Infinity Brand Lockup (All Centred):
 * From bottom to top: Slogan -> Name -> Logo
 * (Top: Larger Readable Logo, Middle: Name, Bottom: Slogan in signature Blue / Purple / Pink colours)
 *
 * @param {{
 *   logoUrl?: string,
 *   companyName?: string,
 *   size?: 'xs' | 'sm' | 'md' | 'lg',
 *   theme?: 'light' | 'dark',
 *   className?: string,
 *   showSlogan?: boolean,
 * }} props
 */
export default function BrandLogoLockup({
  logoUrl = DEFAULT_BRAND_LOGO,
  companyName = 'ComplianceHR Infinity',
  size = 'sm',
  theme = 'light',
  className = '',
  showSlogan = true,
}) {
  const isCustomName = companyName && companyName !== 'ComplianceHR Infinity';

  // Increased logo size across all tiers so the infinity mark is crisp, prominent, and readable
  const logoSizeClass =
    size === 'xs'
      ? 'h-8 w-24 sm:h-9 sm:w-28'
      : size === 'sm'
        ? 'h-10 w-28 sm:h-11 sm:w-32'
        : size === 'lg'
          ? 'h-14 w-40 sm:h-16 sm:w-44'
          : 'h-12 w-32 sm:h-14 sm:w-36';

  const nameSizeClass =
    size === 'xs'
      ? 'text-xs sm:text-sm'
      : size === 'sm'
        ? 'text-sm sm:text-base'
        : size === 'lg'
          ? 'text-lg sm:text-xl'
          : 'text-base sm:text-lg';

  const sloganSizeClass =
    size === 'xs'
      ? 'text-[9px] sm:text-[10px]'
      : size === 'sm'
        ? 'text-[10px] sm:text-[11px]'
        : 'text-[11px] sm:text-xs';

  const isDark = theme === 'dark';

  return (
    <div
      className={`flex flex-col items-center justify-center text-center select-none ${className}`}
    >
      {/* 1. TOP: LARGER READABLE LOGO (Centred) */}
      <div className="flex items-center justify-center rounded-xl border border-slate-200/90 bg-white px-2 py-1 shadow-sm">
        <Image
          src={logoUrl || DEFAULT_BRAND_LOGO}
          alt={companyName || 'ComplianceHR Infinity'}
          fittingType="fit"
          className={`${logoSizeClass} shrink-0 object-contain`}
        />
      </div>

      {/* 2. MIDDLE: NAME (Centred) */}
      <div
        className={`mt-1 font-editorial ${nameSizeClass} font-extrabold leading-tight tracking-tight whitespace-nowrap ${
          isDark ? 'text-white' : 'text-[#0A2B6D]'
        }`}
      >
        {isCustomName ? (
          <span>{companyName}</span>
        ) : (
          <>
            <span style={{ color: isDark ? '#FFFFFF' : '#0A2B6D' }}>Compliance</span>
            <span
              className="font-editorial-italic"
              style={{ color: isDark ? '#00C6FF' : '#5A00D6' }}
            >
              HR
            </span>{' '}
            <span
              className="bg-gradient-to-r from-[#0072FF] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent"
              style={isDark ? { color: '#FF6EDB', WebkitTextFillColor: 'initial', background: 'none' } : undefined}
            >
              Infinity
            </span>
          </>
        )}
      </div>

      {/* 3. BOTTOM: SLOGAN IN PREVIOUS SIGNATURE COLOURS (Blue / Purple / Pink, Centred) */}
      {showSlogan && (
        <div
          className={`mt-0.5 ${sloganSizeClass} font-extrabold leading-tight whitespace-nowrap`}
        >
          <span style={{ color: isDark ? '#00C6FF' : '#0072FF' }}>
            Complete Control.
          </span>{' '}
          <span style={{ color: isDark ? '#C084FC' : '#5A00D6' }}>
            Greater Confidence.
          </span>{' '}
          <span style={{ color: isDark ? '#FF6EDB' : '#FF2E9A' }}>
            Brighter Success.
          </span>
        </div>
      )}
    </div>
  );
}