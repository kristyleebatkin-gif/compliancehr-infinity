import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import IncidentWorkflow from '@/components/IncidentWorkflow';
import { Field, TextInput, Select, TextArea, DateInput, Checkbox } from '@/components/Field';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { recordSafetyEvent } from '@/lib/safetyEvent';
import { useRole } from '@/lib/useRole';
import { ROLES } from '@/lib/roles';

const categories = ['Medical', 'Behavioural', 'Safety', 'Medication Error', 'Abuse/Neglect', 'Other'];
const severities = ['Low', 'Medium', 'High', 'Critical'];
const statuses = ['Reported', 'Under Investigation', 'Action Required', 'Resolved', 'Closed'];
const reportableTypes = ['Not assessed', 'Death', 'Serious injury', 'Abuse or neglect', 'Unlawful sexual or physical contact', 'Sexual misconduct or grooming', 'Unauthorised restrictive practice', 'Other reportable incident', 'Not reportable'];

export default function IncidentForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useRole();
  const canReview = [ROLES.ADMIN, ROLES.COMPLIANCE, ROLES.TEAM_LEADER].includes(role);
  const isEdit = id && id !== 'new';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', incident_id: '', date_occurred: '', time_occurred: '', date_reported: '',
    reported_by: '', received_by: '', participant_id: '', participant_name: '', staff_id: '', staff_name: '', location: '',
    category: 'Other', severity: 'Medium', status: 'Reported',
    description: '', immediate_actions: '', hazards_identified: '', risk_assessment: '', control_measures: '',
    requires_ndis_report: false, reportable_incident_type: 'Not assessed', reportability_decision_reasons: '',
    provider_awareness_at: '', initial_notification_due_at: '', initial_notified_at: '', ndis_commission_reference: '',
    five_day_follow_up_due: '', five_day_follow_up_submitted: '', final_report_due: '', final_report_submitted: '',
    late_notification_reason: '', participant_or_nominee_notified_at: '', whs_notification_required: false,
    whs_notified_at: '', whs_reference: '', requires_police: false,
  });
  const [participants, setParticipants] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [participantPage, staffPage] = await Promise.all([
          base44.entities.ParticipantProfile.filter({}, { sort: 'full_name', limit: 1000, fields: ['full_name'] }).catch(() => ({ items: [] })),
          base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 1000, fields: ['full_name'] }).catch(() => ({ items: [] })),
        ]);
        const participantRecords = participantPage.items || [];
        const staffRecords = staffPage.items || [];
        setParticipants(participantRecords);
        setStaff(staffRecords);
        if (isEdit) {
          const rec = await base44.entities.Incident.get(id);
          setForm((current) => ({ ...current, ...rec }));
        } else {
          const participantId = searchParams.get('participantId') || '';
          const staffId = searchParams.get('staffId') || '';
          setForm((current) => ({
            ...current,
            participant_id: participantId,
            participant_name: participantRecords.find((record) => record.id === participantId)?.full_name || '',
            staff_id: staffId,
            staff_name: staffRecords.find((record) => record.id === staffId)?.full_name || '',
          }));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id, isEdit, searchParams]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      ['id', 'created_date', 'updated_date', 'created_by_id'].forEach((key) => delete payload[key]);
      if (!canReview) {
        payload.status = 'Reported';
        payload.received_by = '';
      }
      if (canReview && payload.requires_ndis_report && (payload.reportable_incident_type === 'Not assessed' || !payload.provider_awareness_at || !payload.initial_notification_due_at)) {
        throw new Error('Complete the reportability type, provider awareness time and initial notification deadline');
      }
      if (isEdit) {
        if (!canReview) throw new Error('Administrative access is required to review an incident');
        await base44.entities.Incident.update(id, payload);
        await recordSafetyEvent('Incident', id, { notify: false });
      } else {
        const rec = await base44.entities.Incident.create(payload);
        const result = await recordSafetyEvent('Incident', rec.id);
        if (result.email_failures?.length) {
          toast({ title: 'Incident recorded; some administrator emails failed', description: `${result.email_failures.length} email(s) could not be sent.`, variant: 'destructive' });
        }
      }
      toast({ title: 'Incident saved' });
      navigate('/incidents');
    } catch (err) {
      toast({ title: 'Failed to save', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8 space-y-4">
      <Link to="/incidents" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"><ArrowLeft className="h-4 w-4" /> All Incidents</Link>
      <PageHeader title={isEdit ? 'Review Incident' : 'New Incident'} subtitle={canReview ? 'Record details, attach profiles and manage the administrative review workflow' : 'Submit the incident for administrative review'} />

      {canReview && <IncidentWorkflow status={form.status} />}

      {(form.severity === 'High' || form.severity === 'Critical') && (
        <div className="flex items-center gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          High/Critical severity — all administrative users will be notified and emailed on submission.
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 space-y-5">
        <Field label="Title"><TextInput value={form.title} onChange={(e) => set('title', e.target.value)} required /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Incident ID"><TextInput value={form.incident_id || ''} onChange={(e) => set('incident_id', e.target.value)} /></Field>
          <Field label="Location"><TextInput value={form.location || ''} onChange={(e) => set('location', e.target.value)} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Date Occurred"><DateInput value={form.date_occurred || ''} onChange={(e) => set('date_occurred', e.target.value)} required /></Field>
          <Field label="Time Occurred"><TextInput type="time" value={form.time_occurred || ''} onChange={(e) => set('time_occurred', e.target.value)} /></Field>
          <Field label="Date Reported"><DateInput value={form.date_reported || ''} onChange={(e) => set('date_reported', e.target.value)} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Reported By"><TextInput value={form.reported_by || ''} onChange={(e) => set('reported_by', e.target.value)} /></Field>
          {canReview && <Field label="Received By"><TextInput value={form.received_by || ''} onChange={(e) => set('received_by', e.target.value)} /></Field>}
          <Field label="Attach to Participant"><Select value={form.participant_id || ''} onChange={(e) => { const record = participants.find((item) => item.id === e.target.value); setForm((current) => ({ ...current, participant_id: e.target.value, participant_name: record?.full_name || '' })); }}><option value="">No participant attached</option>{participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.full_name}{participant.participant_id ? ` (${participant.participant_id})` : ''}</option>)}</Select></Field>
          <Field label="Attach to Staff Member"><Select value={form.staff_id || ''} onChange={(e) => { const record = staff.find((item) => item.id === e.target.value); setForm((current) => ({ ...current, staff_id: e.target.value, staff_name: record?.full_name || '' })); }}><option value="">No staff member attached</option>{staff.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name}{employee.employee_id ? ` (${employee.employee_id})` : ''}</option>)}</Select></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Category"><Select value={form.category} onChange={(e) => set('category', e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Severity"><Select value={form.severity} onChange={(e) => set('severity', e.target.value)}>{severities.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          {canReview && <Field label="Review Status"><Select value={form.status} onChange={(e) => set('status', e.target.value)}>{statuses.map((s) => <option key={s}>{s}</option>)}</Select></Field>}
        </div>
        <Field label="Description"><TextArea rows={4} value={form.description || ''} onChange={(e) => set('description', e.target.value)} /></Field>
        <Field label="Immediate Actions Taken"><TextArea rows={3} value={form.immediate_actions || ''} onChange={(e) => set('immediate_actions', e.target.value)} /></Field>
        <Field label="Risks / Hazards Identified"><TextArea rows={3} value={form.hazards_identified || ''} onChange={(e) => set('hazards_identified', e.target.value)} /></Field>
        <Field label="Risk Assessment"><TextArea rows={3} value={form.risk_assessment || ''} onChange={(e) => set('risk_assessment', e.target.value)} placeholder="Likelihood, consequence, risk rating and people exposed" /></Field>
        <Field label="Control Measures"><TextArea rows={3} value={form.control_measures || ''} onChange={(e) => set('control_measures', e.target.value)} placeholder="Immediate and ongoing controls, owner and review date" /></Field>
        <div className="flex flex-wrap gap-4">
          <Checkbox label="Requires NDIS Report" checked={form.requires_ndis_report} onChange={(e) => set('requires_ndis_report', e.target.checked)} />
          <Checkbox label="Police Notified" checked={form.requires_police} onChange={(e) => set('requires_police', e.target.checked)} />
          <Checkbox label="WHS Regulator Notification Required" checked={form.whs_notification_required} onChange={(e) => set('whs_notification_required', e.target.checked)} />
        </div>
        {canReview && <div className="space-y-4 rounded-xl border border-warning/30 bg-warning/5 p-4">
          <div><h3 className="text-sm font-semibold">Regulatory Notification Assessment</h3><p className="text-xs text-foreground/55">Record applicable deadlines and references based on the incident type, provider jurisdiction and current regulator requirements.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Reportable Incident Type"><Select value={form.reportable_incident_type || 'Not assessed'} onChange={(e) => set('reportable_incident_type', e.target.value)}>{reportableTypes.map((value) => <option key={value}>{value}</option>)}</Select></Field>
            <Field label="Provider Awareness Date and Time"><TextInput type="datetime-local" value={form.provider_awareness_at || ''} onChange={(e) => set('provider_awareness_at', e.target.value)} /></Field>
            <Field label="Initial Notification Due"><TextInput type="datetime-local" value={form.initial_notification_due_at || ''} onChange={(e) => set('initial_notification_due_at', e.target.value)} /></Field>
            <Field label="Initial Notification Submitted"><TextInput type="datetime-local" value={form.initial_notified_at || ''} onChange={(e) => set('initial_notified_at', e.target.value)} /></Field>
            <Field label="NDIS Commission Reference"><TextInput value={form.ndis_commission_reference || ''} onChange={(e) => set('ndis_commission_reference', e.target.value)} /></Field>
            <Field label="Participant or Nominee Notified"><TextInput type="datetime-local" value={form.participant_or_nominee_notified_at || ''} onChange={(e) => set('participant_or_nominee_notified_at', e.target.value)} /></Field>
            <Field label="Five-Day Follow-up Due"><DateInput value={form.five_day_follow_up_due || ''} onChange={(e) => set('five_day_follow_up_due', e.target.value)} /></Field>
            <Field label="Five-Day Follow-up Submitted"><DateInput value={form.five_day_follow_up_submitted || ''} onChange={(e) => set('five_day_follow_up_submitted', e.target.value)} /></Field>
            <Field label="Final Report Due"><DateInput value={form.final_report_due || ''} onChange={(e) => set('final_report_due', e.target.value)} /></Field>
            <Field label="Final Report Submitted"><DateInput value={form.final_report_submitted || ''} onChange={(e) => set('final_report_submitted', e.target.value)} /></Field>
            <Field label="WHS Regulator Notified"><TextInput type="datetime-local" value={form.whs_notified_at || ''} onChange={(e) => set('whs_notified_at', e.target.value)} /></Field>
            <Field label="WHS Reference"><TextInput value={form.whs_reference || ''} onChange={(e) => set('whs_reference', e.target.value)} /></Field>
          </div>
          <Field label="Reportability Decision and Reasons"><TextArea value={form.reportability_decision_reasons || ''} onChange={(e) => set('reportability_decision_reasons', e.target.value)} /></Field>
          <Field label="Late Notification Reason"><TextArea value={form.late_notification_reason || ''} onChange={(e) => set('late_notification_reason', e.target.value)} /></Field>
        </div>}
        <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
          <button type="button" onClick={() => navigate('/incidents')} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
          <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Saving...' : canReview ? 'Save Incident Review' : 'Submit Incident'}</button>
        </div>
      </form>
    </div>
  );
}