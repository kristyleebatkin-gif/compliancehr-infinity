import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCheck, X } from 'lucide-react';

// Floating action bar shown when document records are selected,
// applying one status change to every selected record at once.
export default function BulkEditBar({ count, applying, onApply, onClear }) {
  const [status, setStatus] = useState('Current');
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
      <span className="text-sm font-bold font-editorial text-foreground/80">{count} selected</span>
      <span className="text-sm text-muted-foreground">Apply status:</span>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Current">Approve (mark Current)</SelectItem>
          <SelectItem value="Expiring Soon">Mark Expiring Soon</SelectItem>
          <SelectItem value="Expired">Mark Expired</SelectItem>
          <SelectItem value="Archived">Archive</SelectItem>
        </SelectContent>
      </Select>
      <Button size="sm" onClick={() => onApply(status)} disabled={applying} className="gap-1.5">
        <CheckCheck className="h-4 w-4" />{applying ? 'Applying...' : 'Apply to selected'}
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear} className="gap-1.5">
        <X className="h-4 w-4" /> Clear selection
      </Button>
    </div>
  );
}