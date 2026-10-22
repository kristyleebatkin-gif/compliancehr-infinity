import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { APP_MODULES } from '@/lib/commTypes';
import { MASTER_TODO_SECTIONS } from '@/lib/sharedTodoChecklistData';
import { ChevronDown, ChevronUp, ClipboardCheck, ListPlus, Loader2, Plus } from 'lucide-react';

export default function SharedTodoInfoPanel({ tasks = [], onCreated }) {
  const { toast } = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [openChecklist, setOpenChecklist] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [addingItem, setAddingItem] = useState(null);
  const [form, setForm] = useState({
    title: '',
    module: APP_MODULES[0],
    task_date: new Date().toISOString().slice(0, 10),
    task_time: '',
    due_date: '',
    how_to_complete: '',
    resources_needed: '',
    important_info: '',
    responsible: [],
  });

  useEffect(() => {
    base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 300 })
      .then((page) => setStaffList((page.items || []).filter((s) => s.email)))
      .catch(() => setStaffList([]));
  }, []);

  const toggleResponsible = (email) => {
    setForm((f) => ({
      ...f,
      responsible: f.responsible.includes(email)
        ? f.responsible.filter((e) => e !== email)
        : [...f.responsible, email],
    }));
  };

  const createTask = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Task / subject is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const user = await base44.auth.me().catch(() => null);
      const responsible = form.responsible.map((email) => staffList.find((s) => s.email === email)?.full_name || email);
      await base44.entities.TodoTask.create({
        title: form.title.trim(),
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
        status: 'Pending',
        priority: 'Medium',
      });
      toast({ title: 'Shared to-do created', description: 'Saved with all task details and routed to responsible staff.' });
      setForm({
        title: '',
        module: APP_MODULES[0],
        task_date: new Date().toISOString().slice(0, 10),
        task_time: '',
        due_date: '',
        how_to_complete: '',
        resources_needed: '',
        important_info: '',
        responsible: [],
      });
      setOpenForm(false);
      onCreated?.();
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const quickAddChecklistItem = async (section, itemText) => {
    setAddingItem(itemText);
    try {
      const user = await base44.auth.me().catch(() => null);
      await base44.entities.TodoTask.create({
        title: itemText,
        module: section.module,
        task_date: new Date().toISOString().slice(0, 10),
        important_info: section.title,
        shared_by: user?.full_name || '',
        status: 'Pending',
        priority: 'Medium',
      });
      toast({ title: 'Added to Shared To-Do List', description: itemText });
      onCreated?.();
    } finally {
      setAddingItem(null);
    }
  };

  const existingTitles = new Set((tasks || []).map((t) => String(t.title || '').trim().toLowerCase()));

  return (
    <div className="mt-2.5 space-y-2 border-t border-pink-200/70 pt-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold text-foreground/80">
          Shared to-dos include module location, how to complete, resources needed, important info, responsible staff and due date.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => setOpenForm((v) => !v)}
            className="font-bold text-white shadow"
            style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}
          >
            <ListPlus className="h-4 w-4" />
            New Shared To-Do Task &amp; All Information
            {openForm ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setOpenChecklist((v) => !v)}
            className="border-pink-300 font-bold text-pink-700 hover:bg-pink-50"
          >
            <ClipboardCheck className="h-4 w-4" />
            Master Compliance Checklist (17 Sections)
            {openChecklist ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {openForm && (
        <div className="rounded-xl border border-pink-200 bg-white p-3.5 shadow-sm">
          <h4 className="mb-2.5 text-sm font-extrabold text-pink-700">New Shared To-Do Task — Full Information</h4>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="grid gap-1 sm:col-span-2">
              <Label className="text-xs font-bold">Task / Subject *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter task title or subject…" />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs font-bold">Module (Location)</Label>
              <select
                value={form.module}
                onChange={(e) => setForm({ ...form, module: e.target.value })}
                className="h-9 rounded-md border border-input bg-background px-3 text-xs font-semibold"
              >
                {APP_MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="grid gap-1">
              <Label className="text-xs font-bold">Due Date</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs font-bold">Date</Label>
              <Input type="date" value={form.task_date} onChange={(e) => setForm({ ...form, task_date: e.target.value })} />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs font-bold">Time</Label>
              <Input type="time" value={form.task_time} onChange={(e) => setForm({ ...form, task_time: e.target.value })} />
            </div>
            <div className="grid gap-1 sm:col-span-2">
              <Label className="text-xs font-bold">How to Complete</Label>
              <Textarea rows={2} value={form.how_to_complete} onChange={(e) => setForm({ ...form, how_to_complete: e.target.value })} placeholder="Step-by-step instructions…" />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs font-bold">Resources Needed</Label>
              <Input value={form.resources_needed} onChange={(e) => setForm({ ...form, resources_needed: e.target.value })} placeholder="Templates, forms, tools…" />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs font-bold">Important Info</Label>
              <Input value={form.important_info} onChange={(e) => setForm({ ...form, important_info: e.target.value })} placeholder="Key compliance notes…" />
            </div>
            <div className="grid gap-1 sm:col-span-2">
              <Label className="text-xs font-bold">Responsible (Share with one or many staff)</Label>
              <div className="max-h-32 space-y-0.5 overflow-y-auto rounded-lg border border-input p-2">
                {staffList.map((s) => (
                  <label key={s.email} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs font-semibold hover:bg-accent">
                    <Checkbox checked={form.responsible.includes(s.email)} onCheckedChange={() => toggleResponsible(s.email)} />
                    <span className="truncate">{s.full_name}</span>
                    <span className="ml-auto text-[11px] text-muted-foreground">{s.email}</span>
                  </label>
                ))}
                {staffList.length === 0 && <p className="px-2 py-1 text-xs text-muted-foreground">No staff with email addresses on file yet.</p>}
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button
              type="button"
              size="sm"
              onClick={createTask}
              disabled={saving}
              className="font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Share To-Do Task
            </Button>
          </div>
        </div>
      )}

      {openChecklist && (
        <div className="max-h-96 space-y-3 overflow-y-auto rounded-xl border border-pink-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-pink-700">Master Compliance &amp; Platform Checklist (17 Sections)</h4>
            <span className="text-xs font-semibold text-muted-foreground">Click any item to add it as a Shared To-Do</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {MASTER_TODO_SECTIONS.map((sec) => (
              <div key={sec.title} className="rounded-xl border border-pink-100 bg-pink-50/30 p-2.5">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold text-pink-800">{sec.title}</p>
                  <Badge variant="outline" className="text-[10px] font-bold">{sec.module}</Badge>
                </div>
                <ul className="space-y-1">
                  {sec.items.map((item) => {
                    const added = existingTitles.has(item.toLowerCase());
                    return (
                      <li key={item} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1 text-xs font-semibold shadow-sm">
                        <span className="min-w-0 flex-1 truncate">{item}</span>
                        <button
                          type="button"
                          disabled={added || addingItem === item}
                          onClick={() => quickAddChecklistItem(sec, item)}
                          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold text-white transition ${
                            added ? 'bg-emerald-600 opacity-80' : 'bg-pink-600 hover:bg-pink-700'
                          }`}
                        >
                          {addingItem === item ? 'Adding…' : added ? 'Added' : '+ Add To-Do'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}