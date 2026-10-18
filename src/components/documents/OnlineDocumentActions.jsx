import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Save } from 'lucide-react';

export default function OnlineDocumentActions({ editor, readOnly }) {
  return <div className="sticky bottom-0 z-10 flex flex-wrap justify-end gap-3 border-t border-border bg-card py-4">
    <Button type="button" variant="outline" onClick={editor.close} disabled={editor.busy}>Close</Button>
    {readOnly ? <>
      <Button type="button" variant="outline" onClick={editor.editCopy} disabled={editor.busy}>Edit as new draft</Button>
      <Button type="button" onClick={editor.download} disabled={editor.busy}><Download className="h-4 w-4" />Download saved PDF</Button>
    </> : <>
      <Button type="button" variant="outline" onClick={() => editor.save(false)} disabled={editor.busy || !editor.ready}><Save className="h-4 w-4" />Save draft</Button>
      <Button type="submit" disabled={editor.busy || !editor.ready}>{editor.busy && <Loader2 className="h-4 w-4 animate-spin" />}Save completed document</Button>
    </>}
  </div>;
}