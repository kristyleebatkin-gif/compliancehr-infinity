import React from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { canonicalIntakeDocumentType } from '@/lib/intakeCases';

/**
 * Live participant file compliance matrix: one row per participant (name and
 * NDIS number), one column per required document. Updates automatically as
 * intake and profile documents are submitted.
 */
const COLUMNS = [
  'Service Agreement',
  'NDIS Plan',
  'Participant Support Plan',
  'Individual Risk Assessment',
  'Consent to Share Information',
  'Personal Emergency Form',
  'Satisfaction Survey',
  'Fire Drill Form',
];

export default function ParticipantFileMatrix({ participants, intakeDocs }) {
  const intakeByProfile = new Map();
  (intakeDocs || []).forEach((record) => {
    if (!record.profile_id) return;
    if (!intakeByProfile.has(record.profile_id)) intakeByProfile.set(record.profile_id, new Set());
    intakeByProfile.get(record.profile_id).add(canonicalIntakeDocumentType(record.document_type));
  });

  const rows = (participants || []).map((participant) => {
    const docs = intakeByProfile.get(participant.id) || new Set();
    const cells = COLUMNS.map((column) => docs.has(column));
    const pct = Math.round((cells.filter(Boolean).length / COLUMNS.length) * 100);
    return { participant, cells, pct };
  });
  const overall = rows.length
    ? Math.round(rows.reduce((sum, row) => sum + row.pct, 0) / rows.length)
    : 0;
  const tone = overall >= 90 ? 'bg-safe/10 text-safe' : overall >= 70 ? 'bg-warning/10 text-warning' : 'bg-red-600/10 text-red-600';

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Participant file checklist - live ({participants.length} participants in system)</p>
        <Badge className={tone}>{overall}% complete</Badge>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No participant profiles yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="sticky left-0 bg-muted/40 px-3 py-2">Participant</th>
                <th className="px-3 py-2">NDIS number</th>
                {COLUMNS.map((column) => <th key={column} className="whitespace-nowrap px-2 py-2 text-center">{column}</th>)}
                <th className="px-3 py-2 text-center">Ready</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ participant, cells, pct }) => (
                <tr key={participant.id} className="border-b last:border-0">
                  <td className="sticky left-0 bg-card px-3 py-2 font-medium">{participant.full_name}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{participant.ndis_number || 'n/a'}</td>
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