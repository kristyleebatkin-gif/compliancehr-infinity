import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';

const CONSENT = /(?:audit consent|consent to share information|consent to act as an advocate|medication consent):/i;

function LogList({ lines, empty }) {
  if (!lines.length) return <p className="px-1 text-[11px] text-black">{empty}</p>;
  return <ul className="max-h-60 space-y-1 overflow-y-auto">{lines.map((line, i) => <li key={i} className="break-words rounded-md bg-white px-2 py-1 text-[11px] leading-relaxed text-black">{line}</li>)}</ul>;
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
    <EmployeeProfileSection title="Logged Audit Consent" tone="pink"><LogList lines={lines.filter((l) => CONSENT.test(l))} empty="No audit consent changes logged yet." /></EmployeeProfileSection>
    <EmployeeProfileSection title="Logged Detail Changes" tone="green"><LogList lines={lines.filter((l) => !CONSENT.test(l))} empty="No detail changes logged yet." /></EmployeeProfileSection>
    <EmployeeProfileSection title="Logged Acknowledgements" tone="orange"><Acknowledgements profile={profile} /></EmployeeProfileSection>
  </>;
}