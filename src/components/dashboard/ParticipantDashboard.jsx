import React from 'react';
import DashboardTile from './DashboardTile';
import { useRole } from '@/lib/useRole';
import {
  FolderOpen, Megaphone, AlertTriangle, ShieldAlert, Heart, Users, UserCog, LayoutPanelTop,
} from 'lucide-react';

const MODULES = [
  { icon: FolderOpen, title: 'My Documents', desc: 'Access your forms and documents', to: '/documents', color: '#eab308' },
  { icon: AlertTriangle, title: 'Report an Incident', desc: 'Tell us about an incident or concern', to: '/incidents', color: '#ef4444' },
  { icon: ShieldAlert, title: 'Raise a Risk', desc: 'Flag a risk or hazard to your team', to: '/risks', color: '#f97316' },
  { icon: Megaphone, title: 'Messages', desc: 'Announcements and updates from your team', to: '/communications', color: '#06b6d4' },
  { icon: LayoutPanelTop, title: 'Visual Boards', desc: 'View routines and choose communication messages', to: '/visual-boards', color: '#0891b2' },
  { icon: Users, title: 'Programs', desc: 'View participant and community programs', to: '/programs', color: '#0f766e' },
  { icon: UserCog, title: 'Key Business Contacts', desc: 'Primary business contacts', to: '/key-contacts', color: '#f97316' },
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