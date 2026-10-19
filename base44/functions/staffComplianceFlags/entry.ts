import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { computeStaffCompliance, FLAG_THRESHOLD } from '../../shared/staffCompliance.ts';

// Admin endpoint: per-staff compliance progress (onboarding pack completion %).
// The reporting dashboard uses this to flag anyone below the threshold.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const service = base44.asServiceRole;
    const rows = await computeStaffCompliance(service);
    const flagged = rows.filter((r) => r.pct !== null && r.pct < FLAG_THRESHOLD);
    return Response.json({ threshold: FLAG_THRESHOLD, rows, flagged });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}