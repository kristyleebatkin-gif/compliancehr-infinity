import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ClipboardList, ShieldAlert } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SectionCard from '@/components/SectionCard';
import { statusTone } from '@/lib/statusStyles';

const IncidentList = ({ staffId, staffName }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    base44.entities.Incident.filter(
      { $or: [{ staff_id: staffId }, { staff_name: staffName }] },
      { sort: '-date_occurred', limit: 200 },
    )
      .then((page) => setIncidents(page.items || []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [staffId, staffName]);

  if (loading) {
    return <div className="py-4 text-center text-sm text-foreground/50">Loading incident reports...</div>;
  }
  if (incidents.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-foreground/50">
        <AlertTriangle className="mx-auto mb-2 h-6 w-6" />No incident reports reference this staff member.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {incidents.map((incident) => (
        <Link key={incident.id} to={`/incidents/${incident.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3 hover:bg-muted/40">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{incident.title || incident.incident_id || 'Incident report'}</div>
            <div className="text-xs text-foreground/50">{incident.date_occurred || 'No date'} · {incident.category || 'Other'}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone(incident.status)}`}>{incident.status || 'Reported'}</span>
            <span className="text-xs font-semibold">{incident.severity || 'Medium'}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

const RiskList = ({ staffName }) => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    base44.entities.Risk.filter({ owner: staffName }, { sort: '-identified_date', limit: 200 })
      .then((page) => setRisks(page.items || []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [staffName]);

  if (loading) {
    return <div className="py-4 text-center text-sm text-foreground/50">Loading risk reports...</div>;
  }
  if (risks.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-foreground/50">
        <ClipboardList className="mx-auto mb-2 h-6 w-6" />No risk reports are owned by this staff member.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {risks.map((risk) => (
        <Link key={risk.id} to="/risks" className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3 hover:bg-muted/40">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{risk.title || risk.risk_id || 'Risk report'}</div>
            <div className="text-xs text-foreground/50">{risk.identified_date || 'No date'} · {risk.report_type || 'Risk'} · {risk.category || 'Other'}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone(risk.status)}`}>{risk.status || 'Identified'}</span>
            <span className="text-xs font-semibold">{risk.rating || 'Medium'}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default function StaffSafetyTab({ staff }) {
  return (
    <div className="space-y-5">
      <SectionCard
        title="Incident Reports"
        description={`Safety incidents involving ${staff.full_name}`}
        action={
          <Link to={`/incidents/new?staffId=${encodeURIComponent(staff.id)}`} className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white">
            <ShieldAlert className="h-3.5 w-3.5" /> Add Incident
          </Link>
        }
      >
        <IncidentList staffId={staff.id} staffName={staff.full_name} />
      </SectionCard>

      <SectionCard
        title="Risk & Hazard Reports"
        description={`Risks and hazards owned by ${staff.full_name}`}
      >
        <RiskList staffName={staff.full_name} />
      </SectionCard>
    </div>
  );
}