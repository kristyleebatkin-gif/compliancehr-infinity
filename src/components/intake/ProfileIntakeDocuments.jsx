import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { FolderOpen, Loader2 } from 'lucide-react';

export default function ProfileIntakeDocuments({ profileId }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const page = await base44.entities.IntakeDocument.filter(
          { profile_id: profileId },
          { sort: '-uploaded_date', limit: 100 },
        );
        if (!cancelled) setDocs(page.items || []);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [profileId]);

  const openDoc = async (doc) => {
    setOpening(doc.id);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      console.error(error);
    } finally {
      setOpening('');
    }
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><FolderOpen className="h-4 w-4 text-primary" />Intake documents</div>
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading…</p>
        ) : docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No intake documents were uploaded for this profile.</p>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div key={doc.id} className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{doc.document_type}</div>
                  <div className="truncate text-xs text-muted-foreground">{doc.file_name}{doc.uploaded_date ? ` · uploaded ${format(new Date(doc.uploaded_date), 'd MMM yyyy')}` : ''}{doc.uploaded_by ? ` by ${doc.uploaded_by}` : ''}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => openDoc(doc)} disabled={opening === doc.id}>
                  {opening === doc.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}View
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}