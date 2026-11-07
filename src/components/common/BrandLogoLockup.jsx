import React from 'react';
import { Image } from '@/components/ui/image';

export const DEFAULT_BRAND_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/ce40e6573_generated_image.png';

export const BRAND_SLOGAN_TEXT =
  'Complete Control. Greater Confidence. Brighter Success.';

/**
 * Canonical ComplianceHR Infinity Brand Lockup:
 * Line 1 (Top): Enlarged Logo & White Frame (+1cm) with minimal white border around emblem
 * Line 2 (Middle): "ComplianceHR Infinity" on ONE single line
 * Line 3 (Bottom): Slogan on ONE single line
 */
export default function BrandLogoLockup({
  logoUrl = DEFAULT_BRAND_LOGO,
  companyName = 'ComplianceHR Infinity',
  size = 'md',
  theme = 'dark',
  className = '',
  showSlogan = true,
  compactSlogan = false,
}) {
  const isCustomName = companyName && companyName !== 'ComplianceHR Infinity';

  // Keep the same frame proportions at each size while fitting narrower layouts.
  const logoSizeClass =
    size === 'xs'
      ? 'mt-0.5 w-36 sm:w-44'
      : size === 'lg'
      ? 'mt-0.5 w-52 sm:w-60'
      : 'mt-0.5 w-44 sm:w-52';

  // Line 2: Structured heading on ONE single line
  const nameSizeClass =
    size === 'xs'
      ? 'text-base sm:text-lg mt-1'
      : size === 'lg'
      ? 'text-xl sm:text-2xl mt-1'
      : 'text-lg sm:text-xl mt-1';

  // Line 3: Slogan under name
  const sloganSizeClass = compactSlogan
    ? size === 'xs'
      ? 'text-[9px] tracking-[-0.04em] gap-x-0.5 mt-0.5'
      : 'text-[10px] sm:text-[11px] tracking-tight gap-x-1 mt-0.5'
    : size === 'xs'
      ? 'text-[9px] sm:text-[10px] tracking-tight gap-x-1.5 mt-0.5'
      : 'text-xs sm:text-[13px] tracking-wide gap-x-2 mt-0.5';

  const isDark = theme === 'dark';

  return (
    <div
      className={`inline-flex max-w-full flex-col items-center justify-center text-center select-none ${className}`}
    >
      {/* UNIFIED CONTAINER FOR LOGO, NAME & SLOGAN */}
      <div className="flex w-full flex-col items-center justify-center bg-transparent px-1 py-0.5">
        {/* LINE 1: ENLARGED (+1CM) UNCLIPPED LOGO & WHITE AREA WITH SLIGHTLY REDUCED WHITE MARGIN */}
        <div
          className={`${logoSizeClass} aspect-[13/7] max-w-full shrink-0 overflow-hidden rounded-xl border border-[#00C6FF]/60 bg-white p-0.5 shadow-[0_0_12px_rgba(255,255,255,0.45)]`}
        >
          <Image
            src={logoUrl || DEFAULT_BRAND_LOGO}
            alt={companyName || 'ComplianceHR Infinity'}
            fittingType="fit"
            className="h-full w-full object-contain"
          />
        </div>

        {/* LINE 2: "ComplianceHR Infinity" ON ONE LINE */}
        <div
          className={`font-editorial ${nameSizeClass} font-extrabold leading-tight tracking-tight whitespace-nowrap`}
        >
          {isCustomName ? (
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #00C6FF 0%, #0072FF 45%, #A100FF 75%, #FF2E9A 100%)',
              }}
            >
              {companyName}
            </span>
          ) : (
            <>
              <span style={{ color: isDark ? '#00C6FF' : '#0A2B6D' }}>Compliance{' '}</span>
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #00C6FF 0%, #0072FF 30%, #A100FF 68%, #FF2E9A 100%)',
                }}
              >
                HR Infinity
              </span>
            </>
          )}
        </div>

        {/* LINE 3: SLOGAN UNDER NAME */}
        {showSlogan && (
          <div
            className={`flex max-w-full items-center justify-center text-center ${sloganSizeClass} font-extrabold leading-tight whitespace-nowrap`}
          >
            <span style={{ color: '#00C6FF' }}>Complete Control.</span>{' '}
            <span style={{ color: '#A855F7' }}>Greater Confidence.</span>{' '}
            <span style={{ color: '#FF2E9A' }}>Brighter Success.</span>
          </div>
        )}
      </div>
    </div>
  );
}