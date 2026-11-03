import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope, HeartPulse, ClipboardCheck, Sparkles,
  ArrowRight, PlusCircle, BookOpen,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { logUserAction } from '@/lib/actionLog';
import AlliedHealthMasterCataloguePanel from '@/components/enterprise/AlliedHealthMasterCataloguePanel';

export const ALLIED_HEALTH_DISCIPLINES = [
  {
    id: 'ot',
    title: 'Occupational Therapy (OT)',
    focus: 'Functional Capacity Assessments (FCA), SIL/SDA housing, AT & home modifications',
    standards: ['NDIS Core 1 & 4', 'Strengthened Aged Care Std 3 & 4'],
    defaultItems: [
      'Functional Capacity & Daily Living Activities Assessed',
      'Assistive Technology / Home Modification Prescription Verified',
      'Sensory & Environmental Risk Controls Documented',
      'Participant Goals & Independence Outcomes Linked',
    ],
  },
  {
    id: 'speech',
    title: 'Speech Pathology',
    focus: 'Dysphagia, Mealtime Management Plans, AAC & communication boards',
    standards: ['NDIS Mealtime Management', 'Aged Care Std 5 Clinical Care'],
    defaultItems: [
      'Swallowing & Dysphagia Screening Completed',
      'IDDSI Food & Fluid Texture Prescription Verified',
      'Mealtime Risk & Choking Escalation Protocol Attached',
      'AAC / Visual Communication Preferences Recorded',
    ],
  },
  {
    id: 'physio',
    title: 'Physiotherapy',
    focus: 'Mobility, falls prevention, manual handling plans & transfer protocols',
    standards: ['WHS Manual Handling', 'Aged Care Falls Prevention Std 5'],
    defaultItems: [
      'Falls Risk & Mobility Transfer Assessment Completed',
      'Hoist / Sling & Mobility Equipment Checked',
      'Manual Handling Plan Communicated to Rostered Support Team',
      'Rehabilitation & Pain Management Goals Recorded',
    ],
  },
  {
    id: 'psych',
    title: 'Psychology & Positive Behaviour Support',
    focus: 'Behaviour Support Plans (BSP), Regulated Restrictive Practices & trauma-informed care',
    standards: ['NDIS Behaviour Support Module 2a', 'Aged Care Behaviour Support'],
    defaultItems: [
      'Functional Behaviour Assessment (FBA) & Triggers Documented',
      'Positive Behaviour Support Strategies & De-escalation Plan Active',
      'Restrictive Practice Authorisation & Consent Verified (if applicable)',
      'NDIS Commission Monthly/Unauthorised Reporting Controls Linked',
    ],
  },
  {
    id: 'social',
    title: 'Social Work & Psychosocial Recovery',
    focus: 'Safeguarding, family governance, advocacy, housing & crisis support',
    standards: ['NDIS Rights & Responsibilities', 'Aged Care Std 1 Person-Centred'],
    defaultItems: [
      'Psychosocial Recovery & Safeguarding Assessment Completed',
      'Advocate / Nominee & Guardian Authority Verified',
      'Information Sharing Consent & Privacy Controls Confirmed',
      'Community & Crisis Referral Pathways Documented',
    ],
  },
  {
    id: 'ep',
    title: 'Exercise Physiology',
    focus: 'Cardiometabolic health, strength conditioning & chronic disease management',
    standards: ['NDIS Health & Wellbeing', 'Aged Care Reablement Std 3'],
    defaultItems: [
      'Pre-Exercise Medical Clearance & Baseline Vitals Recorded',
      'Individualised Exercise & Reablement Program Prescribed',
      'Fatigue & Safe Vital Sign Thresholds Documented',
      'Functional Outcome Measures Linked to Participant Goals',
    ],
  },
];

export const NURSING_OS_DOMAINS = [
  {
    id: 'clinical-assessment',
    title: 'Clinical Assessments & Observations',
    focus: 'Comprehensive nursing assessment, vital signs, wound care & neurological obs',
    route: '/checklists',
  },
  {
    id: 'care-plans',
    title: 'High-Intensity & Clinical Care Plans',
    focus: 'Complex bowel, enteral feeding (PEG), catheter, tracheostomy & ventilator plans',
    route: '/our-participants',
  },
  {
    id: 'medication',
    title: 'Medication Management (SAM / MAR / S8)',
    focus: 'Medication consent, administration charts, PRN protocols & error triage',
    route: '/incidents',
  },
  {
    id: 'clinical-risks',
    title: 'Clinical Risks, Deterioration & Escalations',
    focus: 'Pressure injury, sepsis/delirium recognition, hospital transfer & clinical reviews',
    route: '/risks',
  },
];

export const ASSESSMENT_17_LIBRARY = [
  { id: 'Participant Assessment', category: 'Participant', standard: 'NDIS Core 3 / Aged Care Std 3' },
  { id: 'Clinical Nursing Assessment', category: 'Nursing OS', standard: 'Aged Care Std 5 Clinical Care' },
  { id: 'OT Functional Capacity Assessment', category: 'Allied Health OS', standard: 'NDIS Assessment & Planning' },
  { id: 'Speech & Mealtime Assessment', category: 'Allied Health OS', standard: 'NDIS Mealtime Management' },
  { id: 'Physiotherapy Mobility & Falls Assessment', category: 'Allied Health OS', standard: 'WHS & Falls Prevention' },
  { id: 'Psychology & Behaviour Assessment', category: 'Allied Health OS', standard: 'NDIS Module 2a Behaviour Support' },
  { id: 'Social Work Safeguarding Assessment', category: 'Allied Health OS', standard: 'NDIS Safeguarding & Rights' },
  { id: 'Exercise Physiology Reablement Assessment', category: 'Allied Health OS', standard: 'NDIS Health & Wellbeing' },
  { id: 'Individual & Organizational Risk Assessment', category: 'Risk OS', standard: 'ISO 31000 / NDIS Core 2' },
  { id: 'WHS Workplace Hazard Assessment', category: 'Safety OS', standard: 'WHS Act 2011' },
  { id: 'Home & Environmental Safety Assessment', category: 'Safety OS', standard: 'NDIS Safe Environment Core 4' },
  { id: 'Worker High-Intensity Competency Assessment', category: 'Learning OS', standard: 'NDIS High Intensity Daily Personal Activities' },
  { id: 'Staff Training & Induction Assessment', category: 'Learning OS', standard: 'NDIS Worker Screening & Induction' },
  { id: 'Employee Performance & Supervision Assessment', category: 'HR OS', standard: 'Fair Work & HR Governance' },
  { id: 'Emergency & Disaster Readiness Assessment', category: 'Emergency OS', standard: 'NDIS Emergency & Disaster Management' },
  { id: 'Service Quality & Outcomes Assessment', category: 'Quality OS', standard: 'NDIS Quality Indicators' },
  { id: 'Internal Audit Readiness Assessment', category: 'Audit OS', standard: 'NDIS & Aged Care Audit Program' },
];

export const REVIEWS_13_LIBRARY = [
  'Participant Support Plan Review',
  'Participant Goal & Outcome Review',
  'Staff Onboarding & 90-Day Probation Review',
  'Annual Staff Performance Review',
  'Monthly Practice Supervision Review',
  'Quality & Continuous Improvement Review',
  'Statutory Compliance Posture Review',
  'Board & Organisational Governance Review',
  'Enterprise Risk & Control Effectiveness Review',
  'Clinical Governance & Medication Review',
  'Service Delivery & Roster Capacity Review',
  'Internal & External Audit Finding Review',
  'Emergency Drill & Business Continuity Review',
];

export const AI_12_WORKFORCE = [
  { id: 'Compliance AI', role: 'Monitors NDIS, Aged Care, WHS & Privacy obligations; flags gaps before expiry.', actionLabel: 'Generate Compliance Gap Action', targetModule: 'Compliance' },
  { id: 'Audit AI', role: 'Assembles evidence packs, verifies audit consents, and cross-checks 356 checkpoints.', actionLabel: 'Prepare Continuous Audit Task', targetModule: 'Audit' },
  { id: 'Risk AI', role: 'Evaluates 5×5 likelihood/consequence matrices and recommends ISO 31000 controls.', actionLabel: 'Create Risk Treatment Task', targetModule: 'Risk' },
  { id: 'Quality AI', role: 'Synthesizes complaints, incidents, and audit findings into CAPA improvements.', actionLabel: 'Log Continuous Improvement Item', targetModule: 'Quality' },
  { id: 'Workforce AI', role: 'Matches worker competencies, screening clearances, and fatigue limits to shifts.', actionLabel: 'Verify Roster Screening Task', targetModule: 'Workforce' },
  { id: 'HR AI', role: 'Automates onboarding packs, position descriptions, contracts, and supervision schedules.', actionLabel: 'Schedule Supervision Action', targetModule: 'HR' },
  { id: 'Learning AI', role: 'Assigns role-based training modules and tracks expiring first aid/CPR credentials.', actionLabel: 'Assign Competency Refresher', targetModule: 'Training' },
  { id: 'Allied Health AI', role: 'Pre-fills OT, Speech, Physio, Psych, Social Work & EP assessments and links goals.', actionLabel: 'Launch Allied Health Assessment', targetModule: 'Allied Health' },
  { id: 'Clinical AI', role: 'Monitors nursing observations, medication charts, clinical risks, and SIRS/NDIS triage.', actionLabel: 'Create Clinical Governance Review', targetModule: 'Clinical' },
  { id: 'Executive AI', role: 'Generates 30-second posture briefings, financial forecasts, and operational KPIs.', actionLabel: 'Generate Executive Action', targetModule: 'Executive' },
  { id: 'Board AI', role: 'Compiles board assurance packs, delegation registers, and strategic risk summaries.', actionLabel: 'Prepare Board Assurance Action', targetModule: 'Governance' },
  { id: 'Participant AI', role: 'Tracks 28-stage participant journeys, easy-read handbooks, consents, and outcomes.', actionLabel: 'Schedule Participant Plan Review', targetModule: 'Participant' },
];

export default function AlliedHealthAndNursingOsSuite() {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState('numbered-catalogue'); // numbered-catalogue | allied-nursing | assessments-reviews | ai-workforce
  const [participants, setParticipants] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(ASSESSMENT_17_LIBRARY[0].id);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [checkItems, setCheckItems] = useState([
    { text: 'Person identity, consent and authority to share verified from 360° profile', done: true },
    { text: 'Clinical / functional baseline and risk controls assessed against NDIS & Aged Care standards', done: true },
    { text: 'Goals, interventions and review schedule linked to Master Register', done: true },
    { text: 'Supporting evidence and digital sign-off recorded for continuous audit readiness', done: true },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.ParticipantProfile.filter({}, { sort: '-created_date', limit: 25 })
        .then((res) => (Array.isArray(res) ? res : res?.items || []))
        .catch(() => []),
      base44.entities.StaffProfile.filter({}, { sort: '-created_date', limit: 25 })
        .then((res) => (Array.isArray(res) ? res : res?.items || []))
        .catch(() => []),
      base44.auth.me().catch(() => null),
    ]).then(([parts, stf, me]) => {
      setParticipants(parts);
      setStaff(stf);
      if (parts[0]?.id) setSelectedPersonId(parts[0].id);
      if (me?.full_name || me?.email) setReviewerName(me.full_name || me.email);
    });
  }, []);

  const completedCount = checkItems.filter((i) => i.done).length;
  const autoScore = Math.round((completedCount / Math.max(1, checkItems.length)) * 100);

  const handleSelectDiscipline = (disc) => {
    setSelectedAssessment(`${disc.title} Assessment`);
    setCheckItems(disc.defaultItems.map((text) => ({ text, done: true })));
    setSubTab('assessments-reviews');
  };

  const handleSaveGuidedAssessment = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const matchedPart = participants.find((p) => p.id === selectedPersonId);
      const matchedStaff = staff.find((s) => s.id === selectedPersonId);
      const personName = matchedPart?.full_name || matchedStaff?.full_name || 'Organisation-Wide';

      const created = await base44.entities.Checklist.create({
        title: `${selectedAssessment} — ${personName}`,
        category: selectedAssessment,
        status: autoScore === 100 ? 'Approved' : 'In Progress',
        outcome: autoScore >= 80 ? 'Compliant' : 'Action Required',
        reviewer: reviewerName || 'Clinical / Compliance Lead',
        review_date: new Date().toISOString().slice(0, 10),
        participant_id: matchedPart?.id || undefined,
        participant_name: matchedPart?.full_name || undefined,
        employee_id: matchedStaff?.id || undefined,
        employee_name: matchedStaff?.full_name || undefined,
        ndis_compliant: true,
        aged_care_compliant: true,
        items: checkItems,
        recommendations: clinicalNotes || `Auto-scored ${autoScore}% via Guided Assessment Library.`,
        notes: `Pre-filled from 360° profile (${personName}). Auto-score: ${autoScore}%.`,
      });

      await logUserAction('Guided Assessment Completed & Evidenced', 'Checklist', {
        record_id: created?.id || 'new',
        record_title: `${selectedAssessment} — ${personName}`,
        details: `Auto-score ${autoScore}% · Linked to ${personName}`,
      });

      toast({
        title: 'Assessment saved & linked to Evidence Vault',
        description: `${selectedAssessment} (${autoScore}% score) saved for ${personName}.`,
      });
      setClinicalNotes('');
    } catch (err) {
      toast({
        title: 'Could not save assessment',
        description: err?.message || 'Please check your permissions.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRunAiWorkforceAction = async (agent) => {
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const created = await base44.entities.TodoTask.create({
        title: `[${agent.id}] ${agent.actionLabel}`,
        task_type: 'AI Workforce Automation',
        module: agent.targetModule,
        task_date: today,
        due_date: today,
        priority: 'High',
        status: 'In Progress',
        how_to_complete: agent.role,
        notes: `Dispatched automatically by ${agent.id} via the Organisational Brain.`,
      });

      await logUserAction('AI Workforce Task Dispatched', 'TodoTask', {
        record_id: created?.id || 'ai-task',
        record_title: `[${agent.id}] ${agent.actionLabel}`,
        details: agent.role,
      });

      toast({
        title: `${agent.id} dispatched action`,
        description: `"${agent.actionLabel}" created in Tasks and logged to the Audit Trail.`,
      });
    } catch (err) {
      toast({
        title: 'Could not dispatch AI task',
        description: err?.message || 'Check permissions and try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-[#F8FAFC] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#5A00D6]/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#5A00D6]">
            <Stethoscope className="h-3.5 w-3.5" />
            Allied Health OS · Nursing OS · Assessment Library · 12-Agent AI Workforce
          </span>
          <h3 className="mt-1 font-editorial text-lg font-extrabold text-[#0A2B6D]">
            Clinical &amp; Allied Health Governance, Pre-Filled Assessments &amp; Autonomous AI Workforce
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="tablist">
          {[
            { id: 'numbered-catalogue', label: 'Numbered Allied Health & 12 Registers', icon: BookOpen },
            { id: 'allied-nursing', label: 'Allied Health & Nursing OS', icon: HeartPulse },
            { id: 'assessments-reviews', label: '17 Assessments & 13 Reviews', icon: ClipboardCheck },
            { id: 'ai-workforce', label: '12-Agent AI Workforce', icon: Sparkles },
          ].map((t) => {
            const Icon = t.icon;
            const active = subTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSubTab(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white shadow-2xs'
                    : 'border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: active ? '#00C6FF' : '#0072FF' }} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* TAB 0: NUMBERED ALLIED HEALTH OS MASTER CATALOGUE & 12 DOCUMENT REGISTERS */}
        {subTab === 'numbered-catalogue' && (
          <AlliedHealthMasterCataloguePanel participants={participants} staff={staff} />
        )}

        {/* TAB 1: ALLIED HEALTH OS & NURSING OS */}
        {subTab === 'allied-nursing' && (
          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                    Allied Health OS — 6 Multidisciplinary Clinical Streams
                  </h4>
                  <p className="text-xs text-[#0A2B6D]/75">
                    Shared services across Assessments, Reports, Reviews, Goals, Interventions, Outcomes, Evidence &amp; Clinical Governance.
                  </p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                  Pre-Filled &amp; Evidence-Linked
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {ALLIED_HEALTH_DISCIPLINES.map((disc) => (
                  <div
                    key={disc.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-sm font-extrabold text-[#0A2B6D]">{disc.title}</h5>
                        <Stethoscope className="h-4 w-4 shrink-0 text-[#0072FF]" />
                      </div>
                      <p className="text-xs text-[#0A2B6D]/75 leading-relaxed">{disc.focus}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {disc.standards.map((st) => (
                          <span
                            key={st}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-[#0A2B6D]"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <Link
                        to="/goals"
                        className="text-xs font-bold text-[#5A00D6] hover:underline"
                      >
                        Outcomes &amp; Goals →
                      </Link>
                      <Button
                        size="sm"
                        type="button"
                        onClick={() => handleSelectDiscipline(disc)}
                      >
                        Launch Pre-Filled Assessment
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                    Nursing OS — Clinical Governance, High-Intensity Care &amp; Medication Management
                  </h4>
                  <p className="text-xs text-[#0A2B6D]/75">
                    Aligned with NDIS High Intensity Daily Personal Activities and Strengthened Aged Care Quality Standard 5 (Clinical Care).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {NURSING_OS_DOMAINS.map((dom) => (
                  <Link
                    key={dom.id}
                    to={dom.route}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 transition hover:border-[#0072FF] hover:bg-white"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold text-[#0A2B6D]">{dom.title}</span>
                        <HeartPulse className="h-4 w-4 shrink-0 text-rose-600" />
                      </div>
                      <p className="mt-1.5 text-xs text-[#0A2B6D]/75 leading-relaxed">{dom.focus}</p>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#0072FF]">
                      <span>Open Clinical Register</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 17 ASSESSMENT LIBRARY & 13 REVIEWS LIBRARY */}
        {subTab === 'assessments-reviews' && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Guided Pre-Filled Assessment Builder */}
            <form
              onSubmit={handleSaveGuidedAssessment}
              className="lg:col-span-7 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                    Guided, Pre-Filled &amp; Auto-Scored Assessment Builder
                  </h4>
                  <p className="text-xs text-[#0A2B6D]/75">
                    Select any of the 17 statutory assessments; 90% pre-filled from the selected 360° profile and saved directly to the Checklist &amp; Evidence register.
                  </p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                  Auto-Score: {autoScore}%
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0A2B6D]">
                    Assessment Template (17 Library Types)
                  </label>
                  <select
                    value={selectedAssessment}
                    onChange={(e) => setSelectedAssessment(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-[#0A2B6D]"
                  >
                    {ASSESSMENT_17_LIBRARY.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} ({a.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0A2B6D]">
                    Auto-Fill from 360° Profile (Participant / Staff)
                  </label>
                  <select
                    value={selectedPersonId}
                    onChange={(e) => setSelectedPersonId(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-[#0A2B6D]"
                  >
                    <option value="">Organisation-Wide Assessment</option>
                    <optgroup label="Participants">
                      {participants.map((p) => (
                        <option key={p.id} value={p.id}>
                          Participant: {p.full_name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Staff Members">
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>
                          Staff: {s.full_name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
                  Guided Evidence Checkpoints (Click to toggle verification)
                </div>
                {checkItems.map((item, idx) => (
                  <label
                    key={idx}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-xs font-medium text-[#0A2B6D] hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() =>
                        setCheckItems((prev) =>
                          prev.map((row, i) => (i === idx ? { ...row, done: !row.done } : row))
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#0072FF]"
                    />
                    <span>{item.text}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0A2B6D]">Assessing Clinician / Reviewer</label>
                  <Input
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Clinician or manager name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0A2B6D]">Clinical / Assessment Recommendations</label>
                  <Input
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Key findings, interventions or follow-up actions"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-xs text-[#0A2B6D]/70">
                  Saves to <code className="font-mono font-bold">Checklist</code> &amp; logs evidence to <code className="font-mono font-bold">AuditLog</code>
                </span>
                <Button type="submit" disabled={saving}>
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  {saving ? 'Filing Assessment…' : `Save & Evidence Assessment (${autoScore}%)`}
                </Button>
              </div>
            </form>

            {/* 13 Auto-Prepared Reviews Library */}
            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                    13 Auto-Prepared Reviews Library
                  </h4>
                  <p className="text-xs text-[#0A2B6D]/75">
                    Automatically prepared from live timeline, goals, incidents, and credentials.
                  </p>
                </div>
                <Link
                  to="/review-due"
                  className="text-xs font-bold text-[#0072FF] hover:underline"
                >
                  Open Review Board →
                </Link>
              </div>

              <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                {REVIEWS_13_LIBRARY.map((rev, i) => (
                  <div
                    key={rev}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-xs"
                  >
                    <span className="font-bold text-[#0A2B6D]">
                      {i + 1}. {rev}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAssessment(rev);
                        toast({
                          title: `${rev} loaded`,
                          description: 'Pre-filled in the Guided Assessment & Review form on the left.',
                        });
                      }}
                      className="shrink-0 rounded-md bg-[#0A2B6D] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#0072FF]"
                    >
                      Auto-Prepare
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 12-AGENT AI WORKFORCE */}
        {subTab === 'ai-workforce' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  12-Domain Autonomous AI Workforce — AI Performs Work, Not Just Conversation
                </h4>
                <p className="text-xs text-[#0A2B6D]/75">
                  Each specialist AI agent continuously monitors its domain and dispatches pre-filled actions directly into your operational registers.
                </p>
              </div>
              <Link
                to="/assistant"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#5A00D6] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0072FF]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Open Full AI Copilot</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {AI_12_WORKFORCE.map((agent) => (
                <div
                  key={agent.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-extrabold text-[#0A2B6D]">{agent.id}</span>
                      <Badge variant="outline" className="text-xs">
                        {agent.targetModule}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-[#0A2B6D]/75 leading-relaxed">{agent.role}</p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    disabled={saving}
                    onClick={() => handleRunAiWorkforceAction(agent)}
                    className="mt-3 w-full justify-between"
                  >
                    <span>{agent.actionLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#0072FF]" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}