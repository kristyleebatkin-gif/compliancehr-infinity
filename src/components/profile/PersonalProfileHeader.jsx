import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { Badge } from '@/components/ui/badge';
import { UserRound, Sparkles, History } from 'lucide-react';
import { profilePalette } from '@/lib/profileColours';
import { getCompanyBranding, loadCompanyBranding } from '@/lib/companyBranding';

export default function PersonalProfileHeader({ profile, kind, showIdentity = true }) {
  const [photo, setPhoto] = useState('');
  const [branding, setBranding] = useState(getCompanyBranding());
  const staff = kind === 'staff';
  const { primary, accent } = profilePalette(profile.full_name);
  useEffect(() => { loadCompanyBranding().then(setBranding); }, []);
  useEffect(() => {
    let active = true;
    setPhoto('');
    if (profile.profile_photo_uri) base44.integrations.Core.CreateFileSignedUrl({ file_uri: profile.profile_photo_uri }).then(({ signed_url }) => { if (active) setPhoto(signed_url); });
    return () => { active = false; };
  }, [profile.profile_photo_uri]);
  const facts = [staff && profile.employee_number && `Employee ID ${profile.employee_number}`, !staff && profile.ndis_number && `NDIS ${profile.ndis_number}`, !staff && profile.ndis_reference_number && `Ref ${profile.ndis_reference_number}`, profile.phone, profile.email, staff && profile.start_date && `Start ${profile.start_date}`, staff && profile.end_date && `End ${profile.end_date}`].filter(Boolean);
  const log = String(profile.change_log || '').split('\n').filter(Boolean);
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      {showIdentity && <div className="relative px-6 py-6 text-primary-foreground" style={{ background: `linear-gradient(120deg, ${primary} 0%, ${accent} 100%)` }}>
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 88% 8%, rgba(255,255,255,0.28), transparent 42%), radial-gradient(circle at 6% 95%, rgba(255,255,255,0.18), transparent 38%)' }} />
        <div className="relative flex flex-wrap items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary-foreground/70 bg-primary-foreground/15 ring-4 ring-primary-foreground/25">{photo ? <Image src={photo} alt={profile.full_name} className="h-full w-full" /> : <UserRound className="h-9 w-9" />}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold">{profile.full_name}</h2><Badge className="border-0 bg-primary-foreground/20 text-primary-foreground">{profile.status || 'Active'}</Badge></div>
            <p className="text-sm opacity-85">{staff ? profile.position || profile.role || 'Staff member' : profile.support_type || 'Participant'}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium">{facts.map((fact, i) => <span key={i} className="max-w-full break-words rounded-full bg-primary-foreground/20 px-2.5 py-1">{fact}</span>)}</div>
          </div>
          {staff && <div className="w-[230px] shrink-0 overflow-hidden rounded-xl bg-card text-card-foreground shadow-lg"><div className="flex items-center gap-2 px-3 py-2" style={{ background: primary }}>{(branding.logoDataUrl || branding.logoUrl) && <Image src={branding.logoDataUrl || branding.logoUrl} alt="Logo" fittingType="fit" className="h-7 w-7 rounded bg-card" />}<p className="truncate text-[11px] font-bold text-primary-foreground">{branding.companyName || 'ComplianceHR'}</p></div><div className="px-3 py-2"><p className="truncate text-sm font-bold">{profile.full_name}</p><p className="text-[10px] text-muted-foreground">{profile.position || 'Support Worker'}</p><p className="mt-1 text-[9px] text-muted-foreground">Employee No. {profile.employee_number || '-'}</p></div></div>}
        </div>
      </div>}
      <div className="grid gap-2 p-3 md:grid-cols-2">
        <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 p-4 shadow-sm"><div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" />About Me</div><p className="whitespace-pre-wrap text-sm text-muted-foreground">{profile.about_me || 'No introduction added yet.'}</p></div>
        <div className="rounded-xl border border-border/60 bg-muted/40 p-4"><div className="mb-2 flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4 text-primary" />Details check &amp; change log</div>{log.length ? <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border/60 bg-muted/40 p-3">{log.slice(-12).reverse().map((line, i) => <li key={i} className="text-[11px] text-muted-foreground">{line}</li>)}</ul> : <p className="text-xs text-muted-foreground">No changes logged yet.</p>}{profile.last_details_check_date && <p className="mt-1 text-[11px] text-muted-foreground">Last details check requested: {profile.last_details_check_date}</p>}</div>
      </div>
    </div>
  );
}