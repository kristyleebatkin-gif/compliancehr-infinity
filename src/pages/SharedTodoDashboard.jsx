import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ListTodo } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import TodoBoard from '@/components/communications/TodoBoard';

export default function SharedTodoDashboard() {
  return <div className="mx-auto max-w-6xl space-y-3">
    <PageHeader title="Shared To-do Dashboard" subtitle="Share team actions, track completion and review manager sign-off." icon={ListTodo} showAudit={false} showCompliance={false} showAlerts={false} action={<Button asChild variant="outline" size="sm"><Link to="/tasks"><ArrowLeft className="h-4 w-4" />Task dashboard</Link></Button>} />
    <TodoBoard compact />
  </div>;
}