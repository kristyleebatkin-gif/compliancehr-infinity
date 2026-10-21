import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { participantModuleUrl, profileVaultUrl } from '@/lib/profileDocumentLinks';

export default function ProfileRegisterLinks({ profile, kind }) {
  const { pathname } = useLocation();
  const participant = kind === 'participant';
  const moduleUrl = (module, form = '') => pathname === '/my-profile' ? `/my-profile?${new URLSearchParams({ module, ...(form ? { form } : {}) })}` : participantModuleUrl(profile, module, form);
  const links = participant ? [
    ['Progress notes', moduleUrl('progress-notes')], ['Progress reports', moduleUrl('progress-reports')],
    ['Individual risk assessment', moduleUrl('forms', 'Individual Risk Assessment')], ['Home risk assessment', moduleUrl('forms', 'Home Risk Assessment')],
    ['Provider declaration', moduleUrl('forms', 'Provider Declaration')], ['Risk register', moduleUrl('risks')],
    ['Support plan in Document Vault', profileVaultUrl(profile, kind, 'Participant Support Plan')],
    ['NDIS plan in Document Vault', profileVaultUrl(profile, kind, 'NDIS Plan')],
  ] : [];
  return <nav aria-label="Linked profile registers and plans" className="flex flex-wrap gap-2">
    {links.map(([label, to]) => <Button key={label} variant="outline" size="sm" asChild><Link to={to}>{label}</Link></Button>)}
    <Button variant="outline" size="sm" asChild><Link to={profileVaultUrl(profile, kind)}>Document Vault for {profile.full_name}</Link></Button>
  </nav>;
}