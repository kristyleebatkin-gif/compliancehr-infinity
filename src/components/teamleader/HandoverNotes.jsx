import React, { useEffect, useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { readHandover, writeHandover } from '@/components/teamleader/handoverNotes';
import { todayIso } from '@/components/today/useTodayData';

export default function HandoverNotes({ day }) {
  const key = day || todayIso();
  const [text, setText] = useState(() => readHandover(key));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setText(readHandover(key));
    window.addEventListener('cs-handover-change', sync);
    return () => window.removeEventListener('cs-handover-change', sync);
  }, [key]);

  const save = (value) => {
    setText(value);
    writeHandover(key, value);
    setSaved(true);
  };

  return (
    <section className="tl-card p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <NotebookPen className="h-3.5 w-3.5 text-[#5A00D6]" />
          <p className="tl-text text-[12px] font-extrabold">Handover notes</p>
        </div>
        <span className="tl-muted text-[9.5px] font-bold">{saved ? 'Saved' : 'Saved on this device'}</span>
      </div>
      <textarea
        value={text}
        onChange={(event) => save(event.target.value)}
        placeholder="What the next team leader needs to know…"
        rows={5}
        className="tl-text mt-2 w-full resize-none rounded-xl border border-[#0A2B6D]/10 bg-white/70 p-2.5 text-[12px] leading-5 outline-none placeholder:text-[#4B6392]/70"
      />
    </section>
  );
}