import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, RefreshCw, PlugZap, ShieldQuestion } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

/**
 * Administrator integration visibility. Shows only what the platform reports for
 * app-wide connections, with the check time and the reported error. No token is
 * ever returned to the browser by the backend function behind this card.
 */
export default function IntegrationStatusCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('integrationStatus', {});
      if (res?.data?.error) {
        setError(res.data.error);
        setData(null);
      } else {
        setData(res?.data || null);
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Integration status could not be checked.');
      setData(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tone = (status) =>
    ({
      credential_available: 'border-sky-200 bg-sky-50 text-blue-900',
      binding_required: 'border-amber-200 bg-amber-50 text-amber-900',
      expired: 'border-rose-200 bg-rose-50 text-rose-700',
      unconfigured: 'border-sky-200 bg-sky-50 text-blue-900',
      restricted: 'border-amber-200 bg-amber-50 text-amber-800',
      error: 'border-amber-200 bg-amber-50 text-amber-800',
    })[status] || 'border-sky-200 bg-sky-50 text-blue-900';

  return (
    <section className="rounded-xl border border-sky-200 bg-white p-3 sm:p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <PlugZap className="h-4 w-4 text-[#0072FF]" />
        <h3 className="text-sm font-extrabold text-[#0A2B6D]">Connected services</h3>
        <span className="text-[11px] text-muted-foreground">
          {data?.checked_at ? `Checked ${new Date(data.checked_at).toLocaleString()}` : 'Checking…'}
        </span>
        <Button size="sm" variant="outline" className="ml-auto" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Check again
        </Button>
      </div>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800">{error}</p>}
      {loading && !data && <p className="text-[12px] text-muted-foreground">Asking the platform for the current connection state…</p>}

      {!!data?.items?.length && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item) => (
            <div key={item.integration_type} className={`rounded-lg border px-2.5 py-2 ${tone(item.status)}`}>
              <p className="text-[12px] font-extrabold">{item.integration_type === 'googlecalendar' ? 'Google Calendar' : item.integration_type === 'googledrive' ? 'Google Drive' : item.integration_type}</p>
              <p className="text-[11.5px] font-semibold">{item.label}</p>
              <p className="text-[11px] opacity-80">{item.used_for}</p>
              {item.error ? <p className="mt-1 text-[10.5px] leading-3.5 opacity-90">Reported: {item.error}</p> : null}
              <p className="mt-1 text-[10.5px] opacity-70">{new Date(item.checked_at).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      )}

      <Link to="/connected-workflows" className="mt-3 inline-block text-sm font-semibold text-blue-900 underline">Review connected workflow evidence</Link>
      <p className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
        <ShieldQuestion className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {data?.method || 'Status comes from the platform connector SDK. No provider API is called, no message is sent and no credential is shown.'}
        {data?.scope ? ` ${data.scope}` : ''}
      </p>
    </section>
  );
}