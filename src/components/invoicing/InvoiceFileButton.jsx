import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FileCheck2, Loader2, Save } from 'lucide-react';
import invoiceArchive from '@/components/invoicing/invoiceArchive';

export default function InvoiceFileButton({ invoice, business, onChanged }) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const filed = Boolean(invoice.pdf_file_uri && invoice.pdf_library_document_id);
  const act = async () => {
    const tab = filed ? window.open('', '_blank') : null;
    if (tab) tab.opener = null;
    setBusy(true);
    try {
      if (filed) {
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: invoice.pdf_file_uri });
        if (tab) tab.location.href = signed_url;
        else window.location.assign(signed_url);
      } else {
        await invoiceArchive(invoice, business);
        await onChanged();
        toast({ title: 'Invoice PDF saved', description: 'The original PDF is stored privately and filed in the Document Vault.' });
      }
    } catch (error) {
      tab?.close();
      toast({ title: filed ? 'Could not open saved PDF' : 'Invoice PDF filing incomplete', description: error.message, variant: 'destructive' });
    } finally { setBusy(false); }
  };
  return <Button variant="outline" size="sm" disabled={busy} onClick={act}>
    {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : filed ? <FileCheck2 className="h-3 w-3" /> : <Save className="h-3 w-3" />}
    {filed ? 'Saved PDF' : invoice.pdf_file_uri ? 'Retry filing' : 'Save PDF'}
  </Button>;
}