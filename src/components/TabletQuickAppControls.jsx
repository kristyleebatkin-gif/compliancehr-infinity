import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';

export default function TabletQuickAppControls({ sections, selected, onSelect, mode, onModeChange, moduleCount, canParticipants, showAiCore, workspaceView, onSwitchWorkspaceView }) {
  return (
    <div className="hidden min-w-0 flex-wrap items-center gap-1 md:flex lg:hidden">
      <select aria-label="Workspace group" value={selected?.id || ''} onChange={(event) => { const section = sections.find((item) => item.id === event.target.value); if (section) onSelect(section); }} disabled={!sections.length} className="min-h-9 max-w-full rounded-md border border-header-foreground/20 bg-workspace-navy px-2 text-xs font-bold text-header-foreground">
        {!sections.length && <option value="">No groups available</option>}
        {sections.map((section) => <option className="bg-background text-foreground" key={section.id} value={section.id}>{section.label}</option>)}
      </select>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><button type="button" className="inline-flex min-h-9 items-center gap-1 rounded-md border border-header-foreground/20 bg-workspace-navy px-2 text-xs font-bold text-header-foreground">Options <ChevronDown className="h-3 w-3" /></button></DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-[70vh] overflow-y-auto">
          <DropdownMenuLabel>Navigation</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={mode} onValueChange={onModeChange}>
            <DropdownMenuRadioItem value="pillars5">5 Pillars</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="os11">10 Groups</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="all">All {moduleCount} modules</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
          {showAiCore && <DropdownMenuItem asChild><Link to="/assistant">AI Core</Link></DropdownMenuItem>}
          <DropdownMenuItem asChild><Link to="/frontline-hub">60s Field Bar</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/auditor-portal">Auditor View</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/compliance">Audit Ready</Link></DropdownMenuItem>
          {canParticipants && onSwitchWorkspaceView && <DropdownMenuItem asChild><Link to="/our-participants">Participant Profiles</Link></DropdownMenuItem>}
          {onSwitchWorkspaceView && <DropdownMenuItem onSelect={() => onSwitchWorkspaceView('both')}>Both Views{workspaceView === 'both' ? ' (current)' : ''}</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}