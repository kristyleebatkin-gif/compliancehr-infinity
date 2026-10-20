import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { UserCheck } from 'lucide-react';
import { TERMINAL_STATUSES } from './intakeDisplay';

export default function IntakeCaseDetail({ activeCase, intakeType, readiness, busy, onMoveToReview, onApprove, onConvert, onUpdateCase }) {
  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-panel">
        <div className="gradient-brand relative flex flex-wrap items-center gap-3 px-5 py-4 text-white">
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 88% 15%, rgba(255,255,255,0.22), transparent 55%)' }} />
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/50 bg-white/20 text-sm font-bold">
            {activeCase.applicant_name?.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold">{activeCase.applicant_name}</h3>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-medium">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5">{activeCase.case_number}</span>
              {intakeType === 'Employee' && (
                <span className="rounded-full bg-white/20 px-2.5 py-0.5">Employee ID: {activeCase.employee_id_number || 'Generated at conversion'}</span>
              )}
              {activeCase.date_of_birth && (
                <span className="rounded-full bg-white/20 px-2.5 py-0.5">DOB {format(new Date(activeCase.date_of_birth), 'd MMM yyyy')}</span>
              )}
            </div>
          </div>
          <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold">Readiness {readiness.score}%</span>
          <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-semibold">{activeCase.status}</span>
        </div>
      </div>

      <div className="grid gap-x-3 gap-y-2.5 rounded-xl border border-border/60 bg-card p-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div><span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">DOB</span><div className="font-medium">{activeCase.date_of_birth ? format(new Date(activeCase.date_of_birth), 'd MMM yyyy') : 'Not provided'}</div></div>
        <div><span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">Email</span><div className="font-medium">{activeCase.email || 'Not provided'}</div></div>
        <div><span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">Phone</span><div className="font-medium">{activeCase.phone || 'Not provided'}</div></div>
        <div><span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">Address</span><div className="font-medium">{activeCase.address || 'Not provided'}</div></div>
        {intakeType === 'Participant' ? (
          <>
            <div><span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">NDIS number</span><div className="font-medium">{activeCase.ndis_number || 'Not provided'}</div></div>
            <div><span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">Plan type</span><div className="font-medium">{activeCase.plan_type || 'Not set'}</div></div>
          </>
        ) : (
          <>
            <div><span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">Role</span><div className="font-medium">{activeCase.employee_role || 'Not set'}</div></div>
            <div><span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">Preferred name</span><div className="font-medium">{activeCase.preferred_name || 'Not provided'}</div></div>
            <div><span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">Proposed start date</span><div className="font-medium">{activeCase.target_start_date ? format(new Date(activeCase.target_start_date), 'd MMM yyyy') : 'Not set'}</div></div>
          </>
        )}
        <div><span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">Eligibility / service fit</span><div className="font-medium">{activeCase.service_fit || 'Pending'}</div></div>
        <div><span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">Referral source</span><div className="font-medium">{activeCase.referral_source || 'Not provided'}</div></div>
        <div><span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">Intake owner</span><div className="font-medium">{activeCase.assigned_to || 'Unassigned'}</div></div>
        <div><span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">Date completed</span><div className="font-medium">{activeCase.date_completed ? format(new Date(activeCase.date_completed), 'd MMM yyyy') : 'Not recorded'}</div></div>
        <div className="sm:col-span-2 lg:col-span-3">
          <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">Consent and acknowledgement log</span>
          <div className="font-medium">
            Privacy consent: {activeCase.privacy_consent_by
              ? `${activeCase.privacy_consent_by}, ${activeCase.privacy_consent_date || ''}${activeCase.privacy_consent_time ? ` ${activeCase.privacy_consent_time}` : ''}`
              : 'Not recorded'}
          </div>
          <div className="font-medium">
            NDIS audit: {activeCase.audit_consent || 'Audit declined'}
            {activeCase.audit_consent_by ? ` · ${activeCase.audit_consent_by}${activeCase.audit_consent_date ? `, ${activeCase.audit_consent_date}${activeCase.audit_consent_time ? ` ${activeCase.audit_consent_time}` : ''}` : ''}` : ''}
          </div>
          {(activeCase.acknowledgement_log || '').split('\n').filter(Boolean).map((entry, index) => (
            <div key={index} className="text-xs text-foreground/60">{entry}</div>
          ))}
        </div>
      </div>

      {activeCase.outstanding_actions && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          {activeCase.outstanding_actions}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!TERMINAL_STATUSES.has(activeCase.status) && activeCase.status !== 'Approved' && (
          <Button variant="outline" size="sm" onClick={onMoveToReview} disabled={busy}>
            {readiness.ready ? 'Mark ready for review' : 'Record missing information'}
          </Button>
        )}
        {activeCase.status === 'Ready for Review' && (
          <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={onApprove} disabled={busy}>Approve intake</Button>
        )}
        {activeCase.status === 'Approved' && (
          <Button size="sm" className="bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:from-violet-700 hover:to-pink-700" onClick={onConvert} disabled={busy}>
            <UserCheck className="mr-1.5 h-4 w-4" /> Convert to {intakeType} profile
          </Button>
        )}
        {!TERMINAL_STATUSES.has(activeCase.status) && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/30"
              onClick={() => onUpdateCase({ status: 'Declined', decision_reason: activeCase.outstanding_actions || 'Service fit decision recorded' }, 'Intake declined')}
              disabled={busy}
            >
              Decline
            </Button>
            <Button variant="outline" size="sm" onClick={() => onUpdateCase({ status: 'Withdrawn' }, 'Intake withdrawn')} disabled={busy}>
              Withdraw
            </Button>
          </>
        )}
      </div>
    </>
  );
}