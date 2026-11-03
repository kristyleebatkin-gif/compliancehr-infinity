import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Save } from 'lucide-react';

export default function OnlineDocumentActions({ editor, readOnly }) {
  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap justify-end gap-2.5 border-t border-sky-200 bg-white py-4">
      <Button
        type="button"
        variant="outline"
        onClick={editor.close}
        disabled={editor.busy}
        className="border-slate-300 bg-white text-[#0A2B6D]"
      >
        Close
      </Button>
      {readOnly ? (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={editor.editCopy}
            disabled={editor.busy}
            className="border-[#0072FF] bg-[#F0F7FF] text-[#0A2B6D]"
          >
            Edit as new draft
          </Button>
          <Button
            type="button"
            onClick={editor.download}
            disabled={editor.busy}
            className="bg-[#0A2B6D] text-white hover:bg-[#0072FF]"
          >
            <Download className="h-4 w-4" />
            Download saved PDF
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => editor.save(false)}
            disabled={editor.busy || !editor.ready}
            className="border-[#0072FF] bg-[#F0F7FF] text-[#0A2B6D]"
          >
            <Save className="h-4 w-4 text-[#0072FF]" />
            Save draft
          </Button>
          <Button
            type="submit"
            disabled={editor.busy || !editor.ready}
            className="bg-[#0A2B6D] text-white hover:bg-[#0072FF]"
          >
            {editor.busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Save completed document
          </Button>
        </>
      )}
    </div>
  );
}