import { hasApprovedAccess, canAccessNav } from './roleMatrix.js';

export function executiveIdentity(user) {
  return JSON.stringify([user?.id, user?.tenant_id || user?.data?.tenant_id, user?.role, user?.account_status, user?.access_approved]);
}

export function canReadExecutiveMetrics(user) {
  return Boolean(user?.id && (user.tenant_id || user.data?.tenant_id) && hasApprovedAccess(user) && canAccessNav(user.role, 'operations-centre'));
}

export async function loadExecutiveMetrics({ entities: sourceEntities, user, view, today }) {
  if (!canReadExecutiveMetrics(user)) return {};
  const tenant = user.tenant_id || user.data.tenant_id;
  // Keep the tenant predicate even if an entity proxy cannot infer its schema.
  // Platform RLS still enforces the caller's record permissions.
  const entities = new Proxy({}, { get: (_, name) => ({ count: query => sourceEntities[name].count({ ...query, tenant_id: tenant }) }) });
      const openRisks = { status: { $in: ['Identified', 'Assessed', 'Treating', 'Monitored'] } };
      const openIncidents = { status: { $in: ['Reported', 'Under Investigation', 'Action Required'] } };
      const canReadGovernance = canAccessNav(user.role, 'governance');
      const canReadPolicy = canAccessNav(user.role, 'compliance');
      const canReadQuality = canAccessNav(user.role, 'quality');
      const canReadDocuments = canAccessNav(user.role, 'documents');
      const openQuality = { status: { $in: ['New', 'In Progress'] } };
      const definitions = {
        risks: () => entities.Risk.count(openRisks),
        highRisks: () => entities.Risk.count({ ...openRisks, rating: { $in: ['High', 'Critical'] } }),
        riskReviews: () => entities.Risk.count({ ...openRisks, review_date: { $gte: '1900-01-01', $lt: today } }),
        incidents: () => entities.Incident.count(openIncidents),
        issues: () => entities.ComplianceIssue.count({ status: { $in: ['Open', 'In Progress'] } }),
        tasks: () => entities.TodoTask.count({ status: { $in: ['Pending', 'Pending Approval', 'In Progress', 'Open', 'Overdue'] }, due_date: { $gte: '1900-01-01', $lt: today } }),
        governanceReviews: () => canReadGovernance ? entities.GovernanceObject.count({ status: { $in: ['Active', 'Under Review'] }, review_date: { $gte: '1900-01-01', $lt: today } }) : null,
        declarations: () => canReadGovernance ? entities.AuthorityDeclaration.count({ status: { $in: ['Under Review', 'Expired'] } }) : null,
        auditFollowups: () => canReadGovernance ? entities.Audit.count({ status: 'Follow-up Required' }) : null,
        expiredPolicies: () => canReadPolicy ? entities.Policy.count({ status: 'Expired' }) : null,
        openImprovements: () => canReadQuality ? entities.QualityItem.count({ ...openQuality, type: { $in: ['Improvement', 'Idea'] } }) : null,
        openCorrective: () => canReadQuality ? entities.QualityItem.count({ ...openQuality, type: 'Corrective Action' }) : null,
        overdueCorrective: () => canReadQuality ? entities.QualityItem.count({ ...openQuality, type: 'Corrective Action', target_date: { $gte: '1900-01-01', $lt: today } }) : null,
        openPreventive: () => canReadQuality ? entities.QualityItem.count({ ...openQuality, type: 'Preventive Action' }) : null,
        documentReviews: () => canReadDocuments ? entities.DocumentControl.count({ status: { $in: ['Draft', 'Review', 'Approved'] }, review_date: { $gte: '1900-01-01', $lt: today } }) : null,
        documentsInReview: () => canReadDocuments ? entities.DocumentControl.count({ status: 'Review' }) : null,
        draftDocuments: () => canReadDocuments ? entities.DocumentControl.count({ status: 'Draft' }) : null,
        supersededDocuments: () => canReadDocuments ? entities.DocumentControl.count({ status: 'Superseded' }) : null,
      };
      const views = { executive: ['risks', 'incidents', 'issues', 'tasks'], risk: ['risks', 'highRisks', 'riskReviews', 'incidents'], board: ['governanceReviews', 'declarations', 'auditFollowups', 'highRisks'], compliance: ['issues', 'expiredPolicies', 'auditFollowups', 'tasks'], quality: ['openImprovements', 'openCorrective', 'overdueCorrective', 'openPreventive'], documents: ['documentReviews', 'documentsInReview', 'draftDocuments', 'supersededDocuments'] };
      const keys = views[view];
      if (!keys || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(today)) return {};
      const permissions = { risks: 'risks', highRisks: 'risks', riskReviews: 'risks', incidents: 'incidents', issues: 'compliance', tasks: 'tasks', governanceReviews: 'governance', declarations: 'governance', auditFollowups: 'compliance', expiredPolicies: 'compliance', openImprovements: 'quality', openCorrective: 'quality', overdueCorrective: 'quality', openPreventive: 'quality', documentReviews: 'documents', documentsInReview: 'documents', draftDocuments: 'documents', supersededDocuments: 'documents' };
      const results = await Promise.allSettled(keys.map(key => canAccessNav(user.role, permissions[key]) ? definitions[key]() : null));
      return Object.fromEntries(keys.map((key, index) => {
        const result = results[index];
        const value = result.status === 'fulfilled' ? result.value : null;
        return [key, Number.isSafeInteger(value) && value >= 0 ? value : null];
      }));
}
