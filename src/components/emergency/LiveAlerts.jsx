import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Radar, Loader2, ExternalLink, RefreshCw, Info } from 'lucide-react';

const STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];
const LEVEL_TONES = {
  'Emergency Warning': 'bg-danger text-white',
  'Watch and Act': 'bg-warning/20 text-warning',
  Advice: 'bg-brand/10 text-brand',
};

const safeUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

export default function LiveAlerts() {
  const [state, setState] = useState(() => localStorage.getItem('emergency-alerts-state') || 'NSW');
  const [postcode, setPostcode] = useState(() => localStorage.getItem('emergency-alerts-postcode') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkedAt, setCheckedAt] = useState(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('emergencyAlerts', { state, postcode: postcode.trim() });
      setResult(res.data);
      setCheckedAt(new Date());
      localStorage.setItem('emergency-alerts-state', state);
      localStorage.setItem('emergency-alerts-postcode', postcode.trim());
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Could not load alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { run(); }, []);

  const alerts = Array.isArray(result?.alerts) ? result.alerts : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <p className="mb-1 flex items-center gap-2 text-sm font-bold"><Radar className="h-4 w-4 text-danger" />Live alerts &amp; warnings</p>
          <p className="mb-3 text-xs text-muted-foreground">Checks official emergency services and Bureau of Meteorology sources for active bushfire, flood, storm, heatwave and community safety warnings in your area.</p>
          <div className="flex flex-wrap gap-2">
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Input
              className="w-32"
              inputMode="numeric"
              maxLength={4}
              placeholder="Postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
            />
            <Button onClick={run} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              {loading ? 'Checking...' : 'Check alerts'}
            </Button>
          </div>
          {error && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>}
          {checkedAt && !loading && <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Info className="h-3.5 w-3.5" />Checked {checkedAt.toLocaleTimeString()} - always confirm with your state's official warning channel before acting.</p>}
        </CardContent>
      </Card>

      {result && !loading && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm">{result.summary}</p>
            {alerts.length === 0 ? (
              <p className="mt-3 rounded-xl bg-safe/10 px-3 py-2 text-sm font-medium text-safe">No active alerts reported for this area right now.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {alerts.map((a, i) => {
                  const url = safeUrl(a?.url);
                  return (
                    <li key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{a?.title}</p>
                        <p className="text-xs text-muted-foreground">{[a?.level, a?.area, a?.source, a?.issued].filter(Boolean).join(' - ')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${LEVEL_TONES[a?.level] || 'bg-muted text-foreground'}`}>{a?.level}</span>
                        {url && <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand/10">Open<ExternalLink className="h-3 w-3" /></a>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}