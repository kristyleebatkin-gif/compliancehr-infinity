// Per-staff compliance risk scoring, shared by the Staff Detail page threshold
// alert. Score is 0-100 (higher = clearer); risk points = 100 - score
// (higher = riskier). The alert fires when risk points exceed the threshold.
// Mirrors the StaffRiskSummary formula on the Staff Detail page.

export const RISK_ALERT_THRESHOLD = 40; // alert when risk points exceed this

const PENDING_STATUSES = ['Pending', 'Pending Approval', 'In Progress', 'Open', 'Overdue'];

const sydneyDate = (ts) => new Date(ts).toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' });

// Returns rows: [{ staff_id, name, score, risk_points, overdue_tasks, expired_docs, expired_certs, soon_docs, soon_certs }]
export async function computeStaffRiskScores(service) {
  const today = sydneyDate(Date.now());
  const in30 = sydneyDate(Date.now() + 30 * 86400000);

  const [tasksPage, docsPage, certsPage, staffPage] = await Promise.all([
    service.entities.TodoTask.filter(
      { status: { $in: PENDING_STATUSES } },
      { sort: 'due_date', limit: 500, fields: ['assigned_to', 'due_date'] },
    ),
    service.entities.EmployeeDocument.filter({}, { limit: 500, fields: ['employee_id', 'expiry_date'] }),
    service.entities.Certificate.filter({}, { limit: 500, fields: ['staff_name', 'expiry_date'] }),
    service.entities.StaffProfile.list(),
  ]);
  const staff = staffPage.items || staffPage || [];

  const rows = [];
  for (const s of staff) {
    if (!s.full_name) continue;
    const tasks = (tasksPage.items || []).filter((t) => t.assigned_to === s.full_name);
    const overdueTasks = tasks.filter((t) => t.due_date && t.due_date < today).length;
    const docs = (docsPage.items || []).filter((d) => d.employee_id === s.id);
    const expiredDocs = docs.filter((d) => d.expiry_date && d.expiry_date < today).length;
    const soonDocs = docs.filter((d) => d.expiry_date && d.expiry_date >= today && d.expiry_date <= in30).length;
    const certs = (certsPage.items || []).filter((c) => c.staff_name === s.full_name);
    const expiredCerts = certs.filter((c) => c.expiry_date && c.expiry_date < today).length;
    const soonCerts = certs.filter((c) => c.expiry_date && c.expiry_date >= today && c.expiry_date <= in30).length;

    const score = Math.max(0, Math.min(100,
      100
      - overdueTasks * 10
      - expiredDocs * 15
      - expiredCerts * 15
      - soonDocs * 5
      - soonCerts * 5,
    ));
    rows.push({
      staff_id: s.id,
      name: s.full_name,
      score,
      risk_points: 100 - score,
      overdue_tasks: overdueTasks,
      expired_docs: expiredDocs,
      expired_certs: expiredCerts,
      soon_docs: soonDocs,
      soon_certs: soonCerts,
    });
  }
  rows.sort((a, b) => b.risk_points - a.risk_points || a.name.localeCompare(b.name));
  return rows;
}

export const exceedsRiskThreshold = (row) => row.risk_points > RISK_ALERT_THRESHOLD;