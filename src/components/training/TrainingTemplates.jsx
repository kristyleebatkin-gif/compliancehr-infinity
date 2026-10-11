import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, GraduationCap, Loader2 } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { LMS_MODULES, LMS_GROUPS } from '@/lib/lmsCurriculum';

const ROLES = ['Support Worker', 'Team Leader', 'Compliance Manager', 'Administration', 'Management'];
const todayStr = () => format(new Date(), 'yyyy-MM-dd');

export default function TrainingTemplates() {
  const [templates, setTemplates] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', role: 'Support Worker', description: '', selected: [] });
  const [saving, setSaving] = useState(false);

  const [assignTemplate, setAssignTemplate] = useState(null);
  const [assignStaff, setAssignStaff] = useState('');
  const [assignMode, setAssignMode] = useState('one');
  const [assignResult, setAssignResult] = useState('');
  const [assigning, setAssigning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tplPage, staffPage] = await Promise.all([
        base44.entities.TrainingTemplate.list('-created_date', 100),
        base44.entities.StaffProfile.filter({ status: 'Active' }, { sort: 'full_name', limit: 200, fields: ['full_name', 'role'] }),
      ]);
      setTemplates(tplPage.items || []);
      setStaff(staffPage.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleModule = (title) => {
    setForm((f) => ({
      ...f,
      selected: f.selected.includes(title) ? f.selected.filter((t) => t !== title) : [...f.selected, title],
    }));
  };

  const createTemplate = async () => {
    if (!form.name.trim() || form.selected.length === 0) return;
    setSaving(true);
    try {
      await base44.entities.TrainingTemplate.create({
        name: form.name.trim(),
        role: form.role,
        description: form.description || undefined,
        module_titles: form.selected.join('\n'),
      });
      setForm({ name: '', role: 'Support Worker', description: '', selected: [] });
      setCreateOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const openAssign = (tpl) => {
    setAssignTemplate(tpl);
    setAssignStaff('');
    setAssignMode('one');
    setAssignResult('');
  };

  const doAssign = async () => {
    if (!assignTemplate) return;
    setAssigning(true);
    setAssignResult('');
    try {
      const titles = (assignTemplate.module_titles || '').split('\n').map((t) => t.trim()).filter(Boolean);
      if (titles.length === 0) { setAssignResult('This template has no modules.'); return; }
      const today = todayStr();
      const targets = assignMode === 'role'
        ? staff.filter((s) => s.role === assignTemplate.role).map((s) => s.full_name)
        : [assignStaff];
      if (targets.length === 0) {
        setAssignResult(`No active staff with the ${assignTemplate.role} role.`);
        return;
      }
      const compsPage = await base44.entities.TrainingCompletion.filter(
        { status: 'Completed' },
        { limit: 500, fields: ['employee_name', 'module_title', 'expiry_date'] },
      );
      const current = new Set(
        (compsPage.items || [])
          .filter((c) => !c.expiry_date || c.expiry_date >= today)
          .map((c) => `${c.employee_name}|${c.module_title}`),
      );
      const records = [];
      targets.forEach((name) => {
        titles.forEach((title) => {
          if (current.has(`${name}|${title}`)) return;
          const mod = LMS_MODULES.find((m) => m.title === title);
          const months = mod?.validity_months;
          records.push({
            employee_name: name,
            learner_type: 'Employee',
            learner_name: name,
            module_title: title,
            completed_date: today,
            expiry_date: months ? format(addMonths(new Date(), months), 'yyyy-MM-dd') : undefined,
            status: 'Completed',
            training_notes: `Assigned via "${assignTemplate.name}" template${assignMode === 'role' ? ' (role auto-assign)' : ''}`,
          });
        });
      });
      if (records.length === 0) {
        setAssignResult('Everyone already holds all modules in this bundle.');
        return;
      }
      await base44.entities.TrainingCompletion.bulkCreate(records);
      setAssignResult(`Recorded ${records.length} module${records.length === 1 ? '' : 's'} for ${targets.length} staff member${targets.length === 1 ? '' : 's'}${assignMode === 'role' ? ` with the ${assignTemplate.role} role` : ''}.`);
    } finally {
      setAssigning(false);
    }
  };

  const moduleCount = (tpl) => (tpl.module_titles || '').split('\n').filter((t) => t.trim()).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Bundle mandatory modules per role, then assign a whole set to a staff member at once.</p>
        <Button size="sm" onClick={() => { setForm({ name: '', role: 'Support Worker', description: '', selected: [] }); setCreateOpen(true); }}>
          <Plus className="h-4 w-4" /> New template
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : templates.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No role templates yet — create your first bundle.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((tpl) => (
            <Card key={tpl.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight">{tpl.name}</p>
                    {tpl.description && <p className="text-xs text-muted-foreground">{tpl.description}</p>}
                  </div>
                  <Badge className="bg-brand/10 text-brand border-transparent">{tpl.role}</Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5" /> {moduleCount(tpl)} modules
                </div>
                <Button size="sm" variant="outline" className="w-full" onClick={() => openAssign(tpl)}>
                  <Users className="h-4 w-4" /> Assign to staff
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader><DialogTitle>New role template</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Template name (e.g. New Support Worker Induction)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <p className="text-xs font-semibold text-foreground/60">Select modules ({form.selected.length} chosen)</p>
            <div className="max-h-64 space-y-3 overflow-y-auto rounded-lg border border-border/60 p-3">
              {LMS_GROUPS.map((g) => {
                const mods = LMS_MODULES.filter((m) => m.group === g.name);
                if (mods.length === 0) return null;
                return (
                  <div key={g.name}>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-foreground/40">{g.name}</p>
                    <div className="space-y-1">
                      {mods.map((m) => (
                        <label key={m.number} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={form.selected.includes(m.title)}
                            onChange={() => toggleModule(m.title)}
                            className="h-3.5 w-3.5 rounded border-input"
                          />
                          <span className="truncate">{m.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={createTemplate} disabled={saving || !form.name.trim() || form.selected.length === 0}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(assignTemplate)} onOpenChange={(o) => { if (!o) setAssignTemplate(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Assign "{assignTemplate?.name}"</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant={assignMode === 'one' ? 'default' : 'outline'} onClick={() => setAssignMode('one')}>Single staff</Button>
              <Button size="sm" variant={assignMode === 'role' ? 'default' : 'outline'} onClick={() => setAssignMode('role')}>All {assignTemplate?.role}s</Button>
            </div>
            {assignMode === 'role' ? (
              <p className="rounded-lg bg-brand/10 p-2 text-xs text-brand">
                {staff.filter((s) => s.role === assignTemplate?.role).length} active staff member(s) have the {assignTemplate?.role} role — the bundle will be recorded for all of them.
              </p>
            ) : (
              <Select value={assignStaff || ''} onValueChange={setAssignStaff}>
                <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.full_name} value={s.full_name}>
                      {s.full_name}{s.role ? ` (${s.role})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-sm text-muted-foreground">
              {moduleCount(assignTemplate || {})} modules per person. Modules already held currently are skipped.
            </p>
            {assignResult && <p className="rounded-lg bg-safe/10 p-2 text-xs font-medium text-safe">{assignResult}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTemplate(null)}>Close</Button>
            <Button onClick={doAssign} disabled={assigning || (assignMode === 'one' && !assignStaff)}>
              {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign bundle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}