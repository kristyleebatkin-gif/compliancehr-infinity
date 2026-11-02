import React from 'react';
import { Image } from '@/components/ui/image';

export const DEFAULT_BRAND_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

export const BRAND_SLOGAN_TEXT =
  'Complete Control. Greater Confidence. Brighter Success.';

/**
 * Canonical ComplianceHR Infinity Brand Lockup (All Centred):
 * From bottom to top: Slogan -> Name -> Logo
 * (Top: Logo, Middle: Name, Bottom: Slogan)
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

  const logoSizeClass =
    size === 'xs'
      ? 'h-4 w-11'
      : size === 'sm'
        ? 'h-5 w-14'
        : size === 'lg'
          ? 'h-8 w-20'
          : 'h-6 w-16';

  const nameSizeClass =
    size === 'xs'
      ? 'text-[10.5px]'
      : size === 'sm'
        ? 'text-[12px] sm:text-[13px]'
        : size === 'lg'
          ? 'text-base sm:text-lg'
          : 'text-[13px] sm:text-sm';

  const sloganSizeClass =
    size === 'xs'
      ? 'text-[7px]'
      : size === 'sm'
        ? 'text-[8px]'
        : 'text-[9px]';

  const isDark = theme === 'dark';

  return (
    <div
      className={`flex flex-col items-center justify-center text-center select-none ${className}`}
    >
      {/* 1. TOP: LOGO (Centred) */}
      <div className="flex items-center justify-center rounded-md border border-slate-200/90 bg-white px-1 py-0.5 shadow-2xs">
        <Image
          src={logoUrl || DEFAULT_BRAND_LOGO}
          alt={companyName || 'ComplianceHR Infinity'}
          fittingType="fit"
          className={`${logoSizeClass} shrink-0 object-contain`}
        />
      </div>

      {/* 2. MIDDLE: NAME (Centred) */}
      <div
        className={`mt-0.5 font-editorial ${nameSizeClass} font-extrabold leading-tight tracking-tight whitespace-nowrap ${
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

      {/* 3. BOTTOM: SLOGAN (Centred) */}
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