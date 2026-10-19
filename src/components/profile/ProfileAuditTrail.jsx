import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { History } from 'lucide-react';

// Per-profile audit trail: every recorded change on this person's profile
// (documents, details, consents), latest first.
export default function ProfileAuditTrail({ changeLog, title = 'Audit trail', limit = 15 }) {
  const lines = String(changeLog || '').split('\n').filter(Boolean);
  if (!lines.length) return null;
  return (
    <Card className="border-border/60">
      <CardContent className="p-5 space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4 text-brand" />{title}</div>
        <p className="text-xs text-foreground/50">Who changed what on this profile and when, latest first.</p>
        <div className="space-y-1">
          {lines.slice(-limit).reverse().map((line, i) => (
            <div key={i} className="rounded-lg bg-muted/30 px-3 py-2 text-xs text-foreground/70">{line}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}