import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCheck, X } from 'lucide-react';

// Floating action bar shown when register records are selected,
// applying one status (and optionally a version) to all selected records at once.
export default function BulkEditBar({ count, applying, onApply, onClear, options, showVersion = false, versionPlaceholder = 'e.g. 2.1' }) {
  const opts = options || [
    { value: 'Current', label: 'Approve (mark Current)' },
    { value: 'Expiring Soon', label: 'Mark Expiring Soon' },
    { value: 'Expired', label: 'Mark Expired' },
    { value: 'Archived', label: 'Archive' },
  ];
  const [status, setStatus] = useState(opts[0].value);
  const [version, setVersion] = useState('');
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
      <span className="text-sm font-bold font-editorial text-foreground/80">{count} selected</span>
      <span className="text-sm text-muted-foreground">Apply:</span>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
        <SelectContent>
          {opts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
      {showVersion && (
        <Input
          className="w-36"
          placeholder={`Version ${versionPlaceholder}`}
          value={version}
          onChange={(e) => setVersion(e.target.value)}
        />
      )}
      <Button size="sm" onClick={() => onApply({ status, version: version.trim() })} disabled={applying} className="gap-1.5">
        <CheckCheck className="h-4 w-4" />{applying ? 'Applying...' : 'Apply to selected'}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => { setVersion(''); onClear(); }} className="gap-1.5">
        <X className="h-4 w-4" /> Clear selection
      </Button>
    </div>
  );
}