import React from 'react';
import { Field, TextInput, TextArea } from '@/components/Field';

const TITLES = [['leaderboard_title', 'Leaderboard title'], ['prizes_title', 'Prizes title'], ['banter_title', 'Sledge board title'], ['strategies_title', 'Team strategies title'], ['history_title', 'Competition history title']];
const LISTS = [['jokes', 'Weekly jokes, one per line'], ['fun_facts', 'Fun facts, one per line'], ['team_strategies', 'Team building strategies, one per line']];
export default function CompetitionContentFields({ form, set }) {
  return <div className="space-y-3">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Field label="Season starts"><TextInput type="date" required value={form.season_start} onChange={(e) => set('season_start', e.target.value)} /></Field><Field label="Competition ends"><TextInput type="datetime-local" required value={form.season_end} onChange={(e) => set('season_end', e.target.value)} /></Field></div>
    <Field label="Season explanation"><TextArea value={form.season_note} onChange={(e) => set('season_note', e.target.value)} /></Field>
    {TITLES.map(([key, label]) => <Field key={key} label={label}><TextInput value={form[key]} onChange={(e) => set(key, e.target.value)} /></Field>)}
    <fieldset className="space-y-2 rounded-xl border border-border p-3"><legend className="px-1 text-sm font-semibold">Prize vouchers</legend>{form.vouchers.map((v, i) => <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-3"><Field label="Place"><TextInput type="number" min="1" required value={v.rank} onChange={(e) => set('vouchers', form.vouchers.map((row, n) => n === i ? { ...row, rank: Number(e.target.value) } : row))} /></Field><Field label="Amount ($)"><TextInput type="number" min="0" value={v.amount} onChange={(e) => set('vouchers', form.vouchers.map((row, n) => n === i ? { ...row, amount: Number(e.target.value) } : row))} /></Field><Field label="Voucher label"><TextInput value={v.label} onChange={(e) => set('vouchers', form.vouchers.map((row, n) => n === i ? { ...row, label: e.target.value } : row))} /></Field></div>)}</fieldset>
    <Field label="Prize and certificate explanation"><TextArea value={form.prizes_note} onChange={(e) => set('prizes_note', e.target.value)} /></Field>
    {LISTS.map(([key, label]) => <Field key={key} label={label}><TextArea rows={5} value={Array.isArray(form[key]) ? form[key].join('\n') : form[key]} onChange={(e) => set(key, e.target.value)} /></Field>)}
    <Field label="Competition history, one season | note per line"><TextArea rows={4} value={Array.isArray(form.history) ? form.history.map((h) => `${h.season} | ${h.note}`).join('\n') : form.history} onChange={(e) => set('history', e.target.value)} /></Field>
  </div>;
}