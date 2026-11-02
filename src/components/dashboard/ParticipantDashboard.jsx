import React from 'react';
import DashboardTile from './DashboardTile';
import { useRole } from '@/lib/useRole';
import {
  FolderOpen, Megaphone, AlertTriangle, ShieldAlert, Users, UserCog, LayoutPanelTop,
} from 'lucide-react';

const MODULES = [
  { icon: FolderOpen, title: 'My Documents', desc: 'Access your forms and documents', to: '/documents', color: '#0072FF' },
  { icon: AlertTriangle, title: 'Report an Incident', desc: 'Tell us about an incident or concern', to: '/incidents', color: '#0A2B6D' },
  { icon: ShieldAlert, title: 'Raise a Risk', desc: 'Flag a risk or hazard to your team', to: '/risks', color: '#5A00D6' },
  { icon: Megaphone, title: 'Messages', desc: 'Announcements and updates from your team', to: '/communications', color: '#A100FF' },
  { icon: LayoutPanelTop, title: 'Visual Boards', desc: 'View routines and choose communication messages', to: '/visual-boards', color: '#FF2E9A' },
  { icon: Users, title: 'Programs', desc: 'View participant and community programs', to: '/programs', color: '#00C6FF' },
  { icon: UserCog, title: 'Key Business Contacts', desc: 'Primary business contacts', to: '/key-contacts', color: '#FF6EDB' },
];

export default function ParticipantDashboard() {
  const { can } = useRole();
  const visibleModules = MODULES.filter((module) => can(module.to.slice(1)));
  return (
    <div>
      <div className="mb-3 text-base font-semibold">Your Portal</div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visibleModules.map((c) => <DashboardTile key={c.title} {...c} />)}
      </div>
    </div>
  );
}