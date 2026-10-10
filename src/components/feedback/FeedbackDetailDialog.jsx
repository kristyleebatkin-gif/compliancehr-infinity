import React from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { format } from 'date-fns';

const fmt = (d) => d ? format(new Date(d), 'EEE d MMM yyyy, h:mm a') : null;

export default function FeedbackDetailDialog({ item, onClose }) {
  if (!item) return null;
  const timeline = [
    ['Received', item.received_date],
    ['Viewed', item.viewed_date],
    ['Pending further action', item.pending_date],
    ['Finalised', item.finalised_date],
  ];
  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>{item.subject}</DialogTitle></DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{item.type}</Badge>
            <Badge className={statusTone(item.status)}>{item.status}</Badge>
            {item.rating ? <Badge variant="outline">{item.rating}/5</Badge> : null}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <p className="text-muted-foreground">Submitted by</p><p>{item.submitted_by || 'Anonymous'}</p>
            <p className="text-muted-foreground">Contact details</p><p>{item.contact_details || '-'}</p>
            <p className="text-muted-foreground">Received via</p><p>{item.received_via || '-'}</p>
            <p className="text-muted-foreground">Assigned to</p><p>{item.assigned_to || '-'}</p>
          </div>
          <div>
            <p className="mb-1 font-medium">Message</p>
            <p className="whitespace-pre-wrap text-muted-foreground">{item.message || '-'}</p>
          </div>
          <div>
            <p className="mb-1 font-medium">Outcome / resolution</p>
            <p className="whitespace-pre-wrap text-muted-foreground">{item.outcome || '-'}</p>
          </div>
          <div>
            <p className="mb-2 font-medium">Lifecycle</p>
            <div className="space-y-1.5">
              {timeline.map(([label, date]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${date ? 'bg-safe' : 'bg-border'}`} />
                  <span className="w-40 text-muted-foreground">{label}</span>
                  <span>{date ? fmt(date) : 'Not yet'}</span>
                </div>
              ))}
            </div>
          </div>
          {item.form_uri && (
            <Button variant="outline" size="sm" onClick={async () => {
              const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: item.form_uri });
              window.open(signed_url, '_blank');
            }}>Download attached form</Button>
          )}
          <div>
            <p className="mb-1 font-medium">Status history</p>
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs text-muted-foreground">{item.status_log || 'No changes recorded yet.'}</pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}