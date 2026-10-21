import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { openAttachment } from '@/lib/commTypes';
const attachmentsFor = (value) => { try { return JSON.parse(value || '[]'); } catch { return []; } };
const room = /^https:\/\/meet\.jit\.si\/[A-Za-z0-9_-]+$/;
export default function EmployeeCommunicationRecord({ record, onReply, onJoin }) {
  return <article className="space-y-2 rounded-xl border border-border bg-card p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold">{record.subject || record.title || record.entry_kind}</h3><Badge variant="outline">{record.entry_kind || 'Update'}</Badge></div>
    <p className="text-xs text-muted-foreground">{[record.person_name, record.sender_name || record.posted_by, record.entry_date || record.created_date?.slice(0, 10), record.entry_time].filter(Boolean).join(' · ')}</p>
    {record.body && <p className="whitespace-pre-wrap break-words text-sm">{record.body}</p>}
    <div className="flex flex-wrap gap-2">{attachmentsFor(record.attachments_json).map((file, index) => <Button key={index} variant="outline" size="sm" onClick={() => openAttachment(file)}>{file.name || 'Open attachment'}</Button>)}
      {onReply && <Button variant="outline" size="sm" onClick={() => onReply(record)}>Reply</Button>}
      {onJoin && room.test(record.body || '') && <Button variant="outline" size="sm" onClick={() => onJoin(record.body)}>Join call</Button>}
    </div>
  </article>;
}