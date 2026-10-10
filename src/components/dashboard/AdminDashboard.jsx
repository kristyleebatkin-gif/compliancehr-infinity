import React from 'react';
import DashboardTile from './DashboardTile';
import DashboardCharts from './DashboardCharts';
import AttentionPanel from './AttentionPanel';
import { useRole } from '@/lib/useRole';
import {
  UserPlus, FolderOpen, Users, Heart, Megaphone,
  AlertTriangle, ShieldAlert, ShieldCheck, GraduationCap, Handshake,
  Boxes, Target, UserCog, ClipboardList, Siren, ReceiptText, Wrench, Landmark, CalendarDays, Vault, LayoutPanelTop, FileSpreadsheet, CalendarClock,
} from 'lucide-react';

const MODULES = [
  { icon: UserPlus, title: 'Intake Centre', desc: 'Participant & employee intake forms', to: '/intake', color: '#3b82f6' },
  { icon: FolderOpen, title: 'Document Vault', desc: 'Store and manage compliance documents', to: '/documents', color: '#eab308' },
  { icon: Vault, title: 'Company Safe', desc: 'Completed forms and submitted documents in one secure register', to: '/company-safe', color: '#0f766e' },
  { icon: Users, title: 'Staff Profiles', desc: 'Manage staff records and screening', to: '/staff', color: '#16a34a' },
  { icon: CalendarClock, title: 'Rostering Facility', desc: 'Build rosters, manage shifts and record handovers', to: '/rostering', color: '#2563eb' },
  { icon: FileSpreadsheet, title: 'Invoicing Centre', desc: 'NDIS invoices, Xero exports and employee timesheets', to: '/invoicing', color: '#0f766e' },
  { icon: Heart, title: 'Participant Profiles', desc: 'View and manage participant records', to: '/participants', color: '#8b5cf6' },
  { icon: LayoutPanelTop, title: 'Visual Boards', desc: 'Create accessible routines and communication boards', to: '/visual-boards', color: '#0891b2' },
  { icon: Megaphone, title: 'Communication Centre', desc: 'Announcements and messaging', to: '/communications', color: '#be185d' },
  { icon: AlertTriangle, title: 'Incident Clinic', desc: 'Report and track incidents', to: '/incidents', color: '#ef4444' },
  { icon: ShieldAlert, title: 'Risk Reporting', desc: 'Log and manage risks', to: '/risks', color: '#f97316' },
  { icon: ShieldCheck, title: 'Compliance & Report Centre', desc: 'Compliance Dashboard & Report Centre', to: '/compliance', color: '#4f46e5' },
  { icon: GraduationCap, title: 'Training Hub', desc: 'Training modules and certifications', to: '/training', color: '#d946ef' },
  { icon: Target, title: 'Goal Progress', desc: 'Progress and goal achievement', to: '/goals', color: '#1e3a8a' },
  { icon: ClipboardList, title: 'Checklists', desc: 'Fillable operational checklists and records', to: '/checklists', color: '#10b981' },
  { icon: Siren, title: 'Emergency Response', desc: 'Emergency plans, kits and drill records', to: '/emergency-response', color: '#e11d48' },
  { icon: ReceiptText, title: 'Receipt Hub', desc: 'Upload and manage expense receipts', to: '/receipts', color: '#000000' },
  { icon: Wrench, title: 'Equipment Manuals and MSDS', desc: 'Equipment manuals and material safety data sheets', to: '/equipment-manuals', color: '#f97316' },
  { icon: Landmark, title: 'Insurance & Finance Management', desc: 'Policies, renewals and financial registers', to: '/insurance-finance', color: '#dc2626' },
  { icon: Users, title: 'Programs', desc: 'Manage participant and community programs', to: '/programs', color: '#0f766e' },
  { icon: CalendarDays, title: 'Meeting Centre', desc: 'Schedule meetings, minutes and action items', to: '/meetings', color: '#0891b2' },
  { icon: UserCog, title: 'Key Personnel Contacts', desc: 'Personnel profiles and delegated authority registers', to: '/key-contacts', color: '#f97316' },
  { icon: Handshake, title: 'Volunteering & Student Placement', desc: 'Onboarding, screening, supervision and placement records', to: '/volunteering-placements', color: '#0d9488' },
  { icon: Boxes, title: 'Asset Management', desc: 'Track assets, internal audits and improvement actions', to: '/assets', color: '#0ea5e9' },
];

export default function AdminDashboard() {
  const { can } = useRole();
  const visibleModules = MODULES.filter((module) => can(module.to.slice(1)));

  return (
    <>
      <AttentionPanel />

      <DashboardCharts />

      <div>
        <div className="mb-3 text-base font-semibold">Modules</div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {visibleModules.map((c) => <DashboardTile key={c.title} {...c} />)}
        </div>
      </div>
    </>
  );
}