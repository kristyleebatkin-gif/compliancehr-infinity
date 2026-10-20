import React from 'react';
import { Image } from '@/components/ui/image';
import { getCompanyBranding } from '@/lib/companyBranding';

export default function FinanceBrandIdentity({ business = {} }) {
  const branding = getCompanyBranding();
  const logo = branding.logoUrl || branding.logoDataUrl;
  return <>
    {logo && <Image src={logo} alt="Company logo" fittingType="fit" className="mb-2 h-12 w-32 rounded-lg bg-card p-1" />}
    <div className="text-lg font-bold">{business.business_name || branding.companyName}</div>
    {branding.slogan && <div className="mt-1 max-w-sm text-xs">{branding.slogan}</div>}
  </>;
}