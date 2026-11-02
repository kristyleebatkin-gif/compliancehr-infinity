import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { participantModuleUrl, profileVaultUrl } from '@/lib/profileDocumentLinks';

const GRADIENT_BORDER_STYLE = {
  border: '2px solid transparent',
  background:
    'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%) border-box',
  color: '#0A2B6D',
};

const APP_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

export default function ProfileRegisterLinks({ profile, kind }) {
  const { pathname } = useLocation();
  const participant = kind === 'participant';
  const moduleUrl = (module, form = '') =>
    pathname === '/my-profile'
      ? `/my-profile?${new URLSearchParams({ module, ...(form ? { form } : {}) })}`
      : participantModuleUrl(profile, module, form);
  const links = participant
    ? [
        ['Progress notes', moduleUrl('progress-notes')],
        ['Progress reports', moduleUrl('progress-reports')],
        ['Individual risk assessment', moduleUrl('forms', 'Individual Risk Assessment')],
        ['Home risk assessment', moduleUrl('forms', 'Home Risk Assessment')],
        ['Provider declaration', moduleUrl('forms', 'Provider Declaration')],
        ['Risk register', moduleUrl('risks')],
        ['Support plan in Document Vault', profileVaultUrl(profile, kind, 'Participant Support Plan')],
        ['NDIS plan in Document Vault', profileVaultUrl(profile, kind, 'NDIS Plan')],
      ]
    : [];
  if (!links.length) return null;
  return (
    <nav aria-label="Linked profile registers and plans" className="flex flex-wrap gap-2">
      {links.map(([label, to], idx) => {
        const symCol = APP_COLOURS[idx % APP_COLOURS.length];
        return (
          <Button
            key={label}
            variant="outline"
            size="sm"
            className="rounded-full font-extrabold text-[#0A2B6D]"
            style={GRADIENT_BORDER_STYLE}
            asChild
          >
            <Link to={to}>
              <span style={{ color: symCol }}>◉</span>
              <span>{label}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}