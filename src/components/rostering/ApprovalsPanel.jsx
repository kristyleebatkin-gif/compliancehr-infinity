import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { statusTone } from '@/lib/statusStyles';
import { shiftHours } from '@/lib/rostering';
import { useToast } from '@/components/ui/use-toast';

export default function ApprovalsPanel({ shifts, onChanged }) {
  const [busyId, setBusyId] = useState(null);
  const { toast } = useToast();

  const pending = shifts.filter((s) => s.approval_status === 'Pending Approval');

  const decide = async (shift, decision) => {
    setBusyId(shift.id);
    try {
      await base44.entities.Shift.update(shift.id, { approval_status: decision });
      toast({ title: decision === 'Approved' ? 'Shift approved' : 'Shift rejected', description: shift.employee_name || 'Unassigned' });
      await onChanged();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold">Timesheet approvals</h3>
        <p className="mt-1 text-sm text-muted-foreground">Completed shifts awaiting approval of worked hours.</p>
        {pending.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No shifts awaiting approval.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {pending.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{s.employee_name || 'Unassigned'}</p>
                    {s.participant_name && <span className="text-sm text-muted-foreground">→ {s.participant_name}</span>}
                    <Badge className={statusTone(s.status)}>{s.status}</Badge>
                    {s.location_verified && (
                      <Badge className={s.location_verified === 'Verified' ? 'bg-safe/10 text-safe' : s.location_verified === 'Outside range' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}>
                        {s.location_verified}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {[
                      format(new Date(s.date), 'EEE d MMM yyyy'),
                      s.start_time && s.end_time ? `Planned ${s.start_time}–${s.end_time} (${shiftHours(s.start_time, s.end_time)}h)` : '',
                      s.clock_in ? `Worked ${format(new Date(s.clock_in), 'd MMM, HH:mm')}${s.clock_out ? `–${format(new Date(s.clock_out), 'HH:mm')}` : ''}` : '',
                    ].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-safe" disabled={busyId === s.id} onClick={() => decide(s, 'Approved')}>
                    <Check className="mr-1 h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive" disabled={busyId === s.id} onClick={() => decide(s, 'Rejected')}>
                    <X className="mr-1 h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ClockButton({ shift, onChanged }) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const getPosition = () => new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });

  const locationFor = (pos) => {
    if (!pos) return { recorded: '', verified: 'Not checked' };
    const recorded = `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)} (±${Math.round(pos.accuracy || 0)}m)`;
    if (shift.location_lat == null || shift.location_lng == null) return { recorded, verified: 'Not checked' };
    const R = 6371000;
    const dLat = (pos.lat - shift.location_lat) * Math.PI / 180;
    const dLng = (pos.lng - shift.location_lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(shift.location_lat * Math.PI / 180) * Math.cos(pos.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    const metres = 2 * R * Math.asin(Math.sqrt(a));
    return { recorded, verified: metres <= 250 ? 'Verified' : 'Outside range' };
  };

  const clock = async (action) => {
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const pos = await getPosition();
      const { recorded, verified } = locationFor(pos);
      if (action === 'in') {
        await base44.entities.Shift.update(shift.id, { status: 'In Progress', clock_in: now, clock_in_location: recorded, location_verified: verified });
        toast({
          title: verified === 'Verified' ? 'Started — location verified' : verified === 'Outside range' ? 'Started — outside location range' : 'Shift started',
          description: recorded || 'GPS unavailable, clocked in without location',
        });
      } else {
        await base44.entities.Shift.update(shift.id, { status: 'Completed', clock_out: now, approval_status: 'Pending Approval', clock_out_location: recorded });
        toast({ title: 'Clocked out', description: recorded || 'GPS unavailable' });
      }
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  if (shift.status === 'Scheduled') {
    return <Button size="sm" variant="outline" disabled={busy} onClick={() => clock('in')}><Clock className="mr-1 h-4 w-4" /> Start</Button>;
  }
  if (shift.status === 'In Progress') {
    return <Button size="sm" variant="outline" className="text-safe" disabled={busy} onClick={() => clock('out')}>Clock out</Button>;
  }
  return null;
}