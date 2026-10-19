// Shared constants for the Compliance Issues register.
export const CATEGORIES = ['Governance', 'Policy', 'Documentation', 'Training', 'Safety', 'Incident', 'Privacy & Records', 'Finance', 'Workforce', 'Environment', 'Other'];
export const SOURCES = ['Internal Audit', 'NDIS Audit', 'Incident Review', 'Feedback & Complaints', 'Checklist Review', 'Management Observation', 'Staff Report', 'Other'];

export const today = () => new Date().toISOString().slice(0, 10);

export const appendLog = (existing, entry) => [existing, entry].filter(Boolean).join('\n');

export const nextIssueId = (issues) => {
  const nums = issues.map((i) => Number(String(i.issue_id || '').replace(/^CI-/, ''))).filter((n) => Number.isFinite(n));
  return (nums.length ? Math.max(...nums) : 0) + 1;
};