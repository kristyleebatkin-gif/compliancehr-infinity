import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import SectionCard from '@/components/SectionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { PenLine, CheckCircle2 } from 'lucide-react';
import { findUnassigned, findDoubleBookings, findMissingInstructions } from '@/lib/rosterValidation';

// Weekly roster compliance sign-off: records who signed off the week and the exception counts at signing time.
export default function RosterWeeklySignOff({ shifts = [], weekStart }) {
  const { toast } = useToast();
  const [signOffs, setSignOffs] = useState([]);
  const [myName, setMyName] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const weekKey = format(weekStart, 'yyyy-MM-dd');
  const thisWeek = signOffs.filter((s) => s.week_start === weekKey);
  const signed = thisWeek.length > 0 ? thisWeek[0] : null;

  const load = async () => {
    try {
      const page = await base44.entities.RosterSignOff.filter({}, { sort: '-created_date', limit: 8 });
      setSignOffs(page.items || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    load();
    base44.auth.me().then((m) => setMyName(m?.full_name || '')).catch(() => {});
  }, []);

  const signOff = async () => {
    setSaving(true);
    try {
      await base44.entities.RosterSignOff.create({
        week_start: weekKey,
        signed_off_by: myName,
        signed_off_date: format(new Date(), 'yyyy-MM-dd'),
        shift_count: shifts.length,
        unassigned_count: findUnassigned(shifts).length,
        double_bookings: findDoubleBookings(shifts).length,
        missing_instructions: findMissingInstructions(shifts).length,
        notes: notes || '',
      });
      setNotes('');
      await load();
      toast({ title: 'Week signed off' });
    } catch (err) {
      toast({ title: 'Sign-off failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard
      title="Weekly roster sign-off"
      description="Confirm the week's roster has been reviewed and is ready to go live. Exceptions are snapshotted at sign-off."
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-transparent bg-brand/10 text-brand">Week of {format(new Date(weekKey + 'T00:00:00'), 'd MMM yyyy')}</Badge>
            <Badge className="border-transparent bg-muted text-foreground/70">{shifts.length} shifts</Badge>
            {findUnassigned(shifts).length > 0 && <Badge className="border-transparent bg-warning/10 text-warning">{findUnassigned(shifts).length} unassigned</Badge>}
            {findDoubleBookings(shifts).length > 0 && <Badge className="border-transparent bg-danger/10 text-danger">{findDoubleBookings(shifts).length} double-bookings</Badge>}
            {findMissingInstructions(shifts).length > 0 && <Badge className="border-transparent bg-brand/10 text-brand">{findMissingInstructions(shifts).length} missing instructions</Badge>}
          </div>
          {signed ? (
            <div className="flex items-center gap-2 rounded-lg border border-safe/30 bg-safe/5 p-3">
              <CheckCircle2 className="h-5 w-5 text-safe" />
              <div>
                <p className="text-sm font-semibold">Signed off by {signed.signed_off_by || '—'} on {signed.signed_off_date || '—'}</p>
                {signed.notes && <p className="text-xs text-foreground/60">{signed.notes}</p>}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional sign-off notes" />
              <Button onClick={signOff} disabled={saving || shifts.length === 0} className="shrink-0">
                <PenLine className="mr-2 h-4 w-4" />{saving ? 'Signing off…' : 'Sign off this week'}
              </Button>
            </div>
          )}
        </div>
        {signOffs.length > 0 && (
          <div className="lg:w-72">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">Recent sign-offs</p>
            <ul className="space-y-1.5">
              {signOffs.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-1.5 text-xs">
                  <span className="font-medium">Week of {s.week_start ? format(new Date(s.week_start + 'T00:00:00'), 'd MMM yyyy') : '—'}</span>
                  <span className="text-foreground/60">{s.signed_off_by || '—'}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SectionCard>
  );
}