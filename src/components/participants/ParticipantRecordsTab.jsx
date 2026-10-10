import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { AlertTriangle, Target } from 'lucide-react';

export default function ParticipantRecordsTab({ participant }) {
  const [incidents, setIncidents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [incidentPage, goalPage] = await Promise.all([
          base44.entities.Incident.filter({ participant_name: participant.full_name }, { sort: '-created_date', limit: 50 }).catch(() => ({ items: [] })),
          base44.entities.Goal.filter({ participant_name: participant.full_name }, { sort: '-created_date', limit: 50 }).catch(() => ({ items: [] })),
        ]);
        if (!cancelled) {
          setIncidents(incidentPage.items || []);
          setGoals(goalPage.items || []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [participant.id, participant.full_name]);

  if (loading) {
    return <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="h-4 w-4 text-warning" />Incidents ({incidents.length})</div>
        {incidents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No incidents recorded for this participant.</p>
        ) : (
          <div className="space-y-2">
            {incidents.map((incident) => (
              <div key={incident.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{incident.title}</p>
                  <p className="text-xs text-muted-foreground">{incident.date_occurred || 'No date'} · {incident.category || 'Uncategorised'}</p>
                </div>
                <div className="flex gap-1.5">
                  <Badge className={statusTone(incident.severity)}>{incident.severity}</Badge>
                  <Badge className={statusTone(incident.status)}>{incident.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4 text-brand" />NDIS goals ({goals.length})</div>
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No NDIS goals recorded for this participant.</p>
        ) : (
          <div className="space-y-2">
            {goals.map((goal) => (
              <div key={goal.id} className="rounded-lg border border-border/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{goal.goal}</p>
                  <Badge className={statusTone(goal.status)}>{goal.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{goal.category || 'Uncategorised'} · {goal.progress ?? 0}% progress{goal.target_date ? ` · target ${goal.target_date}` : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}