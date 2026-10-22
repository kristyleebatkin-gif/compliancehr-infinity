import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, UploadCloud, Sparkles } from 'lucide-react';
import { loadCompanyBranding, saveCompanyBranding } from '@/lib/companyBranding';

export default function BusinessIdentityCard({ actions = null }) {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [providerId, setProviderId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const branding = await loadCompanyBranding();
        setCompanyName(branding.companyName || '');
        setSlogan(branding.slogan || '');
        setLogoUrl(branding.logoUrl || '');
        setProviderId(branding.providerId || '');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const syncName = (event) => setCompanyName(event.detail.companyName);
    window.addEventListener('company-identity-saved', syncName);
    return () => window.removeEventListener('company-identity-saved', syncName);
  }, []);

  const uploadLogo = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setLogoUrl(file_url);
      toast({ title: 'Logo uploaded - click save to apply' });
    } catch (error) {
      toast({ title: 'Logo upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const branding = await saveCompanyBranding({ providerId, companyName, slogan, logoUrl });
      setCompanyName(branding.companyName);
      setSlogan(branding.slogan);
      setLogoUrl(branding.logoUrl || '');
      setProviderId(branding.providerId || providerId);
      toast({ title: 'Business identity saved - logo, name and slogan applied everywhere' });
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div
      className="overflow-hidden rounded-2xl border-2 shadow-panel"
      style={{
        borderColor: '#7c3aed66',
        background: 'linear-gradient(145deg, rgba(37,99,235,0.10) 0%, rgba(124,58,237,0.12) 52%, rgba(236,72,153,0.10) 100%)',
      }}
    >
      <div
        className="comm-panel-bar flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-white"
        style={{ background: 'linear-gradient(120deg, #2563eb 0%, #7c3aed 52%, #ec4899 100%)' }}
      >
        <div className="flex items-center gap-2 text-sm font-extrabold">
          <Sparkles className="h-4 w-4" />
          Business Identity — Save Logo, Business Name &amp; Slogan (Blue · Purple · Pink)
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-xs font-bold text-foreground/80">
          The business name, logo, and slogan saved here appear on every generated form, plan, register, wall frame, and staff badge.
        </p>
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-violet-400 bg-white p-2 shadow-md">
            {logoUrl
              ? <img src={logoUrl} alt="Business logo" className="h-full w-full object-contain" />
              : <span className="text-[10px] font-bold text-muted-foreground">No logo</span>}
          </div>
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label className="font-extrabold text-violet-950">Business name</Label>
              <Input className="bg-white font-bold" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label className="font-extrabold text-violet-950">Slogan</Label>
              <Input className="bg-white font-bold" value={slogan} onChange={(e) => setSlogan(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-violet-400 bg-white px-4 h-10 text-xs font-extrabold text-violet-800 shadow-sm hover:bg-violet-50">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4 text-pink-600" />}
            Upload logo
            <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.webp,.svg" onChange={(e) => uploadLogo(e.target.files?.[0])} />
          </label>
          <Button
            onClick={save}
            disabled={saving}
            className="h-10 rounded-xl px-5 text-xs font-extrabold text-white shadow-md"
            style={{ background: 'linear-gradient(120deg, #2563eb 0%, #7c3aed 52%, #ec4899 100%)' }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Logo, Name &amp; Slogan
          </Button>
          {actions}
        </div>
      </div>
    </div>
  );
}