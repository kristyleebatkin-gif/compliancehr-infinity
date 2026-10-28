import React from 'react';
import { Smartphone } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import FrontlineWorkerMobileRapidSuite from '@/components/operations/FrontlineWorkerMobileRapidSuite';

export default function FrontlineRapidHub() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <ModuleShell
        icon={Smartphone}
        moduleKey="tasks"
        title="Frontline Worker, Mobile-First & Rapid Completion Hub"
        subtitle="My Day Dashboard, Single-Screen Shift Workspace, Voice-to-Text, AI-Assisted Notes, ✓ Yes / ✗ No Smart Checklists, Offline Sync & 'Finish My Shift' 7-Gate Verification"
      />
      <FrontlineWorkerMobileRapidSuite />
    </div>
  );
}