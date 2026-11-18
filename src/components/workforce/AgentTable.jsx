import React from 'react';
import { Pencil, Play, Pause, Power } from 'lucide-react';
import { Button, NewRow, StatusBadge, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow, WorkforceEmpty } from '@/components/workforce/workforceKit';

/** The agent registry: what each agent is pinned to, how much autonomy it has, and its state. */
export default function AgentTable({ agents = [], canConfigure, onNew, onEdit, onStatus } = {}) {
  return (
    <div>
      <NewRow canConfigure={canConfigure} label="New agent" onNew={onNew} />
      {!agents.length ? (
        <WorkforceEmpty
          title="No agent registered yet"
          body="An agent pins one validated model and one published prompt version. It stays a draft until you activate it, and it can be paused or disabled at any time."
        />
      ) : (
        <TableFrame>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Model and prompt</TableHead>
              <TableHead>Autonomy</TableHead>
              <TableHead>Grants</TableHead>
              <TableHead>Decisions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="min-w-[200px]">
                  <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                  <div className="text-[11px] text-[#0A2B6D]/60">{row.agent_key}</div>
                  <div className="text-[11px] text-[#0A2B6D]/60">{row.purpose || row.description}</div>
                </TableCell>
                <TableCell className="min-w-[170px] text-[11px] text-[#0A2B6D]/80">
                  <div className="text-xs font-bold text-[#0A2B6D]">{row.model_name}</div>
                  <div>{row.prompt_name} v{row.prompt_version}</div>
                  <div className="text-[#0A2B6D]/50">pinned hash {(row.prompt_hash || '').slice(0, 18) || 'none'}</div>
                </TableCell>
                <TableCell className="min-w-[150px]">
                  <StatusBadge status={row.autonomy_level === 'Internal actions permitted' ? 'Allowed with approval' : 'Propose only'} />
                  <div className="mt-1 text-[11px] text-[#0A2B6D]/80">{row.autonomy_level}</div>
                  <div className="text-[11px] text-[#0A2B6D]/60">{row.risk_tier} risk</div>
                </TableCell>
                <TableCell className="text-xs text-[#0A2B6D]">{row.tool_count || 0}</TableCell>
                <TableCell className="text-xs text-[#0A2B6D]">{row.decision_count || 0}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge status={row.status} />
                  {row.status_reason && <div className="mt-1 max-w-[180px] text-[11px] text-[#0A2B6D]/70">{row.status_reason}</div>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                    {row.status !== 'Active' && (
                      <Button size="sm" variant="secondary" onClick={() => onStatus?.(row, 'Active')}><Play className="h-3.5 w-3.5" /> Activate</Button>
                    )}
                    {row.status === 'Active' && (
                      <Button size="sm" variant="ghost" onClick={() => onStatus?.(row, 'Paused')}><Pause className="h-3.5 w-3.5" /> Pause</Button>
                    )}
                    {row.status !== 'Disabled' && (
                      <Button size="sm" variant="ghost" onClick={() => onStatus?.(row, 'Disabled')}><Power className="h-3.5 w-3.5" /> Disable</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableFrame>
      )}
    </div>
  );
}