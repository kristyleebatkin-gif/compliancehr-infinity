import React from 'react';
import { Image } from '@/components/ui/image';

export const DEFAULT_BRAND_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

export const BRAND_SLOGAN_TEXT =
  'Complete Control. Greater Confidence. Brighter Success.';

/**
 * Canonical ComplianceHR Infinity Brand Lockup (All Centred inside ONE App-Design Gradient Border on White):
 * Line 1 (Top): Logo approx. 3cm in size, centred
 * Line 2 (Middle): "ComplianceHR Infinity" on ONE single line, dark blue (#0A2B6D) changing into app design colours towards the end
 * Line 3 (Bottom): Slightly smaller slogan on ONE single line in medium blue (#0072FF), purple (#5A00D6), pink (#FF2E9A),
 *                  almost lining up on each end with "ComplianceHR Infinity" (just slightly longer)
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
  size = 'md',
  theme = 'light',
  className = '',
  showSlogan = true,
}) {
  const isCustomName = companyName && companyName !== 'ComplianceHR Infinity';

  // Proportional logo size (+1cm height x +1cm length in both Navigator Remote and header above dashboard)
  const logoSizeClass =
    size === 'xs'
      ? 'h-[calc(4rem+1cm)] w-[calc(10rem+1cm)] sm:h-[calc(4.25rem+1cm)] sm:w-[calc(11rem+1cm)]'
      : 'h-[calc(6rem+1cm)] w-[calc(13rem+1cm)] sm:h-[calc(6.25rem+1cm)] sm:w-[calc(15rem+1cm)]';

  // Line 2: Structured heading on ONE single line
  const nameSizeClass =
    size === 'xs'
      ? 'text-[15px] sm:text-base mt-1'
      : 'text-xl sm:text-2xl mt-1.5';

  // Line 3: Slogan under name — sized to fit cleanly inside the 256px navigation bar for 'xs' and align under the name for 'md'
  const sloganSizeClass =
    size === 'xs'
      ? 'text-[7.5px] tracking-[-0.01em] gap-x-1 mt-0.5'
      : 'text-[11px] sm:text-xs tracking-[0.01em] gap-x-1.5 mt-1';

  return (
    <div
      className={`inline-flex max-w-full flex-col items-center justify-center text-center select-none ${className}`}
    >
      {/* BORDERLESS UNIFIED CONTAINER FOR LOGO, NAME & SLOGAN */}
      <div className="flex w-full flex-col items-center justify-center bg-transparent px-1 py-0.5">
        {/* LINE 1: LOGO */}
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
                  'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 42%, #0072FF 62%, #5A00D6 80%, #FF2E9A 100%)',
              }}
            >
              {companyName}
            </span>
          ) : (
            <>
              <span style={{ color: '#0A2B6D' }}>Compliance</span>
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #0A2B6D 0%, #0072FF 30%, #5A00D6 62%, #A100FF 82%, #FF2E9A 100%)',
                }}
              >
                HR Infinity
              </span>
            </>
          )}
        </div>

        {/* LINE 3: SLOGAN UNDER NAME — MEDIUM BLUE, PURPLE, PINK */}
        {showSlogan && (
          <div
            className={`flex max-w-full items-center justify-center text-center ${sloganSizeClass} font-extrabold leading-tight whitespace-nowrap`}
          >
            <span style={{ color: '#0072FF' }}>Complete Control.</span>
            <span style={{ color: '#5A00D6' }}>Greater Confidence.</span>
            <span style={{ color: '#FF2E9A' }}>Brighter Success.</span>
          </div>
        )}
      </div>
    </div>
  );
}