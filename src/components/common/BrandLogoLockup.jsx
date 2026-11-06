import React from 'react';
import { Image } from '@/components/ui/image';

export const DEFAULT_BRAND_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/ce40e6573_generated_image.png';

export const BRAND_SLOGAN_TEXT =
  'Complete Control. Greater Confidence. Brighter Success.';

/**
 * Canonical ComplianceHR Infinity Brand Lockup:
 * Line 1 (Top): Larger Logo brought down slightly to fit well on Black Background, centred
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
}) {
  const isCustomName = companyName && companyName !== 'ComplianceHR Infinity';

  // Increased logo size and brought down slightly to fit well in the header
  const logoSizeClass =
    size === 'xs'
      ? 'mt-1.5 h-[calc(6rem+1cm)] w-[calc(13.5rem+1cm)] sm:h-[calc(6.25rem+1cm)] sm:w-[calc(14.5rem+1cm)]'
      : 'mt-2 h-[calc(9.25rem+1cm)] w-[calc(20rem+1cm)] sm:h-[calc(10rem+1cm)] sm:w-[calc(23rem+1cm)]';

  // Line 2: Structured heading on ONE single line
  const nameSizeClass =
    size === 'xs'
      ? 'text-[15px] sm:text-base mt-0.5'
      : 'text-xl sm:text-2xl mt-0.5';

  // Line 3: Slogan under name
  const sloganSizeClass =
    size === 'xs'
      ? 'text-[7.5px] tracking-[-0.01em] gap-x-1 mt-0.5'
      : 'text-[11px] sm:text-xs tracking-[0.01em] gap-x-1.5 mt-0.5';

  const isDark = theme === 'dark';

  return (
    <div
      className={`inline-flex max-w-full flex-col items-center justify-center text-center select-none ${className}`}
    >
      {/* UNIFIED CONTAINER FOR LOGO, NAME & SLOGAN */}
      <div className="flex w-full flex-col items-center justify-center bg-transparent px-1 py-0.5">
        {/* LINE 1: LARGER LOGO BROUGHT DOWN TO FIT WELL */}
        <Image
          src={logoUrl || DEFAULT_BRAND_LOGO}
          alt={companyName || 'ComplianceHR Infinity'}
          fittingType="fit"
          className={`${logoSizeClass} shrink-0 object-contain`}
        />

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
              <span style={{ color: isDark ? '#00C6FF' : '#0A2B6D' }}>Compliance</span>
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
            <span style={{ color: '#00C6FF' }}>Complete Control.</span>
            <span style={{ color: '#A855F7' }}>Greater Confidence.</span>
            <span style={{ color: '#FF2E9A' }}>Brighter Success.</span>
          </div>
        )}
      </div>
    </div>
  );
}