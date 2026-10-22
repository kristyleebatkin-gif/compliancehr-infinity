import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { loadCompanyBranding } from '@/lib/companyBranding';
import { Image } from '@/components/ui/image';
import { ShieldCheck, Sparkles, Building2, Code2, Phone, Mail, MapPin, BadgeCheck, Lock } from 'lucide-react';

const DEFAULT_LOGO = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/8f4f0ca87_generated_image.png';

export const SOFTWARE_INFO = {
  name: 'ComplianceHR INFINITY',
  tagline: 'Your Comprehensive ALL-IN-ONE Business Documentation Platform',
  slogan: 'Complete Control. Greater Confidence. Brighter Success',
  description: 'All-in-one, Smart, Comprehensive, Business Super, Documentation Platform',
  developer: {
    name: 'Kristy Lee Whelan',
    location: 'North QLD',
    phone: '0402 165 668',
    email: 'kristyleebatkin@live.com.au',
  },
  business: {
    business_name: 'Choices North Queensland',
    short_name: 'Choices NQ',
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
    companyName: `${SOFTWARE_INFO.business.business_name} (${SOFTWARE_INFO.business.short_name})`,
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
        companyName: rec?.business_name || b?.companyName || `${SOFTWARE_INFO.business.business_name} (${SOFTWARE_INFO.business.short_name})`,
        slogan: b?.slogan || SOFTWARE_INFO.slogan,
        logoUrl: b?.logoUrl || DEFAULT_LOGO,
      });
      if (rec) {
        setBusiness({
          business_name: rec.business_name || SOFTWARE_INFO.business.business_name,
          short_name: SOFTWARE_INFO.business.short_name,
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
      {/* Bright Blue, Purple, Pink Header showing Software, Tagline, Developer & Business Use */}
      <div
        className="comm-panel-bar relative flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-white"
        style={{
          background: 'linear-gradient(120deg, #2563eb 0%, #7c3aed 52%, #ec4899 100%)',
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
                <Sparkles className="h-3 w-3" /> Software: {SOFTWARE_INFO.name}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white ring-1 ring-white/40">
                <Lock className="h-3 w-3" /> Business Use: Choices North Queensland · Choices NQ
              </span>
            </div>
            <h2 className="mt-1 text-base sm:text-lg font-extrabold tracking-tight text-white">
              {SOFTWARE_INFO.tagline}
            </h2>
            <p className="text-xs font-extrabold text-white/95">
              Developer: {SOFTWARE_INFO.developer.name} · Email: {SOFTWARE_INFO.developer.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/company-safe"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-violet-800 shadow-md transition hover:bg-pink-50"
          >
            <ShieldCheck className="h-4 w-4 text-pink-600" />
            Company Safe
          </Link>
        </div>
      </div>

      {/* Three Rich, Vibrant Multi-Colour Cards: Software, Developer, and Business Use */}
      <div className={`grid gap-3 p-3.5 ${compact ? 'md:grid-cols-3' : 'md:grid-cols-3'}`}>
        {/* Card 1: Software: ComplianceHR INFINITY */}
        <div
          className="relative overflow-hidden rounded-xl border-2 p-3.5 shadow-sm"
          style={{
            borderColor: '#7c3aed66',
            borderTop: '4px solid #7c3aed',
            background: 'linear-gradient(145deg, rgba(124, 58, 237, 0.16) 0%, rgba(236, 72, 153, 0.08) 55%, #ffffff 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700">Software</p>
              <h3 className="text-sm font-extrabold text-violet-950">{SOFTWARE_INFO.name}</h3>
            </div>
          </div>
          <p className="mt-2 text-xs font-extrabold text-violet-900">
            Your Comprehensive ALL-IN-ONE Business Documentation Platform
          </p>
          <p className="mt-1 text-[11px] font-bold text-pink-700">
            {SOFTWARE_INFO.slogan}
          </p>
        </div>

        {/* Card 2: Developer: Kristy Lee Whelan */}
        <div
          className="relative overflow-hidden rounded-xl border-2 p-3.5 shadow-sm"
          style={{
            borderColor: '#db277766',
            borderTop: '4px solid #db2777',
            background: 'linear-gradient(145deg, rgba(219, 39, 119, 0.16) 0%, rgba(244, 63, 94, 0.08) 55%, #ffffff 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow" style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}>
              <Code2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-pink-700">Developer</p>
              <h3 className="text-sm font-extrabold text-pink-950">{SOFTWARE_INFO.developer.name}</h3>
            </div>
          </div>
          <div className="mt-2 space-y-1 text-xs font-bold text-foreground/90">
            <p className="flex items-center gap-1.5 break-all">
              <Mail className="h-3.5 w-3.5 shrink-0 text-pink-600" />
              <span>Email: {SOFTWARE_INFO.developer.email}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 shrink-0 text-pink-600" />
              <span>Phone: {SOFTWARE_INFO.developer.phone} ({SOFTWARE_INFO.developer.location})</span>
            </p>
          </div>
        </div>

        {/* Card 3: Business Use: Choices North Queensland / Choices NQ */}
        <div
          className="relative overflow-hidden rounded-xl border-2 p-3.5 shadow-sm"
          style={{
            borderColor: '#2563eb66',
            borderTop: '4px solid #2563eb',
            background: 'linear-gradient(145deg, rgba(37, 99, 235, 0.16) 0%, rgba(14, 165, 233, 0.08) 55%, #ffffff 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow" style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)' }}>
              <Building2 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Business Use</p>
              <h3 className="truncate text-sm font-extrabold text-blue-950">Choices North Queensland · Choices NQ</h3>
            </div>
          </div>
          <div className="mt-2 space-y-0.5 text-xs font-bold text-foreground/90">
            <p className="text-[11px] font-extrabold text-blue-900">{business.trading_name}</p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
              <span className="inline-flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5 text-blue-600" /> ABN: {business.abn}</span>
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-violet-600" /> NDIS Reg: {business.ndis_provider_number}</span>
            </p>
            <p className="flex items-center gap-1 text-[11px]"><MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600" /> {business.address_line}</p>
          </div>
        </div>
      </div>
    </section>
  );
}