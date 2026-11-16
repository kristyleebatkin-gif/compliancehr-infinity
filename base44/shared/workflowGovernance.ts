// Identity-based maker/checker controls shared by the supervised runtime.
export function publicationAuthority(authorId: unknown, publisherId: unknown): string | null {
  if (!authorId || !publisherId) return 'Author and publisher identities must be known before publication.';
  if (String(authorId) === String(publisherId)) return 'An independent authorised publisher must publish this workflow. A publication note cannot override this control.';
  return null;
}

export function approvalIndependence(actorId: unknown, events: any[]): string | null {
  if (!actorId) return 'The approver identity is unavailable.';
  const preparation = events.filter(event =>
    ['StepCompleted', 'EvidenceRecorded', 'EvidenceVerified'].includes(event.event_type) &&
    !['START', 'END', 'DECISION'].includes(event.node_type));
  if (preparation.some(event => !event.actor_id)) return 'A preparation record has no verified actor identity. Resolve its provenance before approval.';
  if (preparation.some(event => String(event.actor_id) === String(actorId))) return 'An independent authorised reviewer must approve work prepared by another person.';
  return null;
}
