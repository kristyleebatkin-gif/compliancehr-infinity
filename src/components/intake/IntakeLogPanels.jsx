import React from 'react';
import { CalendarCheck, Users } from 'lucide-react';
import { Field, TextArea, TextInput, DateInput } from '@/components/Field';
import { Button } from '@/components/ui/button';

const LOG_ROW = 'rounded-md border border-border/60 bg-white px-2.5 py-1.5 font-medium';

/**
 * Referee check (and, for employee intake, buddy shift) logs for an intake
 * case. Entries are also written to the person's training record and buddy
 * shift register so they follow them onto their profile at conversion.
 */
export default function IntakeLogPanels({ intakeType, activeCase, refereeCheck, setRefereeCheck, buddyShift, setBuddyShift, busy, addRefereeCheck, addBuddyShift }) {
  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
        <div className="flex items-center gap-2 border-b border-border/60 bg-white px-4 py-3">
          <span className="gradient-brand flex h-7 w-7 items-center justify-center rounded-lg text-white"><Users className="h-4 w-4" /></span>
          <h4 className="text-sm font-bold">Referee checks (office personnel)</h4>
        </div>
        <p className="mt-3 px-4 text-xs text-muted-foreground">
          Every referee check completed by office staff is logged here with the date, time and person who completed it, and follows the person onto their profile.
        </p>
        <div className="p-4">
          {(activeCase.referee_check_log || '').trim() ? (
            <ul className="mt-3 space-y-1 text-xs">
              {(activeCase.referee_check_log || '').split('\n').filter(Boolean).map((entry, index) => (
                <li key={index} className={LOG_ROW}>{entry}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">No referee checks recorded yet.</p>
          )}
          <form
            onSubmit={(event) => { event.preventDefault(); addRefereeCheck(); }}
            className="mt-3 grid gap-3 sm:grid-cols-4"
          >
            <Field label="Checked by (office personnel)">
              <TextInput value={refereeCheck.checked_by} onChange={(e) => setRefereeCheck({ ...refereeCheck, checked_by: e.target.value })} />
            </Field>
            <Field label="Date"><DateInput value={refereeCheck.date} onChange={(e) => setRefereeCheck({ ...refereeCheck, date: e.target.value })} /></Field>
            <Field label="Time"><TextInput type="time" value={refereeCheck.time} onChange={(e) => setRefereeCheck({ ...refereeCheck, time: e.target.value })} /></Field>
            <Field label="Outcome / notes" className="sm:col-span-4"><TextArea rows={2} value={refereeCheck.outcome} onChange={(e) => setRefereeCheck({ ...refereeCheck, outcome: e.target.value })} /></Field>
            <div className="flex justify-end sm:col-span-4">
              <Button type="submit" size="sm" disabled={busy}>Log referee check</Button>
            </div>
          </form>
        </div>
      </div>

      {intakeType !== 'Participant' && (<div className="overflow-hidden rounded-xl border border-border/60 bg-card">
        <div className="flex items-center gap-2 border-b border-border/60 bg-white px-4 py-3">
          <span className="gradient-brand flex h-7 w-7 items-center justify-center rounded-lg text-white"><CalendarCheck className="h-4 w-4" /></span>
          <h4 className="text-sm font-bold">Buddy shift log</h4>
        </div>
        <p className="mt-3 px-4 text-xs text-muted-foreground">
          Record each buddy shift with the date, time and the other employee present. Entries follow the employee onto their profile and skill assessment.
        </p>
        <div className="p-4">
          {(activeCase.buddy_shift_log || '').trim() ? (
            <ul className="mt-3 space-y-1 text-xs">
              {(activeCase.buddy_shift_log || '').split('\n').filter(Boolean).map((entry, index) => (
                <li key={index} className={LOG_ROW}>{entry}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">No buddy shifts recorded yet.</p>
          )}
          <form
            onSubmit={(event) => { event.preventDefault(); addBuddyShift(); }}
            className="mt-3 grid gap-3 sm:grid-cols-4"
          >
            <Field label="Date"><DateInput value={buddyShift.date} onChange={(e) => setBuddyShift({ ...buddyShift, date: e.target.value })} /></Field>
            <Field label="Time"><TextInput value={buddyShift.time} onChange={(e) => setBuddyShift({ ...buddyShift, time: e.target.value })} /></Field>
            <Field label="Other employee present"><TextInput value={buddyShift.other_employee} onChange={(e) => setBuddyShift({ ...buddyShift, other_employee: e.target.value })} /></Field>
            <Field label="Notes" className="sm:col-span-4"><TextArea rows={2} value={buddyShift.notes} onChange={(e) => setBuddyShift({ ...buddyShift, notes: e.target.value })} /></Field>
            <div className="flex justify-end sm:col-span-4">
              <Button type="submit" size="sm" disabled={busy}>Log buddy shift</Button>
            </div>
          </form>
        </div>
      </div>)}
    </>
  );
}