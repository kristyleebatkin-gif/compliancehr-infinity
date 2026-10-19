import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Computes compliance completion per department (staff role group) from
// employee documents, certificates and training, so the dashboard can show
// at a glance which areas need attention. Admin/management roles only.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const allowedRoles = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Team Leader'];
    if (!allowedRoles.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const [staff, docs, certs, training] = await Promise.all([
      base44.asServiceRole.entities.StaffProfile.list(),
      base44.asServiceRole.entities.EmployeeDocument.list(),
      base44.asServiceRole.entities.Certificate.list(),
      base44.asServiceRole.entities.TrainingCompletion.list(),
    ]);

    const active = (staff || []).filter((s) => s.status !== 'Inactive' && s.status !== 'Archived');
    const roleByName = new Map(active.map((s) => [s.full_name, s.role || 'Unassigned']));

    const today = new Date().toISOString().slice(0, 10);
    const groups = new Map();
    const group = (name) => {
      const key = roleByName.get(name) || 'Unassigned';
      if (!groups.has(key)) {
        groups.set(key, { department: key, staff_count: 0, total: 0, current: 0, expiring: 0, expired: 0 });
      }
      return groups.get(key);
    };
    active.forEach((s) => group(s.full_name).staff_count++);

    const tally = (name, state) => {
      const g = group(name);
      g.total++;
      if (state === 'current') g.current++;
      else if (state === 'expiring') g.expiring++;
      else g.expired++;
    };

    (docs || []).forEach((d) => {
      if (!d.employee_name) return;
      const status = d.status || 'Current';
      if (d.status === 'Archived') return;
      tally(d.employee_name, status === 'Current' ? 'current' : status === 'Expiring Soon' ? 'expiring' : 'expired');
    });
    (certs || []).forEach((c) => {
      if (!c.staff_name || c.status === 'Revoked') return;
      tally(c.staff_name, c.status === 'Current' ? 'current' : c.status === 'Expiring Soon' ? 'expiring' : 'expired');
    });
    (training || []).forEach((t) => {
      if (!t.employee_name) return;
      if (t.expiry_date) tally(t.employee_name, t.expiry_date >= today ? 'current' : 'expired');
      else tally(t.employee_name, 'current');
    });

    const departments = [...groups.values()].map((g) => ({
      ...g,
      rate: g.total > 0 ? Math.round((g.current / g.total) * 100) : 100,
    })).sort((a, b) => a.rate - b.rate);

    return Response.json({ departments, generated_at: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Failed to compute department compliance' }, { status: 500 });
  }
}