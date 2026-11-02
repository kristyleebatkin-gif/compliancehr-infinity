import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, ExternalLink, Phone, Mail, Building2 } from 'lucide-react';

const safeUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

export default function LocalServices() {
  const [postcode, setPostcode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runLookup = async (pc) => {
    const clean = String(pc || '').trim();
    if (!/^\d{4}$/.test(clean)) {
      setError('Enter a valid 4-digit Australian postcode.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('supportServicesLookup', { postcode: clean });
      setResult(res.data);
      localStorage.setItem('referral-support-postcode', clean);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Lookup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const saved = localStorage.getItem('referral-support-postcode');
    if (saved && /^\d{4}$/.test(saved)) {
      setPostcode(saved);
      runLookup(saved);
    }
  }, []);

  const services = Array.isArray(result?.services) ? result.services : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <label className="text-sm font-semibold">Postcode</label>
          <p className="mb-3 text-xs text-muted-foreground">Enter a postcode to list local supports and community services near that area.</p>
          <div className="flex flex-wrap gap-2">
            <Input
              className="max-w-40"
              inputMode="numeric"
              maxLength={4}
              placeholder="e.g. 4810"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(e) => { if (e.key === 'Enter') runLookup(postcode); }}
            />
            <Button onClick={() => runLookup(postcode)} disabled={loading || postcode.length !== 4}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {loading ? 'Searching...' : 'Find local services'}
            </Button>
          </div>
          {error && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>}
        </CardContent>
      </Card>

      {loading && (
        <div className="grid gap-3 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="space-y-2 p-5">
              <div className="h-4 w-44 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            </CardContent></Card>
          ))}
        </div>
      )}

      {result && !loading && (
        <div className="space-y-3">
          {result?.notes && <p className="rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5 text-xs italic text-muted-foreground">{result.notes}</p>}
          {services.length === 0 ? (
            <Card><CardContent className="p-10 text-center text-muted-foreground">No services verified for this area - try a nearby postcode.</CardContent></Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {services.map((s, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <div className="rounded-lg bg-brand/10 p-2"><Building2 className="h-4 w-4 text-brand" /></div>
                        <div className="min-w-0">
                          <p className="font-semibold leading-snug">{s?.name}</p>
                          <p className="text-xs text-muted-foreground">{[s?.suburb, s?.address].filter(Boolean).join(' - ')}</p>
                        </div>
                      </div>
                      {s?.category && <Badge variant="secondary" className="shrink-0 text-[10px]">{s.category}</Badge>}
                    </div>
                    {s?.description && <p className="mt-2 text-xs text-muted-foreground">{s.description}</p>}
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
                      {s?.phone && <a href={`tel:${String(s.phone).replace(/[^\d+]/g, '')}`} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-semibold text-brand hover:bg-brand/5"><Phone className="h-3 w-3" />{s.phone}</a>}
                      {s?.email && <a href={`mailto:${s.email}`} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-semibold text-brand hover:bg-brand/5"><Mail className="h-3 w-3" />Email</a>}
                      {safeUrl(s?.website) && <a href={safeUrl(s?.website)} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-semibold text-brand hover:bg-brand/5"><ExternalLink className="h-3 w-3" />Website</a>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}