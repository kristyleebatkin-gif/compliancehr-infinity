import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, ExternalLink, Phone, Mail, CalendarDays, Search, Loader2, Building2 } from 'lucide-react';

const safeUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

export default function CommunityCouncil() {
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
      const res = await base44.functions.invoke('councilLookup', { postcode: clean });
      setResult(res.data);
      localStorage.setItem('community-council-postcode', clean);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Lookup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('community-council-postcode');
    if (saved && /^\d{4}$/.test(saved)) {
      setPostcode(saved);
      runLookup(saved);
    }
  }, []);

  const council = result?.council_name;
  const website = safeUrl(result?.website);
  const whatsOn = safeUrl(result?.whats_on_url);
  const events = Array.isArray(result?.events) ? result.events : [];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-white/10 p-3"><MapPin className="h-7 w-7" /></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Community & Council</h1>
            <p className="text-sm text-teal-100">Find your local council, its contact details, what's on and community events for your postcode.</p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <label className="text-sm font-semibold">Postcode</label>
          <p className="mb-3 text-xs text-muted-foreground">Enter your 4-digit Australian postcode to look up the local council and community events.</p>
          <div className="flex flex-wrap gap-2">
            <Input
              className="max-w-40"
              inputMode="numeric"
              maxLength={4}
              placeholder="e.g. 2000"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(e) => { if (e.key === 'Enter') runLookup(postcode); }}
            />
            <Button onClick={() => runLookup(postcode)} disabled={loading || postcode.length !== 4}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {loading ? 'Searching...' : 'Find my council'}
            </Button>
          </div>
          {error && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>}
        </CardContent>
      </Card>

      {loading && (
        <Card><CardContent className="space-y-3 p-6">
          <div className="h-5 w-56 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </CardContent></Card>
      )}

      {result && council && !loading && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-brand/10 p-2.5"><Building2 className="h-5 w-5 text-brand" /></div>
                  <div>
                    <p className="text-lg font-bold">{council}</p>
                    <p className="text-xs text-muted-foreground">Local council for postcode {postcode}{result?.state ? ` · ${result.state}` : ''}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {website && <a href={website} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-sm font-semibold text-white hover:bg-brand/90"><ExternalLink className="h-4 w-4" />Council website</a>}
                  {whatsOn && <a href={whatsOn} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal px-3.5 text-sm font-semibold text-white hover:bg-teal/90"><CalendarDays className="h-4 w-4" />What's On</a>}
                </div>
              </div>
              <div className="mt-4 grid gap-2 border-t border-border/60 pt-4 text-sm text-muted-foreground md:grid-cols-2">
                {result?.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /><a className="font-medium text-brand hover:underline" href={`tel:${String(result.phone).replace(/\s/g, '')}`}>{result.phone}</a></p>}
                {result?.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /><a className="font-medium text-brand hover:underline" href={`mailto:${result.email}`}>{result.email}</a></p>}
                {result?.address && <p className="flex items-start gap-2 md:col-span-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{result.address}</p>}
              </div>
              {result?.notes && <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-xs italic text-muted-foreground">{result.notes}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="flex items-center gap-2 text-sm font-bold"><CalendarDays className="h-4 w-4 text-teal-600" />What's on — community events</p>
              {events.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No upcoming events verified right now{whatsOn ? ' — check the council\'s What\'s On page above' : ''}.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {events.map((e, i) => {
                    const url = safeUrl(e?.url);
                    return (
                      <li key={i} className="flex items-start justify-between gap-3 rounded-xl border border-border/60 p-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{e?.title}</p>
                          <p className="text-xs text-muted-foreground">{[e?.date, e?.venue].filter(Boolean).join(' · ') || 'Details on council website'}</p>
                        </div>
                        {url && <a href={url} target="_blank" rel="noreferrer" className="shrink-0 rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand/10">Open</a>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}