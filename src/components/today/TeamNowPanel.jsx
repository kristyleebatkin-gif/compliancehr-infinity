import React, { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Panel, Row, Pill, Empty } from '@/components/today/todayUi';

const statusFor = (member, shifts) => {
  if (member.status === 'On Leave') return { label: 'On leave', tone: 'gray' };
  const shift = shifts.find((item) => item.employee_name === member.full_name);
  if (!shift) return { label: 'Available', tone: 'green' };
  if (shift.clock_in && !shift.clock_out) return { label: 'On shift', tone: 'blue' };
  if (shift.status === 'Completed') return { label: 'Finished', tone: 'gray' };
  return { label: shift.start_time ? `From ${shift.start_time}` : 'Scheduled', tone: 'amber' };
};

export default function TeamNowPanel({ team, shifts, notes }) {
  const [extract, setExtract] = useState(false);

  const summary = useMemo(() => {
    const withIssue = notes.filter((note) => note.issues_concerns || note.incident_report);
    const participants = [...new Set(notes.map((note) => note.person_name).filter(Boolean))];
    return {
      notes: notes.length,
      issues: withIssue.length,
      participants: participants.length
    };
  }, [notes]);

  return (
    <Panel title="Team right now" subtitle={`${team.length} people in the workspace`}>
      {team.length === 0 ? (
        <Empty>No employee profiles have been added yet.</Empty>
      ) : (
        <div className="divide-y divide-[#0A2B6D]/6">
          {team.slice(0, 6).map((member) => {
            const status = statusFor(member, shifts);
            return (
              <Row key={member.id}>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#0A2B6D]/8 text-[10.5px] font-extrabold text-[#0A2B6D]">
                  {(member.full_name || '?').slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="t-title truncate text-[12.5px] font-bold">{member.full_name}</p>
                  <p className="t-muted truncate text-[10.5px]">{member.position || member.role || 'Team member'}</p>
                </div>
                <Pill tone={status.tone}>{status.label}</Pill>
              </Row>
            );
          })}
        </div>
      )}

      <div className="mt-2.5 rounded-xl border border-[#C7B6FF]/50 bg-white/60 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-extrabold text-[#0A2B6D]">Shift-note extractor</p>
          <button type="button" onClick={() => setExtract(!extract)} className="t-btn t-btn-ghost !px-2 !py-1 !text-[10.5px]">
            <Sparkles className="h-3 w-3" /> {extract ? 'Hide' : 'Extract'}
          </button>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-[#2E4472]">
          {extract
            ? `${summary.notes} notes today across ${summary.participants} participants. ${summary.issues} mention an issue or incident — review them in Communication.`
            : 'Summarise today’s shift notes in one pass.'}
        </p>
      </div>
    </Panel>
  );
}