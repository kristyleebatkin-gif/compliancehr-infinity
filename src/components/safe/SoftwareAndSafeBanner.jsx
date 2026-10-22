import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { loadCompanyBranding, saveCompanyBranding } from '@/lib/companyBranding';
import { Image } from '@/components/ui/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';
import {
  ShieldCheck, Sparkles, Building2, Code2, Phone, Mail, MapPin,
  BadgeCheck, Lock, UploadCloud, Save, Loader2, PenSquare,
} from 'lucide-react';

const DEFAULT_LOGO = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/8f4f0ca87_generated_image.png';

export const SOFTWARE_INFO = {
  name: 'ComplianceHR INFINITY',
  taglineLine1: 'Your Comprehensive ALL-IN-ONE',
  taglineLine2: 'Business Documentation Platform',
  sloganLine1: 'Complete Control. Greater Confidence.',
  sloganLine2: 'Brighter Success.',
  slogan: 'Complete Control. Greater Confidence. Brighter Success.',
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
  const { toast } = useToast();
  const [branding, setBranding] = useState({
    companyName: SOFTWARE_INFO.business.business_name,
    slogan: SOFTWARE_INFO.slogan,
    logoUrl: DEFAULT_LOGO,
    providerId: '',
  });
  const [business, setBusiness] = useState(SOFTWARE_INFO.business);
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

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
        providerId: b?.providerId || '',
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

  const handleUploadLogo = async (file) => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setBranding((prev) => ({ ...prev, logoUrl: file_url }));
      toast({ title: 'Logo uploaded — click Save to apply everywhere' });
    } catch (err) {
      toast({ title: 'Logo upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveIdentity = async () => {
    setSavingIdentity(true);
    try {
      const saved = await saveCompanyBranding({
        providerId: branding.providerId,
        companyName: branding.companyName,
        slogan: branding.slogan,
        logoUrl: branding.logoUrl,
      });
      setBranding((prev) => ({
        ...prev,
        companyName: saved.companyName,
        slogan: saved.slogan,
        logoUrl: saved.logoUrl || prev.logoUrl,
        providerId: saved.providerId || prev.providerId,
      }));
      setEditingIdentity(false);
      toast({ title: 'Saved Logo, Business Name, and Slogan to Company Safe' });
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSavingIdentity(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-pink-300/80 bg-card shadow-panel space-y-0">
      {/* Bright Blue - Purple - Pink Header with Save Logo, Name & Slogan Support */}
      <div
        className="comm-panel-bar relative flex flex-wrap items-center justify-between gap-6 px-6 py-6 text-white"
        style={{
          background: 'linear-gradient(120deg, #2563eb 0%, #2563eb 40%, #7c3aed 50%, #ec4899 60%, #ec4899 100%)',
        }}
      >
        <div className="flex min-w-0 items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg ring-2 ring-white/60">
            <Image
              src={branding.logoUrl || DEFAULT_LOGO}
              alt={branding.companyName}
              fittingType="fit"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="min-w-0 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white ring-1 ring-white/40">
                <Sparkles className="h-3.5 w-3.5" /> Software: {SOFTWARE_INFO.name}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white ring-1 ring-white/40">
                <Lock className="h-3.5 w-3.5" /> Blue · Purple · Pink Identity
              </span>
            </div>

            <div className="space-y-1 pt-0.5">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                {branding.companyName || SOFTWARE_INFO.business.business_name}
              </h2>
              <p className="text-sm sm:text-base font-extrabold tracking-tight text-white/95">
                {SOFTWARE_INFO.taglineLine1} · {SOFTWARE_INFO.taglineLine2}
              </p>
            </div>

            <div className="space-y-1 rounded-xl bg-white/15 px-3.5 py-2.5 ring-1 ring-white/30">
              <p className="text-sm sm:text-base font-extrabold text-white">
                {SOFTWARE_INFO.sloganLine1}
              </p>
              <p className="text-sm sm:text-base font-extrabold text-white">
                {SOFTWARE_INFO.sloganLine2}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setEditingIdentity((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-violet-800 shadow-md transition hover:bg-pink-50"
          >
            <PenSquare className="h-4 w-4 text-violet-600" />
            {editingIdentity ? 'Close Identity Editor' : 'Save Logo, Name & Slogan'}
          </button>
          <Link
            to="/company-safe"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-pink-700 shadow-md transition hover:bg-pink-50"
          >
            <ShieldCheck className="h-4 w-4 text-pink-600" />
            Company Safe
          </Link>
        </div>
      </div>

      {/* Inline Blue - Purple - Pink Editor to Save Logo, Name & Slogan */}
      {editingIdentity && (
        <div
          className="border-b-2 border-violet-300 p-5"
          style={{
            background: 'linear-gradient(120deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.14) 52%, rgba(236,72,153,0.12) 100%)',
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-extrabold text-violet-950">
              Save Company Safe Logo, Business Name &amp; Slogan (Blue · Purple · Pink)
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-extrabold text-violet-900">Business Name</Label>
              <Input
                value={branding.companyName}
                onChange={(e) => setBranding((prev) => ({ ...prev, companyName: e.target.value }))}
                className="bg-white font-bold"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-extrabold text-violet-900">Slogan</Label>
              <Input
                value={branding.slogan}
                onChange={(e) => setBranding((prev) => ({ ...prev, slogan: e.target.value }))}
                className="bg-white font-bold"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-extrabold text-violet-900">Logo Image URL or Upload</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={branding.logoUrl}
                  onChange={(e) => setBranding((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://..."
                  className="bg-white font-bold"
                />
                <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border-2 border-violet-400 bg-white px-3 py-2 text-xs font-extrabold text-violet-800 shadow-sm hover:bg-violet-50">
                  {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4 text-pink-600" />}
                  Upload
                  <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.webp,.svg" onChange={(e) => handleUploadLogo(e.target.files?.[0])} />
                </label>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={handleSaveIdentity}
              disabled={savingIdentity}
              className="text-white font-extrabold shadow-md"
              style={{ background: 'linear-gradient(120deg, #2563eb 0%, #7c3aed 52%, #ec4899 100%)' }}
            >
              {savingIdentity ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Logo, Name &amp; Slogan
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Body: Developer + Software Details Under Email + Company Safe Underneath */}
      <div className="space-y-5 p-5">
        {/* Top Row of Boxes: Left = Developer with Software Details Under Developer Email; Right = Company Safe Underneath */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* BOX 1: Developer Details + Software Details Directly Under Developer Email */}
          <div
            className="flex flex-col justify-between overflow-hidden rounded-2xl border-2 p-5 shadow-sm space-y-4"
            style={{
              borderColor: '#db277766',
              borderTop: '5px solid #db2777',
              background: 'linear-gradient(145deg, rgba(219, 39, 119, 0.14) 0%, rgba(124, 58, 237, 0.08) 55%, #ffffff 100%)',
            }}
          >
            {/* Developer Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow" style={{ background: 'linear-gradient(135deg, #ec4899, #7c3aed)' }}>
                  <Code2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-pink-700">Developer</p>
                  <h3 className="text-base font-extrabold text-pink-950">{SOFTWARE_INFO.developer.name}</h3>
                </div>
              </div>

              <div className="space-y-2 rounded-xl bg-white/90 p-3.5 border border-pink-200 text-xs font-bold text-foreground/90">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-pink-600" />
                  <span>Location: {SOFTWARE_INFO.developer.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-pink-600" />
                  <span>Phone: {SOFTWARE_INFO.developer.phone}</span>
                </div>
                <div className="flex items-center gap-2 break-all">
                  <Mail className="h-4 w-4 shrink-0 text-pink-600" />
                  <span>Email: {SOFTWARE_INFO.developer.email}</span>
                </div>
              </div>
            </div>

            {/* Software Details Directly Under Developer Email */}
            <div
              className="space-y-2.5 rounded-xl border-2 p-4 shadow-sm"
              style={{
                borderColor: '#7c3aed66',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.14) 52%, rgba(236,72,153,0.12) 100%)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700">Software Details</p>
                  <h4 className="text-sm font-extrabold text-violet-950">Software: {SOFTWARE_INFO.name}</h4>
                </div>
              </div>

              <div className="space-y-1 text-xs font-extrabold text-violet-900">
                <div>{SOFTWARE_INFO.taglineLine1}</div>
                <div>{SOFTWARE_INFO.taglineLine2}</div>
              </div>

              <div className="space-y-0.5 rounded-lg bg-white/85 px-3 py-2 text-xs font-extrabold text-pink-700 border border-pink-200">
                <div>{SOFTWARE_INFO.sloganLine1}</div>
                <div>{SOFTWARE_INFO.sloganLine2}</div>
              </div>

              <p className="text-xs font-bold text-foreground/85">
                {SOFTWARE_INFO.description}
              </p>
            </div>
          </div>

          {/* BOX 2: Business Use & Company Safe Underneath */}
          <div className="flex flex-col justify-between gap-4">
            <div
              className="flex-1 overflow-hidden rounded-2xl border-2 p-5 shadow-sm space-y-3.5"
              style={{
                borderColor: '#2563eb66',
                borderTop: '5px solid #2563eb',
                background: 'linear-gradient(145deg, rgba(37, 99, 235, 0.14) 0%, rgba(14, 165, 233, 0.08) 55%, #ffffff 100%)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow" style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)' }}>
                  <Building2 className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">Business Use</p>
                  <h3 className="text-base font-extrabold text-blue-950">Choices North Queensland</h3>
                  <p className="text-xs font-extrabold text-sky-700">Choices NQ</p>
                </div>
              </div>

              <div className="space-y-2 rounded-xl bg-white/90 p-3.5 border border-blue-200 text-xs font-bold text-foreground/90">
                <p className="font-extrabold text-blue-950">{business.trading_name}</p>
                <p className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-blue-600" />
                  <span>ABN: {business.abn}</span>
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-violet-600" />
                  <span>NDIS Registration ID: {business.ndis_provider_number}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-blue-600" />
                  <span>Address: {business.address_line}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-blue-600" />
                  <span>{business.contact_person} · {business.phone}</span>
                </p>
              </div>
            </div>

            {/* Company Safe Box Directly Underneath */}
            <div
              className="overflow-hidden rounded-2xl border-2 p-4 text-white shadow-md"
              style={{
                borderColor: '#7c3aed',
                background: 'linear-gradient(120deg, #2563eb 0%, #2563eb 40%, #7c3aed 50%, #ec4899 60%, #ec4899 100%)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/40">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/90">
                      Secured Vault Underneath
                    </div>
                    <h4 className="text-base font-extrabold text-white">Company Safe</h4>
                    <p className="text-xs font-bold text-white/95">
                      Choices North Queensland (Choices NQ) — Logo, Name, Slogan &amp; Credentials Saved
                    </p>
                  </div>
                </div>
                <Link
                  to="/company-safe"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-violet-800 shadow hover:bg-pink-50"
                >
                  <ShieldCheck className="h-4 w-4 text-pink-600" />
                  Open Company Safe
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Wall Scene: Top-Left Picture Frame (Logo, Name, Slogan), Front Corner Chair with Chair Back, Top-Right Colour Frame (Role, Name, Icon, Other Details), Smart Clock & 3-Door Cupboard */}
        {!compact && (
          <ExecutiveWallScene
            logoUrl={branding.logoUrl || DEFAULT_LOGO}
            companyName={branding.companyName || 'Choices North Queensland'}
            sloganLine1={SOFTWARE_INFO.sloganLine1}
            sloganLine2={SOFTWARE_INFO.sloganLine2}
            business={business}
          />
        )}
      </div>
    </section>
  );
}