// Provider policy: annual renewal. Existing credential expiry may require earlier renewal.
function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}

export function trainingRenewalDue(completion) {
  const completed = parseDate(completion?.completed_date);
  if (!completed) return null;
  const year = completed.getUTCFullYear() + 1;
  const month = completed.getUTCMonth();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const annual = new Date(Date.UTC(year, month, Math.min(completed.getUTCDate(), lastDay))).toISOString().slice(0, 10);
  if (!completion.expiry_date) return annual;
  if (!parseDate(completion.expiry_date)) return null;
  return completion.expiry_date < annual ? completion.expiry_date : annual;
}

export function isCurrentEmployeeTraining(completion, employeeId, today) {
  if (!employeeId || !parseDate(today) || completion?.status !== 'Completed') return false;
  if (completion.learner_type && completion.learner_type !== 'Employee') return false;
  const recordedIds = [completion.employee_id, completion.learner_id].filter(Boolean);
  if (!recordedIds.length || recordedIds.some((id) => id !== employeeId)) return false;
  const due = trainingRenewalDue(completion);
  return Boolean(due && completion.completed_date <= today && due > today);
}
