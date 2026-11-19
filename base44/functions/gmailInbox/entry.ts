// Business inbox for the Today dashboard: the latest messages in the app's connected Gmail inbox.
// Read-only (gmail.readonly). Only management roles can see it, because it is the business mailbox.
// If Gmail is not connected, has expired, or lacks read access, the panel is told to ask for a
// reconnect instead of failing.
import { hasApprovedAccess } from '../../shared/appAccess.ts';
import { hasAnyRole, MANAGEMENT_ROLES } from '../../shared/roleMatrix.ts';
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

const READ_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

function header(headers: any[], name: string) {
  const h = (headers || []).find((x) => String(x?.name || '').toLowerCase() === name.toLowerCase());
  return h ? String(h.value || '') : '';
}

function senderName(from: string) {
  const m = from.match(/^\s*"?([^"<]+?)"?\s*<([^>]+)>/);
  return m ? m[1].trim() : from.trim();
}

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasApprovedAccess(user)) return Response.json({ error: 'Approved account access required.' }, { status: 403 });
    if (!hasAnyRole(user, MANAGEMENT_ROLES)) {
      return Response.json({ error: 'The business inbox is open to management roles only.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body.limit) || 8, 1), 20);

    let accessToken = '';
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('gmail');
      accessToken = conn?.accessToken || '';
    } catch {
      return Response.json({ connected: false, needs_reconnect: true, messages: [] });
    }
    if (!accessToken) return Response.json({ connected: false, needs_reconnect: true, messages: [] });

    const auth = { Authorization: `Bearer ${accessToken}` };
    const list = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=INBOX&maxResults=${limit}`,
      { headers: auth },
    );
    if (list.status === 401 || list.status === 403) {
      return Response.json({ connected: true, needs_reconnect: true, missing_scope: READ_SCOPE, messages: [] });
    }
    if (!list.ok) return Response.json({ error: `Gmail inbox unavailable (${list.status}).` }, { status: 502 });

    const ids = ((await list.json())?.messages || []).map((m: any) => m.id).filter(Boolean);
    const messages = await Promise.all(ids.map(async (id: string) => {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: auth },
      );
      if (!res.ok) return null;
      const m = await res.json();
      const headers = m?.payload?.headers || [];
      const from = header(headers, 'From');
      return {
        id,
        thread_id: m.threadId,
        subject: header(headers, 'Subject') || '(no subject)',
        from_name: senderName(from) || 'Unknown sender',
        received_at: m.internalDate ? new Date(Number(m.internalDate)).toISOString() : header(headers, 'Date'),
        snippet: String(m.snippet || '').slice(0, 160),
        unread: Array.isArray(m.labelIds) && m.labelIds.includes('UNREAD'),
        link: `https://mail.google.com/mail/u/0/#inbox/${m.threadId || id}`,
      };
    }));

    const items = messages.filter(Boolean);
    return Response.json({
      connected: true,
      needs_reconnect: false,
      unread: items.filter((m: any) => m.unread).length,
      messages: items,
    });
  } catch (error) {
    return Response.json({ error: (error as Error)?.message || 'Inbox could not load.' }, { status: 500 });
  }
});
