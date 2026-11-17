// Identity changes remount the entire workspace, including PIN, data and open studios.
export function dashboardIdentityKey(user) {
  const tenant = user?.tenant_id || user?.data?.tenant_id;
  if (!user?.id || !tenant || user.account_status !== 'Active' || user.access_approved !== true) return null;
  return JSON.stringify([user.id, tenant, user.role, user.account_status, user.access_approved]);
}

export function todayAssistantContext(data) {
  if (!data) return 'Dashboard information is loading; do not infer any totals.';
  if (Object.values(data.errors || {}).some(Boolean)) {
    return 'Dashboard information is incomplete because some requests failed. Do not infer zero counts or describe these figures as complete.';
  }
  const parts = [];
  const count = (allowed, value, label) => {
    if (allowed && Number.isFinite(value) && value >= 0) parts.push(`${value} ${label}`);
  };
  count(data.access?.emails, data.summary?.emails, 'recorded emails (not a count of unanswered messages)');
  count(data.access?.shifts, data.summary?.shifts, 'shifts today');
  count(data.access?.invoices, data.summary?.invoices, 'draft invoices');
  count(data.access?.notes, data.summary?.notesOutstanding, 'recorded shift notes today (not missing notes)');
  if (data.access?.todos) parts.push(`${data.todos?.length || 0} open tasks in the displayed sample; this is not a full register total`);
  return parts.join('. ') || 'No dashboard figures are available for this role.';
}
