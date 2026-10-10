import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, UploadCloud } from 'lucide-react';
import { loadCompanyBranding, saveCompanyBranding } from '@/lib/companyBranding';

export default function BusinessIdentityCard() {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
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
      } finally {
        setLoading(false);
      }
    })();
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
      const branding = await saveCompanyBranding({ companyName, slogan, logoUrl });
      setCompanyName(branding.companyName);
      setSlogan(branding.slogan);
      setLogoUrl(branding.logoUrl || '');
      toast({ title: 'Business identity saved - used on every generated form' });
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-3 text-sm font-semibold">Business identity</div>
      <p className="mb-4 text-xs text-muted-foreground">The business name and logo stored here appear on every generated form, plan, register and staff badge.</p>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
          {logoUrl
            ? <img src={logoUrl} alt="Business logo" className="h-full w-full object-contain" />
            : <span className="text-[10px] text-muted-foreground">No logo</span>}
        </div>
        <div className="grid flex-1 gap-2 sm:grid-cols-2">
          <div className="grid gap-1.5"><Label>Business name</Label><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label>Slogan</Label><Input value={slogan} onChange={(e) => setSlogan(e.target.value)} /></div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input bg-transparent px-3 h-9 text-sm font-medium hover:bg-accent">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}Upload logo
          <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.webp,.svg" onChange={(e) => uploadLogo(e.target.files?.[0])} />
        </label>
        <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save identity</Button>
      </div>
    </div>
  );
}