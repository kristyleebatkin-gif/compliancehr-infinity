import React from 'react';
import { Bot } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { AGENT_STATUS_TONES } from '@/lib/aiIntelligence';

export default function AgentRegisterTable({ agents }) {
  if (!agents.length) {
    return (
      <EmptyState
        icon={Bot}
        title="No agents registered"
        message="Register each copilot and autonomous agent with its domain, data scope, guardrails and accountable owner before it is used on live registers."
        modulePath="Compliance"
        createLabel="Run a copilot review"
        createHref="/ai-os"
      />
    );
  }

  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full min-w-[960px] border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left">Agent / copilot</th>
            <th className="text-left">Kind</th>
            <th className="text-left">Data scope</th>
            <th className="text-left">Owner</th>
            <th className="text-left">Guardrails</th>
            <th className="text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr key={agent.id} className="border-b border-border/60 last:border-0">
              <td className="align-top">
                <div className="font-semibold text-foreground">{agent.name}</div>
                <div className="max-w-[340px] text-[11px] font-medium leading-snug text-muted-foreground">
                  {agent.domain}
                  {agent.purpose ? ` · ${agent.purpose}` : ''}
                </div>
                {Array.isArray(agent.capabilities) && agent.capabilities.length ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 4).map((capability) => (
                      <span key={capability} className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                        {capability}
                      </span>
                    ))}
                  </div>
                ) : null}
              </td>
              <td className="align-top text-xs font-semibold text-foreground">{agent.kind}</td>
              <td className="align-top text-xs font-semibold text-foreground">{agent.data_scope}</td>
              <td className="align-top text-xs font-semibold text-foreground">{agent.owner || 'Unassigned'}</td>
              <td className="align-top">
                <div className="max-w-[240px] text-[11px] font-medium leading-snug text-muted-foreground">
                  {agent.guardrails || '—'}
                </div>
                <div className="mt-0.5 text-[10px] font-bold text-muted-foreground">
                  {agent.human_review_required === false ? 'Human review optional' : 'Human review required'}
                </div>
              </td>
              <td className="align-top">
                <span
                  className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                    AGENT_STATUS_TONES[agent.status] || AGENT_STATUS_TONES.Draft
                  }`}
                >
                  {agent.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}