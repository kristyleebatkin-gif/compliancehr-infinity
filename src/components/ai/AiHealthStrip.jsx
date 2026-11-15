import React from 'react';
import { Bot, Flag, Gauge, Inbox, ThumbsUp } from 'lucide-react';
import { confidenceBand } from '@/lib/aiIntelligence';

const TILES = [
  { key: 'runs', label: 'Copilot runs', icon: Gauge, hint: 'Completed runs within the displayed snapshot' },
  { key: 'avgConfidence', label: 'Average confidence', suffix: '%', icon: ThumbsUp, hintKey: 'confidenceHint' },
  { key: 'awaiting', label: 'Awaiting review', icon: Inbox, hint: 'Recommendations needing human verification' },
  { key: 'acceptanceRate', label: 'Acceptance rate', suffix: '%', icon: ThumbsUp, hintKey: 'acceptanceHint' },
  { key: 'flaggedRate', label: 'Flagged rate', suffix: '%', icon: Flag, hintKey: 'flaggedHint' },
  { key: 'activeAgents', label: 'Active agents', icon: Bot, hintKey: 'agentHint' },
];

export default function AiHealthStrip({ summary }) {
  const hints = {
    confidenceHint: summary.avgConfidence === null
      ? 'Uncalibrated; numeric score unavailable'
      : confidenceBand(summary.avgConfidence).label,
    acceptanceHint: summary.acceptanceRate === null
      ? 'No decisions recorded yet'
      : `${summary.accepted} accepted or implemented`,
    flaggedHint: summary.flagged
      ? `${summary.flagged} responses flagged · ${summary.overrides} overrides`
      : 'No responses flagged by reviewers',
    agentHint: `${summary.approvedPrompts} of ${summary.totalPrompts} prompts approved`,
  };

  const display = (tile) => {
    const value = summary[tile.key];
    if (value === null || value === undefined) return '—';
    return `${value}${tile.suffix || ''}`;
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {TILES.map((tile) => {
        const Icon = tile.icon;
        return (
          <div key={tile.key} className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{tile.label}</span>
              <Icon className="h-4 w-4 shrink-0 text-brand" />
            </div>
            <div className="mt-1.5 text-2xl font-extrabold leading-none text-foreground">{display(tile)}</div>
            <div className="mt-1.5 text-[11px] font-semibold leading-snug text-muted-foreground">
              {tile.hint || hints[tile.hintKey]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
