import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/EmptyState';
import { Users, ChevronRight } from 'lucide-react';

// Admin view: every employee or participant profile in the organisation,
// shown the same way each person sees their own "My ... profile".
export default function OurProfilesTab({ kind }) {
  const isParticipant = kind === 'participant';
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const entity = isParticipant ? base44.entities.ParticipantProfile : base44.entities.StaffProfile;
        const page = await entity.filter({}, { sort: 'full_name', limit: 100 });
        if (active) setRecords(page.items || []);
      } catch (e) { console.error(e); }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [isParticipant]);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }

  if (!records.length) {
    return <EmptyState icon={Users} title="No profiles yet" message={isParticipant ? 'Participant profiles will appear here once created.' : 'Employee profiles will appear here once created.'} modulePath={isParticipant ? 'participants' : 'staff'} />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {records.map((r) => (
        <Link key={r.id} to={isParticipant ? `/participants/${r.id}` : `/staff/${r.id}`} className="group">
          <Card className="h-full border-border/60 transition-colors group-hover:border-primary/40">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold font-editorial">{r.full_name}</div>
                  <div className="truncate text-sm text-foreground/60">{r.email || 'No email on file'}</div>
                </div>
                <Badge variant="outline">{r.status || 'Active'}</Badge>
              </div>
              <div className="mt-2 text-sm text-foreground/70">
                {isParticipant
                  ? (r.support_type || r.ndis_number || 'Participant')
                  : (r.position || r.role || 'Employee')}
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
                Open profile <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}