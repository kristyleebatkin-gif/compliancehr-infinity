import React from 'react';
import { FilePlus2, Send } from 'lucide-react';
import { Button, NewRow, StatusBadge, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow, WorkforceEmpty } from '@/components/workforce/workforceKit';

/** Prompt versions. A version is immutable once published; edits open the next version. */
export default function PromptTable({ prompts = [], canConfigure, onNew, onPublish } = {}) {
  const ordered = [...prompts].sort((left, right) => String(right.created_date || '').localeCompare(String(left.created_date || '')));
  return (
    <div>
      <NewRow canConfigure={canConfigure} label="New prompt version" onNew={() => onNew?.(null)} />
      {!ordered.length ? (
        <WorkforceEmpty
          title="No prompt version yet"
          body="A prompt must instruct the model what to produce and state that its output is a recommendation a person approves. That guardrail is checked before a version can be published."
        />
      ) : (
        <TableFrame>
          <TableHeader>
            <TableRow>
              <TableHead>Prompt</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Variables</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Guardrail hash</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordered.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="min-w-[200px]">
                  <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                  <div className="text-[11px] text-[#0A2B6D]/60">{row.prompt_key}</div>
                  <div className="text-[11px] text-[#0A2B6D]/60">{row.change_note}</div>
                </TableCell>
                <TableCell className="text-xs font-bold text-[#0A2B6D]">v{row.version}</TableCell>
                <TableCell className="text-xs text-[#0A2B6D]">{row.variable_count || 0}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge status={row.status} />
                  {row.publisher_independent && <div className="mt-1 text-[11px] text-[#0A2B6D]/60">published independently</div>}
                </TableCell>
                <TableCell className="text-[11px] text-[#0A2B6D]/80">{row.author || '—'}</TableCell>
                <TableCell className="text-[11px] text-[#0A2B6D]/50">{(row.body_hash || '').slice(0, 22) || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    {canConfigure && (
                      <Button size="sm" variant="outline" onClick={() => onNew?.(row)}><FilePlus2 className="h-3.5 w-3.5" /> New version</Button>
                    )}
                    {canConfigure && ['Draft', 'Validated'].includes(row.status) && (
                      <Button size="sm" variant="secondary" onClick={() => onPublish?.(row)}><Send className="h-3.5 w-3.5" /> Publish</Button>
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