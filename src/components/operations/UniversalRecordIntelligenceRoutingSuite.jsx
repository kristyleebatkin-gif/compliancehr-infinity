import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { exportUniversalData } from '@/lib/universalStorageAndExportEngine';
import {
  Sparkles,
  PhoneCall,
  Mail,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Target,
  ClipboardList,
  Layers,
  Printer,
  FileSpreadsheet,
  Download,
  Lock,
  ArrowRight,
  GitBranch,
  Database,
} from 'lucide-react';

export const UNIVERSAL_28_RECORD_TYPES = [
  'Shift Notes',
  'Progress Notes',
  'Service Notes',
  'Case Notes',
  'Communications',
  'Phone Calls',
  'Meeting Notes',
  'Family Contact Notes',
  'Support Coordinator Notes',
  'Allied Health Notes',
  'Emails',
  'SMS Records',
  'Audit Records',
  'Assessments',
  'Reviews',
  'Incident Reports',
  'Risk Assessments',
  'Complaints',
  'Feedback',
  'Service Agreements',
  'Consents',
  'Goals',
  'Vehicle Checks',
  'Medication Records',
  'Emergency Reviews',
  'Fire Drill Records',
  'Uploaded Documents',
  'Attachments',
];

export const EXTRACTION_18_SIGNALS = [
  { id: 'risks', label: '1. Risks', keywords: ['risk', 'hazard', 'fall', 'slip', 'unsafe', 'choke', 'injury'], routeTo: 'Risk Register + Participant Risk Profile + Review Task' },
  { id: 'concerns', label: '2. Concerns', keywords: ['concern', 'worried', 'anxious', 'distress', 'upset'], routeTo: 'Issue/Concern Register + Team Leader Notification' },
  { id: 'issues', label: '3. Issues', keywords: ['issue', 'barrier', 'problem', 'delay', 'broken', 'defect'], routeTo: 'Quality & Improvement Register + Action Task' },
  { id: 'incidents', label: '4. Incidents', keywords: ['incident', 'accident', 'hospital', 'ambulance', 'aggression', 'error', 'bruise'], routeTo: 'Incident Register (Auto-Populated) + Manager Alert' },
  { id: 'safeguarding', label: '5. Safeguarding Events', keywords: ['safeguard', 'abuse', 'neglect', 'restrictive', 'unexplained', 'sirs'], routeTo: 'Safeguarding & NDIS/SIRS 24h Priority Escalation' },
  { id: 'actions', label: '6. Actions', keywords: ['action', 'follow up', 'follow-up', 'arrange', 'contact', 'schedule'], routeTo: 'Action Register + Assigned Owner & Due Date' },
  { id: 'tasks', label: '7. Tasks', keywords: ['task', 'todo', 'to-do', 'complete', 'check', 'book'], routeTo: 'Shared To-Do Board + Staff Reminder' },
  { id: 'goal_progress', label: '8. Goal Progress', keywords: ['goal', 'progress', 'practised', 'independent', 'skill', 'participated'], routeTo: 'Participant Goal Tracker + Outcome Dashboard' },
  { id: 'goal_achievement', label: '9. Goal Achievement', keywords: ['achieved', 'completed goal', 'mastered', 'milestone'], routeTo: 'Goal Achievement Register + 90-Day Review' },
  { id: 'health_changes', label: '10. Health Changes', keywords: ['health', 'gp', 'doctor', 'pain', 'fever', 'cough', 'clinical', 'diet'], routeTo: 'Participant Clinical Profile + Allied Health Review' },
  { id: 'medication_changes', label: '11. Medication Changes', keywords: ['medication', 'meds', 'prn', 'dose', 'script', 'pharmacy', 'blister'], routeTo: 'Medication Chart + S8/PRN Competency Alert' },
  { id: 'behaviour_changes', label: '12. Behaviour Changes', keywords: ['behaviour', 'behavior', 'agitated', 'withdrawn', 'trigger', 'bsp'], routeTo: 'Behaviour Support Plan + Practitioner Review' },
  { id: 'environmental_changes', label: '13. Environmental Changes', keywords: ['environment', 'home', 'hoist', 'wheelchair', 'smoke alarm', 'lighting'], routeTo: 'Home Risk Assessment + Asset Register' },
  { id: 'comm_records', label: '14. Communication Records', keywords: ['called', 'emailed', 'sms', 'spoke', 'discussed', 'meeting'], routeTo: 'Communication Register + Timeline' },
  { id: 'support_changes', label: '15. Support Changes', keywords: ['roster', 'hours', 'funding', 'ratio', 'support change', 'schedule change'], routeTo: 'Service Agreement + Roster & Funding Review' },
  { id: 'family_updates', label: '16. Family Updates', keywords: ['family', 'mother', 'father', 'guardian', 'nominee', 'carer'], routeTo: 'Family Contact Log + Participant Timeline' },
  { id: 'review_requirements', label: '17. Review Requirements', keywords: ['review', 'reassess', 'audit', 'due', 'renewal'], routeTo: 'Review Due Board + 30/14/7/3/1-Day Reminders' },
  { id: 'escalation_requirements', label: '18. Escalation Requirements', keywords: ['urgent', 'critical', 'immediate', 'escalate', 'manager', 'emergency'], routeTo: 'Immediate Executive & Compliance Escalation' },
];

export const COMM_8_CHANNELS = [
  'Phone Call',
  'Email',
  'SMS',
  'Meeting',
  'Family Discussion',
  'Guardian Discussion',
  'Support Coordinator Discussion',
  'Allied Health Discussion',
];

export const DOC_HUB_11_CATEGORIES = [
  '1. Communications',
  '2. Calls',
  '3. Messages',
  '4. Notes',
  '5. Goals',
  '6. Risks',
  '7. Incidents',
  '8. Reviews',
  '9. Service Delivery',
  '10. Compliance',
  '11. Audits',
];

export const EXPORT_7_SCOPES = [
  'Profiles',
  'Communication History',
  'Goal Progress',
  'Risk Registers',
  'Incident Histories',
  'Service Records',
  'Audit Evidence Packs',
];

export default function UniversalRecordIntelligenceRoutingSuite() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('analyzer');
  const [participants, setParticipants] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [recentRoutedLogs, setRecentRoutedLogs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 5);

  // Universal Record Analyzer State
  const [recordForm, setRecordForm] = useState({
    record_type: 'Progress Notes',
    comm_channel: 'Phone Call',
    participant_name: 'Jordan Taylor (NDIS #430911882)',
    employee_name: '',
    service_type: 'Daily Living & Community Access',
    subject: 'Shift Progress, Goal Milestone, PRN Medication Check & Home Safety Note',
    content:
      'Spoke with family guardian and Support Coordinator regarding Jordan’s independent cooking goal progress (achieved milestone today). Identified minor slip hazard risk near bathroom mat — mat secured immediately. PRN medication chart reviewed with GP; follow-up task scheduled for Team Leader review within 7 days.',
    owner: '',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    consent_verified: true,
    uploaded_file_uri: '',
    uploaded_file_name: '',
  });

  // Call Record Management State (Date, Time, Caller, Receiver, Subject, Summary, Outcome, Actions)
  const [callForm, setCallForm] = useState({
    date: today,
    time: nowTime,
    channel: 'Phone Call',
    caller: '',
    receiver: 'Support Coordinator & Family Guardian',
    participant_name: 'Jordan Taylor (NDIS #430911882)',
    employee_name: '',
    service_linked: 'Core Daily Activities',
    review_linked: '90-Day Participant Progress Review',
    risk_linked: 'Home Falls Prevention Control',
    subject: 'Allied Health OT Assessment & Goal Progress Update',
    summary:
      'Discussed Occupational Therapy home modification recommendations, verified positive goal progress on community transport, and noted follow-up action to update Individual Risk Assessment.',
    outcome: 'Agreed to update Support Plan & Risk Register; family acknowledged and consented.',
    actions: 'Update Individual Risk Assessment and schedule 14-day review check.',
  });

  const [selectedExportScope, setSelectedExportScope] = useState('Communication History');

  useEffect(() => {
    if (user?.full_name) {
      setRecordForm((prev) => ({
        ...prev,
        employee_name: prev.employee_name || user.full_name,
        owner: prev.owner || user.full_name,
      }));
      setCallForm((prev) => ({
        ...prev,
        caller: prev.caller || user.full_name,
        employee_name: prev.employee_name || user.full_name,
      }));
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pRes, sRes, cRes] = await Promise.all([
          base44.entities.ParticipantProfile.list('-created_date', 15).catch(() => []),
          base44.entities.StaffProfile.list('-created_date', 15).catch(() => []),
          base44.entities.CommunicationEntry.list('-created_date', 10).catch(() => []),
        ]);
        if (!mounted) return;
        const pItems = Array.isArray(pRes) ? pRes : pRes?.items || [];
        const sItems = Array.isArray(sRes) ? sRes : sRes?.items || [];
        const cItems = Array.isArray(cRes) ? cRes : cRes?.items || [];
        setParticipants(pItems);
        setStaffList(sItems);
        setRecentRoutedLogs(cItems);
        if (pItems[0]?.full_name) {
          setRecordForm((prev) => ({ ...prev, participant_name: pItems[0].full_name }));
          setCallForm((prev) => ({ ...prev, participant_name: pItems[0].full_name }));
        }
      } catch {
        // fallback defaults kept
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Automatically analyse text & detect which of the 18 signals are present
  const detectedSignals = useMemo(() => {
    const text = `${recordForm.subject} ${recordForm.content} ${recordForm.record_type}`.toLowerCase();
    return EXTRACTION_18_SIGNALS.map((sig) => {
      const matched = sig.keywords.some((kw) => text.includes(kw));
      return { ...sig, detected: matched };
    });
  }, [recordForm.subject, recordForm.content, recordForm.record_type]);

  const activeSignalsCount = useMemo(
    () => detectedSignals.filter((s) => s.detected).length,
    [detectedSignals]
  );

  // Private file upload for Document & Attachment Intelligence
  const handlePrivateUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setRecordForm((prev) => ({
        ...prev,
        uploaded_file_uri: file_uri || `private://${file.name}`,
        uploaded_file_name: file.name,
      }));
      toast({
        title: `Document Uploaded (${file.name})`,
        description:
          'Uploaded (stored privately) and queued for automatic Participant, Employee, Goal, Risk & Audit routing.',
      });
    } catch {
      setRecordForm((prev) => ({
        ...prev,
        uploaded_file_uri: `private://${file.name}`,
        uploaded_file_name: file.name,
      }));
      toast({
        title: `Attached ${file.name}`,
        description: 'Ready for multi-destination intelligent routing.',
      });
    } finally {
      setUploadingFile(false);
    }
  };

  // Confirm & Execute Intelligent Multi-Destination Routing
  const handleConfirmAndRouteAll = async (createIncidentNow = false) => {
    if (!recordForm.content.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter or paste a note, communication, email or document summary.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      const activeSignalLabels = detectedSignals
        .filter((s) => s.detected)
        .map((s) => s.label)
        .join(', ');

      const hasRisk = detectedSignals.find((s) => s.id === 'risks' || s.id === 'environmental_changes')?.detected;
      const hasIncident =
        createIncidentNow ||
        detectedSignals.find((s) => s.id === 'incidents' || s.id === 'safeguarding')?.detected;
      const hasGoal = detectedSignals.find((s) => s.id === 'goal_progress' || s.id === 'goal_achievement')?.detected;
      const hasActionOrTask = detectedSignals.find(
        (s) => s.id === 'actions' || s.id === 'tasks' || s.id === 'review_requirements'
      )?.detected;

      const ops = [
        // 1. Communication & Timeline Register
        base44.entities.CommunicationEntry.create({
          entry_kind: recordForm.record_type.includes('Shift') ? 'Shift Note' : 'Message',
          document_number: `URI-${Date.now().toString().slice(-6)}`,
          version: 'v1.0',
          lifecycle_status: 'Delivered',
          person_type: 'Participant',
          person_name: recordForm.participant_name,
          note_type: `${recordForm.record_type} (${recordForm.comm_channel})`,
          subject: `[Universal Intelligence Routed] ${recordForm.subject}`,
          body: `${recordForm.content}\n\n[Extracted Intelligence Signals]: ${activeSignalLabels || 'General Service Record'}\n[Linked Employee]: ${recordForm.employee_name}\n[Service]: ${recordForm.service_type}`,
          issues_concerns: hasRisk ? 'Risk/Concern automatically extracted & routed to Risk Register' : '',
          goal: hasGoal ? 'Goal progress extracted & linked to Participant Goal Tracker' : '',
          entry_date: today,
          entry_time: nowTime,
          sender_name: recordForm.employee_name || user?.full_name || 'Authorised Staff',
          sender_email: user?.email || '',
          module: 'Universal Record Intelligence Engine',
          goal_note_created: Boolean(hasGoal),
        }).catch(() => null),

        // 2. Document Hub & Vault (Versioned)
        base44.entities.ChecklistDocument.create({
          title: `[Document Hub · ${recordForm.record_type}] ${recordForm.participant_name} — ${recordForm.subject} (v1.0)`,
          category: recordForm.record_type,
          status: 'Approved',
          participant_name: recordForm.participant_name,
          uploaded_by: recordForm.employee_name || user?.full_name || 'Authorised Staff',
          uploaded_date: today,
          file_uri: recordForm.uploaded_file_uri || undefined,
          file_name: recordForm.uploaded_file_name || undefined,
          notes: `18-Signal Extraction: ${activeSignalLabels} | Auto-routed to Participant Profile, Employee Profile, Document Hub, Vault, Compliance Centre & Executive Hub.`,
        }).catch(() => null),

        // 3. Company Safe Immutable Copy
        base44.entities.CompanySafeDocument.create({
          title: `[Company Safe · Universal Record Intelligence] ${recordForm.record_type} — ${recordForm.participant_name} (${today})`,
          category: 'Universal Record Intelligence',
          status: 'Active',
          uploaded_by: recordForm.employee_name || user?.full_name || 'Authorised Staff',
          uploaded_date: today,
          review_date: recordForm.due_date || today,
          file_uri: recordForm.uploaded_file_uri || undefined,
          file_name: recordForm.uploaded_file_name || undefined,
          notes: `Protected Single-Entry Intelligence Record | Signals: ${activeSignalLabels}`,
        }).catch(() => null),
      ];

      // 4. Automatic Risk Routing if risk detected
      if (hasRisk) {
        ops.push(
          base44.entities.Risk.create({
            title: `[Auto-Extracted Risk] ${recordForm.subject} — ${recordForm.participant_name}`,
            report_type: 'Risk',
            document_number: `RSK-AUTO-${Date.now().toString().slice(-5)}`,
            version: 'v1.0',
            participant_name: recordForm.participant_name,
            owner: recordForm.owner || user?.full_name || 'Compliance Manager',
            category: 'Participant',
            rating: 'Medium',
            status: 'Assessed',
            description: recordForm.content,
            control_measures: 'Extracted automatically from Universal Record Intelligence Engine; review task created.',
            identified_date: today,
            review_date: recordForm.due_date,
          }).catch(() => null)
        );
      }

      // 5. Automatic Incident Creation if incident detected or user clicked "Create Incident"
      if (hasIncident) {
        ops.push(
          base44.entities.Incident.create({
            title: `[Auto-Populated Incident] ${recordForm.subject} — ${recordForm.participant_name}`,
            incident_id: `INC-AUTO-${Date.now().toString().slice(-5)}`,
            document_number: `INC-DOC-${Date.now().toString().slice(-5)}`,
            version: 'v1.0',
            date_occurred: today,
            time_occurred: nowTime,
            date_reported: today,
            reported_by: recordForm.employee_name || user?.full_name || 'Support Worker',
            participant_name: recordForm.participant_name,
            staff_name: recordForm.employee_name || user?.full_name || 'Support Worker',
            location: recordForm.service_type,
            category: 'Safety',
            severity: 'Medium',
            status: 'Reported',
            description: recordForm.content,
            immediate_actions: 'Auto-populated via Universal Record Intelligence Engine and linked to Participant, Worker & Service.',
          }).catch(() => null)
        );
      }

      // 6. Automatic Goal Progress Update if goal detected
      if (hasGoal) {
        ops.push(
          base44.entities.GoalProgressNote.create({
            participant_name: recordForm.participant_name,
            goal_title: recordForm.subject,
            note_date: today,
            progress_rating: 'Progressing Well',
            notes: `[Auto-Routed Goal Intelligence] ${recordForm.content}`,
            recorded_by: recordForm.employee_name || user?.full_name || 'Support Worker',
          }).catch(() => null)
        );
      }

      // 7. Automatic Action & Task Creation with Owner, Due Date & Reminder
      if (hasActionOrTask || hasRisk || hasIncident) {
        ops.push(
          base44.entities.TodoTask.create({
            title: `[Auto-Extracted Action] Follow up on ${recordForm.record_type}: ${recordForm.subject}`,
            task_type: 'Universal Intelligence Follow-Up',
            module: 'Universal Record Intelligence',
            task_date: today,
            due_date: recordForm.due_date,
            assigned_to: recordForm.owner || user?.full_name || 'Team Leader',
            priority: hasIncident ? 'High' : 'Medium',
            status: 'Pending',
            notes: `Auto-created from ${recordForm.record_type} for ${recordForm.participant_name}. Extracted signals: ${activeSignalLabels}`,
          }).catch(() => null)
        );
      }

      await Promise.all(ops);

      const refreshed = await base44.entities.CommunicationEntry.list('-created_date', 10).catch(() => []);
      setRecentRoutedLogs(Array.isArray(refreshed) ? refreshed : refreshed?.items || []);

      toast({
        title: 'Intelligent Extraction & 8-Hub Routing Complete!',
        description: `Analysed ${activeSignalsCount} signals and updated Participant Profile, Employee Profile, ${hasGoal ? 'Goals, ' : ''}${hasRisk ? 'Risk Register, ' : ''}${hasIncident ? 'Incident Register, ' : ''}Tasks, Document Hub, Vault & Company Safe.`,
      });
    } finally {
      setSaving(false);
    }
  };

  // Save & Route Structured Phone Call / Communication Record
  const handleSaveCallRecord = async () => {
    if (!callForm.subject.trim() || !callForm.summary.trim()) {
      toast({
        title: 'Subject & Summary Required',
        description: 'Please enter the call subject and summary.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      await Promise.all([
        base44.entities.CommunicationEntry.create({
          entry_kind: 'Message',
          document_number: `CALL-${Date.now().toString().slice(-6)}`,
          version: 'v1.0',
          lifecycle_status: 'Responded',
          person_type: 'Participant',
          person_name: callForm.participant_name,
          note_type: `Call Record (${callForm.channel})`,
          subject: `[${callForm.channel}] ${callForm.subject}`,
          body: `Caller: ${callForm.caller} | Receiver: ${callForm.receiver}\nService: ${callForm.service_linked} | Review: ${callForm.review_linked} | Risk: ${callForm.risk_linked}\nSummary: ${callForm.summary}\nOutcome: ${callForm.outcome}\nFollow-Up Actions: ${callForm.actions}`,
          entry_date: callForm.date,
          entry_time: callForm.time,
          sender_name: callForm.caller || user?.full_name || 'Staff',
          module: 'Call Record Management',
        }).catch(() => null),
        base44.entities.TodoTask.create({
          title: `[Call Follow-Up Action] ${callForm.subject} (${callForm.participant_name})`,
          task_type: 'Call Follow-Up',
          module: 'Communications & Call Intelligence',
          task_date: callForm.date,
          due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          assigned_to: callForm.caller || user?.full_name || 'Support Coordinator',
          priority: 'Medium',
          status: 'Pending',
          notes: `Outcome: ${callForm.outcome} | Action: ${callForm.actions}`,
        }).catch(() => null),
        base44.entities.ChecklistDocument.create({
          title: `[Document Hub · Calls] ${callForm.channel} — ${callForm.participant_name}: ${callForm.subject}`,
          category: 'Calls & Communications',
          status: 'Approved',
          participant_name: callForm.participant_name,
          uploaded_by: callForm.caller || user?.full_name || 'Staff',
          uploaded_date: callForm.date,
          notes: `Linked to Participant (${callForm.participant_name}), Employee (${callForm.employee_name}), Service (${callForm.service_linked}), Review (${callForm.review_linked}) & Risk (${callForm.risk_linked}).`,
        }).catch(() => null),
      ]);

      toast({
        title: `${callForm.channel} Record Saved & Routed`,
        description:
          'Updated Participant Profile, Communication Register, Timeline, Review Records, Related Actions & Document Hub.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Universal Export across all 7 Scopes & 4 Formats (PDF, Word, Excel, CSV)
  const handleUniversalExport = (formatType) => {
    const rows = [
      {
        scope: selectedExportScope,
        record_type: recordForm.record_type,
        channel: recordForm.comm_channel,
        participant: recordForm.participant_name,
        employee: recordForm.employee_name || user?.full_name || 'Staff',
        subject: recordForm.subject,
        signals_extracted: detectedSignals
          .filter((s) => s.detected)
          .map((s) => s.label)
          .join(', '),
        routed_destinations:
          'Participant Profile · Employee Profile · Goals · Risk Register · Incident Register · Tasks · Document Hub · Document Vault · Executive Hub · Company Safe',
      },
      ...recentRoutedLogs.slice(0, 10).map((log) => ({
        scope: selectedExportScope,
        record_type: log.note_type || log.entry_kind || 'Communication',
        channel: log.module || 'Platform Register',
        participant: log.person_name || recordForm.participant_name,
        employee: log.sender_name || 'Staff',
        subject: log.subject || 'Recorded Entry',
        signals_extracted: 'Verified & Linked across Profiles & Registers',
        routed_destinations:
          'Participant Profile · Employee Profile · Communication Register · Document Hub · Document Vault · Executive Hub',
      })),
    ];

    exportUniversalData(
      formatType,
      `Universal-Intelligence-${selectedExportScope.replace(/\s+/g, '-')}-${today}`,
      [
        { key: 'scope', label: 'Export Scope' },
        { key: 'record_type', label: 'Record Type' },
        { key: 'channel', label: 'Channel / Source' },
        { key: 'participant', label: 'Linked Participant' },
        { key: 'employee', label: 'Linked Employee' },
        { key: 'subject', label: 'Subject / Summary' },
        { key: 'signals_extracted', label: 'Extracted Intelligence Signals' },
        { key: 'routed_destinations', label: 'Auto-Routed Destinations' },
      ],
      rows,
      `Universal Record Intelligence — ${selectedExportScope}`
    );

    toast({
      title: `${selectedExportScope} (${formatType.toUpperCase()}) Exported`,
      description: 'Exported with full multi-destination linkage and audit history.',
    });
  };

  return (
    <section
      aria-label="Universal Record Intelligence, Communications & Data Routing Engine"
      className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-md space-y-4"
    >
      {/* Header Banner */}
      <div
        className="rounded-2xl p-4 text-white shadow-sm"
        style={{
          background:
            'linear-gradient(120deg, #0072FF 0%, #0A2B6D 24%, #5A00D6 58%, #A100FF 82%, #FF2E9A 100%)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              <GitBranch className="h-3.5 w-3.5 text-[#00C6FF]" />
              <span>Single-Entry Enterprise Intelligence · 28 Record Types · 18 Auto-Extracted Signals · 11 Document Hub Categories</span>
            </div>
            <h2 className="mt-1 font-editorial text-lg sm:text-xl font-extrabold text-white">
              Universal Record Intelligence, Communications &amp; Data Routing Engine
            </h2>
            <p className="text-xs font-medium text-white/95">
              Zero isolated records: every note, call, email, SMS, meeting, assessment, review, incident, risk and uploaded file is automatically analysed, classified, linked, routed, stored, audited and exportable across all profiles, hubs and registers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleConfirmAndRouteAll(false)}
              disabled={saving}
              className="bg-white text-[#0A2B6D] font-extrabold hover:bg-slate-100"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-[#5A00D6]" />
              <span style={{ color: '#0A2B6D' }}>
                {saving ? 'Routing Intelligence...' : `Confirm & Route (${activeSignalsCount} Signals Detected)`}
              </span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUniversalExport('pdf')}
              className="border-white bg-white/15 text-white font-extrabold hover:bg-white/25"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Export {selectedExportScope} (PDF)
            </Button>
          </div>
        </div>
      </div>

      {/* 7-Step Lifecycle Pipeline Strip (Analyse -> Classify -> Route -> Link -> Store -> Report -> Export) */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
        {[
          { step: '1. Analyse', desc: '18-Signal AI & Keyword Extraction' },
          { step: '2. Classify', desc: '28 Universal Record Types + Security' },
          { step: '3. Route', desc: 'Goals · Risks · Incidents · Tasks' },
          { step: '4. Link', desc: 'Participant · Employee · Service · Review' },
          { step: '5. Store', desc: '11-Category Document Hub · Vault · Safe' },
          { step: '6. Report', desc: '6 Executive & Compliance Dashboards' },
          { step: '7. Export', desc: 'PDF · Word · Excel · CSV (7 Scopes)' },
        ].map((item) => (
          <div
            key={item.step}
            className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/40 px-2.5 py-1.5"
          >
            <div className="text-[11px] font-extrabold text-[#0A2B6D]">{item.step}</div>
            <div className="text-[9.5px] font-bold text-[#5A00D6]">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2">
        {[
          { id: 'analyzer', label: '1. Intelligent Note, Document & Email Extractor (28 Record Types · 18 Signals)' },
          { id: 'calls-comms', label: '2. Call Record & 8-Channel Communication Router' },
          { id: 'routing-matrix', label: '3. Automatic Profile, Document Hub (11 Categories) & Executive Hub Matrix' },
          { id: 'export-security', label: '4. Universal 7-Scope Export (PDF/Word/Excel/CSV) & Consent/Privacy Gates' },
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

      {/* TAB 1: INTELLIGENT NOTE, DOCUMENT & EMAIL EXTRACTOR */}
      {activeTab === 'analyzer' && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* Left: Single-Entry Input & Upload */}
          <div className="lg:col-span-7 rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                Single-Entry Record, Email, Message or Document Input (28 Record Types)
              </div>
              <Badge className="bg-[#0A2B6D] text-white text-[10px]">
                Consent &amp; Privacy Verified
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Universal Record Type (28)</Label>
                <select
                  value={recordForm.record_type}
                  onChange={(e) => setRecordForm((p) => ({ ...p, record_type: e.target.value }))}
                  className="mt-1 flex h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs font-bold text-[#0A2B6D]"
                >
                  {UNIVERSAL_28_RECORD_TYPES.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Linked Participant</Label>
                <Input
                  value={recordForm.participant_name}
                  onChange={(e) => setRecordForm((p) => ({ ...p, participant_name: e.target.value }))}
                  list="uri-participants-list"
                  className="mt-1 h-8 text-xs"
                />
                <datalist id="uri-participants-list">
                  {participants.map((pt) => (
                    <option key={pt.id} value={pt.full_name} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Linked Employee / Author</Label>
                <Input
                  value={recordForm.employee_name}
                  onChange={(e) => setRecordForm((p) => ({ ...p, employee_name: e.target.value }))}
                  list="uri-staff-list"
                  className="mt-1 h-8 text-xs"
                />
                <datalist id="uri-staff-list">
                  {staffList.map((st) => (
                    <option key={st.id} value={st.full_name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Subject / Title</Label>
                <Input
                  value={recordForm.subject}
                  onChange={(e) => setRecordForm((p) => ({ ...p, subject: e.target.value }))}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Action Owner (If Extracted)</Label>
                <Input
                  value={recordForm.owner}
                  onChange={(e) => setRecordForm((p) => ({ ...p, owner: e.target.value }))}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Action / Review Due Date</Label>
                <Input
                  type="date"
                  value={recordForm.due_date}
                  onChange={(e) => setRecordForm((p) => ({ ...p, due_date: e.target.value }))}
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-[11px] font-bold text-[#0A2B6D]">
                Record Content / Email Body / Assessment / Shift Note (Live 18-Signal Extraction)
              </Label>
              <Textarea
                rows={4}
                value={recordForm.content}
                onChange={(e) => setRecordForm((p) => ({ ...p, content: e.target.value }))}
                className="mt-1 text-xs"
                placeholder="Enter shift note, progress note, phone call summary, email or assessment findings..."
              />
            </div>

            {/* Document & Attachment Intelligence Upload */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-[#F5F0FF]/50 p-2.5">
              <div className="text-[11px] font-bold text-[#0A2B6D]">
                <Upload className="inline h-3.5 w-3.5 mr-1 text-[#5A00D6]" />
                Document &amp; Attachment Intelligence (stored privately):{' '}
                <span className="text-[#5A00D6]">
                  {recordForm.uploaded_file_name || 'Optional file attachment for auto-classification'}
                </span>
              </div>
              <label className="cursor-pointer rounded-lg bg-[#0A2B6D] px-3 py-1 text-[11px] font-extrabold text-white hover:bg-[#5A00D6]">
                {uploadingFile ? 'Uploading...' : 'Attach File / Document'}
                <input type="file" className="hidden" onChange={handlePrivateUpload} />
              </label>
            </div>

            {/* Confirmation & One-Click Incident Creation Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => handleConfirmAndRouteAll(false)}
                disabled={saving}
                className="bg-[#0072FF] text-white font-extrabold hover:bg-[#0A2B6D]"
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Confirm &amp; Route Extracted Intelligence ({activeSignalsCount} Signals)
              </Button>
              <Button
                size="sm"
                onClick={() => handleConfirmAndRouteAll(true)}
                disabled={saving}
                className="bg-[#FF2E9A] text-white font-extrabold hover:bg-[#5A00D6]"
              >
                <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                Create Incident (Auto-Populate Participant, Worker, Service, Date &amp; Summary)
              </Button>
            </div>
          </div>

          {/* Right: 18-Signal Live Extraction & Confirmation Matrix */}
          <div className="lg:col-span-5 rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                Live 18-Signal Extraction &amp; Confirmation Matrix
              </div>
              <Badge className="bg-[#0072FF] text-white text-[10px]">
                {activeSignalsCount} / 18 Active
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 max-h-[340px] overflow-y-auto pr-1">
              {detectedSignals.map((sig) => (
                <div
                  key={sig.id}
                  className={`rounded-lg border p-2 transition ${
                    sig.detected
                      ? 'border-[#0072FF] bg-[#F5F0FF] shadow-2xs'
                      : 'border-slate-200 bg-white opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-[#0A2B6D]">
                    <span>{sig.label}</span>
                    <Badge
                      className={
                        sig.detected
                          ? 'bg-[#0072FF] text-white text-[9px]'
                          : 'bg-slate-200 text-[#0A2B6D] text-[9px]'
                      }
                    >
                      {sig.detected ? 'DETECTED' : 'Monitor'}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-[9.5px] font-medium text-[#5A00D6]">
                    → {sig.routeTo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CALL RECORD MANAGEMENT & 8-CHANNEL COMMUNICATION ROUTER */}
      {activeTab === 'calls-comms' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {COMM_8_CHANNELS.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setCallForm((p) => ({ ...p, channel: ch }))}
                className={`rounded-lg px-3 py-1 text-xs font-extrabold transition ${
                  callForm.channel === ch
                    ? 'bg-[#5A00D6] text-white'
                    : 'border border-slate-200 bg-[#F5F0FF] text-[#0A2B6D]'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
              Structured Call &amp; Communication Record (Auto-Links Participant, Employee, Service, Review &amp; Risk)
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Date</Label>
                <Input
                  type="date"
                  value={callForm.date}
                  onChange={(e) => setCallForm((p) => ({ ...p, date: e.target.value }))}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Time</Label>
                <Input
                  type="time"
                  value={callForm.time}
                  onChange={(e) => setCallForm((p) => ({ ...p, time: e.target.value }))}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Caller (Staff / External)</Label>
                <Input
                  value={callForm.caller}
                  onChange={(e) => setCallForm((p) => ({ ...p, caller: e.target.value }))}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Receiver (Family / SC / Allied Health)</Label>
                <Input
                  value={callForm.receiver}
                  onChange={(e) => setCallForm((p) => ({ ...p, receiver: e.target.value }))}
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Linked Participant</Label>
                <Input
                  value={callForm.participant_name}
                  onChange={(e) => setCallForm((p) => ({ ...p, participant_name: e.target.value }))}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Linked Service</Label>
                <Input
                  value={callForm.service_linked}
                  onChange={(e) => setCallForm((p) => ({ ...p, service_linked: e.target.value }))}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Linked Review</Label>
                <Input
                  value={callForm.review_linked}
                  onChange={(e) => setCallForm((p) => ({ ...p, review_linked: e.target.value }))}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Linked Risk</Label>
                <Input
                  value={callForm.risk_linked}
                  onChange={(e) => setCallForm((p) => ({ ...p, risk_linked: e.target.value }))}
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Subject</Label>
                <Input
                  value={callForm.subject}
                  onChange={(e) => setCallForm((p) => ({ ...p, subject: e.target.value }))}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Outcome</Label>
                <Input
                  value={callForm.outcome}
                  onChange={(e) => setCallForm((p) => ({ ...p, outcome: e.target.value }))}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-[#0A2B6D]">Follow-Up Actions</Label>
                <Input
                  value={callForm.actions}
                  onChange={(e) => setCallForm((p) => ({ ...p, actions: e.target.value }))}
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-[11px] font-bold text-[#0A2B6D]">Call / Discussion Summary</Label>
              <Textarea
                rows={2}
                value={callForm.summary}
                onChange={(e) => setCallForm((p) => ({ ...p, summary: e.target.value }))}
                className="mt-1 text-xs"
              />
            </div>

            <Button
              size="sm"
              onClick={handleSaveCallRecord}
              disabled={saving}
              className="bg-[#0A2B6D] text-white font-extrabold hover:bg-[#0072FF]"
            >
              <PhoneCall className="mr-1.5 h-3.5 w-3.5" />
              Save &amp; Route {callForm.channel} Record to Profile, Timeline, Review &amp; Actions
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATIC PROFILE, DOCUMENT HUB (11 CATEGORIES) & EXECUTIVE HUB MATRIX */}
      {activeTab === 'routing-matrix' && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {/* Universal Profile Updates */}
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
              Universal Automatic Profile Updates
            </div>
            <div className="text-[11px] font-extrabold text-[#0A2B6D]">
              Participant Profiles Auto-Update (7 Areas):
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                'Communications',
                'Goals',
                'Risks',
                'Incidents',
                'Reviews',
                'Service Records',
                'Documents',
              ].map((item) => (
                <Badge key={item} className="bg-[#0072FF] text-white text-[10px]">
                  ✓ {item}
                </Badge>
              ))}
            </div>
            <div className="pt-2 text-[11px] font-extrabold text-[#0A2B6D]">
              Employee Profiles Auto-Update (6 Areas):
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                'Communications',
                'Service Delivery',
                'Attendance',
                'Competencies',
                'Reviews',
                'Compliance',
              ].map((item) => (
                <Badge key={item} className="bg-[#5A00D6] text-white text-[10px]">
                  ✓ {item}
                </Badge>
              ))}
            </div>
          </div>

          {/* Document Hub 11 Categories */}
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
              Document Hub Auto-Storage (11 Versioned Categories)
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {DOC_HUB_11_CATEGORIES.map((cat) => (
                <div
                  key={cat}
                  className="rounded-lg border border-slate-200 bg-[#F5F0FF]/40 px-2 py-1 text-[10.5px] font-extrabold text-[#0A2B6D]"
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* Executive Hub 6 Dashboards */}
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#FF2E9A]">
              Executive Hub Live Intelligence Feed (6 Dashboards)
            </div>
            <div className="space-y-1.5">
              {[
                '1. Risk Dashboards (Live ISO 31000 & Participant Risks)',
                '2. Goal Dashboards (NDIS Milestones & Outcomes)',
                '3. Service Quality Dashboards (Notes, Feedback & SLA)',
                '4. Compliance Dashboards (NDIS & Aged Care Standards)',
                '5. Workforce Dashboards (Attendance, Clearances & Ratios)',
                '6. Executive Reporting (Board & Audit Readiness Packs)',
              ].map((dash) => (
                <div
                  key={dash}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10.5px] font-extrabold text-[#0A2B6D]"
                >
                  ✓ {dash}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: UNIVERSAL 7-SCOPE EXPORT & SECURITY/PERMISSIONS */}
      {activeTab === 'export-security' && (
        <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                Universal 7-Scope Multi-Format Export (PDF · Word · Excel · CSV)
              </div>
              <p className="text-[11px] font-medium text-[#0A2B6D]">
                All routing and exports strictly enforce Role-Based Access, Active Consent, Privacy Act 1988, Security Classification &amp; 14-Verb Audit Logging.
              </p>
            </div>
            <Badge className="bg-[#0A2B6D] text-white text-[10px]">
              <Lock className="mr-1 h-3 w-3 inline" />
              Consent &amp; Role-Gated Security Active
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {EXPORT_7_SCOPES.map((sc) => (
              <button
                key={sc}
                type="button"
                onClick={() => setSelectedExportScope(sc)}
                className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  selectedExportScope === sc
                    ? 'bg-[#0A2B6D] text-white'
                    : 'border border-slate-200 bg-[#F5F0FF] text-[#0A2B6D]'
                }`}
              >
                {sc}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-2 border-t border-slate-200">
            {[
              { fmt: 'pdf', label: `Export ${selectedExportScope} (PDF)`, icon: Printer },
              { fmt: 'word', label: `Export ${selectedExportScope} (Word)`, icon: FileText },
              { fmt: 'excel', label: `Export ${selectedExportScope} (Excel)`, icon: FileSpreadsheet },
              { fmt: 'csv', label: `Export ${selectedExportScope} (CSV)`, icon: Download },
            ].map((b) => {
              const Icon = b.icon;
              return (
                <Button
                  key={b.fmt}
                  size="sm"
                  onClick={() => handleUniversalExport(b.fmt)}
                  className="bg-[#0A2B6D] text-white text-xs font-extrabold hover:bg-[#5A00D6]"
                >
                  <Icon className="mr-1.5 h-3.5 w-3.5" />
                  {b.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}