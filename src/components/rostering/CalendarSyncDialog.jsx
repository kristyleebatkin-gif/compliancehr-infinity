import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, RefreshCw, Check } from 'lucide-react';

const FEED_URL_BASE = 'https://polite-safe-hire-flow.base44.app/functions/rosterIcsFeed';

export default function CalendarSyncDialog({ open, onOpenChange }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const page = await base44.entities.CalendarFeed.filter({}, { limit: 1 });
        if (cancelled) return;
        setToken(page.items?.[0]?.token || '');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  const regenerate = async () => {
    setLoading(true);
    try {
      const newToken = crypto.randomUUID().replace(/-/g, '');
      const page = await base44.entities.CalendarFeed.filter({}, { limit: 1 });
      if (page.items?.[0]) await base44.entities.CalendarFeed.update(page.items[0].id, { token: newToken });
      else await base44.entities.CalendarFeed.create({ token: newToken });
      setToken(newToken);
      setCopied(false);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${FEED_URL_BASE}?token=${token}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) { console.error(e); }
  };

  const url = token ? `${FEED_URL_BASE}?token=${token}` : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sync rostering calendar</DialogTitle>
          <DialogDescription>
            Subscribe to this read-only feed in Google Calendar, Apple Calendar or Outlook — it updates about every hour.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8"><div className="h-7 w-7 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input readOnly value={url} className="text-xs" onFocus={(e) => e.target.select()} />
              <Button variant="outline" size="icon" onClick={copy} title="Copy feed URL">
                {copied ? <Check className="h-4 w-4 text-safe" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <ol className="list-decimal space-y-1 rounded-lg border border-border/60 p-3 pl-7 text-sm text-muted-foreground">
              <li>In Google Calendar, go to <span className="font-semibold text-foreground">Settings → Add calendar → From URL</span>.</li>
              <li>Paste the feed URL and click <span className="font-semibold text-foreground">Add calendar</span>.</li>
              <li>The roster appears as a read-only layer; new shifts appear within about an hour (sooner via "Refresh").</li>
            </ol>
            <p className="text-xs text-muted-foreground">Anyone holding this link can read the roster. Use <span className="font-semibold text-foreground">Regenerate</span> to invalidate the old link if it is ever shared by mistake.</p>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={regenerate} disabled={loading}><RefreshCw className="mr-2 h-3.5 w-3.5" /> Regenerate link</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}