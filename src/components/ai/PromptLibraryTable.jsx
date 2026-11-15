import React from 'react';
import { FileCode2 } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { PROMPT_STATUS_TONES } from '@/lib/aiIntelligence';

export default function PromptLibraryTable({ prompts }) {
  if (!prompts.length) {
    return (
      <EmptyState
        icon={FileCode2}
        title="No prompts in the library"
        message="Every copilot instruction belongs in the prompt library with a version, an owner and an approval. An unapproved prompt should never reach a live register."
        modulePath="Compliance"
        createLabel="Run a copilot review"
        createHref="/ai-os"
      />
    );
  }

  return (
    <div className="space-y-2">
      {prompts.map((prompt) => (
        <details key={prompt.id} className="rounded-xl border border-border bg-card p-3">
          <summary className="flex cursor-pointer flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-foreground">{prompt.name}</span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                PROMPT_STATUS_TONES[prompt.status] || PROMPT_STATUS_TONES.Draft
              }`}
            >
              {prompt.status}
            </span>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
              {prompt.version}
            </span>
            {prompt.module ? (
              <span className="text-[11px] font-semibold text-muted-foreground">{prompt.module}</span>
            ) : null}
            {prompt.agent_name ? (
              <span className="text-[11px] font-semibold text-muted-foreground">· {prompt.agent_name}</span>
            ) : null}
            {prompt.approved_by ? (
              <span className="ml-auto text-[10px] font-bold text-muted-foreground">
                Approved by {prompt.approved_by} · {prompt.approved_date}
              </span>
            ) : null}
          </summary>
          {prompt.purpose ? (
            <p className="mt-2 text-xs font-semibold text-foreground">{prompt.purpose}</p>
          ) : null}
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 text-[11px] font-medium leading-relaxed text-foreground">
            {prompt.prompt_text}
          </pre>
          {prompt.test_notes ? (
            <p className="mt-2 text-[11px] font-medium text-muted-foreground">Testing: {prompt.test_notes}</p>
          ) : null}
        </details>
      ))}
    </div>
  );
}