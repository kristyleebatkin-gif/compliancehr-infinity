// Canonical required file labels shared by the HR completeness report.
export const HR_FILE_TYPES = [
  'Staff Information Form', 'Staff Onboarding Form', 'Staff Induction Form', 'Employment Contract', 'Position Description', 'Secondary Employment Form', 'Staff Commitment Declaration Form',
  '100 Points of Identification Checklist', "Driver's License", 'Medicare Card', 'Passport', 'Birth Certificate', 'Qualifications', 'Resume', 'Car Registration', 'Immunisation Record', 'Vehicle Safety Inspection', 'Superannuation Details', 'Tax File Number',
  'NDIS Code of Conduct Acknowledgement', 'NDIS Worker Screening Clearance', 'Blue Card and/or Police Check',
  'NDIS Worker Orientation Module Certificate', 'NDIS Worker Induction Module Certificate', 'NDIS Supporting Safe and Enjoyable Meals Certificate', 'NDIS Supporting Effective Communication Certificate',
  'Australian Commission on Safety and Quality in Health Care Medication Safety Certificate', 'Australian Commission on Safety and Quality in Health Care Hand Hygiene Certificate', 'Australian Commission on Safety and Quality in Health Care Infection Control Certificate',
  'Manual Handling Training Certificate', 'First Aid Certificate', 'CPR Certificate', 'Medication Administration Training Certificate', 'NDIS Relevant Qualification',
  'Training Record', 'Staff Training Plan', 'Skill Assessment Form', 'Performance Review Schedule', 'Performance Review Form', 'Staff Exit Form', 'Staff File Checklist', 'Car Safety Check Form', 'Staff Handbook',
  'NDIS Act 2013 Acknowledgement', 'NDIS Practice Standards Acknowledgement', 'Work Health and Safety Act 2011 (Qld) Acknowledgement', 'Disability Discrimination Act 1992', 'Mandatory Reporting Information',
];
const normalise = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const ALIASES = {
  contract: ['Employment Contract'], 'ndis worker screening': ['NDIS Worker Screening Clearance'],
  'police check': ['Blue Card and/or Police Check'], 'blue card': ['Blue Card and/or Police Check'],
  'super details declaration form': ['Superannuation Details'], 'tax file number declaration': ['Tax File Number'],
  'first aid cpr': ['First Aid Certificate', 'CPR Certificate'], 'first aid and cpr': ['First Aid Certificate', 'CPR Certificate'],
  'ndis worker orientation': ['NDIS Worker Orientation Module Certificate'], 'ndis worker induction': ['NDIS Worker Induction Module Certificate'],
};
const byLabel = new Map(HR_FILE_TYPES.map((type) => [normalise(type), type]));
export function evidenceTypes(label) {
  const raw = String(label || '');
  const key = normalise(raw);
  if (byLabel.has(key)) return [byLabel.get(key)];
  if (ALIASES[key]) return ALIASES[key];
  const prefix = normalise(raw.split(/\s[-–—|]\s/)[0]);
  return byLabel.has(prefix) ? [byLabel.get(prefix)] : ALIASES[prefix] || [];
}
export function compileFileRows(staff, documentGroups, checklistEntries) {
  const evidence = new Map(staff.map((person) => [person.id, new Set()]));
  const byId = new Map(staff.map((person) => [person.id, person]));
  const byNumber = new Map(staff.filter((person) => person.employee_number).map((person) => [person.employee_number, person]));
  const byName = new Map();
  for (const person of staff) {
    const matches = byName.get(person.full_name) || [];
    byName.set(person.full_name, [...matches, person]);
  }
  for (const group of documentGroups) {
    const named = byName.get(group.employee_name) || [];
    const person = byId.get(group.employee_id) || byNumber.get(group.employee_id) || (!group.employee_id && named.length === 1 ? named[0] : null);
    if (!person) continue;
    const labels = group.document_type === 'Other' ? evidenceTypes(group.title) : evidenceTypes(group.document_type);
    for (const type of labels) evidence.get(person.id).add(type);
  }
  const seen = new Set();
  for (const entry of checklistEntries) {
    const id = String(entry.checklist_key).slice('staff-file-checklist-'.length);
    if (!evidence.has(id) || seen.has(id)) continue;
    seen.add(id);
    let answers;
    try { answers = JSON.parse(entry.answers || '{}'); } catch { continue; }
    for (const [label, answer] of Object.entries(answers)) {
      if (answer?.on_file) for (const type of evidenceTypes(label)) evidence.get(id).add(type);
    }
  }
  return staff.map((person) => {
    const found = evidence.get(person.id);
    const missing = HR_FILE_TYPES.filter((type) => !found.has(type));
    return { id: person.id, name: person.full_name, status: person.status || 'Active', onFile: found.size, total: HR_FILE_TYPES.length,
      pct: Math.round(found.size / HR_FILE_TYPES.length * 100), missing, missingCount: missing.length };
  });
}