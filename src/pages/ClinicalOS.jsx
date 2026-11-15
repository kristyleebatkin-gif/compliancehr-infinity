import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, RefreshCw, Stethoscope } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { resolveUserTenantId } from '@/lib/roles';
import ModuleShell from '@/components/module/ModuleShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import TableTab from '@/components/common/TableTab';
import ClinicalKpiStrip from '@/components/clinical/ClinicalKpiStrip';
import ClinicalCopilotBar from '@/components/clinical/ClinicalCopilotBar';
import CarePlanPanel from '@/components/clinical/CarePlanPanel';
import AlliedHealthPanel from '@/components/clinical/AlliedHealthPanel';
import { clinicalMetrics, daysLabel, reviewQueue } from '@/lib/clinicalGovernance';

export default function ClinicalOS() {
  const { user } = useAuth();
  const tenantId = resolveUserTenantId(user);
  const [plans, setPlans] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const scope = tenantId ? { tenant_id: tenantId } : {};
      const [planPage, referralPage] = await Promise.all([
        base44.entities.CarePlan.filter(scope, { sort: '-created_date', limit: 200 }),
        base44.entities.AlliedHealthReferral.filter(scope, { sort: '-created_date', limit: 200 }),
      ]);
      setPlans(planPage?.items || []);
      setReferrals(referralPage?.items || []);
    } catch (err) {
      setError(err?.message || 'The clinical registers could not load.');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { load(); }, [load]);

  const metrics = useMemo(() => clinicalMetrics(plans, referrals), [plans, referrals]);
  const queue = useMemo(() => reviewQueue(plans), [plans]);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4">
      <ModuleShell
        moduleKey="clinical-os"
        title="Clinical & Allied Health OS"
        subtitle="Care plans, allied health referrals, clinical reviews and the governance around them, recorded where the rest of the assurance chain can see them."
        icon={Stethoscope}
        actions={<Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className="h-4 w-4" />Refresh</Button>}
      />

      {error && (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-card p-3 text-sm">
          {error} <Button variant="link" size="sm" onClick={load}>Try again</Button>
        </div>
      )}
      {loading && !plans.length && !referrals.length && (
        <p role="status" className="flex items-center gap-2 p-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading the clinical registers…</p>
      )}

      <Tabs defaultValue="command">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1.5" aria-label="Clinical OS views">
          <TabsTrigger value="command">Command centre</TabsTrigger>
          <TabsTrigger value="plans">Care plans</TabsTrigger>
          <TabsTrigger value="allied">Allied health</TabsTrigger>
          <TabsTrigger value="copilots">Clinical copilots</TabsTrigger>
          <TabsTrigger value="governance">Clinical governance</TabsTrigger>
        </TabsList>

        <TabsContent value="command" className="mt-4 space-y-4">
          <ClinicalKpiStrip metrics={metrics} />
          <TableTab label="Reviews due">
            {queue.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th>Participant</th>
                      <th>Plan</th>
                      <th>Review due</th>
                      <th>When</th>
                      <th>Consent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((entry) => (
                      <tr key={entry.plan.id} className="border-b border-border/60 last:border-0">
                        <td className="font-semibold text-foreground">{entry.plan.participant_name || '—'}</td>
                        <td>{entry.plan.plan_type}</td>
                        <td>{entry.plan.review_due}</td>
                        <td className={entry.days < 0 ? 'font-bold text-destructive' : entry.days <= 30 ? 'font-bold text-warning' : 'text-muted-foreground'}>
                          {daysLabel(entry.days)}
                        </td>
                        <td>{entry.plan.consent_status || 'Not recorded'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-3 text-sm text-muted-foreground">
                No care plan review falls due in the next 60 days. Plans appear here as soon as they carry a review date.
              </p>
            )}
          </TableTab>
        </TabsContent>

        <TabsContent value="plans" className="mt-4">
          <CarePlanPanel plans={plans} tenantId={tenantId} onChanged={load} />
        </TabsContent>

        <TabsContent value="allied" className="mt-4">
          <AlliedHealthPanel referrals={referrals} tenantId={tenantId} onChanged={load} />
        </TabsContent>

        <TabsContent value="copilots" className="mt-4">
          <ClinicalCopilotBar />
        </TabsContent>

        <TabsContent value="governance" className="mt-4 space-y-3">
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <h2 className="text-sm font-extrabold text-foreground">How clinical governance is recorded here</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Every care plan carries its review date, consent position and any restrictive practice, so a supervisor can see what is overdue without opening each file.</li>
              <li>Allied health referrals record who was referred, to which discipline, and what came back — an outcome left blank stays visible.</li>
              <li>Clinical assurance evidence, findings and corrective actions live in the Evidence OS, so the same record traces to a standard and an audit.</li>
              <li>Nothing on this page scores clinical quality or makes a clinical decision. Those remain the accountable clinician's judgement, recorded by a person.</li>
            </ul>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/evidence" className="rounded-xl border border-border bg-card p-4 text-sm font-bold text-foreground hover:border-primary">Evidence OS · controls and findings</Link>
            <Link to="/knowledge-graph" className="rounded-xl border border-border bg-card p-4 text-sm font-bold text-foreground hover:border-primary">Knowledge Graph OS · traceability</Link>
            <Link to="/training" className="rounded-xl border border-border bg-card p-4 text-sm font-bold text-foreground hover:border-primary">Training Centre · competency and supervision</Link>
            <Link to="/incidents" className="rounded-xl border border-border bg-card p-4 text-sm font-bold text-foreground hover:border-primary">Incidents · clinical incident follow-up</Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}