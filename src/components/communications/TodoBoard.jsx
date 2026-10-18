import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, ListTodo, Loader2, Plus, PenLine } from 'lucide-react';
import { APP_MODULES, loadCommContacts, exportCsv } from '@/lib/commTypes';

const parseJson = (value, fallback = []) => { try { return JSON.parse(value || '') || fallback; } catch { return fallback; } };

export default function TodoBoard() {
  const { toast } = useToast();
  const [staffList, setStaffList] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [finaliseTarget, setFinaliseTarget] = useState(null);
  const [finaliseForm, setFinaliseForm] = useState({ completed_by: '', time_taken_minutes: '' });
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [signTarget, setSignTarget] = useState(null);
  const [signForm, setSignForm] = useState({ signature: '' });
  const [form, setForm] = useState({
    title: '', module: APP_MODULES[0], task_date: new Date().toISOString().slice(0, 10), task_time: '',
    due_date: '', how_to_complete: '', resources_needed: '', important_info: '', responsible: [],
  });

  const load = async () => {
    setLoading(true);
    try {
      const [taskPage, staffPage, user] = await Promise.all([
        base44.entities.TodoTask.filter({}, { sort: '-created_date', limit: 500 }),
        base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 300, fields: ['full_name', 'email'] }).catch(() => ({ items: [] })),
        base44.auth.me().catch(() => null),
      ]);
      setCurrentUser(user);
      setItems(taskPage.items || []);
      setStaffList((staffPage.items || []).filter((s) => s.email));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const pending = items.filter((t) => t.status === 'Pending');
  const awaiting = items.filter((t) => t.status === 'Pending Approval');
  const finalised = items.filter((t) => t.status === 'Finalised');
  const canSign = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Team Leader', 'Human Resources Manager', 'Quality & Improvement Manager'].includes(currentUser?.role);
  const finalisedByModule = APP_MODULES
    .map((m) => ({ module: m, rows: finalised.filter((t) => t.module === m) }))
    .filter((g) => g.rows.length > 0);

  const create = async () => {
    if (!form.title.trim()) { toast({ title: 'Task title is required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const user = await base44.auth.me();
      const responsible = form.responsible.map((email) => staffList.find((s) => s.email === email)?.full_name || email);
      await base44.entities.TodoTask.create({
        title: form.title,
        module: form.module,
        task_date: form.task_date,
        task_time: form.task_time,
        due_date: form.due_date,
        how_to_complete: form.how_to_complete,
        resources_needed: form.resources_needed,
        important_info: form.important_info,
        responsible,
        responsible_emails: form.responsible,
        shared_by: user?.full_name || '',
      });
      toast({ title: 'To-do shared', description: 'It appears in the profiles of everyone responsible and reminds them daily as it falls due.' });
      setOpen(false);
      setForm({ title: '', module: APP_MODULES[0], task_date: new Date().toISOString().slice(0, 10), task_time: '', due_date: '', how_to_complete: '', resources_needed: '', important_info: '', responsible: [] });
      await load();
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const finalise = async () => {
    if (!finaliseTarget) return;
    setSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.TodoTask.update(finaliseTarget.id, {
        status: 'Pending Approval',
        completed_date: new Date().toISOString().slice(0, 10),
        completed_by: finaliseForm.completed_by || user?.full_name || '',
        time_taken_minutes: Number(finaliseForm.time_taken_minutes) || 0,
      });
      toast({ title: 'Completed - awaiting manager sign-off', description: 'A manager must review and digitally sign off before the task is marked as finished.' });
      setFinaliseTarget(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const reopen = async (task) => {
    await base44.entities.TodoTask.update(task.id, { status: 'Pending', completed_date: '', completed_by: '', time_taken_minutes: 0, signed_off_by: '', signed_off_date: '', signature: '' });
    await load();
  };

  const approve = async () => {
    if (!signForm.signature.trim()) { toast({ title: 'Signature required', description: 'Type your full name to sign off.', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.TodoTask.update(signTarget.id, {
        status: 'Finalised',
        signed_off_by: user?.full_name || 'Manager',
        signed_off_date: new Date().toISOString().slice(0, 10),
        signature: signForm.signature.trim(),
      });
      await base44.entities.CommunicationEntry.create({
        entry_kind: 'Employee Log',
        person_type: 'General',
        log_type: 'Task Sign-off',
        subject: `Signed off: ${signTarget.title}`,
        body: `Compliance task "${signTarget.title}" (module: ${signTarget.module || 'General'}) was completed by ${signTarget.completed_by || 'unknown'} on ${signTarget.completed_date || '-'} and has been digitally signed off by ${user?.full_name || 'a manager'} on ${new Date().toISOString().slice(0, 10)}. Signature recorded, task finalised.`,
        module: signTarget.module || 'General',
        entry_date: new Date().toISOString().slice(0, 10),
        entry_time: new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }),
        sender_name: user?.full_name || 'Manager',
        sender_email: user?.email || '',
        email_sent: false,
      });
      toast({ title: 'Signed off and finalised', description: 'The task is now marked as finished with your recorded signature.' });
      setSignTarget(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const decline = async () => {
    setSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.TodoTask.update(signTarget.id, { status: 'Pending', completed_date: '', completed_by: '', time_taken_minutes: 0, signed_off_by: '', signed_off_date: '', signature: '' });
      await base44.entities.CommunicationEntry.create({
        entry_kind: 'Employee Log',
        person_type: 'General',
        log_type: 'Task Sign-off',
        subject: `Sign-off declined: ${signTarget.title}`,
        body: `Manager ${user?.full_name || 'a manager'} declined sign-off on the completed compliance task "${signTarget.title}" (module: ${signTarget.module || 'General'}). It has been returned to pending so it can be completed again before sign-off.`,
        module: signTarget.module || 'General',
        entry_date: new Date().toISOString().slice(0, 10),
        entry_time: new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }),
        sender_name: user?.full_name || 'Manager',
        sender_email: user?.email || '',
        email_sent: false,
      });
      toast({ title: 'Sent back to pending', description: 'The task was returned so it can be completed again before sign-off.' });
      setSignTarget(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleResponsible = (email) => setForm((f) => ({ ...f, responsible: f.responsible.includes(email) ? f.responsible.filter((e) => e !== email) : [...f.responsible, email] }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Shared to-dos travel app user to app user: pick the module (location), set how to complete it, resources, important info, who is responsible and a due date. Everyone responsible sees it in their profile, with daily email reminders until it is finalised.</p>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />New shared to-do</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Pending ({pending.length})</p>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending to-dos.</p>
            ) : pending.map((t) => (
              <div key={t.id} className="rounded-xl border border-border/60 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">{t.module || 'General'}</Badge>
                    <span className="text-sm font-semibold">{t.title}</span>
                    {t.due_date && <Badge variant="destructive">Due {t.due_date}</Badge>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { setFinaliseTarget(t); setFinaliseForm({ completed_by: '', time_taken_minutes: '' }); }}><ListTodo className="h-3.5 w-3.5" />Finalise</Button>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {t.task_date && <span>Date: {t.task_date}{t.task_time ? ` ${t.task_time}` : ''}</span>}
                  {(t.responsible || []).length > 0 && <span>Responsible: {t.responsible.join(', ')}</span>}
                  <span>Shared by {t.shared_by || 'unknown'}</span>
                </div>
                {(t.how_to_complete || t.resources_needed || t.important_info) && (
                  <div className="mt-2 grid gap-1 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
                    {t.how_to_complete && <span><span className="font-semibold text-foreground/70">How to complete:</span> {t.how_to_complete}</span>}
                    {t.resources_needed && <span><span className="font-semibold text-foreground/70">Resources needed:</span> {t.resources_needed}</span>}
                    {t.important_info && <span><span className="font-semibold text-foreground/70">Important info:</span> {t.important_info}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>

          {awaiting.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Awaiting manager sign-off ({awaiting.length})</p>
              {awaiting.map((t) => (
                <div key={t.id} className="rounded-xl border border-amber-300/60 bg-amber-50/60 p-3.5 dark:bg-amber-500/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge className="border-transparent bg-amber-200 text-amber-900">Awaiting sign-off</Badge>
                      <Badge variant="outline">{t.module || 'General'}</Badge>
                      <span className="text-sm font-semibold">{t.title}</span>
                    </div>
                    {canSign && (
                      <Button size="sm" onClick={() => { setSignTarget(t); setSignForm({ signature: '' }); }}><PenLine className="h-3.5 w-3.5" />Review &amp; sign off</Button>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>Completed by {t.completed_by || 'unknown'}</span>
                    {t.completed_date && <span>on {t.completed_date}</span>}
                    {t.time_taken_minutes ? <span>Time taken: {t.time_taken_minutes} min</span> : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          {finalised.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Finalised task table ({finalised.length})</p>
                <Button variant="outline" size="sm" onClick={() => exportCsv('finalised-tasks.csv', finalised.map((t) => ({
                  task: t.title, module: t.module, date: t.task_date, time: t.task_time, due_date: t.due_date,
                  responsible: (t.responsible || []).join('; '), completed_by: t.completed_by, completed_date: t.completed_date,
                  time_taken_minutes: t.time_taken_minutes, signed_off_by: t.signed_off_by, signed_off_date: t.signed_off_date,
                  signature: t.signature, shared_by: t.shared_by,
                })))}><Download className="h-4 w-4" />Export</Button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="p-2.5">Task</th><th className="p-2.5">Module</th><th className="p-2.5">Date</th><th className="p-2.5">Time</th>
                      <th className="p-2.5">Due</th><th className="p-2.5">Responsible</th><th className="p-2.5">Completed by</th><th className="p-2.5">Completed</th><th className="p-2.5">Time taken</th><th className="p-2.5">Signed off by</th><th className="p-2.5">Signed off</th><th className="p-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalisedByModule.map((group) => (
                      <React.Fragment key={group.module}>
                        <tr className="bg-accent/40"><td colSpan={12} className="p-2 text-xs font-bold uppercase tracking-wide text-accent-foreground">{group.module} ({group.rows.length})</td></tr>
                        {group.rows.map((t) => (
                          <tr key={t.id} className="border-t border-border/60">
                            <td className="p-2.5">{t.title}</td>
                            <td className="p-2.5">{t.module}</td>
                            <td className="p-2.5">{t.task_date || '-'}</td>
                            <td className="p-2.5">{t.task_time || '-'}</td>
                            <td className="p-2.5">{t.due_date || '-'}</td>
                            <td className="p-2.5">{(t.responsible || []).join(', ') || '-'}</td>
                            <td className="p-2.5">{t.completed_by || '-'}</td>
                            <td className="p-2.5">{t.completed_date || '-'}</td>
                            <td className="p-2.5">{t.time_taken_minutes ? `${t.time_taken_minutes} min` : '-'}</td>
                            <td className="p-2.5">{t.signed_off_by || '-'}</td>
                            <td className="p-2.5">{t.signed_off_date || '-'}</td>
                            <td className="p-2.5"><Button variant="ghost" size="sm" onClick={() => reopen(t)}>Reopen</Button></td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New shared to-do</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>Task / subject *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Module (location)</Label>
                <select value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                  {APP_MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="grid gap-1.5"><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.task_date} onChange={(e) => setForm({ ...form, task_date: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Time</Label><Input type="time" value={form.task_time} onChange={(e) => setForm({ ...form, task_time: e.target.value })} /></div>
            </div>
            <div className="grid gap-1.5"><Label>How to complete</Label><Textarea rows={2} value={form.how_to_complete} onChange={(e) => setForm({ ...form, how_to_complete: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Resources needed</Label><Input value={form.resources_needed} onChange={(e) => setForm({ ...form, resources_needed: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Important info</Label><Textarea rows={2} value={form.important_info} onChange={(e) => setForm({ ...form, important_info: e.target.value })} /></div>
            <div className="grid gap-1.5">
              <Label>Responsible (share with one or many)</Label>
              <div className="max-h-44 space-y-0.5 overflow-y-auto rounded-lg border border-input p-2">
                {staffList.map((s) => (
                  <label key={s.email} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-accent">
                    <Checkbox checked={form.responsible.includes(s.email)} onCheckedChange={() => toggleResponsible(s.email)} />
                    <span className="truncate">{s.full_name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{s.email}</span>
                  </label>
                ))}
                {staffList.length === 0 && <p className="px-2 py-2 text-xs text-muted-foreground">No staff with email addresses on file yet.</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Share to-do</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(finaliseTarget)} onOpenChange={(o) => !o && setFinaliseTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Finalise task</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">{finaliseTarget?.title}</p>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>Completed by</Label><Input placeholder="Your name" value={finaliseForm.completed_by} onChange={(e) => setFinaliseForm({ ...finaliseForm, completed_by: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>How long did it take? (minutes)</Label><Input type="number" value={finaliseForm.time_taken_minutes} onChange={(e) => setFinaliseForm({ ...finaliseForm, time_taken_minutes: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFinaliseTarget(null)}>Cancel</Button>
            <Button onClick={finalise} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListTodo className="h-4 w-4" />}Finalise</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(signTarget)} onOpenChange={(o) => !o && setSignTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manager sign-off</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">{signTarget?.title}</p>
          {signTarget && (
            <p className="text-xs text-muted-foreground">
              Completed by {signTarget.completed_by || 'unknown'} on {signTarget.completed_date || '-'}
              {signTarget.time_taken_minutes ? ` (${signTarget.time_taken_minutes} min)` : ''}. Signing off marks this task as finished.
            </p>
          )}
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Digital signature — type your full name to sign</Label>
              <Input placeholder="Your full name" value={signForm.signature} onChange={(e) => setSignForm({ ...signForm, signature: e.target.value })} />
              {signForm.signature.trim() && (
                <p className="font-editorial-italic text-xl text-brand">{signForm.signature}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={decline} disabled={saving}>Send back to pending</Button>
            <Button onClick={approve} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}Sign off &amp; finalise</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}