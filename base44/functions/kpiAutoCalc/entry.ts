import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Recomputes derivable KPI current values from live records and refreshes their status.
// Metrics computed: shift fill rate, incident reporting timeliness, client satisfaction,
// complaint resolution time, training currency, invoice payment cycle.
// Document-compliance KPIs are managed manually and are left untouched.

const round1 = (n) => Math.round(n * 10) / 10;
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);

function deriveStatus(current, target, lowerBetter) {
  if (current == null || target == null) return null;
  if (lowerBetter) {
    if (current <= target) return current <= target * 0.8 ? 'Exceeded' : 'On Track';
    return current <= target * 1.1 ? 'At Risk' : 'Off Track';
  }
  if (current >= target) return current >= target * 1.05 ? 'Exceeded' : 'On Track';
  const ratio = current / target;
  return ratio >= 0.9 ? 'At Risk' : 'Off Track';
}

const pct = (part, total) => (total > 0 ? Math.round((part / total) * 100) : null);
const avg = (nums) => (nums.length ? round1(nums.reduce((a, b) => a + b, 0) / nums.length) : null);

function computeMetrics(shifts, incidents, feedback, invoices, staff, training) {
  const todayStr = today();

  // Shift fill rate: last 30 days, non-cancelled shifts rostered with an employee.
  const recentShifts = shifts.filter((s) => s.date >= daysAgo(30) && s.date <= todayStr && s.status !== 'Cancelled');
  const shiftFill = pct(recentShifts.filter((s) => s.employee_name).length, recentShifts.length);

  // Incident reporting timeliness: reported within 24h of occurrence (last 90 days).
  // Records may store the occurrence date as date_occurred or incident_date, and the
  // report date as date_reported or the record's created_date.
  const incDate = (i) => i.date_occurred || i.incident_date || null;
  const incReported = (i) => i.date_reported || (i.created_date ? String(i.created_date).slice(0, 10) : null);
  const recentIncidents = incidents.filter((i) => incDate(i) && incDate(i) >= daysAgo(90));
  const timely = recentIncidents.filter((i) => {
    const reported = incReported(i);
    if (!reported) return false;
    const due = new Date(incDate(i) + 'T00:00:00');
    due.setDate(due.getDate() + 1);
    return new Date(reported + 'T00:00:00') <= due;
  }).length;
  const incidentTimeliness = pct(timely, recentIncidents.length);

  // Client satisfaction: average feedback rating, last 90 days.
  const recentFeedback = feedback.filter((f) => f.type === 'Feedback' && typeof f.rating === 'number' && (!f.received_date || f.received_date >= daysAgo(90)));
  const satisfaction = avg(recentFeedback.map((f) => f.rating));

  // Complaint resolution time: average days received to finalised.
  const finalised = feedback.filter((f) => f.type === 'Complaint' && f.status === 'Finalised' && f.received_date && f.finalised_date);
  const complaintDays = avg(finalised.map((f) => Math.max(0, Math.round((new Date(f.finalised_date) - new Date(f.received_date)) / 86400000))));

  // Training currency: share of active staff with at least one current training completion.
  const staffNames = staff.map((s) => s.full_name).filter(Boolean);
  const currency = pct(
    staffNames.filter((name) => training.some((t) => t.employee_name === name && (!t.expiry_date || t.expiry_date >= todayStr))).length,
    staffNames.length,
  );

  // Invoice payment cycle: average days issue to paid.
  const paid = invoices.filter((i) => i.paid_date && i.issue_date);
  const paymentCycle = avg(paid.map((i) => Math.max(0, Math.round((new Date(i.paid_date) - new Date(i.issue_date)) / 86400000))));

  return {
    'shift fill rate': { value: shiftFill, lowerBetter: false },
    'incident reporting': { value: incidentTimeliness, lowerBetter: false },
    'client satisfaction': { value: satisfaction, lowerBetter: false },
    'complaint resolution': { value: complaintDays, lowerBetter: true },
    'training currency': { value: currency, lowerBetter: false },
    'invoice payment cycle': { value: paymentCycle, lowerBetter: true },
  };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.role !== 'Provider Administrator') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const svc = base44.asServiceRole;
    const [shiftRes, incidentRes, feedbackRes, invoiceRes, staffRes, trainingRes, kpiRes] = await Promise.allSettled([
      svc.entities.Shift.filter({ date: { $gte: daysAgo(30), $lte: today() } }, { limit: 500, fields: ['date', 'employee_name', 'status'] }),
      svc.entities.Incident.list({ limit: 500 }),
      svc.entities.Feedback.list({ limit: 200 }),
      svc.entities.Invoice.list({ limit: 200 }),
      svc.entities.StaffProfile.filter({ status: 'Active' }, { limit: 200, fields: ['full_name'] }),
      svc.entities.TrainingCompletion.list({ limit: 500 }),
      svc.entities.KPI.list({ limit: 100 }),
    ]);
    const val = (r, fallback) => (r.status === 'fulfilled' ? (r.value.items || r.value || fallback) : fallback);

    const shifts = val(shiftRes, []);
    const incidents = val(incidentRes, []);
    const feedback = val(feedbackRes, []);
    const invoices = val(invoiceRes, []);
    const staff = val(staffRes, []);
    const training = val(trainingRes, []);
    const kpis = val(kpiRes, []);

    const metrics = computeMetrics(shifts, incidents, feedback, invoices, staff, training);

    const updates = [];
    const skipped = [];
    for (const kpi of kpis) {
      const titleLower = String(kpi.title || '').toLowerCase();
      const key = Object.keys(metrics).find((m) => titleLower.includes(m));
      const metric = key ? metrics[key] : null;
      if (!metric || metric.value == null) {
        skipped.push(kpi.title);
        continue;
      }
      const status = deriveStatus(metric.value, kpi.target_value, metric.lowerBetter);
      updates.push({
        id: kpi.id,
        current_value: metric.value,
        ...(status ? { status } : {}),
        last_reviewed: today(),
      });
    }

    if (updates.length) {
      await svc.entities.KPI.bulkUpdate(updates);
    }
    return Response.json({ updated: updates, skipped });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}