import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Download, Inbox } from 'lucide-react';
import { format } from 'date-fns';
import { downloadCsv } from '@/lib/csvExport';

const STATUSES = ['Received', 'Reviewing', 'Contacted', 'Accepted', 'Not Proceeding', 'Withdrawn'];

// Public volunteer & student placement applications, submitted from the
// website form. Review, update status and export.
export default function VolunteerApplications() {
  const { toast } = useToast();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.VolunteerInterest.filter({}, { sort: '-submitted_at', limit: 100 });
      setApps(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (app, status) => {
    await base44.entities.VolunteerInterest.update(app.id, { status });
    toast({ title: `Application marked ${status}` });
    load();
  };

  const exportCsv = () => {
    downloadCsv('Volunteer-Applications.csv', [
      { key: 'interest_type', label: 'Interest Type' }, { key: 'full_name', label: 'Full Name' },
      { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'suburb', label: 'Suburb' },
      { key: 'institution_name', label: 'Institution' }, { key: 'course_name', label: 'Course' },
      { key: 'preferred_service_area', label: 'Preferred Service Area' }, { key: 'availability', label: 'Availability' },
      { key: 'relevant_experience', label: 'Experience' }, { key: 'motivation', label: 'Motivation' },
      { key: 'status', label: 'Status' }, { key: 'submitted_at', label: 'Submitted' },
    ], apps);
    toast({ title: 'Applications exported' });
  };

  const newCount = apps.filter((a) => a.status === 'Received').length;

  return (
    <Card className="volunteer-applications">
      <CardContent className="p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-sky-500/10 p-2"><Inbox className="h-4 w-4 text-sky-600" /></div>
            <div>
              <p className="text-sm font-bold">Website Applications</p>
              <p className="text-xs text-muted-foreground">Volunteer &amp; student placement interest submitted from the public form</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-sky-500/10 text-[10px] text-sky-700">{newCount} new</Badge>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={exportCsv} disabled={apps.length === 0}>
              <Download className="mr-1 h-3 w-3" />Export
            </Button>
          </div>
        </div>

        <div className="mt-2 space-y-1">
          {loading && <p className="py-6 text-center text-sm text-muted-foreground">Loading applications...</p>}
          {!loading && apps.map((a) => (
            <div key={a.id} className="rounded-lg border border-border/60 bg-muted/30 px-2 py-1.5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{a.full_name} <span className="text-xs font-normal text-muted-foreground">· {a.interest_type}</span></p>
                  <p className="text-[11px] text-muted-foreground">{[a.email, a.phone, a.suburb, a.availability].filter(Boolean).join(' · ')}</p>
                  {a.motivation && <p className="mt-1 line-clamp-2 text-xs text-foreground/60">{a.motivation}</p>}
                  {a.submitted_at && <p className="mt-1 text-[11px] text-muted-foreground">Submitted {format(new Date(a.submitted_at), 'd MMM yyyy, h:mm a')}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <select
                    value={a.status || 'Received'}
                    onChange={(e) => setStatus(a, e.target.value)}
                    className="h-7 rounded-md border border-input bg-transparent px-1.5 text-[11px] font-semibold text-foreground"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
          {!loading && apps.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No applications yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}