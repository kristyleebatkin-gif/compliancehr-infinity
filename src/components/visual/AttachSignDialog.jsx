import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

// Attaches a sign prompt to a visual routine: pick the routine, then attach as a
// new step or to an existing step of that routine.
export default function AttachSignDialog({ sign, onClose }) {
  const { toast } = useToast();
  const [routines, setRoutines] = useState([]);
  const [routineId, setRoutineId] = useState('');
  const [steps, setSteps] = useState([]);
  const [stepChoice, setStepChoice] = useState('new');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sign) return;
    setLoading(true);
    (async () => {
      try {
        const page = await base44.entities.VisualRoutine.filter({}, { sort: '-created_date', limit: 50 });
        const items = page.items || [];
        setRoutines(items);
        setRoutineId(items[0]?.id || '');
      } finally {
        setLoading(false);
      }
    })();
  }, [sign]);

  useEffect(() => {
    if (!routineId) { setSteps([]); return; }
    (async () => {
      const record = await base44.entities.VisualRoutine.get(routineId).catch(() => null);
      let parsed = [];
      if (record?.steps) { try { parsed = JSON.parse(record.steps); } catch { parsed = []; } }
      setSteps(parsed);
      setStepChoice('new');
    })();
  }, [routineId]);

  const attach = async () => {
    if (!routineId) return;
    setSaving(true);
    try {
      const next = stepChoice === 'new'
        ? [...steps, { id: `${Date.now()}`, text: sign.word, done: false, sign: sign.word, sign_description: sign.description }]
        : steps.map((s) => (s.id === stepChoice ? { ...s, sign: sign.word, sign_description: sign.description } : s));
      await base44.entities.VisualRoutine.update(routineId, { steps: JSON.stringify(next) });
      toast({ title: `Sign attached to routine` });
      onClose();
    } catch (error) {
      toast({ title: 'Could not attach sign', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!sign} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach "{sign?.word}" to a routine</DialogTitle>
          <DialogDescription>Choose a visual routine, then attach the sign as a new step or onto an existing step.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : routines.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">No routines yet. Create one in the Visual Routine tab first.</p>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <Label>Routine</Label>
              <Select value={routineId} onValueChange={setRoutineId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {routines.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}{r.participant_name ? ` (${r.participant_name})` : ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Attach to</Label>
              <Select value={stepChoice} onValueChange={setStepChoice}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New step</SelectItem>
                  {steps.map((s) => <SelectItem key={s.id} value={s.id}>Step: {s.text}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={attach} disabled={saving || !routineId}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Attach sign</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}