import React from 'react';
import { Link } from 'react-router-dom';
import { Panel, Row, Pill, Empty } from '@/components/today/todayUi';

const hasNote = (shift, notes) =>
  notes.some(
    (note) =>
      (note.person_name && note.person_name === shift.participant_name) ||
      (note.subject && shift.participant_name && note.subject.includes(shift.participant_name))
  );

export default function RosterTodayPanel({ shifts, notes }) {
  return (
    <Panel
      title="Roster today"
      subtitle={`${shifts.length} shifts scheduled`}
      action={
        <Link to="/rostering" className="t-muted text-[11.5px] font-bold hover:underline">
          Open roster
        </Link>
      }
    >
      {shifts.length === 0 ? (
        <Empty>No shifts scheduled for today.</Empty>
      ) : (
        <div className="divide-y divide-[#0A2B6D]/6">
          {shifts.slice(0, 6).map((shift) => {
            const noted = hasNote(shift, notes);
            return (
              <Row key={shift.id}>
                <div className="min-w-0 flex-1">
                  <p className="t-title truncate text-[12.5px] font-bold">
                    {shift.employee_name || 'Unfilled shift'}
                  </p>
                  <p className="t-muted mt-0.5 truncate text-[11px]">
                    {shift.participant_name || 'No participant'} · {shift.start_time || '—'}
                    {shift.end_time ? `–${shift.end_time}` : ''}
                  </p>
                </div>
                <Pill tone={noted ? 'green' : 'amber'}>{noted ? 'Note in' : 'Note missing'}</Pill>
              </Row>
            );
          })}
        </div>
      )}
    </Panel>
  );
}