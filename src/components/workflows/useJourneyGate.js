import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

/** Reads one connected-journey gate from the server. The verdict is never computed in the browser. */
export default function useJourneyGate(journey, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('connectedJourneyGate', { action: 'assess', journey, ...params });
      if (res?.data?.error) {
        setError(res.data.error);
        setData(null);
      } else {
        setData(res?.data || null);
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'The check could not be loaded.');
      setData(null);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey, JSON.stringify(params)]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}

/** Runs a write action through the same server gate and returns its payload. */
export async function runGateAction(action, payload = {}) {
  try {
    const res = await base44.functions.invoke('connectedJourneyGate', { action, ...payload });
    const body = res?.data || {};
    if (body.error) return { ok: false, error: body.error, ...body };
    return { ok: true, ...body };
  } catch (err) {
    return { ok: false, error: err?.response?.data?.error || err?.message || 'The action could not be completed.' };
  }
}