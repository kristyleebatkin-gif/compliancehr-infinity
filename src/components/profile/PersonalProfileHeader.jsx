import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import ProfileSummaryPanels from '@/components/profile/ProfileSummaryPanels';
import ProfilePhotoControl from '@/components/profile/ProfilePhotoControl';
import { getCompanyBranding, loadCompanyBranding } from '@/lib/companyBranding';

const APP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

const HEADING_TEXT_GRADIENT =
  'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)';

const APP_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

export default function PersonalProfileHeader({
  profile,
  kind,
  onUpdated,
  showIdentity = true,
  topFormSection = null,
}) {
  const [branding, setBranding] = useState(getCompanyBranding());
  const staff = kind === 'staff';
  useEffect(() => {
    loadCompanyBranding().then(setBranding);
  }, []);

  const professionLabel = staff
    ? profile.position || profile.role || 'Support Worker / Staff Professional'
    : profile.support_type || 'NDIS Participant Profile';

  const summaryItems = staff
    ? [
        { label: 'Full Name', value: profile.full_name || 'Not set' },
        { label: 'Profession / Position', value: profile.position || profile.role || 'Support Worker' },
        {
          label: 'Employment Role & Level',
          value: [profile.role, profile.position_level].filter(Boolean).join(' · ') || 'Active Staff',
        },
        { label: 'Employee ID', value: profile.employee_number || 'Assigned in HR' },
        {
          label: 'Skills & Qualifications',
          value: profile.skills || 'Update in Profession & Skills below',
        },
        {
          label: 'Phone & Email',
          value: [profile.phone, profile.email].filter(Boolean).join(' · ') || 'Not recorded',
        },
        {
          label: 'Address & Car Rego',
          value:
            [profile.address, profile.car_rego && `Rego: ${profile.car_rego}`]
              .filter(Boolean)
              .join(' · ') || 'Not recorded',
        },
        {
          label: 'Emergency Contact',
          value:
            [profile.emergency_contact, profile.emergency_contact_phone]
              .filter(Boolean)
              .join(' · ') || 'Not recorded',
        },
      ]
    : [
        { label: 'Participant Name', value: profile.full_name || 'Not set' },
        {
          label: 'NDIS Number & Ref',
          value:
            [
              profile.ndis_number && `NDIS: ${profile.ndis_number}`,
              profile.ndis_reference_number && `Ref: ${profile.ndis_reference_number}`,
            ]
              .filter(Boolean)
              .join(' · ') || 'Pending NDIS number',
        },
        {
          label: 'Support Provided',
          value: profile.support_type || 'Daily Living & Community Participation',
        },
        {
          label: 'Plan Manager & Coordinator',
          value:
            [
              profile.plan_manager && `Plan Mgr: ${profile.plan_manager}`,
              profile.support_coordinator && `Coord: ${profile.support_coordinator}`,
            ]
              .filter(Boolean)
              .join(' · ') || 'Managed Plan',
        },
        {
          label: 'Phone & Email',
          value: [profile.phone, profile.email].filter(Boolean).join(' · ') || 'Not recorded',
        },
        { label: 'Home Address', value: profile.address || 'Not recorded' },
        {
          label: 'Emergency Contact & Advocate',
          value:
            [
              profile.emergency_contact,
              profile.emergency_contact_phone,
              profile.advocate_representative && `Advocate: ${profile.advocate_representative}`,
            ]
              .filter(Boolean)
              .join(' · ') || 'Not recorded',
        },
        {
          label: 'Likes, Routine & Preferences',
          value:
            [profile.likes && `Likes: ${profile.likes}`, profile.routine && `Routine: ${profile.routine}`]
              .filter(Boolean)
              .join(' | ') || 'Update in Preferences below',
        },
      ];

  return (
    <div
      className="overflow-hidden rounded-2xl p-[3px] shadow-md"
      style={{ background: APP_BORDER_GRADIENT }}
    >
      <div className="rounded-[13px] bg-white p-3 space-y-3">
        {/* MY PROFILE AT THE VERY TOP OF MY PROFILE — CONSISTENT HEADER & REMOTE STYLE */}
        {showIdentity !== false && (
          <div
            className="preserve-island-theme overflow-hidden rounded-2xl p-[2.5px] shadow-md"
            style={{ background: APP_BORDER_GRADIENT }}
          >
            <div
              className="overflow-hidden rounded-[13.5px]"
              style={{
                background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #131B4D 100%)',
              }}
            >
              {/* Top White Identity Section: Every Word Group Framed with an App Design Coloured Border */}
              <div className="bg-white p-3">
                <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-3">
                    <ProfilePhotoControl profile={profile} kind={kind} onUpdated={onUpdated} />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border-2 border-[#5A00D6] bg-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                          <span style={{ color: '#5A00D6' }}>◉</span>
                          <span style={{ color: '#0A2B6D' }}>
                            {staff ? 'MY EMPLOYEE PROFILE & PROFESSION' : 'MY PARTICIPANT PROFILE & NDIS PLAN'}
                          </span>
                        </span>
                        <Badge
                          className="rounded-full border-2 border-[#0072FF] bg-white px-2.5 py-0.5 font-extrabold text-[#0A2B6D]"
                          style={{ color: '#0A2B6D' }}
                        >
                          <span className="mr-1" style={{ color: '#0072FF' }}>◉</span>
                          {profile.status || 'Active'}
                        </Badge>
                      </div>

                      {/* Main Name Header with App Design Coloured Border & Dark Blue -> App Colour Writing */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div
                          className="inline-flex rounded-xl p-[2px]"
                          style={{ background: APP_BORDER_GRADIENT }}
                        >
                          <h2
                            className="rounded-[10px] bg-white px-3 py-1 text-base sm:text-xl font-extrabold bg-clip-text text-transparent"
                            style={{ backgroundImage: HEADING_TEXT_GRADIENT }}
                          >
                            ◉ {profile.full_name}
                          </h2>
                        </div>

                        <span
                          className="inline-flex items-center gap-1 rounded-full border-2 border-[#FF2E9A] bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D]"
                          style={{ color: '#0A2B6D' }}
                        >
                          <span style={{ color: '#FF2E9A' }}>◉</span>
                          <span>
                            {staff
                              ? `Profession / Role: ${professionLabel}`
                              : `Participant Support Profile: ${professionLabel}`}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* App Design Coloured Borders Around Every Profile Item Tile on White */}
              <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
                {summaryItems.map((item, idx) => {
                  const symColor = APP_COLOURS[idx % APP_COLOURS.length];
                  return (
                    <div
                      key={item.label}
                      className="profile-item-box flex flex-col justify-between rounded-xl bg-white p-2.5 shadow-2xs"
                      style={{ border: `2px solid ${symColor}` }}
                    >
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]"
                        style={{ color: '#0A2B6D' }}
                      >
                        <span style={{ color: symColor }}>◉</span> {item.label}
                      </span>
                      <span
                        className="mt-1 break-words text-xs font-bold text-[#0A2B6D]"
                        style={{ color: '#0A2B6D' }}
                      >
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Editable Sectioned Profile Fields directly under the top Profile Summary */}
        {topFormSection && (
          <div
            className="rounded-2xl p-[2px] shadow-sm"
            style={{ background: APP_BORDER_GRADIENT }}
          >
            <div className="rounded-[14px] bg-white p-3">{topFormSection}</div>
          </div>
        )}

        <ProfileSummaryPanels
          profile={profile}
          kind={kind}
          branding={branding}
          onUpdated={onUpdated}
          staffQuestions={staff}
          personal
        />
      </div>
    </div>
  );
}