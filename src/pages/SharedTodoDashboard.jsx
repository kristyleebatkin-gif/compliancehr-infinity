import React from 'react';
import { ListChecks } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import TodoBoard from '@/components/communications/TodoBoard';
import AutomaticTaskCompletionEvidenceClosureEngine from '@/components/operations/AutomaticTaskCompletionEvidenceClosureEngine';

export default function SharedTodoDashboard() {
  return (
    <div className="space-y-3">
      <ModuleShell
        icon={ListChecks}
        moduleKey="tasks"
        title="Shared To-Do & Automatic Evidence Closure Board"
        subtitle="Staff complete the work; the system verifies evidence, closes administrative tasks, and routes only exceptions to managers."
      />
      <AutomaticTaskCompletionEvidenceClosureEngine compact />
      <TodoBoard compact presentation="review" />
    </div>
  );
}