import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { loadCompanyBranding } from '@/lib/companyBranding';
import { Image } from '@/components/ui/image';
import { ShieldCheck, Sparkles, Building2, Code2, Phone, Mail, MapPin, BadgeCheck, Lock } from 'lucide-react';

const DEFAULT_LOGO = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/8f4f0ca87_generated_image.png';

export const SOFTWARE_INFO = {
  name: 'ComplianceHR INFINITY',
  slogan: 'Complete Control. Greater Confidence. Brighter Success',
  description: 'All-in-one, Smart, Comprehensive, Business Super, Documentation Platform',
  developer: {
    name: 'Kristy Lee Whelan',
    location: 'North QLD',
    phone: '0402 165 668',
    email: 'kristyleebatkin@live.com.au',
  },
  business: {
    business_name: 'Choices North Queensland (Choices NQ)',
    trading_name: 'DALTON, KRISTY LEE Trading as CHOICES NORTH QUEENSLAND',
    abn: '11769681650',
    ndis_provider_number: '4-LPHJR5O',
    address_line: 'U5/14 Keane Street, Currajong, QLD, 4812',
    contact_person: 'Choices NQ Administration',
    phone: '0402 165 668',
    email: 'kristyleebatkin@live.com.au',
  },
};

export default function SoftwareAndSafeBanner({ compact = false }) {
  const [branding, setBranding] = useState({
    companyName: SOFTWARE_INFO.business.business_name,
    slogan: SOFTWARE_INFO.slogan,
    logoUrl: DEFAULT_LOGO,
  });
  const [business, setBusiness] = useState(SOFTWARE_INFO.business);

  const load = async () => {
    try {
      const [b, page] = await Promise.all([
        loadCompanyBranding(),
        base44.entities.BusinessDetails.list({ sort: '-created_date', limit: 1 }).catch(() => ({ items: [] })),
      ]);
      const rec = page.items?.[0];
      setBranding({
        companyName: rec?.business_name || b?.companyName || SOFTWARE_INFO.business.business_name,
        slogan: b?.slogan || SOFTWARE_INFO.slogan,
        logoUrl: b?.logoUrl || DEFAULT_LOGO,
      });
      if (rec) {
        setBusiness({
          business_name: rec.business_name || SOFTWARE_INFO.business.business_name,
          trading_name: rec.trading_name || SOFTWARE_INFO.business.trading_name,
          abn: rec.abn || SOFTWARE_INFO.business.abn,
          ndis_provider_number: rec.ndis_provider_number || SOFTWARE_INFO.business.ndis_provider_number,
          address_line: rec.address_line || SOFTWARE_INFO.business.address_line,
          contact_person: rec.contact_person || SOFTWARE_INFO.business.contact_person,
          phone: rec.phone || SOFTWARE_INFO.business.phone,
          email: rec.email || SOFTWARE_INFO.business.email,
        });
      }
    } catch {
      // Fallback to saved defaults
    }
  };

  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener('company-identity-saved', refresh);
    return () => window.removeEventListener('company-identity-saved', refresh);
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-pink-300/80 bg-card shadow-panel">
      {/* Bright, Bold Stylish Header showing Company Safe Business Name, Logo & Slogan + Software Title */}
      <div
        className="comm-panel-bar relative flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-white"
        style={{
          background: 'linear-gradient(120deg, #2563eb 0%, #7c3aed 48%, #ec4899 100%)',
        }}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg ring-2 ring-white/60">
            <Image
              src={branding.logoUrl || DEFAULT_LOGO}
              alt={branding.companyName}
              fittingType="fit"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white ring-1 ring-white/40">
                <Lock className="h-3 w-3" /> Company Safe Saved Entry
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/25 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white ring-1 ring-white/40">
                <Sparkles className="h-3 w-3" /> {SOFTWARE_INFO.name}
              </span>
            </div>
            <h2 className="mt-1 truncate text-lg sm:text-xl font-extrabold tracking-tight text-white">
              {branding.companyName}
            </h2>
            <p className="text-xs sm:text-sm font-extrabold text-white/95">
              {branding.slogan || SOFTWARE_INFO.slogan}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/company-safe"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-violet-800 shadow-md transition hover:bg-pink-50"
          >
            <ShieldCheck className="h-4 w-4 text-pink-600" />
            Company Safe Verified
          </Link>
        </div>
      </div>

      {/* Three Bold Stylish Cards: Software Platform, Developer, and Business Use (Choices NQ) */}
      <div className={`grid gap-3 p-3.5 ${compact ? ' md:grid-cols-3' : 'md:grid-cols-3'}`}>
        {/* Card 1: Software Information */}
        <div
          className="rounded-xl border-2 p-3.5 shadow-sm"
          style={{
            borderColor: '#7c3aed45',
            background: 'linear-gradient(155deg, rgba(124, 58, 237, 0.12) 0%, rgba(236, 72, 153, 0.06) 55%, #ffffff 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700">Software Information</p>
              <h3 className="text-sm font-extrabold text-violet-900">{SOFTWARE_INFO.name}</h3>
            </div>
          </div>
          <p className="mt-2 text-xs font-extrabold text-pink-700">
            {SOFTWARE_INFO.slogan}
          </p>
          <p className="mt-1 text-xs font-bold leading-snug text-foreground/85">
            {SOFTWARE_INFO.description}
          </p>
        </div>

        {/* Card 2: Developer */}
        <div
          className="rounded-xl border-2 p-3.5 shadow-sm"
          style={{
            borderColor: '#db277745',
            background: 'linear-gradient(155deg, rgba(236, 72, 153, 0.12) 0%, rgba(244, 63, 94, 0.06) 55%, #ffffff 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow" style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}>
              <Code2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-pink-700">Platform Developer</p>
              <h3 className="text-sm font-extrabold text-pink-900">{SOFTWARE_INFO.developer.name}</h3>
            </div>
          </div>
          <div className="mt-2 space-y-1 text-xs font-bold text-foreground/85">
            <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0 text-pink-600" /> Location: {SOFTWARE_INFO.developer.location}</p>
            <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0 text-pink-600" /> Phone: {SOFTWARE_INFO.developer.phone}</p>
            <p className="flex items-center gap-1.5 break-all"><Mail className="h-3.5 w-3.5 shrink-0 text-pink-600" /> Email: {SOFTWARE_INFO.developer.email}</p>
          </div>
        </div>

        {/* Card 3: Business Use (Saved in Company Safe) */}
        <div
          className="rounded-xl border-2 p-3.5 shadow-sm"
          style={{
            borderColor: '#0284c745',
            background: 'linear-gradient(155deg, rgba(14, 165, 233, 0.12) 0%, rgba(37, 99, 235, 0.06) 55%, #ffffff 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow" style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb)' }}>
              <Building2 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700">Business Use · Company Safe</p>
              <h3 className="truncate text-sm font-extrabold text-sky-900">{business.business_name}</h3>
            </div>
          </div>
          <div className="mt-2 space-y-0.5 text-xs font-bold text-foreground/85">
            <p className="text-[11px] font-extrabold text-sky-800">{business.trading_name}</p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="inline-flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5 text-sky-600" /> ABN: {business.abn}</span>
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-violet-600" /> NDIS Reg ID: {business.ndis_provider_number}</span>
            </p>
            <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0 text-sky-600" /> {business.address_line}</p>
            <p className="text-[11px] font-extrabold text-foreground/90">{business.contact_person} · {business.phone} · {business.email}</p>
          </div>
        </div>
      </div>
    </section>
  );
}