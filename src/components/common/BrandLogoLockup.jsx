import React from 'react';
import { Image } from '@/components/ui/image';

export const DEFAULT_BRAND_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

export const BRAND_SLOGAN_TEXT =
  'Complete Control. Greater Confidence. Brighter Success.';

/**
 * Canonical ComplianceHR Infinity Brand Lockup (All Centred inside ONE Border):
 * Top: Enlarged Logo
 * Middle: Enlarged Business Name
 * Bottom: Slogan (kept at compact size)
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

  // Larger, high-impact logo sizing across all headers and remotes
  const logoSizeClass =
    size === 'xs'
      ? 'h-16 w-48 sm:h-20 sm:w-56'
      : size === 'sm'
        ? 'h-20 w-56 sm:h-24 sm:w-68'
        : size === 'lg'
          ? 'h-28 w-72 sm:h-32 sm:w-80'
          : 'h-24 w-64 sm:h-28 sm:w-72';

  // Increased business name sizing
  const nameSizeClass =
    size === 'xs'
      ? 'text-base sm:text-lg'
      : size === 'sm'
        ? 'text-lg sm:text-xl'
        : size === 'lg'
          ? 'text-2xl sm:text-3xl'
          : 'text-xl sm:text-2xl';

  // Slogan size kept the same
  const sloganSizeClass =
    size === 'xs'
      ? 'text-[8.5px] sm:text-[9.5px]'
      : size === 'sm'
        ? 'text-[9.5px] sm:text-[10.5px]'
        : 'text-[10.5px] sm:text-xs';

  const APP_BORDER_GRADIENT =
    'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

  return (
    <div
      className={`inline-flex max-w-full flex-col items-center justify-center rounded-2xl p-[2.5px] text-center select-none transition-transform duration-200 hover:scale-[1.01] ${className}`}
      style={{
        background: APP_BORDER_GRADIENT,
        boxShadow: '0 4px 16px -2px rgba(0, 198, 255, 0.45), 0 2px 8px rgba(90, 0, 214, 0.3)',
      }}
    >
      {/* SINGLE UNIFIED WHITE CONTAINER WITH ONE BORDER FOR LOGO, NAME & SLOGAN */}
      <div
        className="flex w-full flex-col items-center justify-center rounded-[13.5px] bg-white px-4 py-2"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #FFFFFF 70%, #F5F0FF 100%)',
        }}
      >
        {/* 1. TOP: ENLARGED LOGO */}
        <Image
          src={logoUrl || DEFAULT_BRAND_LOGO}
          alt={companyName || 'ComplianceHR Infinity'}
          fittingType="fit"
          className={`${logoSizeClass} shrink-0 object-contain drop-shadow-2xs`}
        />

        {/* 2. MIDDLE: ENLARGED BUSINESS NAME */}
        <div
          className={`mt-1 font-editorial ${nameSizeClass} font-extrabold leading-tight tracking-tight text-[#0A2B6D]`}
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

        {/* 3. BOTTOM: SLOGAN (SAME SIZE) */}
        {showSlogan && (
          <div
            className={`mt-0.5 flex flex-wrap items-center justify-center gap-x-1 gap-y-0 text-center ${sloganSizeClass} font-extrabold leading-snug`}
          >
            <span style={{ color: '#0072FF' }}>
              Complete Control.
            </span>
            <span style={{ color: '#5A00D6' }}>
              Greater Confidence.
            </span>
            <span style={{ color: '#FF2E9A' }}>
              Brighter Success.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}