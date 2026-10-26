import React from 'react';
import { Sparkles } from 'lucide-react';

const TIPS = {
  clock: 'Pair the clock with the Visual Routine so each step has a clear start time.',
  routine: 'Keep routines to 4–6 steps with a picture on each; review them with the participant monthly.',
  communication: 'Add the participant\'s most-used words to the first page so they are one tap away.',
  weather: 'Check the weather board before outings so clothing and sun-safety can be planned.',
  daydate: 'Reviewing the day and date at the start of each shift helps orientation and predictability.',
  speech: 'Save frequent phrases in the speech pad to speed up communication.',
  signs: 'Use sign prompts alongside spoken words to reinforce understanding.',
  translator: 'Confirm key information (medication, safety) with an interpreter, not only the translator.',
  'kids-zone': 'Walk the 44×44px seashell & sand dollar stepping stones with the crab or pirate avatar to burst open the 132×132px golden treasure chest!',
};

export default function VisualBoardsInsight({ tab }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-white px-3.5 py-2 shadow-sm">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-ai-hint-foreground" />
      <p className="text-xs"><span className="font-bold">AI Insight: </span>{TIPS[tab] || TIPS.clock}</p>
    </div>
  );
}