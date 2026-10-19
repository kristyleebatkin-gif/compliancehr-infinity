import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import { useRole } from '@/lib/useRole';

// Admin-only per-section export: downloads the data behind one profile
// tab as CSV. Tabs whose data spans several entities download one file
// per entity, named after the person.
const BUILT_IN = new Set(['id', 'created_date', 'updated_date', 'created_by_id']);
const SKIP_FIELDS = ['profile_photo_uri', 'resume_autofill_data', 'attachments_json'];

const scalarValue = (v) => {
  if (v === undefined || v === null) return '';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

const genericColumns = (rows) => {
  const keys = [];
  rows.forEach((r) => Object.keys(r).forEach((k) => {
    if (!keys.includes(k) && !BUILT_IN.has(k) && !SKIP_FIELDS.includes(k)) keys.push(k);
  }));
  return keys.slice(0, 30).map((k) => ({ key: k, label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }));
};

const profileRows = (person) => Object.entries(person)
  .filter(([k, v]) => !BUILT_IN.has(k) && !SKIP_FIELDS.includes(k) && typeof v !== 'object')
  .map(([field, value]) => ({ field, value: scalarValue(value) }));

const entityExport = async (name, entity, query) => {
  const rows = await fetchAllRecords(entity, query);
  const columns = genericColumns(rows);
  return {
    name,
    columns,
    rows: rows.map((r) => Object.fromEntries(columns.map((c) => [c.key, scalarValue(r[c.key])]))),
  };
};

export default function SectionExportButton({ kind, person, section, className }) {
  const { isAdmin } = useRole();
  const [busy, setBusy] = useState(false);

  if (!isAdmin) return null;

  const exportsFor = {
    staff: {
      details: () => [{ name: 'Profile Details', columns: [{ key: 'field', label: 'Field' }, { key: 'value', label: 'Value' }], rows: profileRows(person) }],
      forms: () => [entityExport('Fillable Forms', base44.entities.StaffFormEntry, { staff_id: person.id })],
      filechecklist: () => [entityExport('File Checklist', base44.entities.ComplianceChecklistEntry, { checklist_key: `staff-file-checklist-${person.id}` })],
      records: () => [
        entityExport('Buddy Shifts', base44.entities.BuddyShift, { staff_id: person.id }),
        entityExport('Training Completions', base44.entities.TrainingCompletion, { employee_name: person.full_name }),
        entityExport('Certificates', base44.entities.Certificate, { staff_name: person.full_name }),
      ],
      access: () => [entityExport('Access', base44.entities.StaffProfile, { id: person.id })],
      performance: () => [entityExport('Performance Reviews', base44.entities.PerformanceReview, { staff_id: person.id })],
      safety: () => [
        entityExport('Incidents', base44.entities.Incident, { $or: [{ staff_id: person.id }, { staff_name: person.full_name }] }),
        entityExport('Risks', base44.entities.Risk, { owner: person.full_name }),
      ],
      comm: () => [entityExport('Communication Log', base44.entities.CommunicationEntry, { person_name: person.full_name })],
      todo: () => [entityExport('To-Do', base44.entities.TodoTask, { $or: [{ assigned_to: person.full_name }, { responsible: person.full_name }] })],
    },
    participant: {
      details: () => [{ name: 'Profile Details', columns: [{ key: 'field', label: 'Field' }, { key: 'value', label: 'Value' }], rows: profileRows(person) }],
      documents: () => [entityExport('Documents', base44.entities.ParticipantDocument, { participant_id: person.id })],
      records: () => [
        entityExport('Incidents', base44.entities.Incident, { participant_name: person.full_name }),
        entityExport('Goals', base44.entities.Goal, { participant_name: person.full_name }),
      ],
      comm: () => [entityExport('Communication Diary', base44.entities.CommunicationEntry, { person_name: person.full_name })],
      forms: () => [entityExport('Fillable Forms', base44.entities.ParticipantFormEntry, { participant_id: person.id })],
    },
  };

  const handleExport = async () => {
    const files = exportsFor[kind]?.[section];
    if (!files) return;
    setBusy(true);
    try {
      const resolved = (await Promise.all(files.map((f) => f))).filter((f) => f.rows.length > 0);
      resolved.forEach((file) => {
        downloadCsv(`${person.full_name} - ${file.name}.csv`, file.columns, file.rows);
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" size="sm" className={className} onClick={handleExport} disabled={busy}>
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}Export section
    </Button>
  );
}