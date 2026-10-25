import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';

import ProfileSummaryPanels from '@/components/profile/ProfileSummaryPanels';
import ProfilePhotoControl from '@/components/profile/ProfilePhotoControl';
import { getCompanyBranding, loadCompanyBranding } from '@/lib/companyBranding';

export default function PersonalProfileHeader({ profile, kind, onUpdated, showIdentity = true, topFormSection = null }) {
  const [branding, setBranding] = useState(getCompanyBranding());
  const staff = kind === 'staff';
  useEffect(() => { loadCompanyBranding().then(setBranding); }, []);

  const professionLabel = staff
    ? (profile.position || profile.role || 'Support Worker / Staff Professional')
    : (profile.support_type || 'NDIS Participant Profile');

  const summaryItems = staff
    ? [
        { label: 'Full Name', value: profile.full_name || 'Not set' },
        { label: 'Profession / Position', value: profile.position || profile.role || 'Support Worker' },
        { label: 'Employment Role & Level', value: [profile.role, profile.position_level].filter(Boolean).join(' · ') || 'Active Staff' },
        { label: 'Employee ID', value: profile.employee_number || 'Assigned in HR' },
        { label: 'Skills & Qualifications', value: profile.skills || 'Update in Profession & Skills below' },
        { label: 'Phone & Email', value: [profile.phone, profile.email].filter(Boolean).join(' · ') || 'Not recorded' },
        { label: 'Address & Car Rego', value: [profile.address, profile.car_rego && `Rego: ${profile.car_rego}`].filter(Boolean).join(' · ') || 'Not recorded' },
        { label: 'Emergency Contact', value: [profile.emergency_contact, profile.emergency_contact_phone].filter(Boolean).join(' · ') || 'Not recorded' },
      ]
    : [
        { label: 'Participant Name', value: profile.full_name || 'Not set' },
        { label: 'NDIS Number & Ref', value: [profile.ndis_number && `NDIS: ${profile.ndis_number}`, profile.ndis_reference_number && `Ref: ${profile.ndis_reference_number}`].filter(Boolean).join(' · ') || 'Pending NDIS number' },
        { label: 'Support Provided', value: profile.support_type || 'Daily Living & Community Participation' },
        { label: 'Plan Manager & Coordinator', value: [profile.plan_manager && `Plan Mgr: ${profile.plan_manager}`, profile.support_coordinator && `Coord: ${profile.support_coordinator}`].filter(Boolean).join(' · ') || 'Managed Plan' },
        { label: 'Phone & Email', value: [profile.phone, profile.email].filter(Boolean).join(' · ') || 'Not recorded' },
        { label: 'Home Address', value: profile.address || 'Not recorded' },
        { label: 'Emergency Contact & Advocate', value: [profile.emergency_contact, profile.emergency_contact_phone, profile.advocate_representative && `Advocate: ${profile.advocate_representative}`].filter(Boolean).join(' · ') || 'Not recorded' },
        { label: 'Likes, Routine & Preferences', value: [profile.likes && `Likes: ${profile.likes}`, profile.routine && `Routine: ${profile.routine}`].filter(Boolean).join(' | ') || 'Update in Preferences below' },
      ];

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md space-y-3 p-3">
      {/* MY PROFILE AT THE VERY TOP OF MY PROFILE */}
      {showIdentity !== false && (
        <div className="overflow-hidden rounded-xl border-2 border-[#0A2B6D] bg-white shadow-sm">
          <div className="app-page-header relative flex items-center rounded-none px-4 py-3" style={{ background: 'var(--header-gradient)' }}>
            <div className="relative flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <ProfilePhotoControl profile={profile} kind={kind} onUpdated={onUpdated} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/50 bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                      {staff ? 'MY EMPLOYEE PROFILE & PROFESSION' : 'MY PARTICIPANT PROFILE & NDIS PLAN'}
                    </span>
                    <Badge className="border border-white bg-[#00C6FF] font-extrabold text-[#0A2B6D]">{profile.status || 'Active'}</Badge>
                  </div>
                  <h2 className="mt-1 text-lg sm:text-xl font-extrabold text-white">{profile.full_name}</h2>
                  <p className="text-xs font-bold text-white/95">
                    {staff ? `Profession / Role: ${professionLabel}` : `Participant Support Profile: ${professionLabel}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dark blue boxes around every profile item at the top of My Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-3 bg-[#F5F0FF]/50">
            {summaryItems.map((item) => (
              <div
                key={item.label}
                className="profile-item-box flex flex-col justify-between rounded-lg border-2 border-[#0A2B6D] bg-white p-2.5 shadow-2xs"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                  {item.label}
                </span>
                <span className="mt-1 break-words text-xs font-bold text-[#0A2B6D]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editable Sectioned Profile Fields directly under the top Profile Summary so updates immediately reflect in the right section */}
      {topFormSection && (
        <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3 shadow-sm">
          {topFormSection}
        </div>
      )}

      <ProfileSummaryPanels profile={profile} kind={kind} branding={branding} onUpdated={onUpdated} staffQuestions={staff} personal />
    </div>
  );
}