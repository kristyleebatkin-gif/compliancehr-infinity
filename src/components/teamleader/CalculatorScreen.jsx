import React, { useMemo, useState } from 'react';
import { ArrowLeft, Mic, ClipboardCheck, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useSpeechInput from '@/components/today/useSpeechInput';
import { appendHandover } from '@/components/teamleader/handoverNotes';
import { todayIso } from '@/components/today/useTodayData';

const TABS = [
  { key: 'basic', label: 'Basic' },
  { key: 'shift', label: 'Shift hours' },
  { key: 'km', label: 'Km claim' },
  { key: 'team', label: 'Team hours' }
];

const KEYS = ['AC', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='];

const toMinutes = (value) => {
  if (!value) return null;
  const [hour, minute] = value.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return hour * 60 + minute;
};

export default function CalculatorScreen({ onBack }) {
  const { toast } = useToast();
  const [tab, setTab] = useState('basic');
  const [display, setDisplay] = useState('0');
  const [previous, setPrevious] = useState(null);
  const [operator, setOperator] = useState(null);
  const [fresh, setFresh] = useState(true);

  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [brk, setBrk] = useState('30');
  const [km, setKm] = useState('0');
  const [rate, setRate] = useState('0.85');
  const [rows, setRows] = useState([
    { id: 1, name: '', hours: '' },
    { id: 2, name: '', hours: '' }
  ]);
  const [note, setNote] = useState('');

  const speech = useSpeechInput((transcript) => setNote((prev) => (prev ? `${prev} ${transcript}` : transcript)));

  const shiftHours = useMemo(() => {
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    if (startMin === null || endMin === null) return 0;
    const worked = ((endMin - startMin + 1440) % 1440) - Number(brk || 0);
    return Math.max(0, worked) / 60;
  }, [start, end, brk]);

  const claim = useMemo(() => Number(km || 0) * Number(rate || 0), [km, rate]);
  const teamTotal = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.hours || 0), 0),
    [rows]
  );

  const press = (key) => {
    if (/^\d$/.test(key)) {
      setDisplay(fresh ? key : display === '0' ? key : `${display}${key}`);
      setFresh(false);
      return;
    }
    if (key === '.') {
      if (!display.includes('.')) {
        setDisplay(`${display}.`);
        setFresh(false);
      }
      return;
    }
    if (key === 'AC') {
      setDisplay('0');
      setPrevious(null);
      setOperator(null);
      setFresh(true);
      return;
    }
    if (key === '±') {
      setDisplay(String(-Number(display)));
      return;
    }
    if (key === '%') {
      setDisplay(String(Number(display) / 100));
      return;
    }
    if (['+', '-', '×', '÷'].includes(key)) {
      setPrevious(Number(display));
      setOperator(key);
      setFresh(true);
      return;
    }
    if (key === '=') {
      if (operator === null || previous === null) return;
      const b = Number(display);
      const result =
        operator === '+' ? previous + b : operator === '-' ? previous - b : operator === '×' ? previous * b : b === 0 ? 0 : previous / b;
      setDisplay(String(Number(result.toFixed(6))));
      setPrevious(null);
      setOperator(null);
      setFresh(true);
    }
  };

  const result = useMemo(() => {
    if (tab === 'basic') return display;
    if (tab === 'shift') return `${shiftHours.toFixed(2)} hours`;
    if (tab === 'km') return `$${claim.toFixed(2)}`;
    return `${teamTotal.toFixed(2)} hours`;
  }, [tab, display, shiftHours, claim, teamTotal]);

  const useResult = () => {
    const label =
      tab === 'basic'
        ? `Calculation: ${display}`
        : tab === 'shift'
          ? `Shift ${start}–${end} (${brk} min break) = ${shiftHours.toFixed(2)} hrs`
          : tab === 'km'
            ? `${km} km at $${rate}/km = $${claim.toFixed(2)}`
            : `Team hours total = ${teamTotal.toFixed(2)} hrs`;
    setNote((prev) => (prev ? `${prev}\n${label}` : label));
  };

  const copyToNote = () => {
    if (!note.trim()) return;
    appendHandover(todayIso(), note.trim());
    toast({ title: 'Added to handover notes', description: 'Open Handover notes on Home to see it.' });
    setNote('');
  };

  return (
    <div className="px-3.5 pt-3.5">
      <header className="mb-2 flex items-center gap-2">
        <button type="button" onClick={onBack} aria-label="Back" className="tl-btn tl-ghost !px-2">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="tl-text min-w-0 flex-1 truncate text-[16px] font-extrabold">Calculator</h1>
        <span className="tl-pill tl-blue">{result}</span>
      </header>

      <div className="mb-2 flex gap-1 overflow-x-auto tl-scroll">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold ${
              tab === item.key ? 'bg-[#0A2B6D] text-white' : 'tl-card tl-muted'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="tl-card p-3">
        {tab === 'basic' ? (
          <>
            <p className="tl-text mb-2 rounded-xl bg-[#0A2B6D]/5 px-3 py-2 text-right text-[22px] font-extrabold tabular-nums">
              {display}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => press(key)}
                  className={`tl-key ${key === '0' ? 'col-span-2' : ''} ${key === '=' ? 'bg-[#0A2B6D] !text-white' : ''}`}
                >
                  {key}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {tab === 'shift' ? (
          <div className="grid grid-cols-2 gap-2">
            <label className="tl-text text-[10.5px] font-bold">
              Start
              <input type="time" value={start} onChange={(event) => setStart(event.target.value)} className="mt-1 w-full rounded-xl border border-[#0A2B6D]/12 bg-white/70 px-2 py-1.5 text-[12px] text-[#0A2B6D] outline-none" />
            </label>
            <label className="tl-text text-[10.5px] font-bold">
              End
              <input type="time" value={end} onChange={(event) => setEnd(event.target.value)} className="mt-1 w-full rounded-xl border border-[#0A2B6D]/12 bg-white/70 px-2 py-1.5 text-[12px] text-[#0A2B6D] outline-none" />
            </label>
            <label className="tl-text col-span-2 text-[10.5px] font-bold">
              Unpaid break (minutes)
              <input type="number" value={brk} onChange={(event) => setBrk(event.target.value)} className="mt-1 w-full rounded-xl border border-[#0A2B6D]/12 bg-white/70 px-2 py-1.5 text-[12px] text-[#0A2B6D] outline-none" />
            </label>
            <p className="tl-text col-span-2 rounded-xl bg-[#0A2B6D]/5 px-3 py-2 text-[13px] font-extrabold">{shiftHours.toFixed(2)} worked hours</p>
          </div>
        ) : null}

        {tab === 'km' ? (
          <div className="grid grid-cols-2 gap-2">
            <label className="tl-text text-[10.5px] font-bold">
              Kilometres
              <input type="number" value={km} onChange={(event) => setKm(event.target.value)} className="mt-1 w-full rounded-xl border border-[#0A2B6D]/12 bg-white/70 px-2 py-1.5 text-[12px] text-[#0A2B6D] outline-none" />
            </label>
            <label className="tl-text text-[10.5px] font-bold">
              Rate per km
              <input type="number" step="0.01" value={rate} onChange={(event) => setRate(event.target.value)} className="mt-1 w-full rounded-xl border border-[#0A2B6D]/12 bg-white/70 px-2 py-1.5 text-[12px] text-[#0A2B6D] outline-none" />
            </label>
            <p className="tl-text col-span-2 rounded-xl bg-[#0A2B6D]/5 px-3 py-2 text-[13px] font-extrabold">Claim ${claim.toFixed(2)}</p>
          </div>
        ) : null}

        {tab === 'team' ? (
          <div className="space-y-1.5">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center gap-1.5">
                <input
                  value={row.name}
                  onChange={(event) => setRows(rows.map((item) => (item.id === row.id ? { ...item, name: event.target.value } : item)))}
                  placeholder="Name"
                  className="min-w-0 flex-1 rounded-xl border border-[#0A2B6D]/12 bg-white/70 px-2 py-1.5 text-[11.5px] text-[#0A2B6D] outline-none"
                />
                <input
                  type="number"
                  value={row.hours}
                  onChange={(event) => setRows(rows.map((item) => (item.id === row.id ? { ...item, hours: event.target.value } : item)))}
                  placeholder="Hrs"
                  className="w-16 rounded-xl border border-[#0A2B6D]/12 bg-white/70 px-2 py-1.5 text-[11.5px] text-[#0A2B6D] outline-none"
                />
                <button type="button" onClick={() => setRows(rows.filter((item) => item.id !== row.id))} aria-label="Remove row" className="tl-muted px-1">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setRows([...rows, { id: Date.now(), name: '', hours: '' }])}
              className="tl-btn tl-ghost w-full"
            >
              <Plus className="h-3.5 w-3.5" /> Add person
            </button>
            <p className="tl-text rounded-xl bg-[#0A2B6D]/5 px-3 py-2 text-[13px] font-extrabold">Team total {teamTotal.toFixed(2)} hours</p>
          </div>
        ) : null}
      </section>

      <section className="tl-card mt-2 p-3">
        <div className="flex items-center gap-1.5">
          <p className="tl-text text-[11.5px] font-extrabold">Copy to note</p>
          <button type="button" onClick={speech.toggle} aria-label="Dictate note" className={`ml-auto grid h-7 w-7 place-items-center rounded-full ${speech.listening ? 'bg-[#FF2E9A] text-white' : 'tl-ghost tl-muted'}`}>
            <Mic className="h-3.5 w-3.5" />
          </button>
        </div>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="Working note for handover…"
          className="mt-1.5 w-full resize-none rounded-xl border border-[#0A2B6D]/12 bg-white/70 p-2 text-[11.5px] leading-5 text-[#0A2B6D] outline-none"
        />
        <div className="mt-1.5 flex gap-1.5">
          <button type="button" onClick={useResult} className="tl-btn tl-ghost flex-1">
            Use result
          </button>
          <button type="button" onClick={copyToNote} className="tl-btn tl-primary flex-1">
            <ClipboardCheck className="h-3.5 w-3.5" /> Copy to note
          </button>
        </div>
      </section>
    </div>
  );
}