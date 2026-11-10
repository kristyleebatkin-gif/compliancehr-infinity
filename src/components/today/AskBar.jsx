import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Mic } from 'lucide-react';
import useSpeechInput from '@/components/today/useSpeechInput';

export default function AskBar({ counts, visibleKeys = {} }) {
  const [text, setText] = useState('');
  const [answer, setAnswer] = useState(null);
  const speech = useSpeechInput((transcript) => setText((prev) => (prev ? `${prev} ${transcript}` : transcript)));

  const chips = [
    { label: "What's waiting on me?", visible: visibleKeys.emails || visibleKeys.invoices || visibleKeys.notesOutstanding },
    { label: "Who's on shift now?", visible: visibleKeys.shifts },
    { label: 'Which invoices can I approve?', visible: visibleKeys.invoices }
  ].filter((chip) => chip.visible);

  const ask = (value) => {
    const query = value.toLowerCase();
    let reply;
    if (query.includes('email') || query.includes('inbox')) {
      reply = visibleKeys.emails ? `${counts.emails} ${counts.emails === 1 ? 'email is' : 'emails are'} waiting for a reply.` : 'Email inbox access is not available in this workspace.';
    } else if (query.includes('shift') || query.includes('roster') || query.includes('late')) {
      reply = visibleKeys.shifts ? `${counts.shifts} shifts today · ${counts.onShift} on shift now · ${counts.unfilled} unfilled.` : 'Roster access is not available in this workspace.';
    } else if (query.includes('invoice') || query.includes('approve')) {
      reply = visibleKeys.invoices ? `${counts.invoices} ${counts.invoices === 1 ? 'invoice is' : 'invoices are'} ready for approval.` : 'Invoice access is not available in this workspace.';
    } else if (query.includes('note')) {
      reply = visibleKeys.notesOutstanding ? `${counts.notesOutstanding} shift notes are still outstanding today.` : 'Shift-note access is not available in this workspace.';
    } else if (query.includes('waiting') || query.includes('me')) {
      const waiting = [];
      if (visibleKeys.emails) waiting.push(`${counts.emails} emails`);
      if (visibleKeys.invoices) waiting.push(`${counts.invoices} invoices`);
      if (visibleKeys.notesOutstanding) waiting.push(`${counts.notesOutstanding} shift notes`);
      reply = waiting.length ? `Your current queues: ${waiting.join(', ')}.` : 'No work queues are available in this workspace.';
    } else {
      const topics = [
        visibleKeys.emails && 'emails',
        visibleKeys.shifts && 'the roster',
        visibleKeys.invoices && 'invoices',
        visibleKeys.notesOutstanding && 'shift notes'
      ].filter(Boolean);
      setAnswer({
        text: topics.length ? `I can summarise ${topics.join(', ')}.` : 'No operational summary queues are available for this account.',
        href: '/assistant',
        cta: 'Open AI assistant'
      });
      return;
    }
    setAnswer({ text: reply });
  };

  return (
    <div className="space-y-2">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!text.trim()) return;
          ask(text);
          setText('');
        }}
        className="t-ask flex items-center gap-2 px-3 py-2"
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Ask about the work available to you today…"
          aria-label="Ask about today"
          className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
        />
        <button
          type="button"
          onClick={speech.toggle}
          aria-label="Use voice input"
          className={`grid h-8 w-8 place-items-center rounded-full ${speech.listening ? 'bg-[#FF2E9A] text-white' : 't-muted hover:bg-white/70'}`}
        >
          <Mic className="h-4 w-4" />
        </button>
        <button type="submit" aria-label="Ask" className="grid h-8 w-8 place-items-center rounded-full bg-[#0A2B6D] text-white">
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map(({ label }) => (
            <button
              key={label}
              type="button"
              onClick={() => ask(label)}
              className="rounded-full border border-[#0A2B6D]/10 bg-white/60 px-2.5 py-1 text-[11px] font-semibold text-[#2E4472] transition hover:bg-white"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {answer ? (
        <p className="t-card px-3 py-2 text-[12px] leading-relaxed">
          {answer.text}{' '}
          {answer.href ? <Link to={answer.href} className="font-bold text-[#5A00D6] underline-offset-2 hover:underline">{answer.cta}</Link> : null}
        </p>
      ) : null}
      {speech.error ? <p className="text-[11px] font-semibold text-[#B0126A]">{speech.error}</p> : null}
    </div>
  );
}
