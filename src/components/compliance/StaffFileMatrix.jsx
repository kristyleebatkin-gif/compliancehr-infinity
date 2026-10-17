import React from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Live staff file compliance matrix: one row per staff member (name and
 * employee number), one column per required certificate, licence, ID, car
 * rego or card. Updates automatically from training completions, employee
 * documents, intake documents and the staff profile.
 */
export const STAFF_COLUMNS = [
  { label: 'First Aid', training: 'First Aid Certificate', employeeDoc: 'First Aid Certificate' },
  { label: 'CPR', training: 'CPR Certificate', employeeDoc: 'CPR Certificate' },
  { label: 'NDIS Orientation', training: 'NDIS Worker Orientation Module Certificate' },
  { label: 'NDIS Induction', training: 'NDIS Worker Induction Module Certificate' },
  { label: 'Manual Handling', training: 'Manual Handling Training Certificate' },
  { label: 'Medication Admin', training: 'Medication Administration Training Certificate' },
  { label: 'Hand Hygiene', training: 'Australian Commission on Safety and Quality in Health Care Hand Hygiene Certificate' },
  { label: 'Infection Control', training: 'Australian Commission on Safety and Quality in Health Care Infection Control Certificate' },
  { label: "Driver's Licence", employeeDoc: "Driver's License" },
  { label: 'Car Rego', employeeDoc: 'Car Registration', intake: 'Car Registration', staffField: 'car_rego' },
  { label: 'NDIS Screening', employeeDoc: 'NDIS Worker Screening', intake: 'NDIS Worker Screening Clearance' },
  { label: 'Blue Card / Police', employeeDoc: 'Police Check', altEmployeeDoc: 'Blue Card', intake: 'Blue Card and/or Police Check' },
  { label: 'Immunisation', employeeDoc: 'Immunisation Record', intake: 'Immunisation Record' },
];

export function staffColumnStatus(staff, column, trainingSet, docSet, intakeSet) {
  if (column.training && trainingSet.has(column.training)) return true;
  if (column.employeeDoc && (docSet.has(column.employeeDoc) || (column.altEmployeeDoc && docSet.has(column.altEmployeeDoc)))) return true;
  if (column.intake && intakeSet.has(column.intake)) return true;
  if (column.staffField && String(staff[column.staffField] || '').trim()) return true;
  return false;
}

// Shared with the audit checklist/report: indexes the evidence sets the staff
// file checklist is evaluated against.
export function buildStaffFileSets({ completions = [], employeeDocs = [], intakeDocs = [] } = {}) {
  const trainingByName = new Map();
  const docsByName = new Map();
  const intakeByProfile = new Map();

  (completions || []).forEach((record) => {
    const nameKey = String(record.employee_name || record.learner_name || '').trim().toLowerCase();
    if (!nameKey) return;
    if (!trainingByName.has(nameKey)) trainingByName.set(nameKey, new Set());
    trainingByName.get(nameKey).add(record.module_title);
  });
  (employeeDocs || []).forEach((record) => {
    const nameKey = String(record.employee_name || '').trim().toLowerCase();
    if (!nameKey) return;
    if (!docsByName.has(nameKey)) docsByName.set(nameKey, new Set());
    docsByName.get(nameKey).add(record.document_type);
  });
  (intakeDocs || []).forEach((record) => {
    if (!record.profile_id) return;
    if (!intakeByProfile.has(record.profile_id)) intakeByProfile.set(record.profile_id, new Set());
    intakeByProfile.get(record.profile_id).add(record.document_type);
  });
  return { trainingByName, docsByName, intakeByProfile };
}

export function staffFileCoverage(staff = [], sets) {
  const { trainingByName, docsByName, intakeByProfile } = sets || {};
  return (staff || []).map((member) => {
    const nameKey = String(member.full_name || '').trim().toLowerCase();
    const trainingSet = trainingByName?.get(nameKey) || new Set();
    const docSet = docsByName?.get(nameKey) || new Set();
    const intakeSet = intakeByProfile?.get(member.id) || new Set();
    const cells = STAFF_COLUMNS.map((column) => staffColumnStatus(member, column, trainingSet, docSet, intakeSet));
    const pct = Math.round((cells.filter(Boolean).length / STAFF_COLUMNS.length) * 100);
    return { member, cells, pct };
  });
}

export default function StaffFileMatrix({ staff, completions, employeeDocs, intakeDocs }) {
  const rows = staffFileCoverage(staff, buildStaffFileSets({ completions, employeeDocs, intakeDocs }));
  const overall = rows.length
    ? Math.round(rows.reduce((sum, row) => sum + row.pct, 0) / rows.length)
    : 0;
  const tone = overall >= 90 ? 'bg-safe/10 text-safe' : overall >= 70 ? 'bg-warning/10 text-warning' : 'bg-red-600/10 text-red-600';

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Staff file checklist - live ({staff.length} staff in system)</p>
        <Badge className={tone}>{overall}% complete</Badge>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No staff profiles yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="sticky left-0 bg-muted/40 px-3 py-2">Staff member</th>
                <th className="px-3 py-2">ID</th>
                {STAFF_COLUMNS.map((column) => <th key={column.label} className="whitespace-nowrap px-2 py-2 text-center">{column.label}</th>)}
                <th className="px-3 py-2 text-center">Ready</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ member, cells, pct }) => (
                <tr key={member.id} className="border-b last:border-0">
                  <td className="sticky left-0 bg-card px-3 py-2 font-medium">{member.full_name}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{member.employee_number || 'n/a'}</td>
                  {cells.map((done, index) => (
                    <td key={index} className="px-2 py-2 text-center">
                      {done
                        ? <Check className="mx-auto h-4 w-4 text-emerald-600" />
                        : <X className="mx-auto h-4 w-4 text-red-400" />}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center font-semibold text-xs">{pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}