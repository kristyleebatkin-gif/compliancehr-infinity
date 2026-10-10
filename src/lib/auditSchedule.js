/**
 * Audit review schedule: every audited area and its required review cycle.
 * Frequencies per organisational audit policy.
 */
export const AREAS = [
  { area: 'Participant Files', months: 3 },
  { area: 'First Aid', months: 6 },
  { area: 'Natural Disaster', months: 6 },
  { area: 'Fire Drills', months: 6 },
  { area: 'MSDS', months: 6 },
  { area: 'Staff Files', months: 12 },
  { area: 'Feedback', months: 6 },
  { area: 'Risks', months: 6 },
  { area: 'Incidents', months: 6 },
  { area: 'Investigations', months: 6 },
  { area: 'Continuous Improvement', months: 6 },
];

export const AUDIT_AREA_OPTIONS = [...AREAS.map((a) => a.area), 'NDIS Verification', 'NDIS Certification', 'NDIS Mid-term', 'Other'];