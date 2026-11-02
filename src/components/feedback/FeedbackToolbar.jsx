import React from 'react';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Plus } from 'lucide-react';
import '@/components/feedback/feedbackToolbar.css';

export default function FeedbackToolbar({ tab, onRecord, onExport, embedded = false }) {
  return <div className="feedback-toolbar module-action-bar">
    {tab === 'Feedback' && <Button size="sm" onClick={onRecord}><Plus className="h-3 w-3" />Record</Button>}
    <TabsList className="h-7 p-0.5">
      <TabsTrigger value="Feedback" className="px-1.5 text-[10px]">Feedback &amp; Complaints</TabsTrigger>
      <TabsTrigger value="Surveys" className="px-1.5 text-[10px]">Surveys</TabsTrigger>
    </TabsList>
    {tab === 'Feedback' && <Button size="sm" variant="outline" onClick={onExport}><Download className="h-3 w-3" />Export</Button>}
  </div>;
}