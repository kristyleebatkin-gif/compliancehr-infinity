import React from 'react';
import DashboardTile from './DashboardTile';
import { useRole } from '@/lib/useRole';
import {
  FolderOpen, Megaphone, AlertTriangle, ShieldAlert, Users, UserCog, LayoutPanelTop,
} from 'lucide-react';

const MODULES = [
  { navKey: 'my-profile', icon: UserCog, title: 'My Profile', desc: 'View your personal details and support information', to: '/my-profile', color: '#0072FF' },
  { navKey: 'documents', icon: FolderOpen, title: 'My Documents', desc: 'Access your forms and documents', to: '/documents', color: '#0072FF' },
  { navKey: 'incidents', icon: AlertTriangle, title: 'Report an Incident', desc: 'Tell us about an incident or concern', to: '/incidents', color: '#0A2B6D' },
  { navKey: 'risks', icon: ShieldAlert, title: 'Raise a Risk', desc: 'Flag a risk or hazard to your team', to: '/risks', color: '#5A00D6' },
  { navKey: 'communications', icon: Megaphone, title: 'Messages', desc: 'Announcements and updates from your team', to: '/communications', color: '#A100FF' },
  { navKey: 'visual-boards', icon: LayoutPanelTop, title: 'Visual Boards', desc: 'View routines and choose communication messages', to: '/visual-boards', color: '#FF2E9A' },
  { navKey: 'programs', icon: Users, title: 'Programs', desc: 'View participant and community programs', to: '/programs', color: '#00C6FF' },
  { navKey: 'key-contacts', icon: UserCog, title: 'Key Business Contacts', desc: 'Primary business contacts', to: '/key-contacts', color: '#FF6EDB' },
];

export default function ParticipantDashboard() {
  const { can } = useRole();
  const visibleModules = MODULES.filter((module) => can(module.navKey));
  return (
    <div>
      <div className="mb-3 text-base font-semibold text-[#0A2B6D]">Your Portal</div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visibleModules.map((module) => <DashboardTile key={module.title} {...module} />)}
      </div>
    </div>
  );
}
