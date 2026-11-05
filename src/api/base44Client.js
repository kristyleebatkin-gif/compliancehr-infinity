import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { createTenantScopedEntitiesProxy } from '@/lib/roleMatrix';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const rawClient = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  appBaseUrl,
});

let activeTenantContext = { user: null, tenantId: null };

export function setClientTenantContext(user) {
  const tenantId = user?.tenant_id || user?.data?.tenant_id || null;
  activeTenantContext = { user: user || null, tenantId };
  return activeTenantContext;
}

export function getClientTenantContext() {
  return activeTenantContext;
}

const rawAuthMe = rawClient.auth.me.bind(rawClient.auth);
rawClient.auth.me = async (...args) => {
  const me = await rawAuthMe(...args);
  if (me) setClientTenantContext(me);
  return me;
};

const scopedEntities = createTenantScopedEntitiesProxy(rawClient.entities, () => activeTenantContext, {
  knownTenantEntities: ['AuditLog', 'BusinessDetails', 'Notification', 'Shift', 'TenantMembership', 'User'],
  enableReadCache: true,
  readCacheTtlMs: 15000,
});

export const base44 = new Proxy(rawClient, {
  get(target, prop) {
    if (prop === 'entities') return scopedEntities;
    return target[prop];
  },
});