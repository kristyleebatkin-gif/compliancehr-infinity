import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Mic } from 'lucide-react';
import useSpeechInput from '@/components/today/useSpeechInput';

const CHIPS = ["What's waiting on me?", 'Who is on shift now?', 'Which invoices can I approve?'];

export default function AskBar({ counts }) {
  const [text, setText] = useState('');
  const [answer, setAnswer] = useState(null);
  const speech = useSpeechInput((transcript) => setText((prev) => (prev ? `${prev} ${transcript}` : transcript)));

  const ask = (value) => {
    const query = value.toLowerCase();
    let reply;
    if (query.includes('email') || query.includes('inbox')) {
      reply = `${counts.emails} ${counts.emails === 1 ? 'email is' : 'emails are'} waiting for a reply.`;
    } else if (query.includes('shift') || query.includes('roster') || query.includes('late')) {
      reply = `${counts.shifts} shifts today · ${counts.onShift} on shift now · ${counts.unfilled} unfilled.`;
    } else if (query.includes('invoice') || query.includes('approve')) {
      reply = `${counts.invoices} ${counts.invoices === 1 ? 'invoice is' : 'invoices are'} ready for approval.`;
    } else if (query.includes('note')) {
      reply = `${counts.notesOutstanding} shift notes are still outstanding today.`;
    } else if (query.includes('waiting') || query.includes('me')) {
      reply = `You have ${counts.emails} emails, ${counts.invoices} invoices and ${counts.notesOutstanding} shift notes waiting.`;
    } else {
      setAnswer({
        text: 'I can summarise your emails, roster, invoices and shift notes.',
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
          placeholder="Ask anything about today…"
          aria-label="Ask about today"
          className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
        />
        <button
          type="button"
          onClick={speech.toggle}
          aria-label="Use voice input"
          className={`grid h-8 w-8 place-items-center rounded-full ${
            speech.listening ? 'bg-[#FF2E9A] text-white' : 't-muted hover:bg-white/70'
          }`}
        >
          <Mic className="h-4 w-4" />
        </button>
        <button type="submit" aria-label="Ask" className="grid h-8 w-8 place-items-center rounded-full bg-[#0A2B6D] text-white">
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => ask(chip)}
            className="rounded-full border border-[#0A2B6D]/10 bg-white/60 px-2.5 py-1 text-[11px] font-semibold text-[#2E4472] transition hover:bg-white"
          >
            {chip}
          </button>
        ))}
      </div>

      {answer ? (
        <p className="t-card px-3 py-2 text-[12px] leading-relaxed">
          {answer.text}{' '}
          {answer.href ? (
            <Link to={answer.href} className="font-bold text-[#5A00D6] underline-offset-2 hover:underline">
              {answer.cta}
            </Link>
          ) : null}
        </p>
      ) : null}
      {speech.error ? <p className="text-[11px] font-semibold text-[#B0126A]">{speech.error}</p> : null}
    </div>
  );
}