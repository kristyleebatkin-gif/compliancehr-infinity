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

// Audit CRIT-04: business-specific browser caches are removed on sign-out and whenever the
// signed-in business changes, so one business's branding never shows for another.
const BUSINESS_CACHE_PREFIXES = ['compliancehr_company_branding'];
function clearBusinessCaches() {
  try {
    Object.keys(localStorage)
      .filter((key) => BUSINESS_CACHE_PREFIXES.some((prefix) => key === prefix || key.startsWith(`${prefix}:`)))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage unavailable; nothing cached.
  }
}

export function setClientTenantContext(user) {
  const tenantId = user?.tenant_id || user?.data?.tenant_id || null;
  if (activeTenantContext.tenantId && activeTenantContext.tenantId !== tenantId) clearBusinessCaches();
  activeTenantContext = { user: user || null, tenantId };
  return activeTenantContext;
}

export function getClientTenantContext() {
  return activeTenantContext;
}

const rawLogout = rawClient.auth.logout.bind(rawClient.auth);
rawClient.auth.logout = (...args) => {
  clearBusinessCaches();
  activeTenantContext = { user: null, tenantId: null };
  return rawLogout(...args);
};

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