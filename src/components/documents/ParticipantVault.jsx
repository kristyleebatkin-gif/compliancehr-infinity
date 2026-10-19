import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, FolderOpen } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { format } from 'date-fns';

export default function ParticipantVault({ docs, loading, viewDoc }) {
  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }
  if (docs.length === 0) {
    return <EmptyState icon={FolderOpen} modulePath="/documents" title="No documents yet" message="Documents your support team files for you will appear here." />;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {docs.map((d) => (
        <Card key={d.id} className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold">{d.title || d.document_type}</p>
                <p className="text-sm text-muted-foreground">{d.document_type}</p>
              </div>
              <Badge variant="outline">{d.review_outcome || d.status || 'Received'}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{d.uploaded_date ? `Added ${format(new Date(d.uploaded_date), 'd MMM yyyy')}` : ''}</span>
              {d.file_uri && (
                <Button variant="ghost" size="icon" title="View document" onClick={() => viewDoc(d)}><Eye className="h-4 w-4 text-foreground/60" /></Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}