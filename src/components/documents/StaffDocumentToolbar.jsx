import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Plus, RefreshCw } from 'lucide-react';
import BulkUploadDocuments from '@/components/documents/BulkUploadDocuments';

export default function StaffDocumentToolbar({ profile, staff, scanning, scanMsg, onScan, onExport, onAdd, onDone }) {
  return <section id="staff-docs" className="scroll-mt-24 space-y-2 rounded-2xl border border-brand/25 bg-gradient-brand-soft px-3 py-3">
    <h2 className="text-sm font-bold text-foreground">Staff Documents</h2>
    <div className="vault-staff-actions flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-1" aria-label="Staff document actions">
      {!profile && <Button variant="outline" data-staff-action="scan" onClick={onScan} disabled={scanning}><RefreshCw className={scanning ? 'animate-spin' : ''} />Scan expiries</Button>}
      <Button variant="outline" data-staff-action="export" onClick={onExport}><Download />Bulk export all documents</Button>
      {!profile && <span data-staff-action="bulk" className="shrink-0"><BulkUploadDocuments staff={staff} onDone={onDone} /></span>}
      <Button data-staff-action="add" onClick={onAdd}><Plus />Add document</Button>
    </div>
    {scanMsg && <p role="status" className="text-xs text-muted-foreground">{scanMsg}</p>}
  </section>;
}