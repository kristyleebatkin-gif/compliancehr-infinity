const normalise = (value) => String(value || '').trim().toLowerCase();

export function isOpenIncident(incident) {
  return !['resolved', 'closed'].includes(normalise(incident?.status));
}

export function isOpenRisk(risk) {
  return normalise(risk?.status) !== 'closed';
}

export function isHighCriticalRisk(risk) {
  return ['high', 'critical'].includes(normalise(risk?.rating));
}

export function isOpenHighCriticalRisk(risk) {
  return isOpenRisk(risk) && isHighCriticalRisk(risk);
}