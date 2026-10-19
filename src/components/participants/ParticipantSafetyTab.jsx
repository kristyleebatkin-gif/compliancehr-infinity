import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { statusTone } from '@/lib/statusStyles';

export default function ParticipantSafetyTab({ participant }) {
  const [risks, setRisks] = useState([]);
  const [safeguards, setSafeguards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      base44.entities.Risk.filter(
        { $or: [{ participant_id: participant.id }, { participant_name: participant.full_name }] },
        { sort: '-identified_date', limit: 200 },
      ),
      base44.entities.ParticipantSafeguardRecord.filter(
        { participant_name: participant.full_name },
        { sort: '-record_date', limit: 200 },
      ),
    ])
      .then(([riskPage, safeguardPage]) => {
        setRisks(riskPage.items || []);
        setSafeguards(safeguardPage.items || []);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [participant.id, participant.full_name]);

  if (loading) return <div className="py-4 text-center text-sm text-foreground/50">Loading risks and safeguarding...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground/60">Risk Reports</h3>
        {risks.length === 0 ? (
          <div className="py-4 text-center text-sm text-foreground/50">No risk reports for this participant.</div>
        ) : (
          <div className="space-y-2">
            {risks.map((risk) => (
              <div key={risk.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{risk.title || risk.risk_id || 'Risk report'}</div>
                  <div className="text-xs text-foreground/50">{risk.identified_date || 'No date'} · {risk.report_type || 'Risk'} · {risk.category || 'Other'}</div>
                </div>
                <span className={`shrink-0 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone(risk.status)}`}>{risk.status || 'Open'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground/60">Safeguarding Records</h3>
        {safeguards.length === 0 ? (
          <div className="py-4 text-center text-sm text-foreground/50">No safeguarding records for this participant.</div>
        ) : (
          <div className="space-y-2">
            {safeguards.map((record) => (
              <div key={record.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{record.record_type || 'Record'} · {record.record_date || 'No date'}</div>
                  <div className="truncate text-xs text-foreground/50">
                    {record.staff_name ? `${record.staff_name} · ` : ''}{record.service_or_activity || record.outcome || ''}
                  </div>
                </div>
                <span className={`shrink-0 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone(record.status)}`}>{record.status || 'Draft'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}