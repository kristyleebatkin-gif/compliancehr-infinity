import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModuleShell from '@/components/module/ModuleShell';
import { Play, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import AiHealthStrip from '@/components/ai/AiHealthStrip';
import CopilotRunDialog from '@/components/ai/CopilotRunDialog';
import AgentRegisterTable from '@/components/ai/AgentRegisterTable';
import RecommendationQueue from '@/components/ai/RecommendationQueue';
import PromptLibraryTable from '@/components/ai/PromptLibraryTable';
import AiAuditLogTable from '@/components/ai/AiAuditLogTable';
import { COPILOT_ACTIONS, recommendationsByModule, summariseAi } from '@/lib/aiIntelligence';
import { detectAssuranceGaps, GAP_SEVERITIES } from '@/lib/assuranceGaps';

const LOAD_LIMIT = 300;

export default function AiIntelligenceOS() {
  const [agents, setAgents] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [standards, setStandards] = useState([]);
  const [controls, setControls] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runOpen, setRunOpen] = useState(false);
  const [runAction, setRunAction] = useState(COPILOT_ACTIONS[0].key);
  const [me, setMe] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [
      agentPage, promptPage, recommendationPage, interactionPage,
      standardPage, controlPage, evidencePage, findingPage,
    ] = await Promise.all([
      base44.entities.AiAgent.filter({}, { sort: 'name', limit: LOAD_LIMIT }),
      base44.entities.AiPrompt.filter({}, { sort: 'name', limit: LOAD_LIMIT }),
      base44.entities.AiRecommendation.filter({}, { sort: '-created_date', limit: LOAD_LIMIT }),
      base44.entities.AiInteraction.filter({}, { sort: '-created_date', limit: LOAD_LIMIT }),
      base44.entities.RegulatoryStandard.filter({}, { limit: LOAD_LIMIT }),
      base44.entities.ComplianceControl.filter({}, { limit: LOAD_LIMIT }),
      base44.entities.AssuranceEvidence.filter({}, { limit: LOAD_LIMIT }),
      base44.entities.AssuranceFinding.filter({}, { limit: LOAD_LIMIT }),
    ]);
    setAgents(agentPage.items || []);
    setPrompts(promptPage.items || []);
    setRecommendations(recommendationPage.items || []);
    setInteractions(interactionPage.items || []);
    setStandards(standardPage.items || []);
    setControls(controlPage.items || []);
    setEvidence(evidencePage.items || []);
    setFindings(findingPage.items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    base44.auth.me().then(setMe).catch(() => {});
  }, [load]);

  const summary = useMemo(
    () => summariseAi({ interactions, recommendations, agents, prompts }),
    [interactions, recommendations, agents, prompts]
  );

  const signals = useMemo(
    () => detectAssuranceGaps({ standards, controls, evidence, findings }).slice(0, 4),
    [standards, controls, evidence, findings]
  );

  const usage = useMemo(() => recommendationsByModule(recommendations).slice(0, 6), [recommendations]);

  const launch = (action) => {
    setRunAction(action);
    setRunOpen(true);
  };

  const setRecommendationStatus = async (item, status) => {
    const payload = { status };
    if (status !== 'Awaiting review') {
      payload.human_verified_by = me?.full_name || me?.email || 'Unknown user';
      payload.human_verified_date = new Date().toISOString().slice(0, 10);
    }
    await base44.entities.AiRecommendation.update(item.id, payload);
    await load();
  };

  const flagInteraction = async (entry) => {
    await base44.entities.AiInteraction.update(entry.id, {
      flagged: !entry.flagged,
      override: !entry.flagged,
      flag_reason: entry.flagged ? '' : 'Flagged by reviewer as inaccurate or unsupported',
    });
    await load();
  };

  return (
    <div className="space-y-4">
      <ModuleShell
        title="AI Intelligence OS"
        subtitle="Governed copilots over your own registers — every answer explainable, traceable and awaiting human verification"
        icon={Sparkles}
        moduleKey="compliance"
        actions={(
          <>
            <Button size="sm" onClick={() => launch(COPILOT_ACTIONS[0].key)}>
              <Play className="h-4 w-4" /> Run a copilot
            </Button>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </>
        )}
      />

      <AiHealthStrip summary={summary} />

      <Tabs defaultValue="command" className="min-w-0">
        <TabsList aria-label="AI Intelligence OS views">
          <TabsTrigger value="command">Command centre</TabsTrigger>
          <TabsTrigger value="agents">Copilots &amp; agents ({agents.length})</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations ({summary.awaiting})</TabsTrigger>
          <TabsTrigger value="prompts">Prompt library ({prompts.length})</TabsTrigger>
          <TabsTrigger value="audit">Audit log ({interactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="command" className="mt-2 min-w-0 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {COPILOT_ACTIONS.map((action) => (
              <div key={action.key} className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-foreground">{action.label}</div>
                    <p className="mt-1 text-[11px] font-medium leading-snug text-muted-foreground">{action.description}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => launch(action.key)}>
                    <Play className="h-3.5 w-3.5" /> Run
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5" /> Intelligence signals
            </h3>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground">
              The live gaps the copilots are pointed at. These come from the assurance registers, not from the AI.
            </p>
            {signals.length ? (
              <ul className="mt-2 space-y-1.5">
                {signals.map((gap) => (
                  <li key={gap.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border px-3 py-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${GAP_SEVERITIES[gap.severity].chip}`}>
                      {GAP_SEVERITIES[gap.severity].label}
                    </span>
                    <span className="min-w-0 flex-1 text-xs font-bold text-foreground">{gap.title}</span>
                    <span className="text-[10px] font-semibold text-muted-foreground">{gap.rule}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs font-semibold text-safe">
                No assurance gaps detected — nothing outstanding for the copilots to escalate.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
              Where the intelligence has been used
            </h3>
            {usage.length ? (
              <ul className="mt-2 space-y-1">
                {usage.map((row) => (
                  <li key={row.module} className="flex items-center justify-between gap-2 text-xs font-semibold text-foreground">
                    <span>{row.module}</span>
                    <span className="text-muted-foreground">{row.count} recommendation{row.count === 1 ? '' : 's'}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                No recommendations yet. Run a copilot to see this fill.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="agents" className="mt-2 min-w-0 rounded-xl border border-border bg-card p-3 sm:p-4">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading agent register…</p>
          ) : (
            <AgentRegisterTable agents={agents} />
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="mt-2 min-w-0 rounded-xl border border-border bg-card p-3 sm:p-4">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading recommendations…</p>
          ) : (
            <RecommendationQueue recommendations={recommendations} onStatusChange={setRecommendationStatus} />
          )}
        </TabsContent>

        <TabsContent value="prompts" className="mt-2 min-w-0 rounded-xl border border-border bg-card p-3 sm:p-4">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading prompt library…</p>
          ) : (
            <PromptLibraryTable prompts={prompts} />
          )}
        </TabsContent>

        <TabsContent value="audit" className="mt-2 min-w-0 rounded-xl border border-border bg-card p-3 sm:p-4">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading AI audit trail…</p>
          ) : (
            <AiAuditLogTable interactions={interactions} onFlag={flagInteraction} />
          )}
        </TabsContent>
      </Tabs>

      <CopilotRunDialog
        key={runAction}
        open={runOpen}
        initialAction={runAction}
        onClose={() => setRunOpen(false)}
        onComplete={load}
      />
    </div>
  );
}