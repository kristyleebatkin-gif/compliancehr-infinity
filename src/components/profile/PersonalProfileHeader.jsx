import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';

import ProfileSummaryPanels from '@/components/profile/ProfileSummaryPanels';
import ProfilePhotoControl from '@/components/profile/ProfilePhotoControl';
import { getCompanyBranding, loadCompanyBranding } from '@/lib/companyBranding';

export default function PersonalProfileHeader({ profile, kind, onUpdated, showIdentity = true }) {
  const [branding, setBranding] = useState(getCompanyBranding());
  const staff = kind === 'staff';
  useEffect(() => { loadCompanyBranding().then(setBranding); }, []);
  const facts = [staff && profile.employee_number && `Employee ID ${profile.employee_number}`, !staff && profile.ndis_number && `NDIS ${profile.ndis_number}`, !staff && profile.ndis_reference_number && `Ref ${profile.ndis_reference_number}`, profile.phone, profile.email, staff && profile.start_date && `Start ${profile.start_date}`, staff && profile.end_date && `End ${profile.end_date}`].filter(Boolean);
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      {showIdentity && <div className="relative gradient-brand px-6 py-6 text-primary-foreground">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 88% 8%, rgba(255,255,255,0.28), transparent 42%), radial-gradient(circle at 6% 95%, rgba(255,255,255,0.18), transparent 38%)' }} />
        <div className="relative flex flex-wrap items-center gap-5">
          <ProfilePhotoControl profile={profile} kind={kind} onUpdated={onUpdated} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold">{profile.full_name}</h2><Badge className="border-0 bg-primary-foreground/20 text-primary-foreground">{profile.status || 'Active'}</Badge></div>
            <p className="text-sm opacity-85">{staff ? profile.position || profile.role || 'Staff member' : profile.support_type || 'Participant'}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium">{facts.map((fact, i) => <span key={i} className="max-w-full break-words rounded-full bg-primary-foreground/20 px-2.5 py-1">{fact}</span>)}</div>
          </div>

        </div>
      </div>}
      <ProfileSummaryPanels profile={profile} kind={kind} branding={branding} onUpdated={onUpdated} />
    </div>
  );
}