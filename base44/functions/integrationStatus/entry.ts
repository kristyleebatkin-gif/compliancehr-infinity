import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { connectorOwnerAllows, requireWorkflowAdministrator } from '../../shared/workflowSafety.ts';

const WATCHED = [
  { integration_type: 'googlecalendar', label: 'Google Calendar', used_for: 'Compliance and roster calendar feed' },
  { integration_type: 'gmail', label: 'Gmail', used_for: 'Professional email sending' },
  { integration_type: 'github', label: 'GitHub', used_for: 'Repository and issue reads' },
  { integration_type: 'googledrive', label: 'Google Drive', used_for: 'Document source (not yet used)' },
  { integration_type: 'googlesheets', label: 'Google Sheets', used_for: 'Register export (not yet used)' },
  { integration_type: 'outlook', label: 'Outlook / Microsoft 365', used_for: 'Email and calendar alternative' },
];

export default perBusiness(async function (req: Request) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    const businessId = await requireWorkflowAdministrator(base44, user);
    const checkedAt = new Date().toISOString();
    // This binding must be set by the organisation owner after confirming which
    // business owns the platform-wide connection. Never derive it from a caller.
    const owner = Deno.env.get('APP_CONNECTOR_OWNER_TENANT_ID');
    if (!connectorOwnerAllows(businessId, owner)) {
      return Response.json({
        ok: true,
        checked_at: checkedAt,
        scope: 'App-wide connections. Ownership has not been verified for this business.',
        method: 'No credentials were requested. Verify the connection owner in Base44 settings before checking shared connections.',
        items: WATCHED.map((item) => ({ ...item, status: 'binding_required',
          label: 'Connection owner verification required', checked_at: checkedAt, error: null })),
      });
    }
    const items = [];
    for (const item of WATCHED) {
      try {
        const connection = await base44.asServiceRole.connectors.getConnection(item.integration_type);
        const available = Boolean(connection?.accessToken);
        items.push({ ...item, status: available ? 'credential_available' : 'unconfigured',
          label: available ? 'Credential available; provider operation not tested' : 'No credential available',
          checked_at: checkedAt, error: null });
      } catch (error) {
        // Classify privately. Never return provider errors, configuration keys or credentials.
        const detail = String((error as Error)?.message || '').toLowerCase();
        const expired = /expired|invalid_grant|revoked|reconnect/.test(detail);
        items.push({ ...item, status: expired ? 'expired' : 'unavailable',
          label: expired ? 'Reconnect required' : 'Connection unavailable; check Base44 settings',
          checked_at: checkedAt, error: null });
      }
    }
    return Response.json({ ok: true, checked_at: checkedAt, items,
      scope: 'Connection ownership verified for this business.',
      method: 'Credential availability only. This is not proof of a successful provider operation.' });
  } catch (error) {
    const denied = (error as any)?.status === 403;
    return Response.json({ error: denied ? 'Approved administrator access and active business membership are required.' : 'Connection status could not be checked.' },
      { status: denied ? 403 : 500 });
  }
});
