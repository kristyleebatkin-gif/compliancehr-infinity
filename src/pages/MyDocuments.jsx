import React, { useState, useEffect, useCallback } from 'react';
import withEmployeeView from '@/components/withEmployeeView';
import EmployeeDocuments from '@/components/employee/EmployeeDocuments';
export default withEmployeeView(MyDocuments, EmployeeDocuments);
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { safeUrl } from '@/lib/safeUrl';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Eye, ArrowRight } from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';

const fmt = (d) => d ? format(new Date(d), 'd MMM yyyy') : '';

const tone = (expiry) => {
  if (!expiry) return 'bg-muted text-foreground/60';
  const days = differenceInCalendarDays(new Date(expiry), new Date());
  if (days < 0) return 'bg-danger/10 text-danger';
  if (days <= 30) return 'bg-warning/10 text-warning';
  return 'bg-safe/10 text-safe';
};

// My Documents module: a staff member's or participant's own documents plus
// private documents others hold that contain their information.
function MyDocuments({ embedded = false } = {}) {
  const [me, setMe] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isParticipant = me?.role === 'Participant';

  const load = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      setMe(user);
      const page = user.role === 'Participant'
        ? await base44.entities.ParticipantDocument.filter({ participant_user_id: user.id }, { sort: '-created_date', limit: 50 })
        : await base44.entities.EmployeeDocument.filter({ employee_name: user.full_name, status: { $ne: 'Archived' } }, { sort: '-created_date', limit: 50 });
      setDocs(page.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const viewDoc = async (doc) => {
    try {
      if (doc.file_uri) {
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
        window.open(signed_url, '_blank');
      } else if (safeUrl(doc.file_url)) {
        window.open(safeUrl(doc.file_url), '_blank', 'noopener,noreferrer');
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      {embedded ? (
        !isParticipant && (
          <div className="flex flex-wrap gap-2">
            <Link to="/documents" className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted">Full document vault<ArrowRight className="h-4 w-4" /></Link>
          </div>
        )
      ) : (
        <PageHeader
          icon={FolderOpen}
          title="My Documents"
          subtitle="Your own documents, and private documents held about you — view or download anytime."
          showAlerts={false}
          action={!isParticipant ? (
            <Link to="/documents" className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted">Full document vault<ArrowRight className="h-4 w-4" /></Link>
          ) : null}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : docs.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No documents yet" message="Your documents, and private documents held about you, will appear here to view." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {docs.map((d) => {
            const expired = d.expiry_date && differenceInCalendarDays(new Date(d.expiry_date), new Date()) < 0;
            return (
              <Card key={d.id} className={expired ? 'border-destructive/40' : 'border-border/60'}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{d.title || d.document_type}</p>
                      <p className="text-sm text-muted-foreground">{d.document_type || ''}{d.issue_date ? ` · Issued ${fmt(d.issue_date)}` : ''}</p>
                    </div>
                    <Badge className={tone(d.expiry_date)}>{d.status}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className={expired ? 'font-semibold text-destructive' : ''}>{d.expiry_date ? `${expired ? 'Expired' : 'Expires'} ${fmt(d.expiry_date)}` : 'No expiry'}</span>
                    {(d.file_uri || d.file_url) && (
                      <Button variant="ghost" size="icon" title="View document" onClick={() => viewDoc(d)}><Eye className="h-4 w-4 text-foreground/60" /></Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}