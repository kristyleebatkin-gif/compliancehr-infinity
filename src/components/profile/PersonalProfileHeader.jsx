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
      {showIdentity && <>
        <div className="app-page-header relative flex items-center rounded-none px-4" style={{ background: 'var(--header-gradient)' }}>
          <div className="relative flex w-full min-w-0 items-center gap-3">
            <ProfilePhotoControl profile={profile} kind={kind} onUpdated={onUpdated} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h2>{profile.full_name}</h2><Badge className="border-0 bg-white/20 text-white">{profile.status || 'Active'}</Badge></div>
              <p>{staff ? profile.position || profile.role || 'Staff member' : profile.support_type || 'Participant'}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 p-3 text-xs font-medium">{facts.map((fact, i) => <span key={i} className="max-w-full break-words rounded-full bg-primary/10 px-2.5 py-1 text-foreground">{fact}</span>)}</div>
      </>}
      <ProfileSummaryPanels profile={profile} kind={kind} branding={branding} onUpdated={onUpdated} staffQuestions={staff} />
    </div>
  );
}