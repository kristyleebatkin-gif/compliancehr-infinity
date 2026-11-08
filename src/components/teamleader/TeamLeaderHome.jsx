import React, { useState } from 'react';
import { Calculator, Moon, Sun, Mic, ArrowUp, ChevronRight, Clock } from 'lucide-react';
import useSpeechInput from '@/components/today/useSpeechInput';
import { initials } from '@/components/today/todayUi';
import HandoverNotes from '@/components/teamleader/HandoverNotes';

const TILES = [
  { key: 'escalations', label: 'Escalated to you', hint: '24 hrs+', tone: 'from-[#FF2E9A] to-[#5A00D6]', screen: 'highlights' },
  { key: 'missingNotes', label: 'Shift notes missing', hint: 'Needs a note', tone: 'from-[#5A00D6] to-[#0072FF]', screen: 'notes' },
  { key: 'onShift', label: 'On shift now', hint: 'Clocked in', tone: 'from-[#0072FF] to-[#0A2B6D]', screen: 'team' },
  { key: 'unfilled', label: 'Roster clash / unfilled', hint: 'Cover needed', tone: 'from-[#0A2B6D] to-[#5A00D6]', screen: 'roster' }
];

const CHIPS = ["Today's highlights", "Who's late to clock in?", 'Chase shift notes'];

export default function TeamLeaderHome({ user, data, derived, theme, onToggleTheme, onScreen }) {
  const [text, setText] = useState('');
  const [reply, setReply] = useState('');
  const speech = useSpeechInput((transcript) => setText((prev) => (prev ? `${prev} ${transcript}` : transcript)));

  const answer = (value) => {
    const query = value.toLowerCase();
    if (query.includes('highlight')) {
      onScreen('highlights');
      return;
    }
    if (query.includes('late') || query.includes('clock in')) {
      setReply(
        derived.late.length
          ? `${derived.late.map((shift) => shift.employee_name || 'Unnamed').join(', ')} ${derived.late.length === 1 ? 'has' : 'have'} not clocked in yet.`
          : 'Everyone is clocked in on time.'
      );
      return;
    }
    if (query.includes('note')) {
      setReply(`${derived.missingNotes.length} shift notes are still missing today.`);
      return;
    }
    if (query.includes('shift') || query.includes('roster')) {
      setReply(`${derived.onShift.length} on shift now · ${derived.unfilled.length} unfilled · ${derived.late.length} not clocked in.`);
      return;
    }
    setReply(`${derived.escalations.length} escalations and ${derived.missingNotes.length} missing notes need you today.`);
  };

  const firstName = (user?.full_name || '').split(' ')[0] || 'there';

  return (
    <div className="space-y-3 px-3.5 pt-3.5">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="tl-muted text-[10px] font-bold uppercase tracking-[0.14em]">
            {new Date().toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
          <h1 className="tl-text mt-0.5 truncate text-[20px] font-extrabold leading-tight">
            Kia ora, {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => onScreen('calculator')} aria-label="Calculator" className="tl-btn tl-ghost !px-2">
            <Calculator className="h-4 w-4" />
          </button>
          <button type="button" onClick={onToggleTheme} aria-label="Switch theme" className="tl-btn tl-ghost !px-2">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#0A2B6D] via-[#5A00D6] to-[#FF2E9A] text-[11px] font-extrabold text-white">
            {initials(user?.full_name)}
          </span>
        </div>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!text.trim()) return;
          answer(text);
          setText('');
        }}
        className="tl-ask flex items-center gap-1.5 px-3 py-1.5"
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Ask about your team…"
          aria-label="Ask about your team"
          className="tl-text min-w-0 flex-1 bg-transparent text-[12px] outline-none"
        />
        <button type="button" onClick={speech.toggle} aria-label="Use voice input" className={`grid h-7 w-7 place-items-center rounded-full ${speech.listening ? 'bg-[#FF2E9A] text-white' : 'tl-muted'}`}>
          <Mic className="h-3.5 w-3.5" />
        </button>
        <button type="submit" aria-label="Ask" className="grid h-7 w-7 place-items-center rounded-full bg-[#0A2B6D] text-white">
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </form>

      <div className="flex gap-1.5 overflow-x-auto tl-scroll">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => answer(chip)}
            className="tl-card shrink-0 px-2.5 py-1 text-[10.5px] font-bold"
          >
            {chip}
          </button>
        ))}
      </div>

      {reply ? <p className="tl-card px-3 py-2 text-[11.5px] leading-relaxed">{reply}</p> : null}
      {speech.error ? <p className="text-[10.5px] font-bold text-[#B0126A]">{speech.error}</p> : null}

      <div className="grid grid-cols-2 gap-2">
        {TILES.map(({ key, label, hint, tone, screen }) => (
          <button key={key} type="button" onClick={() => onScreen(screen)} className="tl-card p-2.5 text-left transition active:scale-[0.99]">
            <span className={`grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br ${tone} text-white`}>
              <span className="text-[11px] font-extrabold">{derived[key].length}</span>
            </span>
            <p className="tl-text mt-2 text-[11.5px] font-extrabold leading-tight">{label}</p>
            <p className="tl-muted mt-0.5 text-[9.5px] font-semibold">{hint}</p>
          </button>
        ))}
        <button type="button" onClick={() => onScreen('notes')} className="tl-card col-span-2 flex items-center gap-2 p-2.5 text-left">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#FF2E9A] to-[#5A00D6] text-white">
            <span className="text-[11px] font-extrabold">{derived.noteIncidents.length}</span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="tl-text text-[11.5px] font-extrabold">Incident from notes</p>
            <p className="tl-muted truncate text-[9.5px] font-semibold">
              {derived.noteIncidents[0]?.person_name || 'Nothing flagged yet'}
            </p>
          </div>
          <ChevronRight className="tl-muted h-3.5 w-3.5 shrink-0" />
        </button>
      </div>

      <section className="tl-card p-3">
        <div className="flex items-center justify-between">
          <p className="tl-text text-[12px] font-extrabold">Team right now</p>
          <button type="button" onClick={() => onScreen('team')} className="tl-muted text-[10px] font-bold">
            See all
          </button>
        </div>
        <div className="mt-1 divide-y divide-[#0A2B6D]/8">
          {(data.team || []).slice(0, 4).map((member) => {
            const status = derived.statusFor(member);
            return (
              <div key={member.id} className="flex items-center gap-2 py-1.5">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#0A2B6D]/8 text-[9.5px] font-extrabold text-[#0A2B6D]">
                  {(member.full_name || '?').slice(0, 1)}
                </span>
                <p className="tl-text min-w-0 flex-1 truncate text-[11.5px] font-bold">{member.full_name}</p>
                <span className={`tl-pill tl-${status.tone}`}>{status.label}</span>
              </div>
            );
          })}
          {!data.team?.length ? <p className="tl-muted py-2 text-[11px]">No team profiles yet.</p> : null}
        </div>
      </section>

      <HandoverNotes day={data.day} />

      <p className="tl-muted flex items-center gap-1 pb-1 text-[9.5px] font-semibold">
        <Clock className="h-3 w-3" /> Shift data refreshes when you reopen this screen
      </p>
    </div>
  );
}