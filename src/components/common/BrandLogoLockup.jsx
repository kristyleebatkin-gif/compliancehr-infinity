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

  // Enlarged, high-presence logo sizing across all module headers and remotes
  const logoSizeClass =
    size === 'xs'
      ? 'h-11 w-32 sm:h-12 sm:w-36'
      : size === 'sm'
        ? 'h-12 w-36 sm:h-14 sm:w-44'
        : size === 'lg'
          ? 'h-16 w-48 sm:h-20 sm:w-56'
          : 'h-14 w-40 sm:h-16 sm:w-48';

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
      ? 'text-[8.5px] sm:text-[9.5px]'
      : size === 'sm'
        ? 'text-[9.5px] sm:text-[10.5px]'
        : 'text-[10.5px] sm:text-xs';

  const APP_BORDER_GRADIENT =
    'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

  return (
    <div
      className={`flex max-w-full flex-col items-center justify-center text-center select-none ${className}`}
    >
      {/* 1. TOP: LARGER, ATTRACTIVE JEWEL-FRAMED LOGO ON WHITE WITH APP DESIGN COLOUR BORDER */}
      <div
        className="rounded-2xl p-[2.5px] transition-transform duration-200 hover:scale-[1.02]"
        style={{
          background: APP_BORDER_GRADIENT,
          boxShadow: '0 4px 16px -2px rgba(0, 198, 255, 0.45), 0 2px 8px rgba(90, 0, 214, 0.3)',
        }}
      >
        <div
          className="flex items-center justify-center rounded-[13.5px] bg-white px-3 py-1.5"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, #FFFFFF 65%, #F5F0FF 100%)',
          }}
        >
          <Image
            src={logoUrl || DEFAULT_BRAND_LOGO}
            alt={companyName || 'ComplianceHR Infinity'}
            fittingType="fit"
            className={`${logoSizeClass} shrink-0 object-contain drop-shadow-2xs`}
          />
        </div>
      </div>

      {/* 2. MIDDLE: NAME ON WHITE BACKGROUND WITH APP DESIGN COLOUR BORDER */}
      <div
        className="mt-1 max-w-full rounded-full p-[1.5px] shadow-2xs"
        style={{ background: APP_BORDER_GRADIENT }}
      >
        <div
          className={`rounded-full bg-white px-3 py-0.5 font-editorial ${nameSizeClass} font-extrabold leading-tight tracking-tight text-[#0A2B6D]`}
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

      {/* 3. BOTTOM: SLOGAN ON WHITE BACKGROUND WITH APP DESIGN COLOUR BORDER (FITS SMALL SCREENS & REMOTES) */}
      {showSlogan && (
        <div
          className="mt-1 max-w-full rounded-2xl p-[1.5px] shadow-2xs"
          style={{ background: APP_BORDER_GRADIENT }}
        >
          <div
            className={`flex flex-wrap items-center justify-center gap-x-1 gap-y-0 rounded-[14px] bg-white px-2.5 py-0.5 text-center ${sloganSizeClass} font-extrabold leading-snug`}
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
        </div>
      )}
    </div>
  );
}