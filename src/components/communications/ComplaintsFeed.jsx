import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircleWarning, ArrowRight } from 'lucide-react';
import { statusTone } from '@/lib/statusStyles';

const fmt = (d) => (d ? String(d).slice(0, 10) : '');

// Complaints feed for the Communication Centre: every complaint in one live view,
// with routing to the full register in the Feedback module.
export default function ComplaintsFeed() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let live = true;
    base44.entities.Complaint.filter({}, { sort: '-date_received', limit: 50 })
      .then((page) => { if (live) setItems(page.items || []); })
      .catch(() => { if (live) setItems([]); });
    return () => { live = false; };
  }, []);

  if (!items) {
    return (
      <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />Loading complaints feed...
      </CardContent></Card>
    );
  }

  const open = items.filter((c) => !['Resolved', 'Closed'].includes(c.status));

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-rose-500/10 p-2"><MessageCircleWarning className="h-4 w-4 text-rose-600" /></div>
            <div>
              <p className="text-sm font-bold">Complaints</p>
              <p className="text-xs text-muted-foreground">Every complaint raised with the provider, tracked until resolution</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-rose-600">{open.length} open</span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-600">{items.length - open.length} resolved</span>
            <Link to="/feedback" className="inline-flex items-center gap-1 text-brand hover:underline">Full register <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {items.map((c) => (
            <div key={c.id} className="flex flex-col gap-1 rounded-xl border border-border/60 bg-muted/30 p-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug">{c.complaint_id ? `${c.complaint_id} · ` : ''}{c.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {['Received', fmt(c.date_received), c.complainant_name ? `From: ${c.complainant_name}` : '', c.complainant_relationship, c.category].filter(Boolean).join(' · ')}
                </p>
                {c.description && <p className="mt-0.5 text-xs text-muted-foreground">{String(c.description).slice(0, 160)}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Badge variant="outline" className={`text-[10px] ${statusTone(c.status)}`}>{c.status}</Badge>
                {c.priority && <Badge variant="outline" className="text-[10px] text-muted-foreground">{c.priority}</Badge>}
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No complaints logged.</p>}
        </div>
      </CardContent>
    </Card>
  );
}