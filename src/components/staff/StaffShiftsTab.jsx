import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { statusTone } from '@/lib/statusStyles';

export default function StaffShiftsTab({ staff }) {
  const [shifts, setShifts] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      base44.entities.Shift.filter(
        { employee_name: staff.full_name },
        { sort: '-date', limit: 200 },
      ),
      base44.entities.StaffAvailability.filter(
        { staff_name: staff.full_name },
        { sort: '-date', limit: 200 },
      ),
    ])
      .then(([shiftPage, availPage]) => {
        setShifts(shiftPage.items || []);
        setAvailability(availPage.items || []);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [staff.full_name]);

  if (loading) return <div className="py-4 text-center text-sm text-foreground/50">Loading shifts and availability...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground/60">Shifts</h3>
        {shifts.length === 0 ? (
          <div className="py-4 text-center text-sm text-foreground/50">No shifts rostered for this staff member.</div>
        ) : (
          <div className="space-y-2">
            {shifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {shift.date} · {shift.start_time || ''}{shift.end_time ? ` – ${shift.end_time}` : ''}
                  </div>
                  <div className="truncate text-xs text-foreground/50">
                    {shift.participant_name ? `${shift.participant_name} · ` : ''}{shift.service_type || 'Support'}{shift.location ? ` · ${shift.location}` : ''}
                  </div>
                </div>
                <span className={`shrink-0 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone(shift.status)}`}>{shift.status || 'Scheduled'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground/60">Availability</h3>
        {availability.length === 0 ? (
          <div className="py-4 text-center text-sm text-foreground/50">No availability records for this staff member.</div>
        ) : (
          <div className="space-y-2">
            {availability.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {entry.date}{entry.all_day ? ' · All day' : ` · ${entry.start_time || ''}${entry.end_time ? ` – ${entry.end_time}` : ''}`}
                  </div>
                  {entry.notes ? <div className="truncate text-xs text-foreground/50">{entry.notes}</div> : null}
                </div>
                <span className={`shrink-0 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone(entry.type === 'Unavailable' ? 'Unavailable' : 'Available')}`}>{entry.type || 'Available'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}