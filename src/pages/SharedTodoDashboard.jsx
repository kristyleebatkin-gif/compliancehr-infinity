import React from 'react';
import { ListChecks } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import TodoBoard from '@/components/communications/TodoBoard';

export default function SharedTodoDashboard() {
  return (
    <div className="space-y-3">
      <ModuleShell icon={ListChecks} moduleKey="tasks" title="Shared To-Do" subtitle="Team to-dos, sign-off requests and review tasks in one shared board." />
      <TodoBoard compact presentation="review" />
    </div>
  );
}