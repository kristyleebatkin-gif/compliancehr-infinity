import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Wrench, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronRight } from 'lucide-react';

const ACTIVE_STATUSES = ['pending', 'running', 'in_progress'];
const FAILED_STATUSES = ['failed', 'error'];

function prettyName(name) {
  return (name || 'Tool').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function FunctionDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const projection = toolCall.display_projection;
  const hideMode = projection?.hide_details && projection?.details_redacted;
  const status = toolCall.status;
  let parsed = null;
  try {
    parsed = typeof toolCall.results === 'string' ? JSON.parse(toolCall.results) : toolCall.results;
  } catch {
    parsed = toolCall.results;
  }
  const failed =
    FAILED_STATUSES.includes(status) ||
    (typeof toolCall.results === 'string' && /error|failed/i.test(toolCall.results)) ||
    parsed?.success === false;
  const active = ACTIVE_STATUSES.includes(status);

  if (hideMode) {
    return (
      <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-foreground/60">
        {failed ? (
          <><XCircle className="h-3 w-3 text-danger" /> {projection.error_label || 'Failed'}</>
        ) : active ? (
          <><Loader2 className="h-3 w-3 animate-spin text-brand" /> {projection.active_label || 'Working…'}</>
        ) : (
          <><CheckCircle2 className="h-3 w-3 text-safe" /> {projection.label || 'Done'}</>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-border/60 bg-muted/40 text-xs">
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center gap-1.5 px-2.5 py-1.5 font-medium text-foreground/60">
        {failed ? <XCircle className="h-3 w-3 text-danger" /> : active ? <Loader2 className="h-3 w-3 animate-spin text-brand" /> : <CheckCircle2 className="h-3 w-3 text-safe" />}
        <Wrench className="h-3 w-3" /> {prettyName(toolCall.name)}
        {expanded ? <ChevronDown className="ml-auto h-3 w-3" /> : <ChevronRight className="ml-auto h-3 w-3" />}
      </button>
      {expanded && (
        <div className="space-y-1.5 px-2.5 pb-2">
          {toolCall.arguments_string && (
            <div>
              <div className="font-semibold text-foreground/50">Parameters</div>
              <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words text-[11px] text-foreground/60">
                {(() => { try { return JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2); } catch { return toolCall.arguments_string; } })()}
              </pre>
            </div>
          )}
          {toolCall.results != null && (
            <div>
              <div className="font-semibold text-foreground/50">Result</div>
              <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words text-[11px] text-foreground/60">
                {typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${isUser ? 'gradient-brand text-white' : 'border border-border/60 bg-card text-foreground'}`}>
        {message.content && (isUser ? (
          <p className="whitespace-pre-wrap break-words leading-6">{message.content}</p>
        ) : (
          <div className="break-words leading-6 [&_li]:ml-4 [&_li]:list-disc [&_ol]:list-decimal [&_ol]:ml-4 [&_p]:my-1 [&_strong]:font-bold [&_ul]:my-1">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ))}
        {message.tool_calls?.map((toolCall, idx) => <FunctionDisplay key={idx} toolCall={toolCall} />)}
      </div>
    </div>
  );
}