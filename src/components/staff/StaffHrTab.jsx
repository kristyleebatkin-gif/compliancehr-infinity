import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { statusTone } from '@/lib/statusStyles';
import StaffTemplateGenerator from '@/components/staff/StaffTemplateGenerator';

export default function StaffHrTab({ staff, me }) {
  const [leave, setLeave] = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      base44.entities.LeaveRequest.filter(
        { staff_name: staff.full_name },
        { sort: '-start_date', limit: 200 },
      ),
      base44.entities.EmployeePerformanceAppraisal.filter(
        { $or: [{ staff_profile_id: staff.id }, { employee_name: staff.full_name }] },
        { sort: '-scheduled_review_date', limit: 200 },
      ),
    ])
      .then(([leavePage, appraisalPage]) => {
        setLeave(leavePage.items || []);
        setAppraisals(appraisalPage.items || []);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [staff.id, staff.full_name]);

  if (loading) return <div className="py-4 text-center text-sm text-foreground/50">Loading leave and appraisals...</div>;

  return (
    <div className="space-y-6">
      <StaffTemplateGenerator staff={staff} me={me} />
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground/60">Leave Requests</h3>
        {leave.length === 0 ? (
          <div className="py-4 text-center text-sm text-foreground/50">No leave requests for this staff member.</div>
        ) : (
          <div className="space-y-2">
            {leave.map((request) => (
              <div key={request.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {request.leave_type || 'Leave'} · {request.start_date || ''}{request.end_date ? ` – ${request.end_date}` : ''}
                  </div>
                  <div className="truncate text-xs text-foreground/50">
                    {request.days ? `${request.days} day${request.days === 1 ? '' : 's'} · ` : ''}{request.reason || ''}{request.coverage_arranged ? ` · Coverage: ${request.coverage_arranged}` : ''}
                  </div>
                </div>
                <span className={`shrink-0 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone(request.status)}`}>{request.status || 'Pending'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground/60">Appraisals</h3>
        {appraisals.length === 0 ? (
          <div className="py-4 text-center text-sm text-foreground/50">No appraisals recorded for this staff member.</div>
        ) : (
          <div className="space-y-2">
            {appraisals.map((appraisal) => (
              <div key={appraisal.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {appraisal.review_type || '12-Month Review'} · {appraisal.scheduled_review_date || ''}
                  </div>
                  <div className="truncate text-xs text-foreground/50">
                    {appraisal.reviewer_name ? `Reviewer: ${appraisal.reviewer_name} · ` : ''}
                    {appraisal.overall_rating ? `Rating: ${appraisal.overall_rating}/5 · ` : ''}
                    {appraisal.outcome && appraisal.outcome !== 'Pending' ? appraisal.outcome : ''}
                  </div>
                </div>
                <span className={`shrink-0 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone(appraisal.status)}`}>{appraisal.status || 'Scheduled'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}