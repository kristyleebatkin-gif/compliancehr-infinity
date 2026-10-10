import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock as ClockIcon, ListChecks, MessageSquareText } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import VisualClock from '@/components/visual/VisualClock';
import VisualRoutine from '@/components/visual/VisualRoutine';
import SpeechPad from '@/components/visual/SpeechPad';

export default function VisualBoards() {
  const [tab, setTab] = useState('clock');

  return (
    <div className="space-y-6">
      <PageHeader title="Visual Boards" subtitle="Communication supports: clock, visual routine and speech." />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="clock"><ClockIcon className="mr-1 inline h-3.5 w-3.5" />Clock</TabsTrigger>
          <TabsTrigger value="routine"><ListChecks className="mr-1 inline h-3.5 w-3.5" />Visual Routine</TabsTrigger>
          <TabsTrigger value="speech"><MessageSquareText className="mr-1 inline h-3.5 w-3.5" />Speech</TabsTrigger>
        </TabsList>
        <TabsContent value="clock"><VisualClock /></TabsContent>
        <TabsContent value="routine"><VisualRoutine /></TabsContent>
        <TabsContent value="speech"><SpeechPad /></TabsContent>
      </Tabs>
    </div>
  );
}