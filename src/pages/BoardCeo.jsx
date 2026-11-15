import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Loader2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { resolveUserTenantId } from '@/lib/roles';
import ModuleShell from '@/components/module/ModuleShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import BoardKpiStrip from '@/components/board/BoardKpiStrip';
import BoardCopilotCards from '@/components/board/BoardCopilotCards';
import BoardResolutionPanel from '@/components/board/BoardResolutionPanel';

const CLOSED_FINDING = ['Closed'];
const CLOSED_ACTION = ['Completed', 'Closed', 'Verified'];

export default function BoardCeo() {
  const { user } = useAuth();
  const tenantId = resolveUserTenantId(user);
  const [state, setState] = useState({ evidence: [], findings: [], actions: [], resolutions: [], awaitingAi: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const scope = tenantId ? { tenant_id: tenantId } : {};
      const [evidence, findings, actions, resolutions, awaitingAi] = await Promise.all([
        base44.entities.AssuranceEvidence.filter(scope, { sort: '-updated_date', limit: 200 }),
        base44.entities.AssuranceFinding.filter(scope, { sort: '-updated_date', limit: 200 }),
        base44.entities.ImprovementAction.filter(scope, { sort: '-updated_date', limit: 200 }),
        base44.entities.BoardResolution.filter(scope, { sort: '-updated_date', limit: 200 }),
        base44.entities.AiRecommendation.count({ ...scope, status: 'Awaiting review' }),
      ]);
      setState({
        evidence: evidence?.items || [],
        findings: findings?.items || [],
        actions: actions?.items || [],
        resolutions: resolutions?.items || [],
        awaitingAi: Number(awaitingAi) || 0,
      });
    } catch (err) {
      setError(err?.message || 'The board registers could not load.');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { load(); }, [load]);

  const metrics = useMemo(() => {
    const { evidence, findings, actions, resolutions, awaitingAi } = state;
    return {
      evidence: evidence.length,
      verifiedEvidence: evidence.filter((row) => row.verification_status === 'Verified').length,
      expiredEvidence: evidence.filter((row) => row.verification_status === 'Expired').length,
      openFindings: findings.filter((row) => !CLOSED_FINDING.includes(String(row.status || ''))).length,
      openActions: actions.filter((row) => !CLOSED_ACTION.includes(String(row.status || ''))).length,
      awaitingAi,
      approvedResolutions: resolutions.filter((row) => row.status === 'Approved').length,
    };
  }, [state]);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4">
      <ModuleShell
        moduleKey="board-ceo"
        title="Board & CEO Copilots"
        subtitle="The assurance position prepared for the board and the chief executive, with the resolutions that record what was actually decided."
        icon={Crown}
        actions={<Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className="h-4 w-4" />Refresh</Button>}
      />

      {error && (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-card p-3 text-sm">
          {error} <Button variant="link" size="sm" onClick={load}>Try again</Button>
        </div>
      )}
      {loading && !state.evidence.length && (
        <p role="status" className="flex items-center gap-2 p-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading the board position…</p>
      )}

      <Tabs defaultValue="command">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1.5" aria-label="Board and CEO views">
          <TabsTrigger value="command">Command centre</TabsTrigger>
          <TabsTrigger value="copilots">Board &amp; CEO copilots</TabsTrigger>
          <TabsTrigger value="resolutions">Board resolutions</TabsTrigger>
          <TabsTrigger value="pack">Assurance pack</TabsTrigger>
        </TabsList>

        <TabsContent value="command" className="mt-4 space-y-4">
          <BoardKpiStrip metrics={metrics} />
          <p className="text-xs text-muted-foreground">
            These counts describe the records in this business right now. They are not a compliance rating, an audit opinion or a prediction, and the copilots below cannot issue one.
          </p>
        </TabsContent>

        <TabsContent value="copilots" className="mt-4">
          <BoardCopilotCards />
        </TabsContent>

        <TabsContent value="resolutions" className="mt-4">
          <BoardResolutionPanel
            resolutions={state.resolutions}
            tenantId={tenantId}
            signedByName={user?.full_name || user?.email}
            onChanged={load}
          />
        </TabsContent>

        <TabsContent value="pack" className="mt-4 space-y-3">
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <h2 className="text-sm font-extrabold text-foreground">Building the board pack</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>Confirm the assurance position with a board or CEO copilot run — every line it drafts cites the records it used.</li>
              <li>Review the open findings and corrective actions; anything the board must formally accept belongs in a resolution with its votes recorded.</li>
              <li>Attach the papers to the meeting in the Meeting Centre and sign the resolutions here, so the decision and its evidence stay together.</li>
            </ol>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/operations-centre" className="rounded-xl border border-border bg-card p-4 text-sm font-bold text-foreground hover:border-primary">Operations Centre · executive reports</Link>
            <Link to="/projects" className="rounded-xl border border-border bg-card p-4 text-sm font-bold text-foreground hover:border-primary">Projects Hub · board packs</Link>
            <Link to="/meetings" className="rounded-xl border border-border bg-card p-4 text-sm font-bold text-foreground hover:border-primary">Meeting Centre · agendas and minutes</Link>
            <Link to="/knowledge-graph" className="rounded-xl border border-border bg-card p-4 text-sm font-bold text-foreground hover:border-primary">Knowledge Graph OS · traceability</Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}