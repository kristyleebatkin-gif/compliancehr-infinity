const communicationColumns = [['entry_date', 'Date'], ['entry_kind', 'Type'], ['subject', 'Subject'], ['sender_name', 'Sender'], ['body', 'Communication']];
const documentColumns = [['title', 'Title'], ['employee_name', 'Employee'], ['document_type', 'Type'], ['status', 'Status'], ['expiry_date', 'Expiry date']];
const participantColumns = [['title', 'Title'], ['participant_name', 'Participant'], ['document_type', 'Type'], ['status', 'Status'], ['review_date', 'Review date']];

export function reportSources(area, { user, profile, restricted, isManager } = {}) {
  if (!user) return [];
  if (area === 'communication') {
    if (user.role === 'Employee') return [{ id: 'diary', label: 'My communication diary', serviceView: 'diary', columns: communicationColumns }];
    if (restricted && !profile?.full_name) return [];
    const query = restricted || profile ? { person_type: profile?.kind === 'participant' || user.role === 'Participant' ? 'Participant' : 'Employee', person_name: profile.full_name } : {};
    return [{ id: 'diary', label: restricted || profile ? 'Profile communication diary' : 'Communication diary', entity: 'CommunicationEntry', query, columns: communicationColumns }];
  }
  if (area === 'executive') return [
    { id: 'risk', label: 'Risk register', entity: 'Risk', columns: [['title', 'Risk'], ['category', 'Category'], ['rating', 'Rating'], ['status', 'Status'], ['owner', 'Owner'], ['review_date', 'Review date']] },
    { id: 'incidents', label: 'Incident register', entity: 'Incident', columns: [['title', 'Incident'], ['date_occurred', 'Date'], ['category', 'Category'], ['severity', 'Severity'], ['status', 'Status']] },
    { id: 'issues', label: 'Compliance issues', entity: 'ComplianceIssue', columns: [['title', 'Issue'], ['category', 'Category'], ['priority', 'Priority'], ['status', 'Status'], ['assigned_to', 'Assigned to'], ['target_date', 'Target date']] },
  ];
  if (area === 'documents') {
    if (user.role === 'Participant') return [{ id: 'participant', label: 'My participant documents', entity: 'ParticipantDocument', query: { participant_user_id: user.id }, columns: participantColumns }];
    const personal = ['Support Worker', 'Employee', 'user'].includes(user.role);
    const query = personal ? { $or: [...(user.email ? [{ employee_email: user.email }] : []), ...(user.full_name ? [{ employee_name: user.full_name }] : [])], status: { $ne: 'Archived' } } : { status: { $ne: 'Archived' } };
    if (personal && !query.$or.length) return [];
    const sources = [{ id: 'employee', label: personal ? 'My employee documents' : 'Employee documents', entity: 'EmployeeDocument', query, columns: documentColumns }];
    if (!personal) sources.push({ id: 'participant', label: 'Participant documents', entity: 'ParticipantDocument', columns: participantColumns });
    return sources;
  }
  if (area === 'hr') {
    const query = isManager ? {} : { created_by_id: user.id };
    const sources = [{ id: 'leave', label: isManager ? 'Leave requests' : 'My leave requests', entity: 'LeaveRequest', query, columns: [['staff_name', 'Staff'], ['leave_type', 'Leave type'], ['start_date', 'Start'], ['end_date', 'End'], ['status', 'Status']] }];
    if (isManager) sources.push({ id: 'reviews', label: 'Performance reviews', entity: 'PerformanceReview', columns: [['staff_name', 'Staff'], ['review_type', 'Review type'], ['review_date', 'Review date'], ['reviewer', 'Reviewer'], ['status', 'Status']] });
    return sources;
  }
  if (area === 'administration') return [
    { id: 'memberships', label: 'Organisation memberships', entity: 'TenantMembership', columns: [['user_email', 'User'], ['membership_role', 'Role'], ['status', 'Status'], ['organisation_id', 'Organisation'], ['starts_on', 'Starts'], ['ends_on', 'Ends']] },
    { id: 'activity', label: 'Audit activity', entity: 'AuditLog', columns: [['timestamp', 'Timestamp'], ['action', 'Action'], ['entity_type', 'Record type'], ['record_title', 'Record'], ['performed_by', 'Performed by']] },
  ];
  return [];
}