import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { serviceEvidenceCommand } from '../../shared/serviceEvidence.ts';
export async function handleShiftServiceEvidence(base44, req) {
  try {
    const user = await base44.auth.me().catch(error => error?.status === 401 ? null : Promise.reject(error));
    if (!user) return Response.json({ error: 'Sign in to continue.' }, { status: 401 });
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return Response.json({ error: 'Provide a valid service evidence request.' }, { status: 400 });
    return Response.json(await serviceEvidenceCommand(base44, user, body));
  } catch (error) {
    return Response.json({ error: error.message || 'Service evidence unavailable.' }, { status: error.status || 500 });
  }
}
export default perBusiness(async req => handleShiftServiceEvidence(createScopedClientFromRequest(req), req));
