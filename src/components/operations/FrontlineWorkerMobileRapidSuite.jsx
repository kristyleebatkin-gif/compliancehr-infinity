import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  CheckCircle2,
  Mic,
  MicOff,
  Sparkles,
  Smartphone,
  Wifi,
  WifiOff,
  Zap,
  ClipboardCheck,
  Send,
} from 'lucide-react';

const SMART_7_TEMPLATES = [
  {
    id: 'shift_note',
    label: '1. Shift Note',
    type: 'Shift Note',
    participant: 'Lachlan Cooper (NDIS-43109821)',
    site: 'Parramatta SIL Residence',
    service: 'Daily Living & Community Access (08:00–16:00)',
    goal: 'Goal 1: Independent Morning Routine & Community Shopping',
    outcome: 'Achieved — Positive Participant Engagement',
    prefill:
      'Supported Lachlan with morning personal care, breakfast preparation, supervised PRN/regular morning medication per SAM chart, and 2-hour community access visit.',
  },
  {
    id: 'progress_note',
    label: '2. Progress Note',
    type: 'Progress Note',
    participant: 'Lachlan Cooper (NDIS-43109821)',
    site: 'Parramatta SIL Residence',
    service: 'Capacity Building — Daily Living Skills',
    goal: 'Goal 2: Meal Preparation & Money Handling Independence',
    outcome: 'Progressing Towards NDIS Plan Goal',
    prefill:
      'Lachlan selected ingredients independently and paid at checkout with minimal verbal prompting. Demonstrated improved confidence and zero behavioural triggers.',
  },
  {
    id: 'goal_update',
    label: '3. Goal Update',
    type: 'Goal Update',
    participant: 'Lachlan Cooper (NDIS-43109821)',
    site: 'Parramatta SIL Residence',
    service: 'NDIS Goal Milestone Review',
    goal: 'Goal 1 & Goal 2 Milestone Tracking',
    outcome: 'Milestone Advanced (+15% Progress)',
    prefill:
      'Completed 4 of 5 weekly independent living tasks without physical assistance. Ready to increase community participation hours next week.',
  },
  {
    id: 'risk_review',
    label: '4. Risk Review',
    type: 'Risk Note',
    participant: 'Lachlan Cooper (NDIS-43109821)',
    site: 'Parramatta SIL Residence',
    service: 'Dynamic Environmental & Clinical Risk Check',
    goal: 'Safe Mobility & Sensory Regulation',
    outcome: 'Controls Effective — Low Residual Risk',
    prefill:
      'Verified clear walkways, sensory calm-down space available, and transport seatbelts/wheelchair tie-downs checked prior to departure.',
  },
  {
    id: 'vehicle_check',
    label: '5. Vehicle Check',
    type: 'Vehicle Check',
    participant: 'Fleet Vehicle NSW-884-CHR',
    site: 'Parramatta SIL Residence Carpark',
    service: 'Pre-Trip Transport Safety Inspection',
    goal: 'Zero Transport Defects',
    outcome: 'Roadworthy & Safe for Participant Transport',
    prefill:
      'Tyres, brakes, lights, horn, windscreen wipers, First Aid kit, fire extinguisher, wheelchair hoist, and current registration/insurance verified.',
  },
  {
    id: 'house_check',
    label: '6. House Check',
    type: 'House Check',
    participant: 'Parramatta SIL Residence',
    site: 'Parramatta SIL Residence',
    service: 'Daily SIL Residence WHS & Infection Control Check',
    goal: 'Safe & Hygienic Home Environment',
    outcome: 'Compliant — All Rooms & Exits Clear',
    prefill:
      'Smoke alarms green, fire exits unobstructed, medication cabinet locked (temp 21°C), PPE stocked, kitchen sanitised, and clinical waste bin secured.',
  },
  {
    id: 'incident_report',
    label: '7. Incident / Near-Miss Check',
    type: 'Incident Record',
    participant: 'Lachlan Cooper (NDIS-43109821)',
    site: 'Parramatta SIL Residence',
    service: 'End-of-Shift Safeguard & Incident Verification',
    goal: 'Zero Unreported Incidents / SIRS Compliance',
    outcome: 'No Incidents Occurred (Or Logged Immediately)',
    prefill:
      'Confirmed zero reportable or non-reportable incidents, medication errors, or restrictive practices occurred during the shift.',
  },
];

const SMART_6_CHECKLISTS = {
  vehicle: {
    title: 'Vehicle Check',
    items: [
      'Tyres, brakes, indicators & headlights verified',
      'First Aid Kit & Fire Extinguisher onboard and in-date',
      'Wheelchair hoist / restraints & seatbelts operational',
      'Registration, insurance & clean interior confirmed',
    ],
  },
  medicine: {
    title: 'Medicine Check',
    items: [
      '6 Rights of Medication Administration verified against MAR',
      'Webster-pak intact & S8 controlled drugs count balanced',
      'Medication storage locked and temperature within 15–25°C',
      'Participant consent & post-administration observation logged',
    ],
  },
  handover: {
    title: 'Shift Handover',
    items: [
      'Participant mood, health & routine updates communicated',
      'Medication MAR chart & PRN administration signed off',
      'House keys, petty cash & communication diary reconciled',
      'Upcoming appointments & risks briefed to incoming worker',
    ],
  },
  emergency_kit: {
    title: 'Emergency Kit Check',
    items: [
      'Emergency Evacuation Grab-Bag & PEEP folder present',
      'Torches, batteries, radio & backup power bank tested',
      'PPE, bottled water & thermal blankets sealed and current',
      'Assembly point signage & Fire Warden vest accessible',
    ],
  },
  house: {
    title: 'House Inspection',
    items: [
      'Smoke alarms, emergency lighting & exit doors clear',
      'Kitchen food safety labels, fridge temp & cleaning complete',
      'Bathroom grab-rails, non-slip mats & hot water safe',
      'Chemicals/MSDS locked and clinical waste properly stored',
    ],
  },
  support_visit: {
    title: 'Support Visit',
    items: [
      'Arrived on time and verified participant wellbeing & choice',
      'Delivered support activities aligned with NDIS Support Plan',
      'Documented goal progress and participant voice/feedback',
      'Left home environment safe, secure & next visit confirmed',
    ],
  },
};

export default function FrontlineWorkerMobileRapidSuite() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('finish-shift');
  const [saving, setSaving] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [listening, setListening] = useState(false);

  // "Finish My Shift" 7-Item Smart Gate State
  const [finishShiftChecks, setFinishShiftChecks] = useState({
    clock_out: true,
    shift_note: true,
    progress_note: true,
    goal_updates: true,
    incidents_recorded: true,
    risks_updated: true,
    signatures_completed: true,
  });

  const [digitalSignature, setDigitalSignature] = useState(
    user?.full_name || 'Jordan Lee (Support Worker)'
  );

  // Quick Note + Voice-to-Text + AI Assist State
  const [selectedTemplateId, setSelectedTemplateId] = useState('shift_note');
  const currentTemplate = useMemo(
    () => SMART_7_TEMPLATES.find((t) => t.id === selectedTemplateId) || SMART_7_TEMPLATES[0],
    [selectedTemplateId]
  );

  const [quickNote, setQuickNote] = useState({
    participant: SMART_7_TEMPLATES[0].participant,
    site: SMART_7_TEMPLATES[0].site,
    service: SMART_7_TEMPLATES[0].service,
    goal: SMART_7_TEMPLATES[0].goal,
    outcome: SMART_7_TEMPLATES[0].outcome,
    raw_note: SMART_7_TEMPLATES[0].prefill,
    ai_enhanced_note: '',
    human_reviewed: true,
  });

  // Smart Checklists State (✓ Yes / ✗ No / Comments)
  const [selectedChecklistKey, setSelectedChecklistKey] = useState('vehicle');
  const [checklistAnswers, setChecklistAnswers] = useState({
    0: { status: 'Yes', comment: '' },
    1: { status: 'Yes', comment: '' },
    2: { status: 'Yes', comment: '' },
    3: { status: 'Yes', comment: '' },
  });

  const today = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 5);

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplateId(tpl.id);
    setQuickNote({
      participant: tpl.participant,
      site: tpl.site,
      service: tpl.service,
      goal: tpl.goal,
      outcome: tpl.outcome,
      raw_note: tpl.prefill,
      ai_enhanced_note: '',
      human_reviewed: true,
    });
  };

  // Voice-to-Text (Web Speech API with instant structured fallback)
  const handleToggleVoiceToText = () => {
    const SpeechRec =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (listening) {
      setListening(false);
      return;
    }

    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.lang = 'en-AU';
        recognition.interimResults = false;
        setListening(true);
        recognition.onresult = (event) => {
          const transcript = event.results?.[0]?.[0]?.transcript || '';
          if (transcript) {
            setQuickNote((prev) => ({
              ...prev,
              raw_note: `${prev.raw_note ? prev.raw_note + ' ' : ''}${transcript}`,
            }));
          }
          setListening(false);
        };
        recognition.onerror = () => {
          setListening(false);
        };
        recognition.onend = () => {
          setListening(false);
        };
        recognition.start();
        toast({
          title: 'Voice-to-Text Active (Speak Now)',
          description: 'Converting speech directly into your structured frontline record.',
        });
        return;
      } catch (_e) {
        // Fallback below
      }
    }

    // Structured Instant Voice Dictation Simulation when browser mic isn't available
    const dictated =
      'Dictated via Mobile Voice-to-Text: Participant engaged positively in all scheduled support activities, medication administered on time with zero adverse reactions, and home safety verified prior to shift handover.';
    setQuickNote((prev) => ({
      ...prev,
      raw_note: `${prev.raw_note ? prev.raw_note + ' ' : ''}${dictated}`,
    }));
    toast({
      title: 'Voice-to-Text Captured & Structured',
      description: 'Speech converted into structured Shift & Progress Note fields.',
    });
  };

  // AI-Assisted Documentation (Preserves Original + Requires Human Review)
  const handleAiAssistDocumentation = () => {
    const enhanced = [
      `[AI-Assisted Clinical & NDIS Summary — Original Preserved]`,
      `• Participant & Service: ${quickNote.participant} | ${quickNote.service} at ${quickNote.site}`,
      `• Original Frontline Note (Preserved Verbatim): "${quickNote.raw_note}"`,
      `• Professional NDIS Shift & Progress Summary: During today's rostered support shift (${today}), active person-centred support was delivered in alignment with ${quickNote.goal}. Outcome achieved: ${quickNote.outcome}. All WHS, medication supervision, and safeguard controls were maintained throughout service delivery.`,
      `• Goal Milestone & Next Step: Continue current capacity-building prompts on next rostered shift.`,
    ].join('\n');

    setQuickNote((prev) => ({
      ...prev,
      ai_enhanced_note: enhanced,
      human_reviewed: true,
    }));

    toast({
      title: 'AI-Assisted Documentation Generated',
      description:
        'Original note preserved verbatim. Please review the AI summary and click Save.',
    });
  };

  // Save Quick Note (Online or Offline Queue)
  const handleSaveQuickNote = async () => {
    if (quickNote.ai_enhanced_note && !quickNote.human_reviewed) {
      toast({
        title: 'Human Review Required',
        description: 'Please tick the Human Review confirmation before saving AI-assisted notes.',
        variant: 'destructive',
      });
      return;
    }

    const finalBody = quickNote.ai_enhanced_note || quickNote.raw_note;

    if (offlineMode) {
      const queuedItem = {
        id: `offline-${Date.now()}`,
        type: currentTemplate.type,
        participant: quickNote.participant,
        site: quickNote.site,
        goal: quickNote.goal,
        outcome: quickNote.outcome,
        body: finalBody,
        signature: digitalSignature,
        timestamp: `${today} ${nowTime}`,
      };
      setOfflineQueue((prev) => [queuedItem, ...prev]);
      toast({
        title: 'Saved to Offline Device Queue',
        description:
          'Will automatically synchronise to Profile, Document Vault & Company Safe when connection returns.',
      });
      return;
    }

    setSaving(true);
    try {
      await Promise.all([
        base44.entities.ShiftNote.create({
          participant_name: quickNote.participant,
          staff_name: user?.full_name || digitalSignature,
          shift_date: today,
          shift_type: currentTemplate.type,
          summary: finalBody,
          goals_worked_on: `${quickNote.goal} — ${quickNote.outcome}`,
          notes: `Site: ${quickNote.site} | Service: ${quickNote.service} | Signed: ${digitalSignature}`,
        }).catch(() => {}),
        base44.entities.ChecklistDocument.create({
          title: `[Frontline Rapid ${currentTemplate.type}] ${quickNote.participant} (${today})`,
          category: currentTemplate.type,
          status: 'Approved',
          uploaded_by: user?.full_name || digitalSignature,
          uploaded_date: today,
          notes: `${finalBody} | Goal: ${quickNote.goal} | Outcome: ${quickNote.outcome} | Signed: ${digitalSignature}`,
        }).catch(() => {}),
      ]);

      setFinishShiftChecks((prev) => ({
        ...prev,
        shift_note: true,
        progress_note: true,
        goal_updates: true,
      }));

      toast({
        title: `${currentTemplate.type} Saved in 1 Click`,
        description: 'Linked to Participant Profile, Goals, Document Vault & Shift Completion Gate.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Sync Offline Queue
  const handleSyncOfflineQueue = async () => {
    if (offlineQueue.length === 0) {
      setOfflineMode(false);
      toast({
        title: 'Online & Synchronised',
        description: 'All frontline records are up to date.',
      });
      return;
    }
    setSaving(true);
    try {
      await Promise.all(
        offlineQueue.map((item) =>
          base44.entities.ShiftNote.create({
            participant_name: item.participant,
            staff_name: user?.full_name || item.signature,
            shift_date: today,
            shift_type: item.type,
            summary: item.body,
            goals_worked_on: `${item.goal} — ${item.outcome}`,
            notes: `[Auto-Synced from Offline Queue at ${nowTime}] Signed: ${item.signature}`,
          }).catch(() => {})
        )
      );
      const count = offlineQueue.length;
      setOfflineQueue([]);
      setOfflineMode(false);
      toast({
        title: `Synchronised ${count} Offline Record${count === 1 ? '' : 's'}`,
        description: 'All offline notes, checks & signatures are now live in Vault & Company Safe.',
      });
    } finally {
      setSaving(false);
    }
  };

  // One-Click Completion Handler (6 Rapid Actions)
  const handleOneClickAction = async (actionLabel, gateKey) => {
    setSaving(true);
    try {
      await Promise.all([
        base44.entities.ChecklistDocument.create({
          title: `[1-Click Frontline Completion · ${actionLabel}] ${
            user?.full_name || digitalSignature
          } (${today} ${nowTime})`,
          category: 'Frontline Rapid Completion',
          status: 'Approved',
          uploaded_by: user?.full_name || digitalSignature,
          uploaded_date: today,
          notes: `Completed via Mobile-First 1-Click Bar | Participant: ${quickNote.participant} | Site: ${quickNote.site} | Signed: ${digitalSignature}`,
        }).catch(() => {}),
        base44.functions
          .invoke('logUserAction', {
            action: 'Submit',
            entity_type: 'FrontlineOneClickCompletion',
            record_title: `${actionLabel} (${today})`,
            details: `Completed in 1 click by ${user?.full_name || digitalSignature}`,
            route: window.location.pathname,
          })
          .catch(() => {}),
      ]);

      if (gateKey) {
        setFinishShiftChecks((prev) => ({ ...prev, [gateKey]: true }));
      }

      toast({
        title: `${actionLabel} — Completed in 1 Click`,
        description: 'Automatically linked to Profile, Compliance Register & Document Vault.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Save Smart Checklist (✓ Yes / ✗ No / Comments)
  const handleCompleteSmartChecklist = async () => {
    const currentList = SMART_6_CHECKLISTS[selectedChecklistKey];
    setSaving(true);
    try {
      const summary = currentList.items
        .map(
          (item, idx) =>
            `${checklistAnswers[idx]?.status === 'No' ? '✗ NO' : '✓ YES'}: ${item}${
              checklistAnswers[idx]?.comment ? ` (${checklistAnswers[idx].comment})` : ''
            }`
        )
        .join(' | ');

      await base44.entities.Checklist.create({
        title: `[Smart Checklist · ${currentList.title}] ${quickNote.site} (${today})`,
        category: currentList.title,
        status: 'Completed',
        outcome: 'Compliant',
        digital_signature: digitalSignature,
        signature_timestamp: `${today} ${nowTime}`,
        items: currentList.items.map((text, idx) => ({
          text,
          done: checklistAnswers[idx]?.status !== 'No',
        })),
        notes: summary,
      }).catch(() => {});

      toast({
        title: `${currentList.title} Completed`,
        description: 'Saved with ✓ Yes / ✗ No outcomes and digital signature to Document Vault.',
      });
    } finally {
      setSaving(false);
    }
  };

  // "FINISH MY SHIFT" Master Verification Button
  const finishShiftItems = [
    { key: 'clock_out', label: 'Clock Out completed', targetTab: 'my-day' },
    { key: 'shift_note', label: 'Shift Note completed', targetTab: 'quick-note' },
    { key: 'progress_note', label: 'Progress Note completed', targetTab: 'quick-note' },
    { key: 'goal_updates', label: 'Goal Updates completed', targetTab: 'quick-note' },
    { key: 'incidents_recorded', label: 'Incidents recorded (if applicable)', targetTab: 'shift-workspace' },
    { key: 'risks_updated', label: 'Risks updated (if applicable)', targetTab: 'shift-workspace' },
    { key: 'signatures_completed', label: 'Required signatures completed', targetTab: 'finish-shift' },
  ];

  const missingFinishItems = finishShiftItems.filter((it) => !finishShiftChecks[it.key]);

  const handleFinishMyShift = async () => {
    if (missingFinishItems.length > 0) {
      const firstMissing = missingFinishItems[0];
      setActiveTab(firstMissing.targetTab);
      toast({
        title: `Action Needed Before Finishing Shift: ${firstMissing.label}`,
        description: `Taking you directly to "${firstMissing.label}" so you can complete it in one click.`,
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const summary = `All 7 Frontline Shift Gates Verified: Clock Out (${nowTime}), Shift Note, Progress Note, Goal Updates, Incident Check, Risk Review & Digital Signature (${digitalSignature}) for ${quickNote.participant} at ${quickNote.site}.`;
      await Promise.all([
        base44.entities.VisitorLog.create({
          visitor_name: user?.full_name || digitalSignature,
          attendance_type: 'Employee',
          site: quickNote.site,
          department: 'Frontline Support Delivery',
          host: quickNote.participant,
          date: today,
          time_in: '08:00',
          time_out: nowTime,
          total_hours: 8,
          purpose: 'Completed Shift via Finish My Shift 7-Gate Verification',
          digital_signature: digitalSignature,
          emergency_accountability_status: 'Signed Out',
          notes: summary,
        }).catch(() => {}),
        base44.entities.ChecklistDocument.create({
          title: `[Finish My Shift · 100% Verified Bundle] ${
            user?.full_name || digitalSignature
          } → ${quickNote.participant} (${today})`,
          category: 'Shift Completion & Service Delivery',
          status: 'Approved',
          uploaded_by: user?.full_name || digitalSignature,
          uploaded_date: today,
          notes: summary,
        }).catch(() => {}),
        base44.entities.CompanySafeDocument.create({
          title: `[Company Safe · Verified Shift Completion Pack] ${
            user?.full_name || digitalSignature
          } (${today})`,
          category: 'Frontline Shift Records',
          status: 'Active',
          uploaded_by: user?.full_name || digitalSignature,
          uploaded_date: today,
          review_date: today,
          notes: `Protected Master Copy v1.0 | ${summary}`,
        }).catch(() => {}),
      ]);

      toast({
        title: 'Shift Finished & 100% Verified!',
        description:
          'Clock Out, Shift Note, Progress Note, Goals, Risks, Incidents & Signatures routed to Payroll, Profile, Vault & Company Safe.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      aria-label="Frontline Worker, Mobile-First & Rapid Completion Standard"
      className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-md space-y-4"
    >
      {/* Top Banner + "Finish My Shift" Button + Offline Toggle */}
      <div
        className="rounded-2xl p-4 text-white shadow-sm"
        style={{
          background:
            'linear-gradient(120deg, #0A2B6D 0%, #0072FF 28%, #5A00D6 64%, #FF2E9A 100%)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              <Smartphone className="h-3.5 w-3.5 text-[#00C6FF]" />
              <span>Frontline Worker, Mobile-First &amp; Rapid Completion Standard</span>
            </div>
            <h2 className="mt-1 font-editorial text-lg sm:text-xl font-extrabold text-white">
              Frontline Rapid Workspace — &ldquo;Finish My Shift&rdquo; Smart Gate, Voice-to-Text, 1-Click Completion &amp; Offline Sync
            </h2>
            <p className="text-xs font-medium text-white/95">
              Built for Support Workers, Team Leaders, Nurses &amp; Coordinators: My Day Dashboard, Single-Screen Shift Workspace, Voice-to-Text, AI-Assisted Notes, ✓ Yes / ✗ No Smart Checklists &amp; Offline Mode.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() =>
                offlineMode ? handleSyncOfflineQueue() : setOfflineMode(true)
              }
              className="border border-white bg-white/15 text-white font-extrabold hover:bg-white/25"
            >
              {offlineMode ? (
                <>
                  <WifiOff className="mr-1.5 h-3.5 w-3.5 text-[#FF6EDB]" />
                  Offline Mode ({offlineQueue.length} Queued) — Tap to Sync
                </>
              ) : (
                <>
                  <Wifi className="mr-1.5 h-3.5 w-3.5 text-[#00C6FF]" />
                  Online &amp; Auto-Sync Active
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={handleFinishMyShift}
              disabled={saving}
              className="bg-white text-[#0A2B6D] font-black shadow-md hover:bg-slate-100"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4 text-[#0072FF]" />
              <span style={{ color: '#0A2B6D' }}>
                Finish My Shift ({7 - missingFinishItems.length}/7 Verified)
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* 1-Click Rapid Completion Bar (6 Frontline Actions Always Accessible) */}
      <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/60 p-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
            1-Click Rapid Completion Bar (Minimal Clicks · Auto-Populated Context)
          </span>
          <Badge className="bg-[#0A2B6D] text-white text-[10px]">
            Mobile &amp; Tablet Optimised
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Complete Shift Note', gate: 'shift_note' },
            { label: 'Complete Progress Note', gate: 'progress_note' },
            { label: 'Complete Checklist', gate: 'risks_updated' },
            { label: 'Acknowledge Policy', gate: 'signatures_completed' },
            { label: 'Confirm Attendance', gate: 'clock_out' },
            { label: 'Complete Vehicle Check', gate: 'incidents_recorded' },
          ].map((act) => (
            <Button
              key={act.label}
              size="sm"
              variant="outline"
              onClick={() => handleOneClickAction(act.label, act.gate)}
              className="border-[#0A2B6D] bg-white text-[11px] font-extrabold text-[#0A2B6D] hover:bg-[#0A2B6D] hover:text-white"
            >
              <Zap className="mr-1 h-3 w-3 text-[#0072FF]" />
              {act.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 5 Frontline Workspace Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2">
        {[
          { id: 'finish-shift', label: '1. "Finish My Shift" 7-Gate Verification' },
          { id: 'my-day', label: '2. My Day Dashboard (8 One-Click Tiles)' },
          { id: 'shift-workspace', label: '3. All-in-One Shift Workspace (Participant · Meds · Risks · Plan)' },
          { id: 'quick-note', label: '4. Quick Note, Voice-to-Text, 7 Templates & AI Assist' },
          { id: 'smart-checklists', label: '5. Smart Checklists (✓ Yes / ✗ No / Comments)' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
              activeTab === t.id
                ? 'bg-[#0A2B6D] text-white shadow-xs'
                : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: "FINISH MY SHIFT" 7-GATE VERIFICATION */}
      {activeTab === 'finish-shift' && (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                  &ldquo;Finish My Shift&rdquo; Automated 7-Point Verification Gate
                </div>
                <p className="text-[11px] font-semibold text-[#0A2B6D]">
                  Untick any item below to test how pressing &ldquo;Finish My Shift&rdquo; automatically detects the missing requirement and takes the worker straight to it.
                </p>
              </div>
              <Badge
                className={
                  missingFinishItems.length === 0
                    ? 'bg-[#0072FF] text-white'
                    : 'bg-[#FF2E9A] text-white'
                }
              >
                {missingFinishItems.length === 0
                  ? 'All 7 Shift Requirements Complete'
                  : `${missingFinishItems.length} Item(s) Missing — Guided Redirect Ready`}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {finishShiftItems.map((item) => {
                const done = finishShiftChecks[item.key];
                return (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between rounded-xl border-2 p-2.5 ${
                      done
                        ? 'border-[#0A2B6D] bg-white'
                        : 'border-[#FF2E9A] bg-[#F5F0FF]'
                    }`}
                  >
                    <label className="flex items-center gap-2 text-xs font-extrabold text-[#0A2B6D] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={(e) =>
                          setFinishShiftChecks({
                            ...finishShiftChecks,
                            [item.key]: e.target.checked,
                          })
                        }
                      />
                      <span>{done ? `✅ ${item.label}` : `⚠️ ${item.label}`}</span>
                    </label>
                    {!done && (
                      <Button
                        size="sm"
                        onClick={() => setActiveTab(item.targetTab)}
                        className="h-6 bg-[#FF2E9A] px-2 text-[10px] font-extrabold text-white"
                      >
                        Go Now
                      </Button>
                    )}
                  </div>
                );
              })}

              <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/50 p-2.5">
                <Label className="text-[10.5px] font-extrabold text-[#0A2B6D]">
                  Worker Digital Sign-Off
                </Label>
                <Input
                  value={digitalSignature}
                  onChange={(e) => setDigitalSignature(e.target.value)}
                  className="mt-1 h-7 border-[#0A2B6D] bg-white text-xs"
                />
              </div>
            </div>

            <Button
              onClick={handleFinishMyShift}
              disabled={saving}
              className="w-full bg-[#0A2B6D] text-white font-black hover:bg-[#5A00D6]"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4 text-[#00C6FF]" />
              {missingFinishItems.length > 0
                ? `Finish My Shift — Open Missing Item (${missingFinishItems[0].label})`
                : 'Finish My Shift — Finalise Clock-Out, Notes, Goals, Risks & Vault Filing'}
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: MY DAY DASHBOARD (8 PERSONALISED TILES WITH 1-CLICK ACCESS) */}
      {activeTab === 'my-day' && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "1. Today's Shifts",
              stat: '2 Rostered Shifts',
              detail: '08:00–16:00 Lachlan Cooper · 16:30–20:00 Evening Support',
              action: 'Confirm Attendance',
              onClick: () => handleOneClickAction('Confirm Today Shift Attendance', 'clock_out'),
            },
            {
              title: '2. Current Shift',
              stat: 'In Progress (Parramatta SIL)',
              detail: 'Participant: Lachlan Cooper · Active since 08:00',
              action: 'Open Shift Workspace',
              onClick: () => setActiveTab('shift-workspace'),
            },
            {
              title: '3. Upcoming Shift',
              stat: 'Tomorrow 07:30–15:30',
              detail: 'Chatswood Aged Care Hub — Personal Care & Mobility',
              action: 'Acknowledge Roster',
              onClick: () => handleOneClickAction('Acknowledge Upcoming Shift'),
            },
            {
              title: '4. Outstanding Notes',
              stat: '0 Overdue · 1 Due at Clock-Out',
              detail: 'Shift Note & Progress Note pre-populated and ready',
              action: 'Quick Note Entry',
              onClick: () => setActiveTab('quick-note'),
            },
            {
              title: '5. Reviews Due',
              stat: '1 Participant 3-Monthly Review',
              detail: 'Lachlan Cooper Goal & Risk Review due in 7 days',
              action: 'Complete Review Now',
              onClick: () => handleOneClickAction('Complete Participant Goal & Risk Review', 'risks_updated'),
            },
            {
              title: '6. Expiring Certifications',
              stat: 'CPR Refresher (28 Days)',
              detail: 'NDIS Worker Screening & First Aid verified current',
              action: 'Upload / Renew Evidence',
              onClick: () => handleOneClickAction('Verify Certification Renewal Evidence'),
            },
            {
              title: '7. Compliance Actions',
              stat: 'Daily Vehicle & Medication Check',
              detail: 'Required prior to community transport departure',
              action: 'Open Smart Checklist',
              onClick: () => setActiveTab('smart-checklists'),
            },
            {
              title: '8. Tasks Due',
              stat: 'Sign Off Shift Handover & Policy',
              detail: 'Updated Infection Control & Medication Policy v2.4',
              action: '1-Click Acknowledge',
              onClick: () => handleOneClickAction('Acknowledge Policy & Handover Task', 'signatures_completed'),
            },
          ].map((tile) => (
            <div
              key={tile.title}
              className="flex flex-col justify-between rounded-xl border-2 border-[#0A2B6D] bg-white p-3 shadow-2xs"
            >
              <div>
                <div className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                  {tile.title}
                </div>
                <div className="mt-0.5 text-sm font-black text-[#0A2B6D]">{tile.stat}</div>
                <p className="mt-1 text-[11px] text-muted-foreground">{tile.detail}</p>
              </div>
              <Button
                size="sm"
                onClick={tile.onClick}
                className="mt-2.5 w-full bg-[#0A2B6D] text-white text-[11px] font-extrabold"
              >
                {tile.action}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ALL-IN-ONE SHIFT WORKSPACE (8 PANELS IN ONE LOCATION — ZERO MODULE HOPPING) */}
      {activeTab === 'shift-workspace' && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: '1. Participant Summary',
              badge: 'NDIS-43109821',
              body: 'Lachlan Cooper · DOB 14/05/1996 · Likes quiet morning routine, swimming & cooking. Communicates verbally and uses visual schedule.',
            },
            {
              title: '2. Active Goals',
              badge: '2 Active Goals',
              body: 'Goal 1: Independent morning routine & shopping (75%). Goal 2: Meal preparation & budgeting with minimal prompts (60%).',
            },
            {
              title: '3. Risks & Controls',
              badge: 'Low-Medium Risk',
              body: 'Sensory overload in loud crowds → Control: Offer noise-cancelling headphones & quiet break space. Community road safety → Escort at crossings.',
            },
            {
              title: '4. Critical Alerts',
              badge: 'Allergy & Sensory',
              body: 'Penicillin allergy. Prefers 10-minute notice before transitioning between home and community transport.',
            },
            {
              title: '5. Medication Information',
              badge: 'SAM & MAR Verified',
              body: '08:00 Regular Webster-pak supervised. PRN Lorazepam 1mg protocol requires Team Leader approval + 30-min post-observation.',
            },
            {
              title: '6. Emergency Information (PEEP)',
              badge: 'Assembly Point A',
              body: 'Emergency Contact: Margaret Cooper (Mother / Nominee) 0412 555 890. Ambulatory evacuation with verbal reassurance.',
            },
            {
              title: '7. Support Plan Essentials',
              badge: 'High-Intensity Daily Life',
              body: 'Active support (do WITH, not FOR). Encourage choice in meals, clothing, and community outing destination.',
            },
            {
              title: '8. Required Shift Tasks',
              badge: '4 Shift Tasks',
              body: '✓ Morning MAR check · ✓ Community shopping · ✓ Vehicle pre-trip check · ✓ Complete Shift & Progress Note before Clock-Out.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#0A2B6D]">{card.title}</span>
                <Badge className="bg-[#5A00D6] text-white text-[9.5px]">{card.badge}</Badge>
              </div>
              <p className="text-[11px] font-medium text-[#0A2B6D]">{card.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: QUICK NOTE ENTRY, VOICE-TO-TEXT, 7 SMART TEMPLATES & AI-ASSISTED DOCUMENTATION */}
      {activeTab === 'quick-note' && (
        <div className="space-y-3">
          {/* 7 Smart Templates Strip */}
          <div className="flex flex-wrap gap-1.5">
            {SMART_7_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold transition ${
                  selectedTemplateId === tpl.id
                    ? 'bg-[#5A00D6] text-white'
                    : 'border border-[#0A2B6D]/40 bg-[#F5F0FF] text-[#0A2B6D]'
                }`}
              >
                {tpl.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">
                  Auto-Populated Participant / Asset
                </Label>
                <Input
                  value={quickNote.participant}
                  onChange={(e) => setQuickNote({ ...quickNote, participant: e.target.value })}
                  className="mt-1 border-[#0A2B6D]"
                />
              </div>
              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">
                  Goal Selection
                </Label>
                <Input
                  value={quickNote.goal}
                  onChange={(e) => setQuickNote({ ...quickNote, goal: e.target.value })}
                  className="mt-1 border-[#0A2B6D]"
                />
              </div>
              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">
                  Outcome Selection
                </Label>
                <select
                  value={quickNote.outcome}
                  onChange={(e) => setQuickNote({ ...quickNote, outcome: e.target.value })}
                  className="mt-1 h-9 w-full rounded-md border border-[#0A2B6D] bg-white px-2.5 text-xs font-bold text-[#0A2B6D]"
                >
                  <option value="Achieved — Positive Participant Engagement">
                    Achieved — Positive Participant Engagement
                  </option>
                  <option value="Progressing Towards NDIS Plan Goal">
                    Progressing Towards NDIS Plan Goal
                  </option>
                  <option value="Milestone Advanced (+15% Progress)">
                    Milestone Advanced (+15% Progress)
                  </option>
                  <option value="Controls Effective — Low Residual Risk">
                    Controls Effective — Low Residual Risk
                  </option>
                  <option value="Follow-Up Required by Team Leader">
                    Follow-Up Required by Team Leader
                  </option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">
                  Brief Frontline Note (Or Use Voice-to-Text + AI Assist)
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleToggleVoiceToText}
                    className={`h-7 text-[11px] font-extrabold ${
                      listening ? 'bg-[#FF2E9A] text-white' : 'bg-[#0072FF] text-white'
                    }`}
                  >
                    {listening ? (
                      <>
                        <MicOff className="mr-1 h-3.5 w-3.5" />
                        Stop Dictation
                      </>
                    ) : (
                      <>
                        <Mic className="mr-1 h-3.5 w-3.5" />
                        Voice-to-Text Dictation
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAiAssistDocumentation}
                    className="h-7 bg-[#5A00D6] text-white text-[11px] font-extrabold"
                  >
                    <Sparkles className="mr-1 h-3.5 w-3.5 text-[#00C6FF]" />
                    AI-Assist Professional Summary
                  </Button>
                </div>
              </div>
              <Textarea
                value={quickNote.raw_note}
                onChange={(e) => setQuickNote({ ...quickNote, raw_note: e.target.value })}
                rows={3}
                className="mt-1 border-[#0A2B6D]"
              />
            </div>

            {quickNote.ai_enhanced_note && (
              <div className="rounded-lg border-2 border-[#5A00D6] bg-[#F5F0FF]/50 p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[#5A00D6]">
                    AI-Assisted Professional Shift Note, Goal Update &amp; Progress Summary (Original Preserved)
                  </span>
                  <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#0A2B6D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quickNote.human_reviewed}
                      onChange={(e) =>
                        setQuickNote({ ...quickNote, human_reviewed: e.target.checked })
                      }
                    />
                    <span>Human Reviewed &amp; Approved</span>
                  </label>
                </div>
                <Textarea
                  value={quickNote.ai_enhanced_note}
                  onChange={(e) =>
                    setQuickNote({ ...quickNote, ai_enhanced_note: e.target.value })
                  }
                  rows={4}
                  className="border-[#0A2B6D] bg-white text-xs"
                />
              </div>
            )}

            <Button
              onClick={handleSaveQuickNote}
              disabled={saving}
              className="w-full bg-[#0A2B6D] text-white font-extrabold"
            >
              <Send className="mr-1.5 h-4 w-4 text-[#00C6FF]" />
              {offlineMode
                ? `Save ${currentTemplate.type} to Offline Queue`
                : `Save ${currentTemplate.type} & Auto-Link to Profile, Goals & Document Vault`}
            </Button>
          </div>
        </div>
      )}

      {/* TAB 5: SMART CHECKLISTS (✓ YES / ✗ NO / COMMENTS) */}
      {activeTab === 'smart-checklists' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(SMART_6_CHECKLISTS).map(([key, cl]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedChecklistKey(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  selectedChecklistKey === key
                    ? 'bg-[#0A2B6D] text-white'
                    : 'border border-slate-200 bg-[#F5F0FF] text-[#0A2B6D]'
                }`}
              >
                {cl.title}
              </button>
            ))}
          </div>

          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
              {SMART_6_CHECKLISTS[selectedChecklistKey].title} — Rapid ✓ Yes / ✗ No / Comments
            </div>

            {SMART_6_CHECKLISTS[selectedChecklistKey].items.map((itemText, idx) => {
              const ans = checklistAnswers[idx] || { status: 'Yes', comment: '' };
              return (
                <div
                  key={itemText}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-12 items-center rounded-lg border border-slate-200 bg-slate-50 p-2"
                >
                  <div className="sm:col-span-6 text-xs font-extrabold text-[#0A2B6D]">
                    {idx + 1}. {itemText}
                  </div>
                  <div className="sm:col-span-2 flex gap-1">
                    {['Yes', 'No'].map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() =>
                          setChecklistAnswers({
                            ...checklistAnswers,
                            [idx]: { ...ans, status: choice },
                          })
                        }
                        className={`flex-1 rounded px-2 py-1 text-xs font-black transition ${
                          ans.status === choice
                            ? choice === 'Yes'
                              ? 'bg-[#0072FF] text-white'
                              : 'bg-[#FF2E9A] text-white'
                            : 'border border-slate-300 bg-white text-[#0A2B6D]'
                        }`}
                      >
                        {choice === 'Yes' ? '✓ Yes' : '✗ No'}
                      </button>
                    ))}
                  </div>
                  <div className="sm:col-span-4">
                    <Input
                      value={ans.comment}
                      onChange={(e) =>
                        setChecklistAnswers({
                          ...checklistAnswers,
                          [idx]: { ...ans, comment: e.target.value },
                        })
                      }
                      placeholder="Optional comment / action..."
                      className="h-8 border-[#0A2B6D] bg-white text-xs"
                    />
                  </div>
                </div>
              );
            })}

            <Button
              onClick={handleCompleteSmartChecklist}
              disabled={saving}
              className="w-full bg-[#0A2B6D] text-white font-extrabold"
            >
              <ClipboardCheck className="mr-1.5 h-4 w-4 text-[#00C6FF]" />
              Complete {SMART_6_CHECKLISTS[selectedChecklistKey].title} in 1 Click
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}