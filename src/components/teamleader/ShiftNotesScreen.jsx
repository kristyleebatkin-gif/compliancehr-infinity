import { shiftNoteReview } from '@/lib/rosterDashboard';
import React from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ShiftNotesScreen({ shifts, notes, evidence = [], onBack }) {
  const { toast } = useToast();
  const day = new Date().toLocaleDateString('en-AU', { timeZone: 'Australia/Brisbane' });

  const chase = async (shift) => {
    const message = `Hi ${shift.employee_name || 'team'}, can you please add the shift note for ${
      shift.participant_name || 'your shift'
    } on ${shift.date || day} (${shift.start_time || 'time not recorded'})? Thanks.`;
    try {
      await navigator.clipboard.writeText(message);
      toast({ title: 'Reminder copied', description: 'Paste it into Messages to send.' });
    } catch {
      toast({ title: 'Copy failed', description: 'Your browser blocked clipboard access.', variant: 'destructive' });
    }
  };

  return (
    <div className="px-3.5 pt-3.5">
      <header className="mb-2 flex items-center gap-2">
        <button type="button" onClick={onBack} aria-label="Back" className="tl-btn tl-ghost !px-2">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="tl-text truncate text-[16px] font-extrabold">Shift notes</h1>
          <p className="tl-muted text-[10.5px] font-semibold">{shifts.length} roster records, including overnight carry-over · {day}</p>
        </div>
      </header>

      <section className="tl-card overflow-hidden">
        <table className="tl-table w-full table-fixed border-collapse">
          <thead>
            <tr>
              <th className="w-[34%]">Participant</th>
              <th className="w-[28%]">Worker</th>
              <th className="w-[18%]">Shift</th>
              <th className="w-[20%]">Action</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => {
              const review = shiftNoteReview(shift, notes, new Date(), evidence);
              return (
                <tr key={shift.id}>
                  <td className="tl-text truncate font-bold">{shift.participant_name || '—'}</td>
                  <td className="tl-muted truncate">{shift.employee_name || 'Unfilled'}</td>
                  <td className="tl-muted">{shift.start_time || '—'}</td>
                  <td>
                    {review.state !== 'missing' ? (
                      <span className={`tl-pill tl-${review.tone}`}>{review.label}</span>
                    ) : (
                      <button type="button" onClick={() => chase(shift)} className="tl-btn tl-primary !px-1.5 !py-1 !text-[9.5px]">
                        <Send className="h-2.5 w-2.5" /> Chase
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!shifts.length ? (
              <tr>
                <td colSpan={4} className="tl-muted py-4 text-center text-[11px]">
                  No shifts scheduled today.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
      <p className="tl-muted mt-2 px-1 text-[9.5px]">Notes matched by participant and service date need review. A name match does not verify completion for an individual shift.</p>
    </div>
  );
}