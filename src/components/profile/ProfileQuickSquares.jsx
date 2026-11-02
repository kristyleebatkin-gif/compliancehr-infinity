import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, BellRing, CalendarClock, Target, Receipt, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmployeeProfileSection from '@/components/profile/EmployeeProfileSection';
import MyAvailability from '@/components/rostering/MyAvailability';

/* Coloured squares at the top of the records column. Staff: Timesheets, Alerts
   & Availability, then Emergency Information. Participants: Roster, Goals,
   Steps & Invoice Copies (no timesheets or availability), then Emergency
   Information with their Personal Emergency Plan. Intake Readiness now lives
   with the forms column in the profile layout. */
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
    enabled: isStaff,
    queryKey: ['profile-quick-availability', profile.full_name],
    queryFn: async () => (await base44.entities.StaffAvailability.filter({ staff_name: profile.full_name }, { sort: '-date', limit: 8 })).items || [],
  });

  const goals = useQuery({
    enabled: !isStaff,
    queryKey: ['profile-quick-goals', profile.id],
    queryFn: async () => (await base44.entities.ParticipantGoalProgress.filter({ participant_id: profile.id }, { sort: '-date', limit: 6 })).items || [],
  });

  const invoices = useQuery({
    enabled: !isStaff,
    queryKey: ['profile-quick-invoices', profile.id],
    queryFn: async () => (await base44.entities.ProviderInvoice.filter({ participant_id: profile.id }, { sort: '-created_date', limit: 6 })).items || [],
  });

  const emergencyPlan = useQuery({
    enabled: !isStaff,
    queryKey: ['profile-quick-emergency-plan', profile.id],
    queryFn: async () => {
      const page = await base44.entities.ParticipantDocument.filter({ participant_id: profile.id, document_type: { $in: ['Personal Emergency Form', 'Personal Emergency Record'] } }, { sort: '-created_date', limit: 1 });
      return page.items?.[0] || null;
    },
  });

  const shiftList = shifts.data || [];
  const alertList = alerts.data || [];
  const availabilityList = availability.data || [];
  const goalList = goals.data || [];
  const invoiceList = invoices.data || [];

  const openEmergencyPlan = async () => {
    const doc = emergencyPlan.data;
    if (!doc) return;
    const src = doc.file_url || (doc.file_uri ? (await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri })).signed_url : '');
    if (src) window.open(src, '_blank', 'noopener');
  };

  const GRADIENT_BORDER_STYLE = {
    border: '2px solid transparent',
    background:
      'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%) border-box',
  };
  const Row = ({ children }) => (
    <li
      className="break-words rounded-lg px-2.5 py-1 text-[11px] font-bold leading-relaxed text-[#0A2B6D]"
      style={GRADIENT_BORDER_STYLE}
    >
      <span style={{ color: '#0072FF' }}>◉</span> {children}
    </li>
  );
  const MiniTitle = ({ icon: Icon, children }) => (
    <p
      className="mb-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold text-[#0A2B6D]"
      style={GRADIENT_BORDER_STYLE}
    >
      <Icon className="h-3 w-3 text-[#5A00D6]" />
      <span style={{ color: '#0A2B6D' }}>{children}</span>
    </p>
  );
  const dateOnly = (value) => (value ? String(value).slice(0, 10) : '');

  const rosterBlock = (
    <div>
      <MiniTitle icon={Clock}>Roster Connection</MiniTitle>
      {shifts.isPending ? <p className="text-[11px] text-black">Loading shifts…</p>
        : shiftList.length ? <ul className="space-y-1">{shiftList.slice(0, 6).map((s) => <Row key={s.id}>{dateOnly(s.date)} · {s.start_time || ''}{s.end_time ? `-${s.end_time}` : ''} · {s.status || 'Scheduled'}</Row>)}</ul>
        : <p className="text-[11px] text-black">No shifts in the last four weeks.</p>}
    </div>
  );

  const alertsBlock = (
    <div>
      <MiniTitle icon={BellRing}>My Alerts</MiniTitle>
      {personal
        ? (alerts.isPending ? <p className="text-[11px] text-black">Loading alerts…</p>
          : alertList.length ? <ul className="space-y-1">{alertList.slice(0, 4).map((n) => <Row key={n.id}>{dateOnly(n.created_date)} · {n.type}: {n.message}</Row>)}</ul>
          : <p className="text-[11px] text-black">No alerts addressed to you.</p>)
        : <p className="text-[11px] text-black">Alerts are visible to the person themself on their own profile.</p>}
    </div>
  );

  return <>
    {isStaff
      ? <EmployeeProfileSection title="Timesheets, Alerts & Availability" tone="violet" uniform defaultOpen>
        <div className="space-y-1.5">
          {rosterBlock}
          {alertsBlock}
          <div>
            <MiniTitle icon={CalendarClock}>Availability</MiniTitle>
            {personal ? <MyAvailability />
              : availability.isPending ? <p className="text-[11px] text-black">Loading availability…</p>
              : availabilityList.length ? <ul className="space-y-1">{availabilityList.map((a) => <Row key={a.id}>{dateOnly(a.date)} · {a.type}{a.all_day ? ' · All day' : a.start_time ? ` · ${a.start_time}${a.end_time ? `-${a.end_time}` : ''}` : ''}</Row>)}</ul>
              : <p className="text-[11px] text-black">No availability recorded yet.</p>}
          </div>
        </div>
      </EmployeeProfileSection>
      : <EmployeeProfileSection title="Roster, Goals, Steps & Invoices" tone="violet" uniform defaultOpen>
        <div className="space-y-1.5">
          {rosterBlock}
          <div>
            <MiniTitle icon={Target}>Goals & Steps</MiniTitle>
            {goals.isPending ? <p className="text-[11px] text-black">Loading goals…</p>
              : goalList.length ? <ul className="space-y-1">{goalList.map((g) => <Row key={g.id}>{dateOnly(g.date)} · {g.goal}{g.progress_pct != null ? ` · ${g.progress_pct}% towards goal` : ''}{g.achievement ? ` · ${g.achievement}` : g.progress_towards_goal ? ` · ${g.progress_towards_goal}` : ''}</Row>)}</ul>
              : <p className="text-[11px] text-black">No goal progress recorded yet.</p>}
          </div>
          <div>
            <MiniTitle icon={Receipt}>Invoice Copies</MiniTitle>
            {invoices.isPending ? <p className="text-[11px] text-black">Loading invoices…</p>
              : invoiceList.length ? <ul className="space-y-1">{invoiceList.map((inv) => <Row key={inv.id}>{inv.invoice_number || 'Invoice'} · {inv.status || 'Issued'}{inv.total != null ? ` · $${inv.total}` : ''}</Row>)}</ul>
              : <p className="text-[11px] text-black">No invoice copies on file yet.</p>}
          </div>
          {alertsBlock}
        </div>
      </EmployeeProfileSection>}
    <EmployeeProfileSection title="Emergency Information" tone="pink" uniform defaultOpen>
      <ul className="space-y-1">
        <Row>Emergency contact: {profile.emergency_contact || 'Not recorded yet'}</Row>
        <Row>Emergency phone: {profile.emergency_contact_phone || 'Not recorded yet'}</Row>
      </ul>
      {!isStaff && <div className="mt-1.5">
        <MiniTitle icon={ShieldCheck}>Personal Emergency Plan</MiniTitle>
        {emergencyPlan.isPending ? <p className="text-[11px] text-black">Loading plan…</p>
          : emergencyPlan.data
            ? <Button size="sm" variant="outline" className="mt-1 h-6 bg-white px-2 text-[11px] text-black" onClick={openEmergencyPlan}>Open {emergencyPlan.data.title || 'Personal Emergency Plan'}</Button>
            : <p className="text-[11px] text-black">No personal emergency plan on file yet. Upload one (Personal Emergency Form or Record) in the Document Vault.</p>}
      </div>}
      <p className="mt-1 text-[11px] text-black">Update contact details in the Details form.</p>
    </EmployeeProfileSection>
  </>;
}