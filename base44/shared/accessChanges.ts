// Shared by User Administration (manageAppAccess) and Access Requests (approvals), backlog 17.07 / 16.09:
// keeps a person's business membership in step with their account. Pass a scoped entities client.
const items = (page: any) => (Array.isArray(page) ? page : page?.items || []);

export async function syncMembership(
  entities: any,
  user: any,
  fields: Record<string, unknown>,
  opts: { tenantId?: string; actorId?: string; today: string },
) {
  const existing = items(await entities.TenantMembership.filter({ user_id: user.id }))[0];
  if (existing) return entities.TenantMembership.update(existing.id, fields);
  return entities.TenantMembership.create({
    organisation_id: opts.tenantId || user.tenant_id || user.data?.tenant_id || '',
    user_id: user.id, user_email: user.email || '', starts_on: opts.today,
    invited_by_user_id: opts.actorId || '', membership_role: 'Employee', status: 'Active', ...fields,
  });
}
