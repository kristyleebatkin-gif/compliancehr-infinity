import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle2, CircleAlert, Download, Loader2, RefreshCw, Trash2, Signal } from 'lucide-react';

const CACHE_KEYS = ['community-council-postcode', 'referral-support-postcode', 'emergency-alerts-state', 'emergency-alerts-postcode'];

export default function SystemHealth() {
  const [checks, setChecks] = useState(null);
  const [running, setRunning] = useState(false);
  const [cacheMsg, setCacheMsg] = useState('');

  const runChecks = async () => {
    setRunning(true);
    setChecks(null);
    setCacheMsg('');
    const results = [];

    // 1. Internet connection
    results.push({
      name: 'Internet connection',
      status: navigator.onLine ? 'ok' : 'fail',
      detail: navigator.onLine ? 'Browser reports you are online' : 'Browser reports you are OFFLINE',
    });

    // 2. Session / authentication
    try {
      const me = await base44.auth.me();
      results.push({ name: 'Login session', status: 'ok', detail: `Signed in as ${me?.full_name || me?.email || 'user'}` });
    } catch (e) {
      results.push({ name: 'Login session', status: 'fail', detail: 'Not signed in or session expired - log out and back in' });
    }

    // 3. Database read
    try {
      const count = await base44.entities.Task.count({});
      results.push({ name: 'Database connection', status: 'ok', detail: `Read test passed (tasks on file: ${count})` });
    } catch (e) {
      results.push({ name: 'Database connection', status: 'fail', detail: e?.response?.data?.error || e.message || 'Could not read records' });
    }

    // 4. Automations/backend
    try {
      await base44.functions.invoke('pageActivity', { page: 'help-centre', action: 'health-check' });
      results.push({ name: 'Automations & backend services', status: 'ok', detail: 'Backend responded normally' });
    } catch (e) {
      results.push({ name: 'Automations & backend services', status: 'fail', detail: e?.response?.data?.error || e.message || 'Backend did not respond' });
    }

    // 5. Browser environment
    results.push({
      name: 'Browser environment',
      status: 'ok',
      detail: `${navigator.userAgent.slice(0, 80)}... - viewport ${window.innerWidth}x${window.innerHeight}`,
    });

    setChecks(results);
    setRunning(false);
  };

  const exportDiagnostics = () => {
    const lines = [
      'COMPLIANCEHR PORTAL - DIAGNOSTICS REPORT',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      ...(checks || []).map((c) => `[${c.status.toUpperCase()}] ${c.name}: ${c.detail}`),
      '',
      'Attach this file to a support request for the fastest help.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostics-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearCache = () => {
    CACHE_KEYS.forEach((k) => localStorage.removeItem(k));
    setCacheMsg('Saved searches and preferences cleared. Reload the app to see it fresh.');
  };

  const passCount = (checks || []).filter((c) => c.status === 'ok').length;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold"><Activity className="h-4 w-4 text-brand" />System health check</p>
              <p className="text-xs text-muted-foreground">Tests your connection, login session, database, automations and browser - pinpoints where a problem sits before you report it.</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={runChecks} disabled={running}>
                {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                {running ? 'Running checks...' : 'Run health check'}
              </Button>
              <Button size="sm" variant="outline" onClick={exportDiagnostics} disabled={!checks}><Download className="mr-2 h-4 w-4" />Export diagnostics report</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {checks && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold"><Signal className="h-4 w-4 text-brand" />Results - {passCount} of {checks.length} passed</p>
            <ul className="space-y-2">
              {checks.map((c) => (
                <li key={c.name} className="flex items-start justify-between gap-3 rounded-xl border border-border/60 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.detail}</p>
                  </div>
                  {c.status === 'ok'
                    ? <Badge className="shrink-0 bg-safe/10 text-safe"><CheckCircle2 className="mr-1 h-3 w-3" />OK</Badge>
                    : <Badge className="shrink-0 bg-danger/10 text-danger"><CircleAlert className="mr-1 h-3 w-3" />Problem</Badge>}
                </li>
              ))}
            </ul>
            {passCount === checks.length && <p className="mt-3 rounded-xl bg-safe/10 px-3 py-2 text-sm font-medium text-safe">Everything is healthy. If a feature still misbehaves, use the AI troubleshooter tab.</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <p className="mb-1 text-sm font-bold">Quick fix tools</p>
          <p className="mb-3 text-xs text-muted-foreground">Clears saved searches and locally stored preferences (postcodes, alert areas). Never touches your records.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={clearCache}><Trash2 className="mr-2 h-4 w-4" />Clear local cache</Button>
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}><RefreshCw className="mr-2 h-4 w-4" />Reload the app</Button>
          </div>
          {cacheMsg && <p className="mt-3 rounded-lg bg-safe/10 px-3 py-2 text-sm text-safe">{cacheMsg}</p>}
        </CardContent>
      </Card>
    </div>
  );
}