import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Database, Download, FileDown, Loader2, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import { downloadBreachResponsePlan } from '@/lib/dataBreachPdf';
import ActivityLog from '@/components/datacontrol/ActivityLog';
import BreachRegister from '@/components/datacontrol/BreachRegister';

import { DATA_MODULES as MODULES } from '@/lib/dataModules';
import { useAuth } from '@/lib/AuthContext';
import { isVaultProvider } from '@/components/documents/vaultAccess';

export default function DataControlPanel() {
  const { user: me } = useAuth();
  const [selected, setSelected] = useState('StaffProfile');
  const [count, setCount] = useState(null);
  const [counting, setCounting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const isManager = isVaultProvider(me?.role);

  const runCount = useCallback(async (entityName) => {
    setCounting(true);
    setCount(null);
    try {
      setCount(await base44.entities[entityName].count({}));
    } catch (e) {
      console.error(e);
      setCount(0);
    } finally {
      setCounting(false);
    }
  }, []);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const rows = [];
      let cursor;
      do {
        const page = await base44.entities[selected].filter({}, { limit: 500, cursor });
        rows.push(...page.items);
        cursor = page.next_cursor;
      } while (cursor);

      if (rows.length === 0) return;
      const cols = Object.keys(rows[0]);
      const csv = [
        cols.join(','),
        ...rows.map((r) => cols.map((c) => {
          const v = r[c] == null ? '' : String(r[c]);
          return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v;
        }).join(',')),
      ].join('\n');

      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selected}_export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  if (!isManager) return null;
  return (
    <div className="vault-data-control compact-module space-y-2 rounded-lg border border-border bg-card p-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-brand/10 p-2"><Database className="h-4 w-4 text-brand" /></div>
          <div>
            <p className="font-semibold">Data Control Panel</p>
            <p className="text-xs text-muted-foreground">Users and permissions, access logging, breach response, and data exports.</p>
          </div>
        </div>
        <div className="module-action-bar flex flex-wrap items-center gap-1">
          <Button variant="outline" onClick={() => { window.location.href = '/users'; }}><Users className="mr-2 h-4 w-4" />Users &amp; permissions hub<ArrowRight className="ml-2 h-4 w-4" /></Button>
          <Button variant="outline" onClick={downloadBreachResponsePlan}><FileDown className="mr-2 h-4 w-4" />Data breach response plan</Button>
        </div>
      </div>

      <Tabs defaultValue="activity">
        <TabsList className="h-auto flex-wrap justify-start">
          {isManager && <TabsTrigger value="activity">Access &amp; activity log</TabsTrigger>}
          <TabsTrigger value="breaches"><ShieldAlert className="mr-1.5 inline h-3.5 w-3.5" />Data breaches</TabsTrigger>
          <TabsTrigger value="exports"><ShieldCheck className="mr-1.5 inline h-3.5 w-3.5" />Data exports</TabsTrigger>
        </TabsList>

        {isManager && (
          <TabsContent value="activity" className="mt-4">
            <ActivityLog />
          </TabsContent>
        )}

        <TabsContent value="breaches" className="mt-4">
          <BreachRegister />
        </TabsContent>

        <TabsContent value="exports" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Module</Label>
                  <Select value={selected} onValueChange={(v) => { setSelected(v); runCount(v); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MODULES.map(([id, label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-3">
                  <div className="text-sm text-muted-foreground">
                    Records:{' '}
                    {counting ? <Loader2 className="inline h-4 w-4 animate-spin" /> : count != null ? <span className="font-semibold text-foreground">{count}</span> : 'select a module'}
                  </div>
                  <Button onClick={exportCsv} disabled={exporting}>
                    {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}