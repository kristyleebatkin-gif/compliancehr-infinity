import React from 'react';
import { ListChecks } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import TodoBoard from '@/components/communications/TodoBoard';

export default function SharedTodoDashboard() {
  return (
    <div className="space-y-3">
      <PageHeader icon={ListChecks} title="Shared To-Do" subtitle="Team to-dos, sign-off requests and review tasks in one shared board." />
      <TodoBoard compact presentation="review" />
    </div>
  );
}