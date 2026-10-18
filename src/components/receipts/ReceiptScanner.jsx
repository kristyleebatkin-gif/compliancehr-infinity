import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ScanLine, UploadCloud } from 'lucide-react';
import { imageFileToPdf } from '@/lib/imageToPdf';
import { fileReceiptToAssetRegister } from '@/lib/assetRegister';

const EMPTY_EXTRACTED = { description: '', merchant: '', receipt_number: '', amount: '', gst_amount: '', date: '', paid_by: '', reimburse_to: '', category: '', payment_method: '', status: 'Unreconciled' };

export default function ReceiptScanner({ open, onOpenChange, onSaved }) {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileUri, setFileUri] = useState('');
  const [fileName, setFileName] = useState('');
  const [data, setData] = useState(EMPTY_EXTRACTED);

  const reset = () => { setFile(null); setFileUri(''); setFileName(''); setData(EMPTY_EXTRACTED); };

  const pickFile = async (selected) => {
    if (!selected) return;
    setFile(selected);
    setScanning(true);
    setData(EMPTY_EXTRACTED);
    try {
      // The image is uploaded for detail capture, then automatically converted to a
      // PDF which is stored with the receipt record.
      const { file_uri: imageUri } = await base44.integrations.Core.UploadPrivateFile({ file: selected });
      let storedUri = imageUri;
      let storedName = selected.name;
      if (selected.type.startsWith('image/')) {
        try {
          const pdfFile = await imageFileToPdf(selected);
          const { file_uri: pdfUri } = await base44.integrations.Core.UploadPrivateFile({ file: pdfFile });
          storedUri = pdfUri;
          storedName = pdfFile.name;
        } catch (pdfError) {
          toast({ title: 'PDF conversion skipped', description: 'The receipt is stored as its original image.' });
        }
      }
      setFileUri(storedUri);
      setFileName(storedName);
      const res = await base44.functions.invoke('scanReceipt', { file_uri: imageUri });
      const scan = res.data || {};
      if (scan.error) {
        toast({ title: 'Scan incomplete', description: scan.error });
      } else {
        setData((prev) => ({
          ...prev,
          description: scan.description || prev.description,
          merchant: scan.merchant || '',
          receipt_number: scan.receipt_number || '',
          amount: scan.amount != null ? String(scan.amount) : '',
          gst_amount: scan.gst_amount != null ? String(scan.gst_amount) : '',
          date: scan.date || '',
          category: scan.category || '',
          payment_method: scan.payment_method || '',
        }));
        toast({ title: 'Receipt scanned', description: 'Details captured. Review and confirm below.' });
      }
    } catch (error) {
      toast({ title: 'Scan failed', description: error.message, variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  };

  const save = async () => {
    if (!data.description.trim()) return;
    setSaving(true);
    try {
      const record = await base44.entities.Receipt.create({
        ...data,
        amount: data.amount === '' ? undefined : Number(data.amount),
        gst_amount: data.gst_amount === '' ? undefined : Number(data.gst_amount),
        file_uri: fileUri,
        file_name: fileName,
      });
      await fileReceiptToAssetRegister(record, data.paid_by);
      onSaved();
      onOpenChange(false);
      reset();
      toast({ title: 'Receipt stored', description: 'The scanned receipt and its details are saved in the hub.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Scan receipt</DialogTitle></DialogHeader>
        <label className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center hover:bg-muted/50 ${scanning ? 'pointer-events-none opacity-60' : ''}`}>
          {scanning ? <Loader2 className="h-6 w-6 animate-spin text-brand" /> : file ? <ScanLine className="h-6 w-6 text-brand" /> : <UploadCloud className="h-6 w-6 text-muted-foreground" />}
          <span className="text-sm font-medium">{scanning ? 'Reading receipt details...' : file ? file.name : 'Take or choose a photo of the receipt'}</span>
          <span className="text-xs text-muted-foreground">The image is converted to a PDF, stored with the receipt, and its details are captured automatically.</span>
          <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => pickFile(e.target.files?.[0])} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5"><Label>Description *</Label><Input value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Merchant / supplier</Label><Input value={data.merchant} onChange={(e) => setData({ ...data, merchant: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="grid gap-1.5"><Label>Amount ($)</Label><Input type="number" step="0.01" value={data.amount} onChange={(e) => setData({ ...data, amount: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>GST ($)</Label><Input type="number" step="0.01" value={data.gst_amount} onChange={(e) => setData({ ...data, gst_amount: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5"><Label>Reimburse to</Label><Input value={data.reimburse_to} onChange={(e) => setData({ ...data, reimburse_to: e.target.value })} placeholder="Who is to be reimbursed" /></div>
          <div className="grid gap-1.5"><Label>Paid by</Label><Input value={data.paid_by} onChange={(e) => setData({ ...data, paid_by: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="grid gap-1.5"><Label>Category</Label><Input value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Payment method</Label><Input value={data.payment_method} onChange={(e) => setData({ ...data, payment_method: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Receipt number</Label><Input value={data.receipt_number} onChange={(e) => setData({ ...data, receipt_number: e.target.value })} /></div>
        </div>
        <Button onClick={save} disabled={saving || !data.description.trim() || scanning}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Store receipt
        </Button>
      </DialogContent>
    </Dialog>
  );
}