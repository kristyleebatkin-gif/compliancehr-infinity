import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil } from 'lucide-react';
import CompetitionContentFields from '@/components/tasks/CompetitionContentFields';

const lines = (value) => Array.isArray(value) ? value : value.split('\n').map((v) => v.trim()).filter(Boolean);
export default function CompetitionSettingsDialog({ settings, onSave, loading }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async (e) => {
    e.preventDefault(); setError('');
    if (new Date(form.season_end) <= new Date(form.season_start)) { setError('The competition must end after the season starts.'); return; }
    const { id, created_date, updated_date, created_by_id, ...values } = form;
    const history = Array.isArray(form.history) ? form.history : lines(form.history).map((line) => { const [season, ...note] = line.split('|'); return { season: season.trim(), note: note.join('|').trim() }; });
    setSaving(true);
    try { await onSave({ ...values, jokes: lines(form.jokes), fun_facts: lines(form.fun_facts), team_strategies: lines(form.team_strategies), history }); setForm(null); }
    catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  };
  return <>
    <Button type="button" size="sm" variant="outline" disabled={loading} className="bright-pink-action" onClick={() => { setError(''); setForm({ ...settings }); }}><Pencil className="h-3.5 w-3.5" />Edit competition</Button>
    <Dialog open={!!form} onOpenChange={(open) => { if (!open) setForm(null); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Edit task competition</DialogTitle></DialogHeader>{form && <form onSubmit={save} className="space-y-4"><CompetitionContentFields form={form} set={(key, value) => setForm((current) => ({ ...current, [key]: value }))} />{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setForm(null)}>Cancel</Button><Button type="submit" disabled={saving} className="bright-pink-action">{saving ? 'Saving...' : 'Save competition'}</Button></div></form>}</DialogContent></Dialog>
  </>;
}