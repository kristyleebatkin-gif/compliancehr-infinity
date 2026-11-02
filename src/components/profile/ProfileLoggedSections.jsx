import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';
import ProfileAllLogs from '@/components/profile/ProfileAllLogs';

const CONSENT = /(?:audit consent|consent to share information|consent to act as an advocate|medication consent):/i;

const GRADIENT_BORDER_STYLE = {
  border: '2px solid transparent',
  background:
    'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%) border-box',
};

function LogList({ lines, empty }) {
  if (!lines.length) {
    return (
      <p
        className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-[#0A2B6D]"
        style={GRADIENT_BORDER_STYLE}
      >
        <span style={{ color: '#0072FF' }}>◉</span> {empty}
      </p>
    );
  }
  return (
    <ul className="max-h-60 space-y-1.5 overflow-y-auto">
      {lines.map((line, i) => (
        <li
          key={i}
          className="break-words rounded-lg px-2.5 py-1 text-[11px] font-bold leading-relaxed text-[#0A2B6D]"
          style={GRADIENT_BORDER_STYLE}
        >
          <span style={{ color: '#5A00D6' }}>◉</span> {line}
        </li>
      ))}
    </ul>
  );
}

function Acknowledgements({ profile }) {
  const { data, isLoading } = useQuery({
    queryKey: ['profile-acknowledgements', profile.id],
    queryFn: async () => (await base44.functions.invoke('profileAcknowledgements', { email: profile.email })).data,
  });
  if (isLoading) return <p className="px-1 text-[11px] text-black">Loading…</p>;
  const lines = (data?.items || []).map((r) => `${new Date(r.acknowledged_at).toLocaleString()} · ${r.acknowledged_by_name} (${r.acknowledged_by_role || 'user'}) acknowledged "${r.document_title}"`);
  return <LogList lines={lines} empty="No acknowledgements logged yet." />;
}

export default function ProfileLoggedSections({ profile }) {
  const lines = String(profile.change_log || '').split('\n').filter(Boolean).reverse();
  return <>
    <EmployeeProfileSection title="Logged Audit Consent" tone="pink" uniform><LogList lines={lines.filter((l) => CONSENT.test(l))} empty="No audit consent changes logged yet." /></EmployeeProfileSection>
    <EmployeeProfileSection title="Logged Detail Changes" tone="green" uniform><LogList lines={lines.filter((l) => !CONSENT.test(l))} empty="No detail changes logged yet." /></EmployeeProfileSection>
    <EmployeeProfileSection title="Logged Acknowledgements" tone="orange" uniform><Acknowledgements profile={profile} /></EmployeeProfileSection>
    <ProfileAllLogs profile={profile} />
  </>;
}