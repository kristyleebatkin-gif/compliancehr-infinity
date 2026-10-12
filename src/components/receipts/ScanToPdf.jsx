import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Camera, FileDown, Images, Loader2, Trash2, UploadCloud, FileText, X } from 'lucide-react';
import { readImageDataUrl as readImage } from '@/lib/imageToPdf';

export default function ScanToPdf({ open, onOpenChange }) {
  const { toast } = useToast();
  const [pages, setPages] = useState([]);
  const [building, setBuilding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('Scanned Document');
  const [uploadedUri, setUploadedUri] = useState('');

  const reset = () => { setPages([]); setUploadedUri(''); setFileName('Scanned Document'); };

  const addFiles = async (files) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    try {
      const imgs = await Promise.all(list.map(readImage));
      setPages((prev) => [...prev, ...imgs]);
      toast({ title: 'Page added', description: `${imgs.length} page${imgs.length === 1 ? '' : 's'} ready.` });
    } catch (e) {
      toast({ title: 'Could not read image', description: e.message, variant: 'destructive' });
    }
  };

  const buildPdf = () => {
    if (!pages.length) return null;
    setBuilding(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      pages.forEach((p, i) => {
        if (i) doc.addPage();
        const scale = Math.min(200 / p.w, 277 / p.h);
        const w = p.w * scale, h = p.h * scale;
        doc.addImage(p.dataUrl, 'JPEG', (210 - w) / 2, (297 - h) / 2, w, h);
      });
      return doc;
    } finally {
      setBuilding(false);
    }
  };

  const download = () => {
    const doc = buildPdf();
    if (!doc) return;
    doc.save(`${fileName.replace(/[^\w\s-]/g, '').trim() || 'Scanned Document'}.pdf`);
    toast({ title: 'PDF downloaded' });
  };

  const upload = async () => {
    const doc = buildPdf();
    if (!doc) return;
    setUploading(true);
    try {
      const blob = doc.output('blob');
      const name = `${fileName.replace(/[^\w\s-]/g, '').trim() || 'Scanned Document'}.pdf`;
      const file = new File([blob], name, { type: 'application/pdf' });
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setUploadedUri(file_uri);
      toast({ title: 'PDF uploaded', description: 'Stored with your documents.' });
    } catch (e) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const openUploaded = async () => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uploadedUri });
      window.open(signed_url, '_blank');
    } catch (e) {
      toast({ title: 'Could not open file', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-brand" />Scan to PDF</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Document name</Label>
            <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Scanned Document" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="bg-white text-slate-900 hover:bg-slate-200 border border-input" onClick={() => document.getElementById('scan-pdf-camera')?.click()}>
              <Camera className="h-4 w-4" />Camera
            </Button>
            <Button variant="outline" onClick={() => document.getElementById('scan-pdf-files')?.click()}>
              <Images className="h-4 w-4" />Choose images
            </Button>
          </div>
          <input id="scan-pdf-camera" type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          <input id="scan-pdf-files" type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />

          {pages.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">{pages.length} page{pages.length === 1 ? '' : 's'} in the PDF</p>
              <div className="grid max-h-44 grid-cols-4 gap-2 overflow-y-auto">
                {pages.map((p, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-lg border border-border">
                    <img src={p.dataUrl} alt={`Page ${i + 1}`} className="h-20 w-full object-cover" />
                    <button onClick={() => setPages((prev) => prev.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={download} disabled={!pages.length || building}>
              {building ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}Download PDF
            </Button>
            <Button variant="outline" onClick={upload} disabled={!pages.length || uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}Upload to Hub
            </Button>
            {uploadedUri && (
              <Button variant="ghost" onClick={openUploaded}><FileText className="h-4 w-4" />Open uploaded copy</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}