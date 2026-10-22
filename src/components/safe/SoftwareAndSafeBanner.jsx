import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { loadCompanyBranding, saveCompanyBranding } from '@/lib/companyBranding';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ExecutiveWallScene, { SQUISHED_GRADIENT } from '@/components/safe/ExecutiveWallScene';
import { UploadCloud, Save, Loader2, PenSquare } from 'lucide-react';

const DEFAULT_LOGO = 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/04a0fc5c9_generated_b2aad3e7.png';

export const SOFTWARE_INFO = {
  name: 'ComplianceHR Infinity',
  taglineLine1: 'Your Comprehensive ALL-IN-ONE',
  taglineLine2: 'Business Documentation Platform',
  sloganLine1: 'Complete Control. Greater Confidence.',
  sloganLine2: 'Brighter Success',
  slogan: 'Complete Control. Greater Confidence. Brighter Success',
  description: 'All-in-one, Smart, Comprehensive, Business Super, Documentation Platform',
  developer: {
    name: 'Kristy Lee Whelan',
    location: 'North QLD',
    phone: '0402 165 668',
    email: 'kristyleebatkin@live.com.au',
  },
  business: {
    business_name: 'ComplianceHR Infinity',
    short_name: 'ComplianceHR Infinity',
    trading_name: 'ComplianceHR Infinity',
    abn: '11769681650',
    ndis_provider_number: '4-LPHJR5O',
    address_line: 'U5/14 Keane Street, Currajong, QLD, 4812',
    contact_person: 'Administration',
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
    <section className="space-y-3">
      {/* Top-Left Frame (Logo, Name, Slogan + Chair Back Front Left) & Twice-Size Top-Right Colour Area */}
      <ExecutiveWallScene
        logoUrl={branding.logoUrl || DEFAULT_LOGO}
        companyName={branding.companyName || 'ComplianceHR Infinity'}
        sloganLine1={SOFTWARE_INFO.sloganLine1}
        sloganLine2={SOFTWARE_INFO.sloganLine2}
        business={business}
        developer={SOFTWARE_INFO.developer}
        softwareName={SOFTWARE_INFO.name}
      />

      {/* Squashed Quick Bar to Edit & Save Logo, Name & Slogan */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-violet-300 bg-white px-3 py-1.5 shadow-sm">
          <span className="text-[11px] font-extrabold text-violet-950">
            Software: ComplianceHR Infinity · Complete Control. Greater Confidence. Brighter Success
          </span>
          <button
            type="button"
            onClick={() => setEditingIdentity((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm"
            style={{ background: SQUISHED_GRADIENT }}
          >
            <PenSquare className="h-3 w-3" />
            {editingIdentity ? 'Close Editor' : 'Edit Frame'}
          </button>
        </div>
      )}

      {editingIdentity && (
        <div
          className="rounded-xl border-2 border-violet-300 p-4"
          style={{
            background: 'linear-gradient(120deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.12) 50%, rgba(236,72,153,0.12) 100%)',
          }}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1">
              <Label className="text-xs font-extrabold text-violet-900">Business Name</Label>
              <Input
                value={branding.companyName}
                onChange={(e) => setBranding((prev) => ({ ...prev, companyName: e.target.value }))}
                className="bg-white font-bold h-8 text-xs"
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs font-extrabold text-violet-900">Slogan</Label>
              <Input
                value={branding.slogan}
                onChange={(e) => setBranding((prev) => ({ ...prev, slogan: e.target.value }))}
                className="bg-white font-bold h-8 text-xs"
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs font-extrabold text-violet-900">Logo URL or Upload</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  value={branding.logoUrl}
                  onChange={(e) => setBranding((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://..."
                  className="bg-white font-bold h-8 text-xs"
                />
                <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-violet-400 bg-white px-2.5 py-1.5 text-xs font-extrabold text-violet-800 shadow-sm hover:bg-violet-50">
                  {uploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5 text-pink-600" />}
                  Upload
                  <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.webp,.svg" onChange={(e) => handleUploadLogo(e.target.files?.[0])} />
                </label>
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              onClick={handleSaveIdentity}
              disabled={savingIdentity}
              className="text-white font-extrabold shadow-md"
              style={{ background: SQUISHED_GRADIENT }}
            >
              {savingIdentity ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Logo, Name &amp; Slogan
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}