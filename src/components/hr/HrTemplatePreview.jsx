import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { previewTemplatePdf } from '@/lib/hrTemplatePdf';

/**
 * Document preview window: renders the exact branded PDF (same build as the
 * download) for the merged template, shown in an in-app viewer.
 */
export default function HrTemplatePreview({ open, title, body, completedBy, onClose }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!open) { setUrl(null); return; }
    let blobUrl = null;
    try {
      blobUrl = previewTemplatePdf({ title, body, completedBy });
      setUrl(String(blobUrl));
    } catch (error) {
      console.error(error);
    }
    return () => { if (blobUrl) URL.revokeObjectURL(String(blobUrl)); };
  }, [open, title, body, completedBy]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[92vh] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Preview — {title}</DialogTitle>
        </DialogHeader>
        {url ? (
          <iframe title="HR document preview" src={url} className="h-[70vh] w-full rounded-lg border border-border bg-white" />
        ) : (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-foreground/60">
            <Loader2 className="h-4 w-4 animate-spin" />Building preview...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}