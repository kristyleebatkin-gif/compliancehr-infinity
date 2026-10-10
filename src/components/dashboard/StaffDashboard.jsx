import React from 'react';
import DashboardTile from './DashboardTile';
import { useRole } from '@/lib/useRole';
import {
  UserPlus, FolderOpen, Users, Megaphone,
  AlertTriangle, ShieldAlert, GraduationCap, Target, ClipboardList, Siren, Wrench, ReceiptText, CalendarDays, LayoutPanelTop,
} from 'lucide-react';

const MODULES = [
  { icon: Users, title: 'My Staff Profile', desc: 'View and update your staff records', to: '/staff', color: '#16a34a' },
  { icon: GraduationCap, title: 'Training Hub', desc: 'Training modules and certifications', to: '/training', color: '#d946ef' },
  { icon: AlertTriangle, title: 'Incident Clinic', desc: 'Report and track incidents', to: '/incidents', color: '#ef4444' },
  { icon: ShieldAlert, title: 'Risk Reporting', desc: 'Log and manage risks and Take 5s', to: '/risks', color: '#f97316' },
  { icon: FolderOpen, title: 'Document Vault', desc: 'Compliance forms and documents', to: '/documents', color: '#eab308' },
  { icon: Megaphone, title: 'Communication Centre', desc: 'Announcements and messaging', to: '/communications', color: '#be185d' },
  { icon: LayoutPanelTop, title: 'Visual Boards', desc: 'Use participant routines and communication prompts', to: '/visual-boards', color: '#0891b2' },
  { icon: Target, title: 'Goal Progress', desc: 'Record participant goal progress', to: '/goals', color: '#1e3a8a' },
  { icon: ClipboardList, title: 'Checklists', desc: 'Complete operational checklists', to: '/checklists', color: '#10b981' },
  { icon: Siren, title: 'Emergency Response', desc: 'Emergency plans and drill records', to: '/emergency-response', color: '#e11d48' },
  { icon: Wrench, title: 'Equipment Manuals and MSDS', desc: 'Access equipment manuals and material safety data sheets', to: '/equipment-manuals', color: '#f97316' },
  { icon: ReceiptText, title: 'Receipt Hub', desc: 'Upload and manage expense receipts', to: '/receipts', color: '#000000' },
  { icon: Users, title: 'Programs', desc: 'View participant and community programs', to: '/programs', color: '#0f766e' },
  { icon: CalendarDays, title: 'Meeting Centre', desc: 'Schedule meetings, minutes and action items', to: '/meetings', color: '#0891b2' },
  { icon: UserPlus, title: 'Intake Centre', desc: 'Participant & employee intake forms', to: '/intake', color: '#3b82f6' },
];

export default function StaffDashboard() {
  const { can } = useRole();
  const visibleModules = MODULES.filter((module) => can(module.to.slice(1)));
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 text-base font-semibold">Your Tools</div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibleModules.map((c) => <DashboardTile key={c.title} {...c} />)}
        </div>
      </div>
    </div>
  );
}