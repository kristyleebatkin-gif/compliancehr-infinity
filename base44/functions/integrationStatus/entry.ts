import { perBusiness } from '../../shared/tenantScope.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Administrator integration visibility.
//
// What this does: asks the platform connector SDK (getConnection only) whether
// an app-wide connection currently yields a credential, and reports the answer
// with a timestamp. What it never does: return, log or forward a token, call a
// provider API, send a message or event, or change an OAuth scope.
//
// The SDK has no "list installed connectors" method, so status is established
// per integration type by attempting getConnection and classifying the result.
// The status is therefore evidence of what the platform reports right now, not a
// claim that an integration has been exercised end to end.

const ADMIN_ROLES = ['admin', 'Provider Administrator'];

// Integrations the app is designed around, in the order shown to administrators.
const WATCHED = [
  { integration_type: 'googlecalendar', label: 'Google Calendar', used_for: 'Compliance and roster calendar feed' },
  { integration_type: 'gmail', label: 'Gmail', used_for: 'Professional email sending' },
  { integration_type: 'github', label: 'GitHub', used_for: 'Repository and issue reads' },
  { integration_type: 'googledrive', label: 'Google Drive', used_for: 'Document source (not yet used)' },
  { integration_type: 'googlesheets', label: 'Google Sheets', used_for: 'Register export (not yet used)' },
  { integration_type: 'outlook', label: 'Outlook / Microsoft 365', used_for: 'Email and calendar alternative' },
];

/** Strip anything that looks like a credential before it can reach a screen. */
function sanitise(message: unknown) {
  const raw = String(message ?? '').trim();
  const scrubbed = raw
    .replace(/[A-Za-z0-9_\-.]{40,}/g, '[redacted]')
    .replace(/(access_token|refresh_token|client_secret|Bearer)\s*[:=]\s*\S+/gi, '$1 [redacted]');
  return scrubbed.slice(0, 240);
}

function classify(error: unknown): { status: string; label: string } {
  const message = sanitise((error as Error)?.message ?? error).toLowerCase();
  if (/(expired|invalid_grant|reconnect|revoked)/.test(message)) {
    return { status: 'expired', label: 'Connected before, credential expired — reconnect required' };
  }
  if (/(no active connection|please connect|connect the connector|not connected|not configured|no connection|not found|404|does not exist|unsupported)/.test(message)) {
    return { status: 'unconfigured', label: 'Not set up for this business' };
  }
  if (/(permission|forbidden|403|metered)/.test(message)) {
    return { status: 'restricted', label: 'Connection exists but this method cannot read it' };
  }
  return { status: 'error', label: 'Connection check failed' };
}

export default perBusiness(async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    let user: any = null;
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!ADMIN_ROLES.includes(user.role)) {
      return Response.json({ error: 'Only an administrator can view integration status.' }, { status: 403 });
    }

    const checkedAt = new Date().toISOString();
    const service = base44.asServiceRole;
    const items: any[] = [];

    for (const watched of WATCHED) {
      const started = Date.now();
      try {
        const connection = await service.connectors.getConnection(watched.integration_type);
        const connected = Boolean(connection?.accessToken);
        items.push({
          ...watched,
          status: connected ? 'active' : 'unconfigured',
          label: connected ? 'Active' : 'No credential returned',
          has_connection_config: Boolean(connection?.connectionConfig),
          config_keys: Object.keys(connection?.connectionConfig || {}),
          checked_at: checkedAt,
          duration_ms: Date.now() - started,
          error: null,
        });
      } catch (error) {
        const verdict = classify(error);
        items.push({
          ...watched,
          status: verdict.status,
          label: verdict.label,
          has_connection_config: false,
          config_keys: [],
          checked_at: checkedAt,
          duration_ms: Date.now() - started,
          error: sanitise((error as Error)?.message ?? error) || 'No detail returned by the platform.',
        });
      }
    }

    return Response.json({
      ok: true,
      checked_at: checkedAt,
      scope: 'App-wide (shared) connections for this business only. App-user connections are personal and are not listed here.',
      method: 'connectors.getConnection — credential availability only. No provider API was called and no token is returned.',
      summary: {
        active: items.filter((i) => i.status === 'active').length,
        expired: items.filter((i) => i.status === 'expired').length,
        unconfigured: items.filter((i) => i.status === 'unconfigured').length,
        other: items.filter((i) => !['active', 'expired', 'unconfigured'].includes(i.status)).length,
      },
      items,
    });
  } catch (error) {
    return Response.json({ error: sanitise((error as Error)?.message) || 'Integration status check failed.' }, { status: 500 });
  }
});