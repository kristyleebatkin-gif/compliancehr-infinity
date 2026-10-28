import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SectionCard from '@/components/SectionCard';
import IncidentWorkflow from '@/components/IncidentWorkflow';
import EmptyState from '@/components/EmptyState';
import { Field } from '@/components/Field';
import IncidentFollowUp from '@/components/incidents/IncidentFollowUp';
import IncidentImprovementLink from '@/components/incidents/IncidentImprovementLink';
import IncidentPhotos from '@/components/incidents/IncidentPhotos';
import { ArrowLeft, Pencil, Trash2, Search } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useRole } from '@/lib/useRole';
import { ROLES } from '@/lib/roles';
import RecordResponseEditor from '@/components/safety/RecordResponseEditor';
import Universal360ProfileFramework from '@/components/enterprise/Universal360ProfileFramework';

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, user } = useRole();
  const canReview = [ROLES.ADMIN, ROLES.COMPLIANCE, ROLES.TEAM_LEADER].includes(role);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const rec = await base44.entities.Incident.get(id);
      setItem(rec);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this incident record?')) return;
    await base44.entities.Incident.delete(id);
    await base44.entities.AuditLog.create({ action: 'Delete', entity_type: 'Incident', record_id: id, record_title: item?.title, performed_by: 'ComplianceHR Infinity' }).catch((error) => console.error(error));
    navigate('/incidents');
  };

  if (loading) return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand" /></div>;
  if (!item) return <EmptyState icon={Search} title="Incident not found" />;

  const sevTone = item.severity === 'Critical' || item.severity === 'High' ? 'bg-danger/10 text-danger' : item.severity === 'Medium' ? 'bg-warning/10 text-warning' : 'bg-safe/10 text-safe';
  const initialNotificationLate = item.requires_ndis_report && item.initial_notification_due_at && !item.initial_notified_at && new Date(item.initial_notification_due_at) < new Date();
  const followUpLate = item.five_day_follow_up_due && !item.five_day_follow_up_submitted && item.five_day_follow_up_due < new Date().toISOString().slice(0, 10);

  return (
    <div className="safety-workspace mx-auto min-w-0 max-w-4xl space-y-4">
      <Link to="/incidents" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"><ArrowLeft className="h-4 w-4" /> {user?.role === 'Employee' ? 'My Incidents' : 'All Incidents'}</Link>

      <PageHeader
        title={item.title}
        subtitle={item.incident_id ? `Incident ${item.incident_id}: full record, regulatory tracking and follow-up.` : undefined}
        action={canReview && <>
          <Link to={`/incidents/${item.id}/edit`} className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium hover:bg-muted"><Pencil className="h-4 w-4" /> Edit</Link>
          <button onClick={handleDelete} className="flex items-center gap-1.5 rounded-lg border border-danger/30 px-3.5 py-2 text-sm font-medium text-danger hover:bg-danger/5"><Trash2 className="h-4 w-4" /> Delete</button>
        </>}
      />

      <div className="flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sevTone}`}>Severity: {item.severity}</span>
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">Status: {item.status}</span>
        {item.requires_ndis_report && <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">NDIS Report Required</span>}
        {item.requires_police && <span className="rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger">Police Notified</span>}
        {(initialNotificationLate || followUpLate) && <span className="rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger">Regulatory Deadline Overdue</span>}
      </div>

      <Universal360ProfileFramework initialType="incident" focusRecord={item} compact />
      <IncidentWorkflow status={item.status} />

      <SectionCard title="Incident Details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Category">{item.category || '—'}</Field>
          <Field label="Date Occurred">{item.date_occurred || '—'}</Field>
          <Field label="Date Reported">{item.date_reported || '—'}</Field>
          <Field label="Reported By">{item.reported_by || '—'}</Field>
          <Field label="Location">{item.location || '—'}</Field>
          <Field label="Participant">{item.participant_name || item.participant_id || '—'}</Field>
          <Field label="Staff Involved">{item.staff_name || item.staff_id || '—'}</Field>
          <Field label="Police Notified">{item.requires_police ? 'Yes' : 'No'}</Field>
          <Field label="NDIS Report">{item.requires_ndis_report ? 'Yes' : 'No'}</Field>
        </div>
      </SectionCard>
      <SectionCard title="Photo Evidence">
        <IncidentPhotos incident={item} editable={canReview} onChanged={load} />
      </SectionCard>
      {canReview && item.requires_ndis_report && <SectionCard title="Regulatory Notification Tracking">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Reportable Type">{item.reportable_incident_type || 'Not assessed'}</Field>
          <Field label="Provider Awareness">{item.provider_awareness_at || '—'}</Field>
          <Field label="Initial Due">{item.initial_notification_due_at || '—'}</Field>
          <Field label="Initial Submitted">{item.initial_notified_at || '—'}</Field>
          <Field label="Commission Reference">{item.ndis_commission_reference || '—'}</Field>
          <Field label="Five-Day Follow-up Due">{item.five_day_follow_up_due || '—'}</Field>
          <Field label="Five-Day Follow-up Submitted">{item.five_day_follow_up_submitted || '—'}</Field>
          <Field label="Final Report Due">{item.final_report_due || '—'}</Field>
          <Field label="Final Report Submitted">{item.final_report_submitted || '—'}</Field>
        </div>
        {item.reportability_decision_reasons && <p className="mt-4 whitespace-pre-wrap text-sm text-foreground/70">{item.reportability_decision_reasons}</p>}
      </SectionCard>}

      {[['description', 'Description'], ['immediate_actions', 'Immediate Actions Taken'], ['hazards_identified', 'Risks / Hazards Identified'], ['risk_assessment', 'Risk Assessment'], ['control_measures', 'Control Measures']].map(([field, label]) => (item[field] || canReview) && <SectionCard key={field} title={label}><RecordResponseEditor entity="Incident" record={item} field={field} label={label} canEdit={canReview} onSaved={load} /></SectionCard>)}

      {/* Investigation & Follow-up */}
      {canReview && <IncidentFollowUp incident={item} />}
      {user?.role !== 'Employee' && <IncidentImprovementLink incident={item} canEdit={canReview} />}
    </div>
  );
}