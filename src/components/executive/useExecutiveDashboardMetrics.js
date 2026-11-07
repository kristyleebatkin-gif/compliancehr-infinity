import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';

export default function useExecutiveDashboardMetrics(view) {
  const { user } = useRole();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return useQuery({
    queryKey: ['executive-dashboard-metrics', user?.id, user?.role, view, today],
    queryFn: async () => {
      const openRisks = { status: { $in: ['Identified', 'Assessed', 'Treating', 'Monitored'] } };
      const openIncidents = { status: { $in: ['Reported', 'Under Investigation', 'Action Required'] } };
      const canReadGovernance = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'].includes(user?.role);
      const canReadPolicy = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Team Leader', 'Support Worker', 'Finance & Accounts Officer', 'Human Resources Manager', 'Rostering Coordinator', 'Quality & Improvement Manager', 'CRM & Marketing Officer', 'Intake Officer', 'Participant', 'Auditor', 'Volunteer'].includes(user?.role);
      const canReadQuality = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Team Leader'].includes(user?.role);
      const canReadDocuments = ['admin', 'Provider Administrator', 'Compliance Manager', 'Compliance Administrator', 'Administration', 'Management', 'Team Leader', 'Human Resources Manager', 'Quality & Improvement Manager', 'Support Worker', 'Employee', 'Auditor'].includes(user?.role);
      const openQuality = { status: { $in: ['New', 'In Progress'] } };
      const definitions = {
        risks: () => base44.entities.Risk.count(openRisks),
        highRisks: () => base44.entities.Risk.count({ ...openRisks, rating: { $in: ['High', 'Critical'] } }),
        riskReviews: () => base44.entities.Risk.count({ ...openRisks, review_date: { $gte: '1900-01-01', $lt: today } }),
        incidents: () => base44.entities.Incident.count(openIncidents),
        issues: () => base44.entities.ComplianceIssue.count({ status: { $in: ['Open', 'In Progress'] } }),
        tasks: () => base44.entities.TodoTask.count({ status: { $in: ['Pending', 'Pending Approval', 'In Progress', 'Open', 'Overdue'] }, due_date: { $gte: '1900-01-01', $lt: today } }),
        governanceReviews: () => canReadGovernance ? base44.entities.GovernanceObject.count({ status: { $in: ['Active', 'Under Review'] }, review_date: { $gte: '1900-01-01', $lt: today } }) : null,
        declarations: () => canReadGovernance ? base44.entities.AuthorityDeclaration.count({ status: { $in: ['Under Review', 'Expired'] } }) : null,
        auditFollowups: () => canReadGovernance ? base44.entities.Audit.count({ status: 'Follow-up Required' }) : null,
        expiredPolicies: () => canReadPolicy ? base44.entities.Policy.count({ status: 'Expired' }) : null,
        openImprovements: () => canReadQuality ? base44.entities.QualityItem.count({ ...openQuality, type: { $in: ['Improvement', 'Idea'] } }) : null,
        openCorrective: () => canReadQuality ? base44.entities.QualityItem.count({ ...openQuality, type: 'Corrective Action' }) : null,
        overdueCorrective: () => canReadQuality ? base44.entities.QualityItem.count({ ...openQuality, type: 'Corrective Action', target_date: { $gte: '1900-01-01', $lt: today } }) : null,
        openPreventive: () => canReadQuality ? base44.entities.QualityItem.count({ ...openQuality, type: 'Preventive Action' }) : null,
        documentReviews: () => canReadDocuments ? base44.entities.DocumentControl.count({ status: { $in: ['Draft', 'Review', 'Approved'] }, review_date: { $gte: '1900-01-01', $lt: today } }) : null,
        documentsInReview: () => canReadDocuments ? base44.entities.DocumentControl.count({ status: 'Review' }) : null,
        draftDocuments: () => canReadDocuments ? base44.entities.DocumentControl.count({ status: 'Draft' }) : null,
        supersededDocuments: () => canReadDocuments ? base44.entities.DocumentControl.count({ status: 'Superseded' }) : null,
      };
      const views = { executive: ['risks', 'incidents', 'issues', 'tasks'], risk: ['risks', 'highRisks', 'riskReviews', 'incidents'], board: ['governanceReviews', 'declarations', 'auditFollowups', 'highRisks'], compliance: ['issues', 'expiredPolicies', 'auditFollowups', 'tasks'], quality: ['openImprovements', 'openCorrective', 'overdueCorrective', 'openPreventive'], documents: ['documentReviews', 'documentsInReview', 'draftDocuments', 'supersededDocuments'] };
      const keys = views[view];
      const results = await Promise.allSettled(keys.map((key) => definitions[key]()));
      return Object.fromEntries(keys.map((key, i) => [key, results[i].status === 'fulfilled' && typeof results[i].value === 'number' ? results[i].value : null]));
    },
    staleTime: 30000,
  });
}