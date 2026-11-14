import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { HandoverError, handoverReferralToIntake } from '../../shared/referralHandover.ts';

// Authenticated handover endpoint. The browser sends only the referral id; the
// server decides identity, business, consent, eligibility and linking.
export async function handleReferralHandover(base44: any, req: Request, now: Date = new Date()) {
  const user = await base44.auth.me().catch((error: any) => (error?.status === 401 ? null : Promise.reject(error)));
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const referralId = String(body?.referral_id || '').trim();
  if (!referralId) return Response.json({ error: 'referral_id is required', code: 'BAD_INPUT' }, { status: 400 });

  try {
    const result = await handoverReferralToIntake({ entities: base44.entities, user, referralId, now });
    return Response.json(result, { status: 200 });
  } catch (error: any) {
    if (error instanceof HandoverError) {
      return Response.json(
        { error: error.message, code: error.code, ...(error.details || {}) },
        { status: error.status },
      );
    }
    return Response.json({ error: error?.message || 'The handover failed.' }, { status: 500 });
  }
}

export default perBusiness(async (req: Request) => {
  const base44 = createScopedClientFromRequest(req);
  return await handleReferralHandover(base44, req);
});