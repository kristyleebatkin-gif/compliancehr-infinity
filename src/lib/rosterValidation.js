// Shared roster validation rules, used by the exceptions panel and weekly sign-off.
const minutes = (t) => {
  if (!t) return null;
  const [h, m] = String(t).split(':').map((n) => parseInt(n, 10));
  if (Number.isNaN(h)) return null;
  return h * 60 + (m || 0);
};

const overlaps = (a, b) => {
  const aS = minutes(a.start_time); const aE = minutes(a.end_time);
  const bS = minutes(b.start_time); const bE = minutes(b.end_time);
  if (aS == null || aE == null || bS == null || bE == null) return false;
  return aS < bE && bS < aE;
};

// Rule keys match RosterValidationRule.rule_key records (configurable in-app).
export const RULE_KEYS = ['unassigned', 'double_booking', 'missing_instructions', 'skill_mismatch'];

export const findUnassigned = (shifts) =>
  (shifts || []).filter((s) => !s.employee_name && s.status !== 'Cancelled');

export const findDoubleBookings = (shifts) => {
  const active = (shifts || []).filter((s) => s.status !== 'Cancelled');
  const out = [];
  const seen = new Set();
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i]; const b = active[j];
      for (const field of ['employee_name', 'participant_name']) {
        if (a[field] && b[field] && a[field] === b[field] && a.date === b.date && overlaps(a, b)) {
          const key = `${a.id}|${b.id}|${field}`;
          if (!seen.has(key)) { seen.add(key); out.push({ field, a, b }); }
        }
      }
    }
  }
  return out;
};

export const findMissingInstructions = (shifts) =>
  (shifts || []).filter((s) => s.status !== 'Cancelled' && s.participant_name && !s.notes);

// Skill mismatch: flags shifts where the participant's documented support needs
// (e.g. medication support) require a skill the assigned staff member has not recorded.
export const findSkillMismatches = (shifts, staff = [], participants = []) => {
  const staffSkills = {};
  (staff || []).forEach((s) => {
    const key = (s.full_name || '').toLowerCase();
    if (key) staffSkills[key] = String(s.skills || '').toLowerCase();
  });
  const partBy = {};
  (participants || []).forEach((p) => {
    const key = (p.full_name || '').toLowerCase();
    if (key) partBy[key] = p;
  });
  return (shifts || []).filter((s) => {
    if (s.status === 'Cancelled' || !s.employee_name || !s.participant_name) return false;
    const p = partBy[String(s.participant_name).toLowerCase()];
    if (!p) return false;
    const needsMedication = String(p.medications_dosage || '').trim() !== '';
    const skills = staffSkills[String(s.employee_name).toLowerCase()] || '';
    return needsMedication && !skills.includes('medication');
  });
};