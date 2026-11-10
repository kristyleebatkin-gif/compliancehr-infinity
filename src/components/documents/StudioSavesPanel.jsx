import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Eye, FileImage, FileText, Loader2 } from 'lucide-react';
import { listStudioItems, itemWhen } from '@/components/today/studio/studioData';
import { downloadFile, formatWhen } from '@/components/today/studio/studioStore';
import { resolveDocumentUrl } from '@/lib/openDocument';

const BODY_STYLES =
  'space-y-2 text-sm leading-relaxed text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5';

export default function StudioSavesPanel() {
  const [docs, setDocs] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [documents, filed] = await Promise.all([listStudioItems('document'), listStudioItems('filed_design')]);
        const withPreviews = await Promise.all(
          filed.map(async (item) => ({
            ...item,
            previewUrl: item.fileUri ? await resolveDocumentUrl({ file_uri: item.fileUri }) : ''
          }))
        );
        if (cancelled) return;
        setDocs(documents);
        setDesigns(withPreviews);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Studio documents could not be loaded.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading studio documents…
      </p>
    );
  }

  if (error) {
    return <p role="alert" className="rounded-xl border border-destructive/40 bg-card p-3 text-sm text-destructive">{error}</p>;
  }

  if (!docs.length && !designs.length) return null;

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-sm font-semibold">Studio documents &amp; filed designs</h2>
        <Badge variant="secondary">{docs.length + designs.length} saved</Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Written and designed in the Today and Team Leader workbenches. Each person sees their own work, kept for 7 years.
      </p>

      {docs.length ? (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Documents</h3>
          {docs.map((doc) => (
            <div key={doc.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
              <FileText className="h-4 w-4 shrink-0 text-[#0a2b6d]" />
              <div className="min-w-0 flex-1">
                <button type="button" onClick={() => setPreview(doc)} className="text-left text-sm font-semibold text-[#0A2B6D] hover:text-[#0072FF] hover:underline">
                  {doc.title}
                </button>
                <p className="text-xs text-muted-foreground">
                  {formatWhen(itemWhen(doc))}
                  {doc.retentionUntil ? ` · retained until ${formatWhen(doc.retentionUntil)}` : ''}
                </p>
              </div>
              <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => setPreview(doc)}>
                <Eye className="mr-1 h-3.5 w-3.5" /> Open
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2.5 text-xs"
                onClick={() => downloadFile(`${doc.title.replace(/[^\w\- ]+/g, '').trim() || 'document'}.html`, doc.payload?.html || '', 'text/html;charset=utf-8')}
              >
                <Download className="mr-1 h-3.5 w-3.5" /> Download
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {designs.length ? (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Filed designs</h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {designs.map((design) => (
              <div key={design.id} className="space-y-1.5 rounded-lg border border-border p-2.5">
                {design.previewUrl ? (
                  <a href={design.previewUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border border-border bg-muted">
                    <img src={design.previewUrl} alt={design.title || 'Filed design'} className="h-28 w-full object-cover" />
                  </a>
                ) : (
                  <div className="grid h-28 place-items-center rounded-md border border-border bg-muted text-muted-foreground">
                    <FileImage className="h-6 w-6" />
                  </div>
                )}
                <p className="truncate text-sm font-semibold text-[#0A2B6D]">{design.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatWhen(itemWhen(design))}
                  {design.retentionUntil ? ` · retained until ${formatWhen(design.retentionUntil)}` : ''}
                </p>
                {design.previewUrl ? (
                  <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs" asChild>
                    <a href={design.previewUrl} target="_blank" rel="noreferrer">
                      <Eye className="mr-1 h-3.5 w-3.5" /> Open PNG
                    </a>
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <Dialog open={Boolean(preview)} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{preview?.title || 'Document'}</DialogTitle>
          </DialogHeader>
          <div className={BODY_STYLES} dangerouslySetInnerHTML={{ __html: preview?.payload?.html || '' }} />
        </DialogContent>
      </Dialog>
    </section>
  );
}