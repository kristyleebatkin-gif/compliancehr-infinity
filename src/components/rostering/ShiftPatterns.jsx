import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Save, Loader2, Trash2, Copy, Plus } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { shiftHours } from '@/lib/rostering';

// Runtime fields never copied into a pattern.
const PATTERN_FIELDS = ['employee_name', 'participant_name', 'start_time', 'end_time', 'service_type', 'funding_source', 'location', 'notes', 'break_minutes', 'travel_km', 'billable_rate'];

export default function ShiftPatterns() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekShifts, setWeekShifts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const [applying, setApplying] = useState(null);
  const [applyResult, setApplyResult] = useState('');

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const fromStr = format(weekStart, 'yyyy-MM-dd');
  const toStr = format(weekEnd, 'yyyy-MM-dd');

  const load = useCallback(async (start) => {
    setLoading(true);
    try {
      const [shiftPage, tplPage] = await Promise.all([
        base44.entities.Shift.filter({ date: { $gte: format(start, 'yyyy-MM-dd'), $lte: format(endOfWeek(start, { weekStartsOn: 1 }), 'yyyy-MM-dd') } }, { sort: 'date', limit: 300 }),
        base44.entities.ShiftPatternTemplate.list('-created_date', 50),
      ]);
      setWeekShifts(shiftPage.items || []);
      setTemplates(tplPage.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(weekStart); }, [weekStart, load]);

  const saveWeek = async () => {
    if (!saveName.trim()) return;
    setSaving(true);
    try {
      const entries = weekShifts
        .filter((s) => s.status !== 'Cancelled')
        .map((s) => ({
          ...Object.fromEntries(PATTERN_FIELDS.map((f) => [f, s[f]])),
          day_offset: Math.round((new Date(s.date + 'T00:00:00') - new Date(fromStr + 'T00:00:00')) / 86400000),
        }));
      await base44.entities.ShiftPatternTemplate.create({
        name: saveName.trim(),
        description: saveDesc || undefined,
        shift_count: entries.length,
        pattern_json: JSON.stringify(entries),
      });
      setSaveOpen(false);
      setSaveName('');
      setSaveDesc('');
      await load(weekStart);
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = async (tpl) => {
    setApplying(tpl.id);
    setApplyResult('');
    try {
      let entries = [];
      try { entries = JSON.parse(tpl.pattern_json || '[]'); } catch { entries = []; }
      if (entries.length === 0) { setApplyResult('This template has no shifts.'); return; }

      // Skip duplicates: same date, staff and start time already rostered in the target week.
      const existingPage = await base44.entities.Shift.filter({ date: { $gte: fromStr, $lte: toStr } }, { limit: 300, fields: ['date', 'employee_name', 'start_time'] });
      const existing = new Set((existingPage.items || []).map((s) => `${s.date}|${s.employee_name || ''}|${s.start_time || ''}`));
      const toCreate = entries
        .map((e) => ({ ...e, date: format(addDays(new Date(weekStart + 'T00:00:00'), e.day_offset || 0), 'yyyy-MM-dd') }))
        .filter((e) => !existing.has(`${e.date}|${e.employee_name || ''}|${e.start_time || ''}`))
        .map((e) => ({ ...e, status: 'Scheduled' }));
      if (toCreate.length === 0) { setApplyResult('All shifts in this pattern are already rostered for this week.'); return; }
      await base44.entities.Shift.bulkCreate(toCreate);
      setApplyResult(`Created ${toCreate.length} shift${toCreate.length === 1 ? '' : 's'}${entries.length - toCreate.length > 0 ? ` (${entries.length - toCreate.length} already rostered, skipped)` : ''}.`);
      await load(weekStart);
    } finally {
      setApplying(null);
    }
  };

  const removeTemplate = async (tpl) => {
    await base44.entities.ShiftPatternTemplate.delete(tpl.id);
    await load(weekStart);
  };

  const totalHours = weekShifts.reduce((sum, s) => sum + shiftHours(s.start_time, s.end_time), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, -7))}>‹</Button>
        <span className="text-sm font-semibold">{format(weekStart, 'd MMM')} – {format(weekEnd, 'd MMM yyyy')}</span>
        <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, 7))}>›</Button>
        <div className="flex-1" />
        <Button size="sm" onClick={() => setSaveOpen(true)} disabled={weekShifts.filter((s) => s.status !== 'Cancelled').length === 0}>
          <Save className="h-4 w-4" /> Save this week as template
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="mb-3 text-sm text-muted-foreground">
            {loading ? 'Loading…' : `${weekShifts.length} shifts this week (${totalHours.toFixed(1)}h) — shown week is the source for saving and the target for applying.`}
          </p>
          {templates.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No saved patterns yet. Roster a typical week, then save it as a template.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {templates.map((tpl) => (
                <div key={tpl.id} className="flex items-start justify-between gap-2 rounded-lg border border-border/60 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{tpl.name}</p>
                    {tpl.description && <p className="text-xs text-muted-foreground">{tpl.description}</p>}
                    <Badge className="mt-1 bg-brand/10 text-brand border-transparent">{tpl.shift_count} shifts</Badge>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button size="sm" variant="outline" onClick={() => applyTemplate(tpl)} disabled={applying === tpl.id}>
                      {applying === tpl.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />} Apply
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeTemplate(tpl)} title="Delete template"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {applyResult && <p className="mt-3 rounded-lg bg-safe/10 p-2 text-xs font-medium text-safe">{applyResult}</p>}
        </CardContent>
      </Card>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Save week as pattern template</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Template name (e.g. Standard Mon–Fri roster)" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
            <Input placeholder="Description (optional)" value={saveDesc} onChange={(e) => setSaveDesc(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              {weekShifts.filter((s) => s.status !== 'Cancelled').length} shifts from {format(weekStart, 'd MMM')} – {format(weekEnd, 'd MMM yyyy')} will be saved (cancelled shifts excluded). Staff, times, participants and locations are kept relative to the week.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>Cancel</Button>
            <Button onClick={saveWeek} disabled={saving || !saveName.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}