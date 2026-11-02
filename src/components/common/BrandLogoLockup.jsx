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

  const APP_BORDER_GRADIENT =
    'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

  return (
    <div
      className={`flex flex-col items-center justify-center text-center select-none ${className}`}
    >
      {/* 1. TOP: LARGER READABLE LOGO ON WHITE WITH APP DESIGN COLOUR BORDER */}
      <div
        className="rounded-xl p-[2px] shadow-sm"
        style={{ background: APP_BORDER_GRADIENT }}
      >
        <div className="flex items-center justify-center rounded-[10px] bg-white px-2.5 py-1">
          <Image
            src={logoUrl || DEFAULT_BRAND_LOGO}
            alt={companyName || 'ComplianceHR Infinity'}
            fittingType="fit"
            className={`${logoSizeClass} shrink-0 object-contain`}
          />
        </div>
      </div>

      {/* 2. MIDDLE: NAME ON WHITE BACKGROUND WITH APP DESIGN COLOUR BORDER */}
      <div
        className="mt-1 rounded-full p-[1.5px] shadow-2xs"
        style={{ background: APP_BORDER_GRADIENT }}
      >
        <div
          className={`rounded-full bg-white px-3 py-0.5 font-editorial ${nameSizeClass} font-extrabold leading-tight tracking-tight whitespace-nowrap text-[#0A2B6D]`}
        >
          {isCustomName ? (
            <span style={{ color: '#0A2B6D' }}>{companyName}</span>
          ) : (
            <>
              <span style={{ color: '#0A2B6D' }}>Compliance</span>
              <span
                className="font-editorial-italic"
                style={{ color: '#5A00D6' }}
              >
                HR
              </span>{' '}
              <span
                className="bg-gradient-to-r from-[#0072FF] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent"
              >
                Infinity
              </span>
            </>
          )}
        </div>
      </div>

      {/* 3. BOTTOM: SLOGAN ON WHITE BACKGROUND WITH APP DESIGN COLOUR BORDER */}
      {showSlogan && (
        <div
          className="mt-1 rounded-full p-[1.5px] shadow-2xs"
          style={{ background: APP_BORDER_GRADIENT }}
        >
          <div
            className={`rounded-full bg-white px-2.5 py-0.5 ${sloganSizeClass} font-extrabold leading-tight whitespace-nowrap`}
          >
            <span style={{ color: '#0072FF' }}>
              Complete Control.
            </span>{' '}
            <span style={{ color: '#5A00D6' }}>
              Greater Confidence.
            </span>{' '}
            <span style={{ color: '#FF2E9A' }}>
              Brighter Success.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}