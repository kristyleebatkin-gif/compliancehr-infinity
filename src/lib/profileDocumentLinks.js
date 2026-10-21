export function profileVaultUrl(profile, kind, documentType = '') {
  const params = new URLSearchParams({ focus: kind === 'participant' ? 'participant' : 'employee', [kind === 'participant' ? 'participant_id' : 'employee_id']: profile.id });
  if (documentType) params.set('document_type', documentType);
  return `/documents?${params}`;
}
export function participantModuleUrl(profile, module, form = '') {
  const params = new URLSearchParams({ module });
  if (form) params.set('form', form);
  return `/our-participants/${encodeURIComponent(profile.id)}?${params}`;
}