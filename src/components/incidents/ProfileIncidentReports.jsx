import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SectionCard from '@/components/SectionCard';

export default function ProfileIncidentReports({ profileType, profileId, profileName, canCreate }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const field = profileType === 'participant' ? 'participant_id' : 'staff_id';
  const queryKey = profileType === 'participant' ? 'participantId' : 'staffId';

  useEffect(() => {
    setLoading(true);
    base44.entities.Incident.filter({ [field]: profileId }, { sort: '-date_occurred', limit: 500 })
      .then((page) => setIncidents(page.items || []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [field, profileId]);

  return (
    <SectionCard
      title="Attached Incident Reports"
      description={`Administrative review history for ${profileName}`}
      action={canCreate && (
        <Link to={`/incidents/new?${queryKey}=${encodeURIComponent(profileId)}`} className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white">
          <Plus className="h-3.5 w-3.5" /> Add Incident
        </Link>
      )}
    >
      {loading ? (
        <div className="py-6 text-center text-sm text-foreground/50">Loading incident reports...</div>
      ) : incidents.length === 0 ? (
        <div className="py-6 text-center text-sm text-foreground/50"><AlertTriangle className="mx-auto mb-2 h-6 w-6" />No incident reports are attached.</div>
      ) : (
        <div className="space-y-2">
          {incidents.map((incident) => (
            <Link key={incident.id} to={`/incidents/${incident.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3 hover:bg-muted/40">
              <div>
                <div className="text-sm font-semibold">{incident.title || incident.incident_id || 'Incident report'}</div>
                <div className="text-xs text-foreground/50">{incident.date_occurred || 'No date'} · {incident.category || 'Other'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold">{incident.status || 'Reported'}</div>
                <div className="text-xs text-foreground/50">{incident.severity || 'Medium'}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </SectionCard>
  );
}