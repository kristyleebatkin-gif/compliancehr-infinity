import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { statusTone } from '@/lib/statusStyles';
import { SIGN_LIBRARY, findSign } from '@/lib/signPrompts';
import { printRoutine, routineStepsToCsv } from '@/lib/visualPrint';
import { CalendarDays, Check, ChevronDown, ChevronUp, Download, ImagePlus, ListChecks, Loader2, Mail, Plus, Printer, Trash2 } from 'lucide-react';
import { ROUTINE_RESOURCE_GROUPS } from '@/lib/routineResources';
import StepImage from '@/components/visual/StepImage';

const downloadCsv = (filename, csv) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export default function VisualRoutine() {
  const { toast } = useToast();
  const [routines, setRoutines] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [steps, setSteps] = useState([]);
  const [newStep, setNewStep] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newParticipant, setNewParticipant] = useState('');
  const [participants, setParticipants] = useState([]);
  const [uploadFor, setUploadFor] = useState('');
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const fileRef = React.useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const [page, participantPage] = await Promise.all([
        base44.entities.VisualRoutine.filter({}, { sort: '-created_date', limit: 50 }),
        base44.entities.ParticipantProfile.list({ sort: 'full_name', limit: 200, fields: ['full_name'] }).catch(() => ({ items: [] })),
      ]);
      const items = page.items || [];
      setRoutines(items);
      setParticipants(participantPage.items || []);
      const active = items.find((r) => r.id === activeId) || items[0];
      if (active) setActiveId(active.id);
      let parsed = [];
      if (active?.steps) {
        try { parsed = JSON.parse(active.steps); } catch { parsed = []; }
      }
      setSteps(parsed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeId]);

  const persist = async (next) => {
    setSteps(next);
    if (!activeId) return;
    try {
      await base44.entities.VisualRoutine.update(activeId, { steps: JSON.stringify(next) });
    } catch (error) {
      toast({ title: 'Could not save routine', description: error.message, variant: 'destructive' });
    }
  };

  const addStep = () => {
    if (!newStep.trim()) return;
    persist([...steps, { id: `${Date.now()}`, text: newStep.trim(), done: false, sign: '' }]);
    setNewStep('');
  };

  const move = (index, dir) => {
    const next = [...steps];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    persist(next);
  };

  const toggle = (id) => persist(steps.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  const remove = (id) => persist(steps.filter((s) => (s.id !== id)));
  const rename = (id, text) => persist(steps.map((s) => (s.id === id ? { ...s, text } : s)));
  const setSign = (id, word) => {
    const sign = findSign(word);
    persist(steps.map((s) => (s.id === id ? { ...s, sign: word, sign_description: sign?.description || '' } : s)));
  };

  const setRoutineDate = (value) => {
    if (!activeId) return;
    setRoutines((prev) => prev.map((r) => (r.id === activeId ? { ...r, routine_date: value } : r)));
    base44.entities.VisualRoutine.update(activeId, { routine_date: value }).catch((error) => toast({ title: 'Could not save date', description: error.message, variant: 'destructive' }));
  };

  const addResourceStep = (item) => {
    persist([...steps, { id: `${Date.now()}`, text: item.label, icon: item.emoji, done: false, sign: '' }]);
  };

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    const stepId = uploadFor;
    e.target.value = '';
    setUploadFor('');
    if (!file || !stepId) return;
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      persist(steps.map((s) => (s.id === stepId ? { ...s, image_uri: file_uri } : s)));
      toast({ title: 'Picture added (stored privately)' });
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    }
  };

  const sendRoutineEmail = async () => {
    if (!active || !emailTo.trim()) return;
    setEmailSending(true);
    try {
      const rows = steps.map((s, i) => `<tr><td style="padding:6px;border:1px solid #e5e7eb;">${i + 1}</td><td style="padding:6px;border:1px solid #e5e7eb;">${s.icon || ''} ${s.text}</td><td style="padding:6px;border:1px solid #e5e7eb;">${s.done ? 'Done' : 'To do'}</td><td style="padding:6px;border:1px solid #e5e7eb;">${s.sign || ''}</td></tr>`).join('');
      const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><h2 style="color:#0a0a0a;">Visual routine: ${active.title}</h2><p style="color:#737373;">${active.participant_name ? `Participant: ${active.participant_name} · ` : ''}${active.routine_date ? `Date: ${active.routine_date}` : ''}</p><table style="border-collapse:collapse;width:100%;font-size:14px;"><thead><tr><th style="padding:6px;border:1px solid #e5e7eb;text-align:left;">#</th><th style="padding:6px;border:1px solid #e5e7eb;text-align:left;">Step</th><th style="padding:6px;border:1px solid #e5e7eb;text-align:left;">Status</th><th style="padding:6px;border:1px solid #e5e7eb;text-align:left;">Sign prompt</th></tr></thead><tbody>${rows}</tbody></table><p style="color:#737373;font-size:12px;">Sent from ComplianceHR Infinity visual boards.</p></div>`;
      await base44.functions.invoke('sendAppEmail', { to: emailTo.trim(), subject: `Visual routine: ${active.title}`, body: html });
      toast({ title: 'Routine emailed' });
      setEmailOpen(false);
      setEmailTo('');
    } catch (error) {
      toast({ title: 'Could not email routine', description: error.message, variant: 'destructive' });
    } finally {
      setEmailSending(false);
    }
  };

  const createRoutine = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const user = await base44.auth.me();
      const record = await base44.entities.VisualRoutine.create({
        title: newTitle.trim(),
        participant_name: newParticipant,
        steps: '[]',
        created_by: user?.full_name || '',
      });
      setNewTitle('');
      setNewParticipant('');
      setActiveId(record.id);
      toast({ title: 'Routine created' });
      await load();
    } finally {
      setCreating(false);
    }
  };

  const active = routines.find((r) => r.id === activeId);
  const doneCount = steps.filter((s) => s.done).length;

  const doPrint = () => active && printRoutine({
    title: active.title,
    participant: active.participant_name,
    steps,
  });

  const doExport = () => {
    if (!active) return;
    downloadCsv(`${active.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-routine.csv`, routineStepsToCsv([active]));
    toast({ title: 'Routine exported' });
  };

  const doDeleteRoutine = async () => {
    if (!active || !confirm('Delete this routine?')) return;
    await base44.entities.VisualRoutine.delete(active.id);
    setActiveId('');
    toast({ title: 'Routine deleted' });
    await load();
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <ListChecks className="h-4 w-4 text-brand" />
        <span className="text-sm font-semibold">Visual routine</span>
        <div className="ml-auto flex flex-wrap items-end gap-2">
          <div className="grid gap-1.5">
            <Label>Routine</Label>
            <select value={activeId} onChange={(e) => setActiveId(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              {routines.map((r) => <option key={r.id} value={r.id}>{r.title}{r.participant_name ? ` (${r.participant_name})` : ''}</option>)}
              {routines.length === 0 && <option value="">No routines yet</option>}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label>New routine</Label>
            <Input placeholder="e.g. Morning routine" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Participant</Label>
            <Select value={newParticipant || 'none'} onValueChange={(v) => setNewParticipant(v === 'none' ? '' : v)}>
              <SelectTrigger className="h-9 w-[170px]"><SelectValue placeholder="Select participant" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {participants.map((p) => <SelectItem key={p.id} value={p.full_name}>{p.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={createRoutine} disabled={creating || !newTitle.trim()}>{creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}Add</Button>
          <Button size="sm" variant="outline" onClick={doPrint} disabled={!active}><Printer className="h-3.5 w-3.5" />Print</Button>
          <Button size="sm" variant="outline" onClick={doExport} disabled={!active}><Download className="h-3.5 w-3.5" />Export</Button>
          <Button size="sm" variant="outline" onClick={() => setEmailOpen((v) => !v)} disabled={!active}><Mail className="h-3.5 w-3.5" />Email</Button>
          <div className="grid gap-1.5">
            <Label className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />Date</Label>
            <Input type="date" value={active?.routine_date || ''} onChange={(e) => setRoutineDate(e.target.value)} className="h-9 w-[150px]" disabled={!active} />
          </div>
          <Button size="sm" variant="ghost" onClick={doDeleteRoutine} disabled={!active}><Trash2 className="h-3.5 w-3.5 text-destructive/60" /></Button>
        </div>
      </div>

      {emailOpen && (
        <div className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
          <div className="grid gap-1.5">
            <Label>Email routine to</Label>
            <Input type="email" placeholder="name@example.com" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} className="w-full sm:w-64" />
          </div>
          <Button size="sm" onClick={sendRoutineEmail} disabled={emailSending || !emailTo.trim() || !active}>
            {emailSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}Send
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEmailOpen(false)}>Cancel</Button>
          <p className="w-full text-[11px] text-muted-foreground">Steps, signs and progress are sent as a formatted email.</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : !active ? (
        <p className="text-sm text-muted-foreground">Create a routine above to start adding steps. Routines save automatically.</p>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Input placeholder="Add a step..." value={newStep} onChange={(e) => setNewStep(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addStep()} className="max-w-xs" />
            <Button onClick={addStep} disabled={!newStep.trim()}><Plus className="h-4 w-4" />Add step</Button>
            <span className="ml-auto text-xs text-muted-foreground">{active.participant_name ? `${active.participant_name} · ` : ''}{doneCount}/{steps.length} done</span>
          </div>
          <div className="mb-3 rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Picture resources - tap to add a step</p>
            <div className="space-y-2">
              {ROUTINE_RESOURCE_GROUPS.map((group) => (
                <div key={group.group} className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 w-28 shrink-0 text-[11px] font-semibold text-muted-foreground">{group.group}</span>
                  {group.items.map((item) => (
                    <button key={item.label} onClick={() => addResourceStep(item)} className="flex items-center gap-1 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs font-medium hover:border-brand/50 hover:bg-brand/5">
                      <span>{item.emoji}</span>{item.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            {steps.length === 0 && <p className="text-sm text-muted-foreground">No steps yet - add the first step above.</p>}
            {steps.map((step, index) => (
              <div key={step.id} className={`flex flex-wrap items-center gap-2 rounded-lg border p-2 ${step.done ? 'border-safe/40 bg-safe/5' : 'border-border/60'}`}>
                <button onClick={() => toggle(step.id)} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${step.done ? 'border-safe bg-safe text-white' : 'border-border'}`}>
                  {step.done && <Check className="h-3.5 w-3.5" />}
                </button>
                <span className="w-5 text-xs font-bold text-muted-foreground">{index + 1}</span>
                {step.icon && <span className="text-lg">{step.icon}</span>}
                {step.image_uri && <StepImage uri={step.image_uri} className="h-10 w-10 rounded-md" />}
                <input className="min-w-0 flex-1 bg-transparent text-sm outline-none" value={step.text} onChange={(e) => rename(step.id, e.target.value)} />
                <Select value={step.sign || 'none'} onValueChange={(v) => setSign(step.id, v === 'none' ? '' : v)}>
                  <SelectTrigger className="h-7 w-[150px] text-xs"><SelectValue placeholder="Sign prompt" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No sign</SelectItem>
                    {SIGN_LIBRARY.map((s) => <SelectItem key={s.word} value={s.word}>{s.emoji} {s.word}</SelectItem>)}
                  </SelectContent>
                </Select>
                <button onClick={() => { setUploadFor(step.id); fileRef.current?.click(); }} title="Add a picture to this step" className="rounded p-1 hover:bg-muted"><ImagePlus className="h-3.5 w-3.5 text-muted-foreground" /></button>
                <button onClick={() => move(index, -1)} aria-label="Move step up" className="rounded p-1 hover:bg-muted"><ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /></button>
                <button onClick={() => move(index, 1)} aria-label="Move step down" className="rounded p-1 hover:bg-muted"><ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /></button>
                <button onClick={() => remove(step.id)} aria-label="Remove step" className="rounded p-1 hover:bg-muted"><Trash2 className="h-3.5 w-3.5 text-destructive/60" /></button>
                {step.sign && (
                  <p className="w-full pl-10 text-xs text-muted-foreground">{findSign(step.sign)?.emoji} {step.sign_description || findSign(step.sign)?.description}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}