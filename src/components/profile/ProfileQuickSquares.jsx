import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, BellRing, CalendarClock } from 'lucide-react';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';
import MyAvailability from '@/components/rostering/MyAvailability';
import IntakeCaseWorkflow from '@/components/intake/IntakeCaseWorkflow';

/* The three coloured squares at the top of the right-hand profile column:
   1. Timesheets, Alerts & Availability  2. Emergency Information  3. Intake Readiness. */
export default function ProfileQuickSquares({ profile, kind, personal = false }) {
  const isStaff = kind === 'staff';

  const shifts = useQuery({
    queryKey: ['profile-quick-shifts', profile.id, kind, personal],
    queryFn: async () => {
      if (personal && isStaff) {
        const from = new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
        const to = new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10);
        try {
          const res = await base44.functions.invoke('employeeRoster', { action: 'list', from, to });
          return res.data?.items || [];
        } catch { /* fall back to the register below */ }
      }
      const page = await base44.entities.Shift.filter(isStaff ? { employee_name: profile.full_name } : { participant_name: profile.full_name }, { sort: '-date', limit: 10 });
      return page.items || [];
    },
  });

  const alerts = useQuery({
    queryKey: ['profile-quick-alerts', profile.id, personal],
    queryFn: async () => {
      if (!personal) return [];
      const me = await base44.auth.me();
      const page = await base44.entities.Notification.filter({ recipient_id: me.id }, { sort: '-created_date', limit: 8 });
      return page.items || [];
    },
  });

  const availability = useQuery({
    queryKey: ['profile-quick-availability', profile.full_name],
    queryFn: async () => (await base44.entities.StaffAvailability.filter({ staff_name: profile.full_name }, { sort: '-date', limit: 8 })).items || [],
  });

  const shiftList = shifts.data || [];
  const alertList = alerts.data || [];
  const availabilityList = availability.data || [];

  const Row = ({ children }) => <li className="break-words rounded-md bg-white px-2 py-1 text-[11px] leading-relaxed text-black">{children}</li>;
  const MiniTitle = ({ icon: Icon, children }) => <p className="flex items-center gap-1 text-[11px] font-bold text-black"><Icon className="h-3 w-3" />{children}</p>;
  const dateOnly = (value) => (value ? String(value).slice(0, 10) : '');

  return <>
    <EmployeeProfileSection title="Timesheets, Alerts & Availability" tone="violet" uniform defaultOpen>
      <div className="space-y-1.5">
        <div>
          <MiniTitle icon={Clock}>Timesheets</MiniTitle>
          {shifts.isPending ? <p className="text-[11px] text-black">Loading shifts…</p>
            : shiftList.length ? <ul className="space-y-1">{shiftList.slice(0, 6).map((s) => <Row key={s.id}>{dateOnly(s.date)} · {s.start_time || ''}{s.end_time ? `-${s.end_time}` : ''} · {s.status || 'Scheduled'}</Row>)}</ul>
            : <p className="text-[11px] text-black">No shifts in the last four weeks.</p>}
        </div>
        <div>
          <MiniTitle icon={BellRing}>My Alerts</MiniTitle>
          {personal
            ? (alerts.isPending ? <p className="text-[11px] text-black">Loading alerts…</p>
              : alertList.length ? <ul className="space-y-1">{alertList.slice(0, 4).map((n) => <Row key={n.id}>{dateOnly(n.created_date)} · {n.type}: {n.message}</Row>)}</ul>
              : <p className="text-[11px] text-black">No alerts addressed to you.</p>)
            : <p className="text-[11px] text-black">Alerts are visible to the person themself on their own profile.</p>}
        </div>
        <div>
          <MiniTitle icon={CalendarClock}>Availability</MiniTitle>
          {personal && isStaff ? <MyAvailability />
            : availability.isPending ? <p className="text-[11px] text-black">Loading availability…</p>
            : availabilityList.length ? <ul className="space-y-1">{availabilityList.map((a) => <Row key={a.id}>{dateOnly(a.date)} · {a.type}{a.all_day ? ' · All day' : a.start_time ? ` · ${a.start_time}${a.end_time ? `-${a.end_time}` : ''}` : ''}</Row>)}</ul>
            : <p className="text-[11px] text-black">No availability recorded yet.</p>}
        </div>
      </div>
    </EmployeeProfileSection>
    <EmployeeProfileSection title="Emergency Information" tone="pink" uniform defaultOpen>
      <ul className="space-y-1">
        <Row>Emergency contact: {profile.emergency_contact || 'Not recorded yet'}</Row>
        <Row>Emergency phone: {profile.emergency_contact_phone || 'Not recorded yet'}</Row>
      </ul>
      <p className="mt-1 text-[11px] text-black">Update these in the Details form below.</p>
    </EmployeeProfileSection>
    <EmployeeProfileSection title="Intake Readiness" tone="green" uniform>
      <IntakeCaseWorkflow intakeType={isStaff ? 'Employee' : 'Participant'} profile={profile} profileView="readiness" />
    </EmployeeProfileSection>
  </>;
}