import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, UserX, Users, FileWarning, GraduationCap } from 'lucide-react';
import SectionCard from '@/components/SectionCard';
import EmptyState from '@/components/EmptyState';
import { format } from 'date-fns';
import { findUnassigned, findDoubleBookings, findMissingInstructions, findSkillMismatches } from '@/lib/rosterValidation';
import RosterRulesPanel from '@/components/rostering/RosterRulesPanel';
import RosterExceptionTable from '@/components/rostering/RosterExceptionTable';

const label = (s) => `${s.date ? format(new Date(s.date + 'T00:00:00'), 'd MMM') : '?'} · ${s.start_time || '?'}–${s.end_time || '?'} · ${s.participant_name || 'no participant'}${s.location ? ` · ${s.location}` : ''}`;

// Cross-entity validation panel: configurable rules over shifts — unassigned shifts,
// double-bookings, missing instructions and staff skill mismatches.
// Rules can be switched on/off in the RosterValidationRule register.
export default function RosterExceptions({ shifts = [], onEdit }) {
  const [rules, setRules] = useState(null);
  const [staff, setStaff] = useState([]);
  const [participants, setParticipants] = useState([]);

  const updateRule = (updated) => setRules((prev) => (prev || []).map((r) => (r.id === updated.id ? updated : r)));

  useEffect(() => {
    let live = true;
    base44.entities.RosterValidationRule.list({ limit: 50 }).then((p) => { if (live) setRules(p.items || []); }).catch(() => { if (live) setRules([]); });
    base44.entities.StaffProfile.list({ limit: 200 }).then((p) => { if (live) setStaff(p.items || []); }).catch(() => {});
    base44.entities.ParticipantProfile.list({ limit: 200 }).then((p) => { if (live) setParticipants(p.items || []); }).catch(() => {});
    return () => { live = false; };
  }, []);

  const enabled = (key) => !rules || rules.filter((r) => r.rule_key === key).every((r) => r.enabled !== false);

  const unassigned = enabled('unassigned') ? findUnassigned(shifts) : [];
  const doubleBooked = enabled('double_booking') ? findDoubleBookings(shifts) : [];
  const missingInstructions = enabled('missing_instructions') ? findMissingInstructions(shifts) : [];
  const skillMismatches = enabled('skill_mismatch') ? findSkillMismatches(shifts, staff, participants) : [];

  const group = (icon, title, tone, items, render) => (
    <RosterExceptionTable icon={icon} title={title} tone={tone} items={items} render={render} />
  );

  const quiet = unassigned.length === 0 && doubleBooked.length === 0 && missingInstructions.length === 0 && skillMismatches.length === 0;

  return (
    <SectionCard
      title="Roster exceptions"
      description="Unassigned shifts, double-bookings, shifts missing participant instructions and staff skill mismatches — review before the week goes live"
      action={<RosterRulesPanel rules={rules} onUpdated={updateRule} />}
    >
      {quiet ? (
        <EmptyState icon={AlertTriangle} title="No roster exceptions" subtitle="Every shift is assigned, booked cleanly, carries instructions and matches staff skills." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {group(<UserX className="h-4 w-4 text-warning" />, 'Unassigned shifts', 'bg-warning/15 text-warning', unassigned,
            (s) => <button className="hover:underline" onClick={() => onEdit?.(s)}>{label(s)}</button>)}
          {group(<Users className="h-4 w-4 text-danger" />, 'Double-bookings', 'bg-danger/15 text-danger', doubleBooked,
            (d) => <button className="hover:underline" onClick={() => onEdit?.(d.a)}><span className="font-semibold">{d.a[d.field]}</span> is double-booked: {label(d.a)} vs {label(d.b)}</button>)}
          {group(<FileWarning className="h-4 w-4 text-brand" />, 'Missing instructions', 'bg-brand/15 text-brand', missingInstructions,
            (s) => <button className="hover:underline" onClick={() => onEdit?.(s)}>{label(s)}</button>)}
          {group(<GraduationCap className="h-4 w-4 text-teal" />, 'Skill mismatches', 'bg-teal/15 text-teal', skillMismatches,
            (s) => <button className="hover:underline" onClick={() => onEdit?.(s)}><span className="font-semibold">{s.employee_name}</span> may lack the skills {s.participant_name} needs{onEdit ? '' : ''}</button>)}
        </div>
      )}
    </SectionCard>
  );
}