import React, { useState, useEffect } from 'react';
import {
  CalendarDays, Wand2, CheckCircle2, ClipboardList, Users,
  Sparkles, FileText, Send, Plus, TrendingUp, Award, Clock,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { downloadMeetingMinutesPdf } from '@/lib/meetingPdf';

const HEADER_GRADIENT =
  'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';

export const MASTERPIECE_MEETING_PRESETS = [
  {
    id: 'board-governance',
    title: '2026 Executive Board & NDIS Governance Review',
    meeting_type: 'Governance / Board',
    duration: '60 mins',
    location: 'Executive Boardroom & Online Video Link',
    purpose: 'Review 356-checkpoint Master Compliance Audit status, financial KPIs, reportable incidents, and strategic resolutions.',
    color: '#4f46e5',
    agenda:
      '1. Welcome, Quorum & Conflict of Interest Declarations\n2. Confirmation of Previous Board Minutes & Action Register\n3. Master Compliance Audit Checklist (CHR-AUD-001 & 002) Status\n4. NDIS Reportable Incidents, WHS Risks & Safeguarding Review\n5. Financial Performance, NDIS Claims & Budget Utilisation\n6. Formal Board Resolutions & Delegated Authorities\n7. Next Meeting Date & Close',
  },
  {
    id: 'ndis-compliance',
    title: 'Monthly NDIS Practice Standards & Expiry Audit Clinic',
    meeting_type: 'Compliance Review',
    duration: '45 mins',
    location: 'Compliance Command Centre',
    purpose: 'Audit 100-point staff screening, expiring certificates, participant 3-part consents, and open compliance issues.',
    color: '#7c3aed',
    agenda:
      '1. Attendance & Compliance Score Overview\n2. 100-Point Staff Screening & Worker Orientation Audit\n3. Participant Service Agreements & 3-Part Consent Verification\n4. Document Vault 30-Day Expiry Scan Results\n5. Corrective Actions Assigned to Owners with Target Dates',
  },
  {
    id: 'staff-handover',
    title: 'All-Hands Support Team Roster, Shift Notes & Safety Briefing',
    meeting_type: 'Staff Meeting',
    duration: '30 mins',
    location: 'Main Office & Mobile Team Dial-In',
    purpose: 'Align support workers on weekly roster coverage, participant goals, Take-5 safety checks, and shared to-do tasks.',
    color: '#0891b2',
    agenda:
      '1. Team Shoutouts & Task Leaderboard Recognition\n2. Weekly Roster Coverage, Open Shifts & Buddy Shifts\n3. Participant Goal Progress & High-Support Shift Notes\n4. Take-5 Pre-Shift Safety, Vehicle & Kit Reminders\n5. Shared To-Do Command Board Sign-Offs',
  },
  {
    id: 'participant-care',
    title: 'Participant 10-Weekly Plan, Goal & Safeguard Review',
    meeting_type: 'Participant Planning',
    duration: '45 mins',
    location: 'Participant Home / Consultation Room',
    purpose: 'Collaborate with participant, nominee, and support coordinator on goal attainment, budget, and risk controls.',
    color: '#db2777',
    agenda:
      '1. Participant Voice: What is Working Well & Preferences\n2. NDIS Goal Progress & 10-Weekly Snapshot Review\n3. Individual & Home Risk Assessment + Medication Consent Check\n4. Plan Budget Utilisation & Schedule of Supports\n5. Agreed Next Steps, Owners & Target Dates',
  },
  {
    id: 'incident-risk-clinic',
    title: 'Incident Root-Cause, WHS Hazard & Emergency Drill Review',
    meeting_type: 'Incident / Risk Review',
    duration: '45 mins',
    location: 'Safety & Safeguarding Hub',
    purpose: 'Evaluate recent incidents, 24h/5d NDIS Commission notifications, hierarchy of controls, and emergency drills.',
    color: '#dc2626',
    agenda:
      '1. 24-Hour & 5-Day NDIS Reportable Incident SLA Verification\n2. Root-Cause Investigations & Participant Wellbeing Check\n3. New Hazards, Near Misses & Hierarchy of Controls\n4. 6-Monthly Fire Drill & First Aid Kit Readiness\n5. Preventive Actions Sent to Continuous Improvement Register',
  },
  {
    id: 'quality-sprint',
    title: 'Continuous Improvement (CIR) & Stakeholder Feedback Sprint',
    meeting_type: 'Quality & Improvement',
    duration: '40 mins',
    location: 'Quality Assurance Studio',
    purpose: 'Convert participant feedback, survey results, and audit findings into closed continuous improvement evidence.',
    color: '#16a34a',
    agenda:
      '1. Complaints & Feedback SLA Resolution Summary\n2. Participant & Staff Satisfaction Survey Insights\n3. Open Continuous Improvement Register (CIR) Items\n4. Verification of Completed Improvement Evidence\n5. New Quality Priorities & Task Assignments',
  },
];

export default function MeetingMasterpieceSuite({
  meetings = [],
  onQuickSchedulePreset,
  onRefreshMeetings,
}) {
  const { toast } = useToast();
  const [staff, setStaff] = useState([]);
  const [allMeetingTasks, setAllMeetingTasks] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [smartMinutes, setSmartMinutes] = useState({
    quorum: 'Quorum confirmed — Managing Director (Kristy Lee Whelan) & Key Personnel present.',
    resolutions:
      'RESOLUTION 2026-01: That the 2026 Master Compliance Audit Checklist (CHR-AUD-001 & CHR-AUD-002) and current NDIS Practice Standards evidence register be accepted as true and accurate. (CARRIED UNANIMOUSLY)',
    discussion:
      '• Reviewed 100-point staff credential currency and NDIS Worker Screening statuses.\n• Verified 24-hour and 5-day reportable incident timers and risk hierarchy controls.\n• Confirmed shift-to-invoice reconciliation and participant 10-weekly progress reviews.',
    assessment: '100% 2026 Governance & NDIS Standard alignment achieved. Clear owners and due dates assigned.',
    newActionTitle: '',
    newActionOwner: '',
    newActionDue: new Date().toISOString().slice(0, 10),
  });
  const [savingSmart, setSavingSmart] = useState(false);

  const loadTasksAndStaff = async () => {
    try {
      const [staffPage, taskPage] = await Promise.all([
        base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 50 }).catch(() => ({ items: [] })),
        base44.entities.TodoTask.filter({ linked_entity_type: 'Meeting' }, { sort: '-created_date', limit: 100 }).catch(() => ({ items: [] })),
      ]);
      setStaff(staffPage?.items || []);
      setAllMeetingTasks(taskPage?.items || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadTasksAndStaff();
  }, [meetings.length]);

  useEffect(() => {
    if (!selectedMeetingId && meetings.length > 0) {
      setSelectedMeetingId(meetings[0].id);
    }
  }, [meetings, selectedMeetingId]);

  const activeMeeting = meetings.find((m) => m.id === selectedMeetingId) || meetings[0];

  const handleSmartFillMinutesAndSave = async () => {
    if (!activeMeeting) {
      toast({
        title: 'Schedule or select a meeting first',
        description: 'Click any of the 6 Masterpiece Meeting Presets above to create a meeting in 1 click!',
      });
      return;
    }
    setSavingSmart(true);
    try {
      const attendeeNames =
        activeMeeting.attendees ||
        staff.slice(0, 5).map((s) => s.full_name).filter(Boolean).join(', ') ||
        'Kristy Lee Whelan, Compliance Manager, Team Leader, Roster Coordinator';
      const compiledMinutes = [
        `=== 2026 COMPLIANT GOVERNANCE MINUTES (${activeMeeting.title}) ===`,
        `QUORUM & ATTENDANCE: ${smartMinutes.quorum}`,
        `ATTENDEES PRESENT: ${attendeeNames}`,
        ``,
        `KEY DISCUSSION & REGISTER REVIEW:`,
        smartMinutes.discussion,
        ``,
        `FORMAL RESOLUTIONS & DECISIONS:`,
        smartMinutes.resolutions,
      ].join('\n');

      await base44.entities.Meeting.update(activeMeeting.id, {
        attendance: `Present: ${attendeeNames} | Apologies: Nil`,
        minutes: compiledMinutes,
        assessment: smartMinutes.assessment,
        status: 'Completed',
      });

      if (smartMinutes.newActionTitle.trim()) {
        await base44.entities.TodoTask.create({
          title: smartMinutes.newActionTitle.trim(),
          assigned_to: smartMinutes.newActionOwner || 'Kristy Lee Whelan',
          due_date: smartMinutes.newActionDue || new Date().toISOString().slice(0, 10),
          priority: 'High',
          status: 'Open',
          task_type: 'Meeting Action',
          module: 'Meeting Centre',
          linked_entity_type: 'Meeting',
          linked_entity_id: activeMeeting.id,
        });
      }

      toast({
        title: '2026 Smart-Fill Minutes & Resolutions Saved!',
        description: `"${activeMeeting.title}" is now marked Completed with full 2026 audit-ready minutes.`,
      });
      setSmartMinutes((prev) => ({ ...prev, newActionTitle: '' }));
      await loadTasksAndStaff();
      if (onRefreshMeetings) await onRefreshMeetings();
    } finally {
      setSavingSmart(false);
    }
  };

  const handleCompleteTaskQuick = async (task) => {
    const today = new Date().toISOString().slice(0, 10);
    await base44.entities.TodoTask.update(task.id, {
      status: 'Completed',
      completed_date: today,
      completed_by: 'Kristy Lee Whelan',
      signed_off_by: 'Kristy Lee Whelan',
      signed_off_date: today,
    });
    toast({
      title: 'Meeting Task Completed & Signed Off!',
      description: `"${task.title}" has been marked Completed.`,
    });
    await loadTasksAndStaff();
    if (onRefreshMeetings) await onRefreshMeetings();
  };

  const handleSendTaskToImprovement = async (task) => {
    await base44.entities.ImprovementAction.create({
      title: task.title,
      description: `Actioned from Meeting Centre follow-up task: ${task.title}`,
      date_identified: new Date().toISOString().slice(0, 10),
      area_department: 'Meetings & Governance',
      source: 'Other',
      priority: task.priority || 'High',
      improvement_action_required: task.title,
      owner: task.assigned_to || 'Kristy Lee Whelan',
      target_date: task.due_date || new Date().toISOString().slice(0, 10),
      status: 'Identified',
      linked_entity_type: 'Task',
      linked_entity_id: task.id,
    });
    toast({
      title: 'Logged in Continuous Improvement Register!',
      description: `"${task.title}" is now tracked in Quality & Improvement.`,
    });
  };

  return (
    <div className="space-y-3">
      {/* SECTION 1: 6 MASTERPIECE 1-CLICK MEETING PRESETS */}
      <div className="overflow-hidden rounded-2xl border-2 border-purple-500 bg-white shadow-sm">
        <div
          className="app-section-card-header flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-white"
          style={{ background: HEADER_GRADIENT }}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-white" />
              <h3 className="font-body text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                Masterpiece 1-Click Smart Meeting Templates (2026 NDIS, Governance, HR &amp; Safety)
              </h3>
            </div>
            <p className="font-body text-[8px] font-bold text-white">
              Click any preset below to pre-fill a complete 2026-compliant agenda, purpose, duration, and structure in one click.
            </p>
          </div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-body text-[7.5px] font-black text-white">
            6 Smart Presets Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 p-2">
          {MASTERPIECE_MEETING_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="flex flex-col justify-between rounded-xl border-2 bg-white p-2 shadow-sm"
              style={{
                borderColor: preset.color,
                borderTopWidth: '4px',
                background: `linear-gradient(155deg, ${preset.color}12 0%, #ffffff 85%)`,
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="rounded-full px-2 py-0.5 font-body text-[7px] font-black uppercase tracking-wider text-white"
                    style={{ background: preset.color }}
                  >
                    {preset.meeting_type}
                  </span>
                  <span className="font-body text-[7.5px] font-extrabold text-purple-900">
                    {preset.duration}
                  </span>
                </div>
                <h4 className="mt-1 font-body text-[10px] font-black text-blue-950 leading-snug">
                  {preset.title}
                </h4>
                <p className="mt-0.5 font-body text-[7.5px] font-semibold text-blue-900/90 leading-snug">
                  {preset.purpose}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onQuickSchedulePreset && onQuickSchedulePreset(preset)}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1 font-body text-[7.8px] font-black text-white shadow-sm hover:opacity-95"
                style={{ background: preset.color }}
              >
                <Wand2 className="h-3 w-3 text-white" /> Use This Smart Preset
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: 2026 SMART-FILL MINUTES, QUORUM & FORMAL RESOLUTIONS STUDIO */}
      <div className="overflow-hidden rounded-2xl border-2 border-pink-500 bg-white shadow-sm">
        <div
          className="app-section-card-header flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-white"
          style={{ background: HEADER_GRADIENT }}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <Wand2 className="h-4 w-4 text-white" />
              <h3 className="font-body text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                2026 Smart-Fill Quorum, Minutes, Resolutions &amp; Instant Task Generator
              </h3>
            </div>
            <p className="font-body text-[8px] font-bold text-white">
              Select any meeting to auto-populate quorum, staff attendance, formal board resolutions, and create/complete follow-up tasks in one step.
            </p>
          </div>
          {activeMeeting && (
            <button
              type="button"
              onClick={() => downloadMeetingMinutesPdf(activeMeeting)}
              className="rounded-full bg-white px-2.5 py-1 font-body text-[8px] font-black text-blue-950 shadow-sm hover:bg-pink-50"
            >
              Download Signed Minutes PDF
            </button>
          )}
        </div>

        <div className="p-2.5 space-y-2 text-[8px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="font-extrabold text-blue-950">1. Select Target Meeting</label>
              <select
                value={selectedMeetingId}
                onChange={(e) => setSelectedMeetingId(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-purple-300 bg-purple-50/50 px-2 py-1.5 font-bold text-blue-950"
              >
                {meetings.length === 0 ? (
                  <option value="">No meetings yet — click a preset above!</option>
                ) : (
                  meetings.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.date || 'Unscheduled'} · {m.status})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="font-extrabold text-blue-950">2. Quorum &amp; Governance Declaration</label>
              <input
                type="text"
                value={smartMinutes.quorum}
                onChange={(e) => setSmartMinutes({ ...smartMinutes, quorum: e.target.value })}
                className="mt-0.5 w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 font-semibold text-blue-950"
              />
            </div>

            <div>
              <label className="font-extrabold text-blue-950">3. Meeting Quality &amp; Audit Assessment</label>
              <input
                type="text"
                value={smartMinutes.assessment}
                onChange={(e) => setSmartMinutes({ ...smartMinutes, assessment: e.target.value })}
                className="mt-0.5 w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 font-semibold text-blue-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="font-extrabold text-blue-950">Smart-Filled Discussion &amp; Register Review</label>
              <textarea
                rows={3}
                value={smartMinutes.discussion}
                onChange={(e) => setSmartMinutes({ ...smartMinutes, discussion: e.target.value })}
                className="mt-0.5 w-full rounded-lg border border-purple-300 bg-white p-1.5 font-semibold text-blue-950"
              />
            </div>
            <div>
              <label className="font-extrabold text-blue-950">Formal Resolutions &amp; Carried Outcomes</label>
              <textarea
                rows={3}
                value={smartMinutes.resolutions}
                onChange={(e) => setSmartMinutes({ ...smartMinutes, resolutions: e.target.value })}
                className="mt-0.5 w-full rounded-lg border border-purple-300 bg-white p-1.5 font-semibold text-blue-950"
              />
            </div>
          </div>

          {/* Optional Instant Follow-up Action Item inside the same click */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-1.5 items-end rounded-xl border border-purple-200 bg-purple-50/40 p-2">
            <div className="md:col-span-5">
              <label className="font-extrabold text-blue-950">Assign Follow-Up Task at the Same Time (Optional)</label>
              <input
                type="text"
                value={smartMinutes.newActionTitle}
                onChange={(e) => setSmartMinutes({ ...smartMinutes, newActionTitle: e.target.value })}
                placeholder="e.g. Upload signed Board Pack to Company Safe & notify team"
                className="mt-0.5 w-full rounded border border-purple-300 bg-white px-2 py-1 font-bold text-blue-950"
              />
            </div>
            <div className="md:col-span-3">
              <label className="font-extrabold text-blue-950">Owner</label>
              <select
                value={smartMinutes.newActionOwner}
                onChange={(e) => setSmartMinutes({ ...smartMinutes, newActionOwner: e.target.value })}
                className="mt-0.5 w-full rounded border border-purple-300 bg-white px-2 py-1 font-bold text-blue-950"
              >
                <option value="Kristy Lee Whelan">Kristy Lee Whelan</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.full_name}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="font-extrabold text-blue-950">Due Date</label>
              <input
                type="date"
                value={smartMinutes.newActionDue}
                onChange={(e) => setSmartMinutes({ ...smartMinutes, newActionDue: e.target.value })}
                className="mt-0.5 w-full rounded border border-purple-300 bg-white px-2 py-1 font-bold text-blue-950"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="button"
                disabled={savingSmart}
                onClick={handleSmartFillMinutesAndSave}
                className="flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1.5 font-body text-[8px] font-black text-white shadow-sm"
                style={{ background: HEADER_GRADIENT }}
              >
                <CheckCircle2 className="h-3 w-3 text-white" />
                {savingSmart ? 'Saving…' : 'Smart-Fill & Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: UNIFIED MEETING TASK & ACTION COMPLETION COMMAND BOARD */}
      <div className="overflow-hidden rounded-2xl border-2 border-teal-500 bg-white shadow-sm">
        <div
          className="app-section-card-header flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-white"
          style={{ background: HEADER_GRADIENT }}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-white" />
              <h3 className="font-body text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                Meeting Action &amp; Task Completion Command ({allMeetingTasks.length} Linked Tasks)
              </h3>
            </div>
            <p className="font-body text-[8px] font-bold text-white">
              Complete any meeting-related task in 1 click, sign off digitally, or push directly to the Continuous Improvement Register.
            </p>
          </div>
        </div>

        <div className="p-2">
          {allMeetingTasks.length === 0 ? (
            <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-3 text-center font-body text-[8.5px] font-bold text-blue-950">
              No meeting follow-up tasks yet — use the Smart-Fill studio above or open any meeting card to assign your first action item!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {allMeetingTasks.map((t) => {
                const isDone = t.status === 'Completed' || t.status === 'Finalised';
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-2 rounded-xl border-2 bg-white px-2.5 py-1.5 shadow-sm"
                    style={{
                      borderColor: isDone ? '#16a34a' : '#7c3aed',
                      borderLeftWidth: '4px',
                    }}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-body text-[9px] font-black text-blue-950">
                        {t.title}
                      </div>
                      <div className="font-body text-[7.5px] font-bold text-purple-800">
                        Owner: {t.assigned_to || 'Team'} · Due: {t.due_date || 'Immediate'} · Status: {t.status}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!isDone && (
                        <button
                          type="button"
                          onClick={() => handleCompleteTaskQuick(t)}
                          className="inline-flex items-center gap-0.5 rounded-lg bg-emerald-600 px-2 py-1 font-body text-[7.5px] font-black text-white shadow-sm hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-2.5 w-2.5 text-white" /> Complete Now
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSendTaskToImprovement(t)}
                        className="inline-flex items-center gap-0.5 rounded-lg border border-purple-300 bg-purple-50 px-2 py-1 font-body text-[7.5px] font-black text-purple-950 hover:bg-purple-100"
                      >
                        <TrendingUp className="h-2.5 w-2.5 text-purple-700" /> + Quality CIR
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}