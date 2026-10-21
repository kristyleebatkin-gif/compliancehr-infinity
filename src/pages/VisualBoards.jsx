import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Clock as ClockIcon, CloudSun, Hand, Languages, ListChecks, MessageSquareText, MessagesSquare } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleSearchBar from '@/components/module/ModuleSearchBar';
import VisualBoardsInsight from '@/components/visual/VisualBoardsInsight';
import VisualClock from '@/components/visual/VisualClock';
import VisualRoutine from '@/components/visual/VisualRoutine';
import SpeechPad from '@/components/visual/SpeechPad';
import SignPrompts from '@/components/visual/SignPrompts';
import CommunicationBoard from '@/components/visual/CommunicationBoard';
import WeatherBoard from '@/components/visual/WeatherBoard';
import DayDateBoard from '@/components/visual/DayDateBoard';
import TranslatorPanel from '@/components/visual/TranslatorPanel';

const BOARDS = [['clock', 'Clock'], ['routine', 'Visual Routine'], ['communication', 'Communication'], ['weather', 'Weather'], ['daydate', 'Day & Date'], ['speech', 'Speech'], ['signs', 'Sign Prompts'], ['translator', 'Translator']];

export default function VisualBoards({ embedded = false } = {}) {
  const [tab, setTab] = useState('clock');
  const [query, setQuery] = useState('');
  const search = (q) => {
    setQuery(q);
    const hit = BOARDS.find(([, label]) => q.trim() && label.toLowerCase().includes(q.trim().toLowerCase()));
    if (hit) setTab(hit[0]);
  };

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <ModuleShell
        embedded={embedded}
        title="Visual Boards"
        subtitle="Communication supports: clock, visual routine, speech, signs, a full communication board, weather, day and date, and a translator."
        moduleKey="visual-boards"
        search={<ModuleSearchBar value={query} onChange={search} placeholder="Search boards (clock, routine, weather, translator…)" />}
        insight={<VisualBoardsInsight tab={tab} />}
        insightAfterTiles
        tabs={<TabsList>
          <TabsTrigger value="clock"><ClockIcon className="mr-1 inline h-3.5 w-3.5" />Clock</TabsTrigger>
          <TabsTrigger value="routine"><ListChecks className="mr-1 inline h-3.5 w-3.5" />Visual Routine</TabsTrigger>
          <TabsTrigger value="communication"><MessagesSquare className="mr-1 inline h-3.5 w-3.5" />Communication</TabsTrigger>
          <TabsTrigger value="weather"><CloudSun className="mr-1 inline h-3.5 w-3.5" />Weather</TabsTrigger>
          <TabsTrigger value="daydate"><CalendarDays className="mr-1 inline h-3.5 w-3.5" />Day &amp; Date</TabsTrigger>
          <TabsTrigger value="speech"><MessageSquareText className="mr-1 inline h-3.5 w-3.5" />Speech</TabsTrigger>
          <TabsTrigger value="signs"><Hand className="mr-1 inline h-3.5 w-3.5" />Sign Prompts</TabsTrigger>
          <TabsTrigger value="translator"><Languages className="mr-1 inline h-3.5 w-3.5" />Translator</TabsTrigger>
        </TabsList>}
      >
        <TabsContent value="clock"><VisualClock /></TabsContent>
        <TabsContent value="routine"><VisualRoutine /></TabsContent>
        <TabsContent value="communication"><CommunicationBoard /></TabsContent>
        <TabsContent value="weather"><WeatherBoard /></TabsContent>
        <TabsContent value="daydate"><DayDateBoard /></TabsContent>
        <TabsContent value="speech"><SpeechPad /></TabsContent>
        <TabsContent value="signs"><SignPrompts /></TabsContent>
        <TabsContent value="translator"><TranslatorPanel /></TabsContent>
      </ModuleShell>
    </Tabs>
  );
}