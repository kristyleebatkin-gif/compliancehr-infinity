import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { statusTone } from '@/lib/statusStyles';

export default function ParticipantShiftsTab({ participant }) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    base44.entities.Shift.filter(
      { participant_name: participant.full_name },
      { sort: '-date', limit: 200 },
    )
      .then((page) => setShifts(page.items || []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [participant.full_name]);

  if (loading) return <div className="py-4 text-center text-sm text-foreground/50">Loading shifts...</div>;
  if (shifts.length === 0) {
    return <div className="py-4 text-center text-sm text-foreground/50">No shifts rostered for this participant.</div>;
  }
  return (
    <div className="space-y-2">
      {shifts.map((shift) => (
        <div key={shift.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">
              {shift.date} · {shift.start_time || ''}{shift.end_time ? ` – ${shift.end_time}` : ''}
            </div>
            <div className="truncate text-xs text-foreground/50">
              {shift.employee_name ? `${shift.employee_name} · ` : ''}{shift.service_type || 'Support'}{shift.location ? ` · ${shift.location}` : ''}
            </div>
          </div>
          <span className={`shrink-0 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone(shift.status)}`}>{shift.status || 'Scheduled'}</span>
        </div>
      ))}
    </div>
  );
}