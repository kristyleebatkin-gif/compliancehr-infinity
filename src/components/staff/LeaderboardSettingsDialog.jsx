import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Settings2, Loader2 } from 'lucide-react';

export const LEADERBOARD_WEIGHT_FIELDS = [
  { key: 'training_completion_points', label: 'Training completion (per module)' },
  { key: 'goal_tracking_points', label: 'Goal tracking (per KPI owned)' },
  { key: 'kpi_achievement_points', label: 'KPI achievement (per KPI achieved)' },
  { key: 'goal_success_points', label: 'Goal success (per participant goal achievement)' },
  { key: 'business_milestone_points', label: 'Business milestone (per milestone)' },
  { key: 'employment_anniversary_points', label: 'Employment anniversary (per year)' },
];

// Admin editor for the Employee Leaderboard point weights.
export default function LeaderboardSettingsDialog({ settings, user, onSaved }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState(() => Object.fromEntries(LEADERBOARD_WEIGHT_FIELDS.map((f) => [f.key, settings?.[f.key] ?? 1])));
  const { toast } = useToast();

  const canEdit = user?.role === 'admin' || user?.role === 'Provider Administrator';
  if (!canEdit) return null;

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...values, updated_by: user?.full_name || user?.email || '' };
      const saved = settings?.id
        ? await base44.entities.EmployeeLeaderboardSettings.update(settings.id, payload)
        : await base44.entities.EmployeeLeaderboardSettings.create({ settings_name: 'Default Employee Leaderboard', ...payload });
      toast({ title: 'Leaderboard weights saved' });
      setOpen(false);
      onSaved(saved);
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Settings2 className="mr-2 h-4 w-4" />Points settings</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Leaderboard point weights</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          {LEADERBOARD_WEIGHT_FIELDS.map(({ key, label }) => (
            <div key={key} className="grid gap-1.5">
              <Label>{label}</Label>
              <Input type="number" min="0" max="100" value={values[key]} onChange={(e) => setValues({ ...values, [key]: Number(e.target.value) || 0 })} />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Points are 0 to 100 per achievement. Changes apply to the whole board immediately.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save weights</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}