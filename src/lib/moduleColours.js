import { moduleKeyColour, MODULE_KEY_COLOURS } from '@/components/dashboard/dashboardModuleColours';

export const MODULE_COLOURS = Object.values(MODULE_KEY_COLOURS);

// Every module title maps to its FIXED colour from the 45 dashboard modules.
// Order matters — the first keyword match wins.
const KEYWORD_MODULES = [
  { keywords: ['incident analytics'], key: 'incident-analytics' },
  { keywords: ['incident', 'investigation'], key: 'incidents' },
  { keywords: ['emergency', 'drill', 'safety check'], key: 'emergency-response' },
  { keywords: ['take five', 'risk', 'hazard', 'whs', 'safety'], key: 'risks' },
  { keywords: ['intake'], key: 'intake' },
  { keywords: ['hr hub', 'human resources', 'appraisal', 'contract', 'leave', 'recognition', 'milestone', 'payroll'], key: 'human-resources' },
  { keywords: ['users', 'permission'], key: 'users' },
  { keywords: ['crm', 'lead', 'marketing'], key: 'crm' },
  { keywords: ['procurement', 'purchase', 'supplier'], key: 'procurement' },
  { keywords: ['project'], key: 'projects' },
  { keywords: ['suggestion', 'improvement'], key: 'suggestions-hub' },
  { keywords: ['visual', 'communication board'], key: 'visual-boards' },
  { keywords: ['analytics', 'insight', 'business'], key: 'analytics' },
  { keywords: ['user guide', 'manual'], key: 'user-guides' },
  { keywords: ['help'], key: 'help' },
  { keywords: ['invoice'], key: 'invoicing' },
  { keywords: ['quote'], key: 'quotes' },
  { keywords: ['receipt', 'payment', 'financial'], key: 'receipts' },
  { keywords: ['certificate', 'certification'], key: 'certificates' },
  { keywords: ['training', 'lms', 'competency'], key: 'training' },
  { keywords: ['volunteer', 'placement'], key: 'volunteering-placements' },
  { keywords: ['participant', 'client'], key: 'our-participants' },
  { keywords: ['staff', 'employee', 'personnel', 'performance', 'buddy'], key: 'our-staff' },
  { keywords: ['referral'], key: 'community-referral' },
  { keywords: ['goal'], key: 'goals' },
  { keywords: ['feedback', 'survey'], key: 'feedback' },
  { keywords: ['communication', 'message'], key: 'communications' },
  { keywords: ['roster', 'shift', 'timesheet'], key: 'rostering' },
  { keywords: ['meeting'], key: 'meetings' },
  { keywords: ['task', 'to-do', 'todo'], key: 'tasks' },
  { keywords: ['equipment', 'msds', 'chemical', 'manual'], key: 'equipment-manuals' },
  { keywords: ['asset', 'maintenance'], key: 'assets' },
  { keywords: ['ndis news', 'news'], key: 'ndis-news' },
  { keywords: ['ndis'], key: 'ndis-provider' },
  { keywords: ['community', 'council'], key: 'community-council' },
  { keywords: ['program', 'event'], key: 'programs' },
  { keywords: ['quality', 'checklist'], key: 'quality' },
  { keywords: ['contact'], key: 'key-contacts' },
  { keywords: ['auditor'], key: 'auditor-portal' },
  { keywords: ['compliance', 'audit', 'policy', 'legal'], key: 'compliance' },
  { keywords: ['company safe', 'safe'], key: 'company-safe' },
  { keywords: ['document', 'vault', 'form'], key: 'documents' },
  { keywords: ['assistant'], key: 'assistant' },
  { keywords: ['profile'], key: 'my-profile' },
];

export function moduleColour(value = '') {
  const text = String(value).toLowerCase();
  const match = KEYWORD_MODULES.find((entry) => entry.keywords.some((keyword) => text.includes(keyword)));
  return moduleKeyColour(match ? match.key : 'dashboard');
}