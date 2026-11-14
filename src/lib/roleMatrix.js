// Canonical Role, Permission, Tenant Isolation, Document Classification & Approval Matrix
// Single source of truth used across frontend, backend functions, workflows, exports, and AI agents.

export const ROLES = {
  GUEST: 'Guest',
  ADMIN: 'Provider Administrator',
  COMPLIANCE_ADMIN: 'Compliance Administrator',
  MANAGEMENT: 'Management',
  COMPLIANCE: 'Compliance Administrator',
  TEAM_LEADER: 'Administration',
  EMPLOYEE: 'Employee',
  SUPPORT: 'Employee',
  PARTICIPANT: 'Participant',
  AUDITOR: 'Auditor',
  PENDING_APPROVAL: 'Pending Approval',
  FINANCE: 'Finance & Accounts Officer',
  HR: 'Human Resources Manager',
  ROSTERING: 'Rostering Coordinator',
  QUALITY: 'Quality & Improvement Manager',
  MARKETING: 'CRM & Marketing Officer',
  INTAKE: 'Intake Officer',
  VOLUNTEER: 'Volunteer',
};

export const ALL_ROLES = [
  'Guest',
  'Participant',
  'Employee',
  'Administration',
  'Compliance Administrator',
  'Provider Administrator',
  'Management',
  'Auditor',
  'Volunteer',
];

export const ACCESS_ROLES = ALL_ROLES;

export const LEGACY_ROLE_MAP = {
  admin: 'Provider Administrator',
  user: 'Employee',
  'Support Worker': 'Employee',
  'Finance & Accounts Officer': 'Employee',
  'Human Resources Manager': 'Employee',
  'Rostering Coordinator': 'Employee',
  'Quality & Improvement Manager': 'Employee',
  'CRM & Marketing Officer': 'Employee',
  'Intake Officer': 'Employee',
  'Compliance Manager': 'Compliance Administrator',
  'Compliance Administrator': 'Compliance Administrator',
  'Team Leader': 'Administration',
};

export const BLOCKED_ACCOUNT_STATUSES = [
  'Rejected',
  'Archived',
  'Suspended',
  'Disabled',
  'Pending',
  'Pending Approval',
];

export function isOpenAccessWindowActive() {
  return false;
}

export function normalizeRole(role) {
  if (!role || typeof role !== 'string') return ROLES.PENDING_APPROVAL;
  if (LEGACY_ROLE_MAP[role]) return LEGACY_ROLE_MAP[role];
  return role;
}

// Enforces account_status === 'Active' and access_approved === true globally for every user and role.
export function hasApprovedAccess(user) {
  if (isOpenAccessWindowActive()) return true;
  if (!user || typeof user !== 'object') return false;
  if (user.role === 'Archived' || BLOCKED_ACCOUNT_STATUSES.includes(user.account_status)) return false;
  if (user.account_status !== 'Active' || user.access_approved !== true) return false;
  const normalized = normalizeRole(user.role);
  return ALL_ROLES.includes(normalized);
}

export const FULL_ACCESS = ['admin', ROLES.ADMIN, ROLES.COMPLIANCE_ADMIN, ROLES.MANAGEMENT];
export const OPERATIONS = [...FULL_ACCESS, ROLES.TEAM_LEADER];
export const PERSONAL = [...OPERATIONS, ROLES.EMPLOYEE, ROLES.PARTICIPANT];
export const FINANCIAL_KEYS = ['invoicing', 'quotes', 'receipts', 'insurance-finance', 'procurement', 'analytics', 'my-payroll'];

export const MANAGEMENT_ROLES = ['admin', 'Provider Administrator', 'Management'];
export const COMPLIANCE_REVIEW_ROLES = [...MANAGEMENT_ROLES, 'Compliance Manager', 'Compliance Administrator', 'Administration', 'Quality & Improvement Manager'];
export const STAFF_SEND_ROLES = [
  ...MANAGEMENT_ROLES,
  'Compliance Administrator',
  'Compliance Manager',
  'Administration',
  'Human Resources Manager',
  'CRM & Marketing Officer',
  'Finance & Accounts Officer',
  'Rostering Coordinator',
  'Team Leader',
  'Quality & Improvement Manager',
  'Intake Officer',
  'Support Worker',
  'Employee',
];
export const CONSENT_ROLES = [...MANAGEMENT_ROLES, 'Compliance Administrator', 'Compliance Manager', 'Human Resources Manager', 'Quality & Improvement Manager'];
export const HR_ROLES = [...MANAGEMENT_ROLES, 'Administration', 'Team Leader', 'Human Resources Manager'];

export function canManageAccess(user) {
  return hasApprovedAccess(user) && MANAGEMENT_ROLES.includes(user.role);
}

export function hasAnyRole(user, roles = MANAGEMENT_ROLES) {
  if (!hasApprovedAccess(user)) return false;
  const normalized = normalizeRole(user.role);
  return roles.includes(user.role) || roles.includes(normalized);
}

export const NAV_PERMISSIONS = {
  'my-profile': PERSONAL,
  'our-staff': [...OPERATIONS, ROLES.EMPLOYEE],
  'our-participants': [...OPERATIONS, ROLES.PARTICIPANT],
  dashboard: [...PERSONAL, ROLES.GUEST, ROLES.VOLUNTEER],
  // These workspaces contain operational, staff and finance information.
  // The base role list is administration-only; existing FULL_ACCESS executive roles retain their global access.
  today: ['admin', ROLES.ADMIN, ROLES.TEAM_LEADER],
  'team-leader': ['admin', ROLES.ADMIN, ROLES.TEAM_LEADER],
  'operations-centre': OPERATIONS,
  notifications: PERSONAL,
  assistant: PERSONAL,
  help: [...PERSONAL, ROLES.GUEST, ROLES.VOLUNTEER],
  'user-guides': [...PERSONAL, ROLES.GUEST, ROLES.VOLUNTEER],
  'key-contacts': PERSONAL,
  'community-council': PERSONAL,
  'community-referral': PERSONAL,
  'ndis-news': PERSONAL,
  programs: PERSONAL,
  events: PERSONAL,
  'whats-on': PERSONAL,
  weather: PERSONAL,
  'visual-boards': PERSONAL,
  participants: OPERATIONS,
  intake: PERSONAL,
  staff: OPERATIONS,
  training: PERSONAL,
  compliance: OPERATIONS,
  'daily-briefing': OPERATIONS,
  incidents: PERSONAL,
  risks: PERSONAL,
  'audit-centre': OPERATIONS,
  'universal-storage': PERSONAL,
  documents: PERSONAL,
  'company-safe': FULL_ACCESS,
  'remote-access': PERSONAL,
  certificates: OPERATIONS,
  'audit-log': OPERATIONS,
  'auditor-portal': [...FULL_ACCESS, ROLES.AUDITOR],
  feedback: PERSONAL,
  tasks: PERSONAL,
  approvals: PERSONAL,
  quality: OPERATIONS,
  'review-due': OPERATIONS,
  'suggestions-hub': OPERATIONS,
  assets: OPERATIONS,
  goals: PERSONAL,
  shifts: PERSONAL,
  rostering: PERSONAL,
  governance: OPERATIONS,
  'human-resources': PERSONAL,
  invoicing: FULL_ACCESS,
  quotes: FULL_ACCESS,
  manual: PERSONAL,
  users: FULL_ACCESS,
  forms: OPERATIONS,
  checklists: OPERATIONS,
  registers: PERSONAL,
  'user-success': PERSONAL,
  'record-intelligence': PERSONAL,
  'frontline-hub': PERSONAL,
  'workforce-presence': PERSONAL,
  'emergency-response': PERSONAL,
  meetings: OPERATIONS,
  'data-control': FULL_ACCESS,
  receipts: [...FULL_ACCESS, ROLES.EMPLOYEE],
  'equipment-manuals': PERSONAL,
  msds: PERSONAL,
  'insurance-finance': FULL_ACCESS,
  'ndis-provider': OPERATIONS,
  'volunteering-placements': [...OPERATIONS, ROLES.VOLUNTEER],
  communications: PERSONAL,
  portal: PERSONAL,
  'safety-insights': OPERATIONS,
  'incident-analytics': OPERATIONS,
  'staff-progress': OPERATIONS,
  analytics: FULL_ACCESS,
  crm: OPERATIONS,
  procurement: FULL_ACCESS,
  projects: OPERATIONS,
  'my-payroll': FULL_ACCESS,
};

export const RESTRICTED_EXECUTIVE_KEYS = [
  'operations-centre',
  'company-safe',
  'users',
  'data-control',
  'analytics',
];

export function canAccessNav(role, navKey) {
  const normalized = normalizeRole(role);
  if (
    (normalized === ROLES.PARTICIPANT || normalized === ROLES.EMPLOYEE || role === ROLES.VOLUNTEER) &&
    RESTRICTED_EXECUTIVE_KEYS.includes(navKey)
  ) {
    return false;
  }
  if (FULL_ACCESS.includes(normalized)) return true;
  if (normalized === ROLES.AUDITOR) return navKey === 'auditor-portal';
  if (normalized === ROLES.TEAM_LEADER && FINANCIAL_KEYS.includes(navKey)) return false;
  return Boolean(NAV_PERMISSIONS[navKey]?.includes(normalized));
}

export function isAdmin(role) {
  return FULL_ACCESS.includes(normalizeRole(role));
}

export function isCompliance(role) {
  return FULL_ACCESS.includes(normalizeRole(role));
}

// Document Security Classification Matrix
export const DOCUMENT_CLASSIFICATIONS = {
  PUBLIC: 'Public',
  INTERNAL: 'Internal',
  CONFIDENTIAL: 'Confidential',
  SENSITIVE: 'Sensitive',
  REGULATED: 'Regulated',
};

export const CLASSIFICATION_ALLOWED_ROLES = {
  Public: ALL_ROLES,
  Internal: [...OPERATIONS, ROLES.EMPLOYEE, ROLES.VOLUNTEER],
  Confidential: [...OPERATIONS, ROLES.HR, ROLES.FINANCE],
  Sensitive: [...FULL_ACCESS, ROLES.HR, ROLES.AUDITOR],
  Regulated: [...FULL_ACCESS, ROLES.AUDITOR],
};

export function canAccessDocumentClassification(user, classification = 'Internal') {
  if (!hasApprovedAccess(user)) return false;
  const allowed = CLASSIFICATION_ALLOWED_ROLES[classification] || FULL_ACCESS;
  const normalized = normalizeRole(user.role);
  return allowed.includes(user.role) || allowed.includes(normalized);
}

// Canonical Approval State Machine: Draft -> Submitted -> Under Review -> Approved/Rejected -> Archived
export const APPROVAL_STATES = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Archived'];

export const VALID_APPROVAL_TRANSITIONS = {
  Draft: ['Submitted', 'Archived'],
  Submitted: ['Under Review', 'Draft', 'Archived'],
  'Under Review': ['Approved', 'Rejected', 'Submitted'],
  Approved: ['Archived', 'Under Review'],
  Rejected: ['Draft', 'Submitted', 'Archived'],
  Archived: [],
};

export function validateApprovalTransition(
  currentStatus = 'Draft',
  nextStatus = 'Submitted',
  context = { user: null, reason: '', evidence_uri: '', evidence_url: '', evidence_id: '' }
) {
  const from = APPROVAL_STATES.includes(currentStatus) ? currentStatus : 'Draft';
  if (!APPROVAL_STATES.includes(nextStatus)) {
    throw new Error(`Invalid approval status "${nextStatus}".`);
  }
  const allowedNext = VALID_APPROVAL_TRANSITIONS[from] || [];
  if (!allowedNext.includes(nextStatus)) {
    throw new Error(`Cannot transition approval status from "${from}" to "${nextStatus}".`);
  }
  const user = context.user;
  if (!hasApprovedAccess(user)) {
    throw new Error('Active, approved account access is required to change approval status.');
  }
  if (['Under Review', 'Approved', 'Rejected', 'Archived'].includes(nextStatus)) {
    if (!hasAnyRole(user, COMPLIANCE_REVIEW_ROLES)) {
      throw new Error(`Role "${user.role}" is not permitted to transition records to "${nextStatus}".`);
    }
  }
  if (nextStatus === 'Approved') {
    if (!String(context.reason || '').trim()) {
      throw new Error('An approval reason is required before marking a record Approved.');
    }
    if (!String(context.evidence_uri || context.evidence_url || context.evidence_id || '').trim()) {
      throw new Error('Verified supporting evidence is required before marking a record Approved.');
    }
  }
  if (nextStatus === 'Rejected' && !String(context.reason || '').trim()) {
    throw new Error('A rejection reason is required when rejecting a record.');
  }
  return {
    previous_status: from,
    status: nextStatus,
    approver_id: user.id,
    approver_name: user.full_name || user.email,
    approver_email: user.email,
    approver_role: user.role,
    decision_timestamp: new Date().toISOString(),
    decision_reason: String(context.reason || '').trim(),
    evidence_reference: String(context.evidence_uri || context.evidence_url || context.evidence_id || '').trim(),
  };
}

// Complete Multi-Tenant Isolation Model
export function resolveUserTenantId(user, membership = null, tenant = null) {
  if (!hasApprovedAccess(user)) {
    throw new Error('Active approved user is required for tenant resolution.');
  }
  if (tenant && tenant.status && tenant.status !== 'Active') {
    throw new Error(`Tenant "${tenant.tenant_key || tenant.id}" is ${tenant.status} and cannot be accessed.`);
  }
  if (membership) {
    if (membership.status !== 'Active') {
      throw new Error('Active tenant membership is required.');
    }
    if (membership.user_id && membership.user_id !== user.id) {
      throw new Error('Tenant membership does not belong to the authenticated user.');
    }
  }
  const userTenantId =
    user.organisation_id ||
    user.tenant_id ||
    user.data?.organisation_id ||
    user.data?.tenant_id ||
    membership?.organisation_id ||
    membership?.tenant_id ||
    null;
  const membershipOrgId = membership?.organisation_id || membership?.tenant_id || null;
  if (membershipOrgId && userTenantId && membershipOrgId !== userTenantId) {
    throw new Error('Cross-tenant mismatch between user profile and tenant membership.');
  }
  if (
    tenant?.id &&
    userTenantId &&
    tenant.id !== userTenantId &&
    tenant.tenant_key !== userTenantId &&
    tenant.organisation_id !== userTenantId
  ) {
    throw new Error('Cross-tenant access denied.');
  }
  return userTenantId;
}

export function assertTenantRecordAccess(user, record, expectedTenantId = null) {
  if (!hasApprovedAccess(user)) {
    throw new Error('Active approved user is required.');
  }
  const activeTenantId =
    expectedTenantId ||
    user.organisation_id ||
    user.tenant_id ||
    user.data?.organisation_id ||
    user.data?.tenant_id ||
    null;
  const recordTenantId =
    record?.organisation_id ||
    record?.tenant_id ||
    record?.data?.organisation_id ||
    record?.data?.tenant_id ||
    null;
  if (activeTenantId && recordTenantId && activeTenantId !== recordTenantId) {
    throw new Error('Cross-tenant access denied.');
  }
  if (recordTenantId && !activeTenantId) {
    throw new Error('Tenant-scoped record cannot be accessed without an active tenant context.');
  }
  return true;
}

export function scopeQueryToTenant(query = {}, tenantId = null) {
  if (!tenantId) return { ...query };
  return {
    ...query,
    tenant_id: tenantId,
  };
}

export function stampTenantWritePayload(payload = {}, user = null, explicitTenantId = null) {
  if (!hasApprovedAccess(user)) {
    throw new Error('Active approved user is required to write records.');
  }
  const userTenantId =
    user.organisation_id ||
    user.tenant_id ||
    user.data?.organisation_id ||
    user.data?.tenant_id ||
    null;
  const incomingTenantId =
    payload && typeof payload === 'object'
      ? payload.organisation_id ?? payload.tenant_id
      : undefined;
  if (explicitTenantId && userTenantId && explicitTenantId !== userTenantId) {
    throw new Error('Cross-tenant write denied: cannot write to another tenant.');
  }
  if (incomingTenantId && userTenantId && incomingTenantId !== userTenantId) {
    throw new Error('Cross-tenant write denied: payload tenant_id does not match user tenant.');
  }
  const resolved = explicitTenantId || userTenantId || incomingTenantId || undefined;
  if (!resolved) return { ...payload };
  const stamped = { ...payload, tenant_id: resolved };
  if ('organisation_id' in payload || user.organisation_id || user.data?.organisation_id) {
    stamped.organisation_id = resolved;
  }
  return stamped;
}

export function isSyntheticParticipantId(participantId) {
  const id = String(participantId || '').trim();
  if (!id) return true;
  return /^(?:PART-|DOC-PART-|P-\d+|FAKE-|SYNTH-|TEMP-)/i.test(id);
}

export function detectOrphanParticipantRecords(records = [], validParticipantIds = []) {
  const validSet = new Set(validParticipantIds.map((id) => String(id).trim()).filter(Boolean));
  const orphans = [];
  for (const record of records) {
    const pid = String(record?.participant_id || '').trim();
    if (!pid || isSyntheticParticipantId(pid) || (validSet.size > 0 && !validSet.has(pid))) {
      orphans.push({
        id: record?.id || null,
        title: record?.title || record?.document_type || 'Untitled',
        participant_id: pid || null,
        participant_name: record?.participant_name || null,
        reason: !pid
          ? 'Missing participant_id'
          : isSyntheticParticipantId(pid)
            ? `Synthetic participant_id (${pid})`
            : `Unresolved participant_id (${pid})`,
      });
    }
  }
  return orphans;
}

export function repairOrphanParticipantDocuments(records = [], participants = []) {
  const byId = new Map();
  const byNameCounts = new Map();
  const byNameSingle = new Map();
  for (const p of participants) {
    if (!p?.id) continue;
    byId.set(String(p.id).trim(), p);
    const key = String(p.full_name || '').trim().toLowerCase();
    if (key) {
      byNameCounts.set(key, (byNameCounts.get(key) || 0) + 1);
      byNameSingle.set(key, p);
    }
  }
  const repaired = [];
  const unresolved = [];
  for (const doc of records) {
    const pid = String(doc?.participant_id || '').trim();
    if (pid && !isSyntheticParticipantId(pid) && byId.has(pid)) continue;
    const nameKey = String(doc?.participant_name || '').trim().toLowerCase();
    const count = byNameCounts.get(nameKey) || 0;
    if (nameKey && count === 1) {
      const target = byNameSingle.get(nameKey);
      repaired.push({
        document_id: doc.id,
        previous_participant_id: pid || null,
        resolved_participant_id: target.id,
        participant_name: target.full_name,
      });
    } else {
      unresolved.push({
        document_id: doc?.id || null,
        participant_id: pid || null,
        participant_name: doc?.participant_name || null,
        reason: count > 1 ? 'Ambiguous duplicate participant name' : 'No matching ParticipantProfile found',
      });
    }
  }
  return { repaired, unresolved };
}

export const SYSTEM_GLOBAL_ENTITIES = Object.freeze(['User', 'Tenant']);

export function normalizeTenantEntitySchema(schema = { name: '', properties: {} }) {
  if (!schema || typeof schema !== 'object') return schema;
  if (SYSTEM_GLOBAL_ENTITIES.includes(String(schema.name || ''))) return schema;
  const props = schema.properties && typeof schema.properties === 'object' ? schema.properties : {};
  if ('tenant_id' in props && props.tenant_id) return schema;
  return {
    ...schema,
    properties: {
      tenant_id: { type: 'string', title: 'Tenant ID' },
      ...props,
    },
  };
}

export function createTenantScopedEntitiesProxy(rawEntities, contextResolver, proxyOptions = {}) {
  const resolveCtx = () => {
    const resolved = typeof contextResolver === 'function' ? contextResolver() : contextResolver;
    if (typeof resolved === 'string') {
      return {
        tenantId: resolved,
        user: {
          id: 'tenant_scoped_actor',
          role: 'Provider Administrator',
          account_status: 'Active',
          access_approved: true,
          tenant_id: resolved,
        },
      };
    }
    const user = resolved?.user || null;
    const tenantId = resolved?.tenantId || user?.tenant_id || user?.data?.tenant_id || null;
    return { user, tenantId };
  };

  // strictUntagged (release 2, audit CRIT-01): a business-owned record with no business tag is
  // hidden rather than shown to everyone. Off in release 1 so untagged legacy records stay visible.
  const strictUntagged = Boolean(proxyOptions?.strictUntagged);
  const filterRecordByTenant = (record, tenantId) => {
    if (!record || !tenantId) return true;
    const recTenant = record.tenant_id || record.data?.tenant_id || null;
    if (!recTenant) return !strictUntagged;
    return recTenant === tenantId;
  };

  const assertRecordMatchesTenant = (record, user, tenantId) => {
    if (!record) return record;
    if (!tenantId) return record;
    const recTenant = record.tenant_id || record.data?.tenant_id || null;
    if (recTenant && recTenant !== tenantId) {
      throw new Error('Cross-tenant access denied: record belongs to a different tenant.');
    }
    if (user) {
      assertTenantRecordAccess({ ...user, tenant_id: tenantId }, record, tenantId);
    }
    return record;
  };

  const noTenantFieldEntities = new Set();
  const knownTenantSet = Array.isArray(proxyOptions?.knownTenantEntities)
    ? new Set(proxyOptions.knownTenantEntities)
    : null;
  const enableReadCache = Boolean(proxyOptions?.enableReadCache);
  const readCacheTtlMs = Number(proxyOptions?.readCacheTtlMs) || 15000;
  const readCache = new Map();
  const inFlightReads = new Map();

  const canScopeEntityByTenantField = (entityKey) => {
    if (noTenantFieldEntities.has(entityKey)) return false;
    if (knownTenantSet) return knownTenantSet.has(entityKey);
    return true;
  };

  const invalidateEntityCache = (entityKey) => {
    if (!enableReadCache) return;
    const prefix = `${entityKey}::`;
    for (const key of readCache.keys()) {
      if (key.startsWith(prefix)) readCache.delete(key);
    }
    for (const key of inFlightReads.keys()) {
      if (key.startsWith(prefix)) inFlightReads.delete(key);
    }
  };

  const withRateLimitRetry = async (fn) => {
    try {
      return await fn();
    } catch (err) {
      const msg = String(err?.message || err || '');
      const retryMatch = msg.match(/Rate limit exceeded.*Retry after (\d+)s/i);
      if (retryMatch) {
        const waitMs = Math.min(3000, (Number(retryMatch[1]) || 2) * 1000);
        await new Promise((r) => setTimeout(r, waitMs));
        return fn();
      }
      throw err;
    }
  };

  const runCachedRead = (entityKey, prop, args, executor) => {
    if (!enableReadCache) return executor();
    const { user, tenantId } = resolveCtx();
    let serializedArgs = '';
    try {
      serializedArgs = JSON.stringify(args);
    } catch {
      return executor();
    }
    const cacheKey = `${entityKey}::${prop}::${tenantId || ''}::${user?.id || ''}::${user?.role || ''}::${serializedArgs}`;
    const cached = readCache.get(cacheKey);
    if (cached && Date.now() - cached.at < readCacheTtlMs) {
      return Promise.resolve(cached.value);
    }
    if (inFlightReads.has(cacheKey)) {
      return inFlightReads.get(cacheKey);
    }
    const promise = withRateLimitRetry(executor)
      .then((val) => {
        readCache.set(cacheKey, { at: Date.now(), value: val });
        inFlightReads.delete(cacheKey);
        return val;
      })
      .catch((err) => {
        inFlightReads.delete(cacheKey);
        throw err;
      });
    inFlightReads.set(cacheKey, promise);
    return promise;
  };

  const isMissingTenantFieldError = (err) => {
    const msg = String(err?.message || err || '');
    return /Unknown field ["']?tenant_id["']?|has no field ["']?tenant_id["']?/i.test(msg);
  };

  return new Proxy(rawEntities || {}, {
    get(target, entityName) {
      const dao = target[entityName];
      const entityKey = String(entityName);
      if (!dao || typeof dao !== 'object' || SYSTEM_GLOBAL_ENTITIES.includes(entityKey)) {
        return dao;
      }
      return new Proxy(dao, {
        get(daoTarget, prop) {
          const orig = daoTarget[prop];
          if (typeof orig !== 'function') return orig;

          if (prop === 'get') {
            return async (id, ...rest) => {
              const { user, tenantId } = resolveCtx();
              const record = await orig.call(daoTarget, id, ...rest);
              return assertRecordMatchesTenant(record, user, tenantId);
            };
          }

          if (prop === 'filter') {
            return (query = {}, options = undefined) =>
              runCachedRead(entityKey, 'filter', [query, options], async () => {
                const { tenantId } = resolveCtx();
                const useScoped = Boolean(tenantId && canScopeEntityByTenantField(entityKey));
                const scopedQuery = useScoped ? scopeQueryToTenant(query, tenantId) : query;
                let res;
                try {
                  res = options !== undefined
                    ? await orig.call(daoTarget, scopedQuery, options)
                    : await orig.call(daoTarget, scopedQuery);
                } catch (err) {
                  if (useScoped && isMissingTenantFieldError(err)) {
                    noTenantFieldEntities.add(entityKey);
                    res = options !== undefined
                      ? await orig.call(daoTarget, query, options)
                      : await orig.call(daoTarget, query);
                  } else {
                    throw err;
                  }
                }
                if (!tenantId) return res;
                if (Array.isArray(res)) {
                  return res.filter((r) => filterRecordByTenant(r, tenantId));
                }
                if (res && Array.isArray(res.items)) {
                  return { ...res, items: res.items.filter((r) => filterRecordByTenant(r, tenantId)) };
                }
                return res;
              });
          }

          if (prop === 'list') {
            return (...args) =>
              runCachedRead(entityKey, 'list', args, async () => {
                const { tenantId } = resolveCtx();
                const res = await orig.apply(daoTarget, args);
                if (!tenantId) return res;
                if (Array.isArray(res)) {
                  return res.filter((r) => filterRecordByTenant(r, tenantId));
                }
                if (res && Array.isArray(res.items)) {
                  return { ...res, items: res.items.filter((r) => filterRecordByTenant(r, tenantId)) };
                }
                return res;
              });
          }

          if (prop === 'count') {
            return (query = {}) =>
              runCachedRead(entityKey, 'count', [query], async () => {
                const { tenantId } = resolveCtx();
                const useScoped = Boolean(tenantId && canScopeEntityByTenantField(entityKey));
                const scopedQuery = useScoped ? scopeQueryToTenant(query, tenantId) : query;
                try {
                  return await orig.call(daoTarget, scopedQuery);
                } catch (err) {
                  if (useScoped && isMissingTenantFieldError(err)) {
                    noTenantFieldEntities.add(entityKey);
                    return orig.call(daoTarget, query);
                  }
                  throw err;
                }
              });
          }

          if (prop === 'aggregate') {
            return (params = { query: undefined }) =>
              runCachedRead(entityKey, 'aggregate', [params], async () => {
                const { tenantId } = resolveCtx();
                const useScoped = Boolean(tenantId && canScopeEntityByTenantField(entityKey));
                const baseQuery = params && typeof params === 'object' && 'query' in params ? params.query || {} : {};
                const scopedParams = useScoped
                  ? { ...params, query: scopeQueryToTenant(baseQuery, tenantId) }
                  : params;
                try {
                  return await orig.call(daoTarget, scopedParams);
                } catch (err) {
                  if (useScoped && isMissingTenantFieldError(err)) {
                    noTenantFieldEntities.add(entityKey);
                    return orig.call(daoTarget, params);
                  }
                  throw err;
                }
              });
          }

          if (prop === 'create') {
            return async (payload = {}) => {
              invalidateEntityCache(entityKey);
              const { user, tenantId } = resolveCtx();
              const effectiveUser = user || (tenantId ? { id: 'tenant_actor', role: 'Provider Administrator', account_status: 'Active', access_approved: true, tenant_id: tenantId } : null);
              const stamped = effectiveUser ? stampTenantWritePayload(payload, effectiveUser, tenantId) : payload;
              return orig.call(daoTarget, stamped);
            };
          }

          if (prop === 'bulkCreate') {
            return async (items = []) => {
              invalidateEntityCache(entityKey);
              const { user, tenantId } = resolveCtx();
              const effectiveUser = user || (tenantId ? { id: 'tenant_actor', role: 'Provider Administrator', account_status: 'Active', access_approved: true, tenant_id: tenantId } : null);
              const stamped = effectiveUser
                ? items.map((item) => stampTenantWritePayload(item, effectiveUser, tenantId))
                : items;
              return orig.call(daoTarget, stamped);
            };
          }

          if (prop === 'update') {
            return async (id, payload = {}) => {
              invalidateEntityCache(entityKey);
              const { user, tenantId } = resolveCtx();
              if (tenantId && typeof daoTarget.get === 'function') {
                const existing = await daoTarget.get(id);
                assertRecordMatchesTenant(existing, user, tenantId);
              }
              const effectiveUser = user || (tenantId ? { id: 'tenant_actor', role: 'Provider Administrator', account_status: 'Active', access_approved: true, tenant_id: tenantId } : null);
              const stamped = effectiveUser ? stampTenantWritePayload(payload, effectiveUser, tenantId) : payload;
              return orig.call(daoTarget, id, stamped);
            };
          }

          if (prop === 'delete') {
            return async (id) => {
              invalidateEntityCache(entityKey);
              const { user, tenantId } = resolveCtx();
              if (tenantId && typeof daoTarget.get === 'function') {
                const existing = await daoTarget.get(id);
                assertRecordMatchesTenant(existing, user, tenantId);
              }
              return orig.call(daoTarget, id);
            };
          }

          if (prop === 'updateMany') {
            return async (query = {}, updateOp = {}) => {
              invalidateEntityCache(entityKey);
              const { tenantId } = resolveCtx();
              const useScoped = Boolean(tenantId && canScopeEntityByTenantField(entityKey));
              const scopedQuery = useScoped ? scopeQueryToTenant(query, tenantId) : query;
              try {
                return await orig.call(daoTarget, scopedQuery, updateOp);
              } catch (err) {
                if (useScoped && isMissingTenantFieldError(err)) {
                  noTenantFieldEntities.add(entityKey);
                  return orig.call(daoTarget, query, updateOp);
                }
                throw err;
              }
            };
          }

          if (prop === 'deleteMany') {
            return async (query = {}) => {
              invalidateEntityCache(entityKey);
              const { tenantId } = resolveCtx();
              const useScoped = Boolean(tenantId && canScopeEntityByTenantField(entityKey));
              const scopedQuery = useScoped ? scopeQueryToTenant(query, tenantId) : query;
              try {
                return await orig.call(daoTarget, scopedQuery);
              } catch (err) {
                if (useScoped && isMissingTenantFieldError(err)) {
                  noTenantFieldEntities.add(entityKey);
                  return orig.call(daoTarget, query);
                }
                throw err;
              }
            };
          }

          return orig.bind(daoTarget);
        },
      });
    },
  });
}