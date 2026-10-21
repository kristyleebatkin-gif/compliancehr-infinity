import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { EMERGENCY_DOC_GROUPS } from '@/lib/emergencyTemplates';

export default function EmergencyDocumentDialog({ open, onOpenChange, initialType, saving, onUpload }) {
  const [type, setType] = useState(initialType);
  const [participant, setParticipant] = useState('');
  const [file, setFile] = useState(null);
  useEffect(() => { if (open) { setType(initialType); setParticipant(''); setFile(null); } }, [open, initialType]);
  const submit = async (event) => {
    event.preventDefault();
    if (await onUpload(type, file, type === 'Participant Personal Emergency Plan' ? participant : '')) onOpenChange(false);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Add emergency document</DialogTitle></DialogHeader>
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5"><Label htmlFor="emergency-document-tile">Choose an existing tile</Label><select id="emergency-document-tile" value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">{EMERGENCY_DOC_GROUPS.map((group) => <optgroup key={group.name} label={group.name}>{group.types.map((name) => <option key={name} value={name}>{name}</option>)}</optgroup>)}</select></div>
      {type === 'Participant Personal Emergency Plan' && <div className="space-y-1.5"><Label htmlFor="emergency-participant">Participant name</Label><Input id="emergency-participant" value={participant} onChange={(event) => setParticipant(event.target.value)} /></div>}
      <div className="space-y-1.5"><Label htmlFor="emergency-document-file">Document (stored privately)</Label><Input key={`${open}-${initialType}`} id="emergency-document-file" type="file" required accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.png,.jpg,.jpeg" onChange={(event) => setFile(event.target.files?.[0] || null)} /></div>
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={saving || !file}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Add doc</Button></div>
    </form>
  </DialogContent></Dialog>;
}