// Continuous compliance score (Vanta/Drata parity): evidence is collected live
// from every connected register using server-side counts, never manual
// tick-and-flick. Shared by the live endpoint (complianceScore) and the
// automated weekly audit report.

const ALLOWED = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Quality & Improvement Manager', 'Auditor', 'Team Leader'];

export const canViewComplianceScore = (role) => ALLOWED.includes(role);

export async function collectComplianceScore(service) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const in30 = new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10);
  const in2 = new Date(now.getTime() + 2 * 86400000).toISOString().slice(0, 10);

  const [
    certExpired, certExpiring, docExpired, docExpiring,
    actionsOverdue, deadlinesOverdue, risksPastReview, docsPastReview,
    tasksOverdue, shiftsUnfilled,
  ] = await Promise.all([
    service.entities.Certificate.count({ status: 'Expired' }),
    service.entities.Certificate.count({ expiry_date: { $gte: today, $lte: in30 }, status: { $ne: 'Expired' } }),
    service.entities.EmployeeDocument.count({ status: 'Expired' }),
    service.entities.EmployeeDocument.count({ expiry_date: { $gte: today, $lte: in30 }, status: { $ne: 'Expired' } }),
    service.entities.AuditAction.count({ due_date: { $lt: today }, status: { $in: ['Open', 'In Progress'] } }),
    service.entities.NDISComplianceDeadline.count({ due_date: { $lt: today }, status: { $in: ['Not Started', 'In Progress', 'Overdue'] } }),
    service.entities.Risk.count({ review_date: { $lt: today }, status: { $ne: 'Closed' } }),
    service.entities.CompanyDocument.count({ review_date: { $lt: today }, status: 'Current' }),
    service.entities.TodoTask.count({ due_date: { $lt: today }, status: { $ne: 'Finalised' } }),
    service.entities.Shift.count({ date: { $gte: today, $lte: in2 }, employee_name: null, status: { $ne: 'Cancelled' } }),
  ]);

  const controls = [
    {
      key: 'certificates', label: 'Staff qualifications & certificates',
      fails: certExpired, warns: certExpiring,
      fail_detail: `${certExpired} expired certificate${certExpired === 1 ? '' : 's'}`,
      warn_detail: `${certExpiring} expiring within 30 days`,
      source: 'Certificates register', path: '/certificates',
      penalty: certExpired * 3 + certExpiring,
    },
    {
      key: 'staff_docs', label: 'Mandatory staff documents',
      fails: docExpired, warns: docExpiring,
      fail_detail: `${docExpired} expired document${docExpired === 1 ? '' : 's'}`,
      warn_detail: `${docExpiring} expiring within 30 days`,
      source: 'Staff document checklists', path: '/staff',
      penalty: docExpired * 3 + docExpiring,
    },
    {
      key: 'corrective', label: 'Corrective actions closed on time',
      fails: actionsOverdue, warns: 0,
      fail_detail: `${actionsOverdue} overdue corrective action${actionsOverdue === 1 ? '' : 's'}`,
      warn_detail: '',
      source: 'Audit actions register', path: '/audit',
      penalty: actionsOverdue * 4,
    },
    {
      key: 'ndis_deadlines', label: 'NDIS compliance deadlines met',
      fails: deadlinesOverdue, warns: 0,
      fail_detail: `${deadlinesOverdue} overdue NDIS deadline${deadlinesOverdue === 1 ? '' : 's'}`,
      warn_detail: '',
      source: 'NDIS deadline tracker', path: '/ndis-portal',
      penalty: deadlinesOverdue * 5,
    },
    {
      key: 'risks', label: 'Risk reviews up to date',
      fails: risksPastReview, warns: 0,
      fail_detail: `${risksPastReview} risk${risksPastReview === 1 ? '' : 's'} past review date`,
      warn_detail: '',
      source: 'Risk register', path: '/risks',
      penalty: risksPastReview * 2,
    },
    {
      key: 'documents', label: 'Policy & document reviews current',
      fails: docsPastReview, warns: 0,
      fail_detail: `${docsPastReview} document${docsPastReview === 1 ? '' : 's'} past review date`,
      warn_detail: '',
      source: 'Document control register', path: '/documents',
      penalty: docsPastReview * 1,
    },
    {
      key: 'tasks', label: 'Compliance tasks completed by due date',
      fails: tasksOverdue, warns: 0,
      fail_detail: `${tasksOverdue} overdue task${tasksOverdue === 1 ? '' : 's'}`,
      warn_detail: '',
      source: 'Task register', path: '/tasks',
      penalty: tasksOverdue * 1,
    },
    {
      key: 'coverage', label: 'Shifts filled before start (T-48h rule)',
      fails: shiftsUnfilled, warns: 0,
      fail_detail: `${shiftsUnfilled} unfilled shift${shiftsUnfilled === 1 ? '' : 's'} starting within 48 hours`,
      warn_detail: '',
      source: 'Roster board', path: '/roster',
      penalty: shiftsUnfilled * 3,
    },
  ].map((c) => ({
    key: c.key,
    label: c.label,
    status: c.fails > 0 ? 'fail' : c.warns > 0 ? 'attention' : 'pass',
    detail: c.fails > 0 ? c.fail_detail : c.warns > 0 ? c.warn_detail : 'All current — evidence collected automatically',
    source: c.source,
    path: c.path,
    penalty: c.penalty,
  }));

  const totalPenalty = controls.reduce((sum, c) => sum + c.penalty, 0);
  const score = Math.max(0, 100 - totalPenalty);

  return {
    score,
    penalty_total: totalPenalty,
    registers_monitored: 10,
    controls,
    generated_at: now.toISOString(),
  };
}