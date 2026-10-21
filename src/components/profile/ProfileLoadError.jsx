import React from 'react';
import { Button } from '@/components/ui/button';

export default function ProfileLoadError({ error, onRetry }) {
  const message = error?.response?.data?.error || error?.message || error || 'Unable to load profiles. Please try again.';
  return (
    <div role="alert" className="space-y-3 rounded-xl border border-destructive/30 bg-card p-4">
      <p className="font-semibold text-destructive">Profiles could not be loaded</p>
      <p className="text-sm text-muted-foreground">{String(message)}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}