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

  // Larger logo image (approx. 3cm on main header, scaled proportionally in sidebar remote)
  const logoSizeClass =
    size === 'xs'
      ? 'h-[4.75rem] w-44 sm:h-[5.25rem] sm:w-48'
      : 'h-24 w-56 sm:h-28 sm:w-64';

  // Line 2: Similar-sized structured heading on ONE single line
  const nameSizeClass =
    size === 'xs'
      ? 'text-base sm:text-lg'
      : 'text-xl sm:text-2xl';

  // Line 3: Slightly smaller slogan on ONE single line that aligns with and extends just slightly past the business name
  const sloganSizeClass =
    size === 'xs'
      ? 'text-[9.5px] sm:text-[10.5px] tracking-[0.01em]'
      : 'text-[11px] sm:text-[12.5px] tracking-[0.015em]';

  const APP_BORDER_GRADIENT =
    'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

  return (
    <div
      className={`inline-flex max-w-full flex-col items-center justify-center rounded-2xl p-[3px] text-center select-none transition-transform duration-200 ${className}`}
      style={{
        background: APP_BORDER_GRADIENT,
        boxShadow: '0 4px 16px -2px rgba(0, 114, 255, 0.25), 0 2px 8px rgba(90, 0, 214, 0.2)',
      }}
    >
      {/* SINGLE UNIFIED WHITE CONTAINER WITH ONE APP-DESIGN GRADIENT BORDER FOR LOGO, NAME & SLOGAN */}
      <div className="flex w-full flex-col items-center justify-center rounded-[13px] bg-white px-5 py-2">
        {/* LINE 1: LARGER LOGO */}
        <Image
          src={logoUrl || DEFAULT_BRAND_LOGO}
          alt={companyName || 'ComplianceHR Infinity'}
          fittingType="fit"
          className={`${logoSizeClass} shrink-0 object-contain`}
        />

        {/* LINE 2: LESS SPACE ABOVE "ComplianceHR Infinity" ON ONE LINE */}
        <div
          className={`mt-0.5 font-editorial ${nameSizeClass} font-extrabold leading-tight tracking-tight whitespace-nowrap`}
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

        {/* LINE 3: SLOGAN ON ONE LINE — MEDIUM BLUE, PURPLE, PINK — ALMOST LINING UP ON EACH END (JUST SLIGHTLY LONGER) */}
        {showSlogan && (
          <div
            className={`mt-0.5 flex items-center justify-center gap-x-1.5 text-center ${sloganSizeClass} font-extrabold leading-tight whitespace-nowrap`}
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