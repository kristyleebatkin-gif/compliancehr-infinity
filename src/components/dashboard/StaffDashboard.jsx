import React from 'react';
import DashboardTile from './DashboardTile';
import MyAvailability from '@/components/rostering/MyAvailability';
import ApprovedParticipantProfiles from '@/components/profile/ApprovedParticipantProfiles';
import { useRole } from '@/lib/useRole';
import {
  UserPlus, FolderOpen, Users, Megaphone,
  AlertTriangle, ShieldAlert, GraduationCap, Target, ClipboardList, Siren, Wrench, ReceiptText, CalendarDays, LayoutPanelTop,
} from 'lucide-react';

const MODULES = [
  { icon: Users, title: 'My Staff Profile', desc: 'View and update your staff records', to: '/staff', color: '#0072FF' },
  { icon: GraduationCap, title: 'Training Hub', desc: 'Training modules and certifications', to: '/training', color: '#0A2B6D' },
  { icon: AlertTriangle, title: 'Incident Clinic', desc: 'Report and track incidents', to: '/incidents', color: '#5A00D6' },
  { icon: ShieldAlert, title: 'Risk Reporting', desc: 'Log and manage risks and Take 5s', to: '/risks', color: '#A100FF' },
  { icon: FolderOpen, title: 'Document Vault', desc: 'Compliance forms and documents', to: '/documents', color: '#FF2E9A' },
  { icon: Megaphone, title: 'Communication Centre', desc: 'Announcements and messaging', to: '/communications', color: '#A100FF' },
  { icon: LayoutPanelTop, title: 'Visual Boards', desc: 'Use participant routines and communication prompts', to: '/visual-boards', color: '#5A00D6' },
  { icon: Target, title: 'Goal Progress', desc: 'Record participant goal progress', to: '/goals', color: '#0A2B6D' },
  { icon: ClipboardList, title: 'Checklists', desc: 'Complete operational checklists', to: '/checklists', color: '#0072FF' },
  { icon: Siren, title: 'Emergency Response', desc: 'Emergency plans and drill records', to: '/emergency-response', color: '#00C6FF' },
  { icon: Wrench, title: 'Equipment Manuals and MSDS', desc: 'Access equipment manuals and material safety data sheets', to: '/equipment-manuals', color: '#FF6EDB' },
  { icon: ReceiptText, title: 'Receipt Hub', desc: 'Upload and manage expense receipts', to: '/receipts', color: '#C084FC' },
  { icon: Users, title: 'Programs', desc: 'View participant and community programs', to: '/programs', color: '#5A00D6' },
  { icon: CalendarDays, title: 'Meeting Centre', desc: 'Schedule meetings, minutes and action items', to: '/meetings', color: '#A100FF' },
  { icon: UserPlus, title: 'Intake Centre', desc: 'Participant & employee intake forms', to: '/intake', color: '#0072FF' },
];

export default function StaffDashboard() {
  const { can } = useRole();
  const visibleModules = MODULES.filter((module) => can(module.to.slice(1)));
  return (
    <div className="space-y-4">
      <MyAvailability />
      <ApprovedParticipantProfiles />

      <div>
        <div className="mb-3 text-base font-semibold">Your Tools</div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibleModules.map((c) => <DashboardTile key={c.title} {...c} />)}
        </div>
      </div>
    </div>
  );
}