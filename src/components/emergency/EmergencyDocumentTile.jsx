import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function EmergencyDocumentTile({ type, documents, onAdd, onOpen, onRemove }) {
  return <section className="min-w-0 rounded-xl border border-border bg-card p-3.5">
    <div className="flex items-start gap-2"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><h3 className="min-w-0 flex-1 break-words text-sm font-semibold">{type}</h3>{documents.length > 0 && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{documents.length}</span>}</div>
    <Button type="button" variant="outline" size="sm" className="mt-2.5 h-7 text-xs" onClick={() => onAdd(type)}><Plus className="h-3 w-3" />Add doc</Button>
    {documents.length > 0 && <div className="mt-2 space-y-2">{documents.map((doc) => <div key={doc.id} className="flex items-start gap-1.5 text-xs">
      <button type="button" onClick={() => onOpen(doc)} className="flex min-w-0 flex-1 items-start gap-1 text-left text-primary hover:underline"><ExternalLink className="mt-0.5 h-3 w-3 shrink-0" /><span className="break-words">{doc.participant_name ? `${doc.participant_name} - ` : ''}{doc.file_name || doc.title}</span></button>
      {doc.issue_date && <span className="shrink-0 text-[10px] text-muted-foreground">{format(new Date(doc.issue_date), 'd MMM yyyy')}</span>}
      <button type="button" onClick={() => onRemove(doc)} aria-label="Remove document" className="shrink-0 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
    </div>)}</div>}
  </section>;
}