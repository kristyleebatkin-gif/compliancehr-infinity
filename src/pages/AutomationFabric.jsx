import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Send, Workflow } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DecisionDialog from '@/components/twin/DecisionDialog';
import FabricKpiStrip from '@/components/fabric/FabricKpiStrip';
import MessageTable from '@/components/fabric/MessageTable';
import SubscriptionTable from '@/components/fabric/SubscriptionTable';
import FlowTable from '@/components/fabric/FlowTable';
import RuleTable from '@/components/fabric/RuleTable';
import EventCatalogTable from '@/components/fabric/EventCatalogTable';
import ConnectorTable from '@/components/fabric/ConnectorTable';
import EventTypeDialog from '@/components/fabric/EventTypeDialog';
import SubscriptionDialog from '@/components/fabric/SubscriptionDialog';
import FlowDialog from '@/components/fabric/FlowDialog';
import RuleDialog from '@/components/fabric/RuleDialog';
import ConnectorDialog from '@/components/fabric/ConnectorDialog';
import PublishEventDialog from '@/components/fabric/PublishEventDialog';
import MessageDialog from '@/components/fabric/MessageDialog';

const EMPTY = {
  eventTypes: [], subscriptions: [], flows: [], rules: [], connectors: [], messages: [],
  workflowTargets: [], catalogue: { categories: [], sensitivities: [], seeded: [] }, defaults: {},
  counts: {}, canConfigure: false, canManageConnectors: false, fabricVersion: '',
};

const closed = { open: false, record: null };

export default function AutomationFabric() {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [eventTypeState, setEventTypeState] = useState(closed);
  const [subscriptionState, setSubscriptionState] = useState(closed);
  const [flowState, setFlowState] = useState(closed);
  const [ruleState, setRuleState] = useState(closed);
  const [connectorState, setConnectorState] = useState(closed);
  const [publishOpen, setPublishOpen] = useState(false);
  const [messageState, setMessageState] = useState({ open: false, id: '', detail: null, loading: false });
  const [decision, setDecision] = useState({ open: false, config: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('automationFabric', { action: 'list' });
      const payload = response?.data || {};
      if (payload.error) setError(payload.error);
      else {
        setError('');
        setData({ ...EMPTY, ...payload });
      }
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'The automation fabric is unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (payload) => {
    setBusy(true);
    setActionError('');
    try {
      const response = await base44.functions.invoke('automationFabric', payload);
      const result = response?.data || {};
      if (result.error) {
        setActionError(result.error);
        return null;
      }
      await load();
      return result;
    } catch (e) {
      setActionError(e?.response?.data?.error || e?.message || 'That change could not be saved.');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const ask = (config) => { setActionError(''); setDecision({ open: true, config }); };
  const closeDecision = () => setDecision({ open: false, config: null });
  const submitDecision = async ({ note, decision: choice }) => {
    const config = decision.config;
    if (!config) return;
    const result = await config.submit({ note, choice });
    if (result) closeDecision();
  };

  const openMessage = async (row) => {
    setMessageState({ open: true, id: row.id, detail: null, loading: true });
    try {
      const response = await base44.functions.invoke('automationFabric', { action: 'message', message_id: row.id });
      const payload = response?.data || {};
      setMessageState({ open: true, id: row.id, detail: payload.error ? null : payload, loading: false });
      if (payload.error) setActionError(payload.error);
    } catch (e) {
      setMessageState({ open: true, id: row.id, detail: null, loading: false });
      setActionError(e?.response?.data?.error || e?.message || 'That delivery could not be read.');
    }
  };

  const publish = async (payload) => {
    const result = await run({ action: 'publishEvent', ...payload });
    return result;
  };

  const saveEventType = async (payload) => {
    const result = eventTypeState.record
      ? await run({ action: 'updateEventType', event_type_id: eventTypeState.record.id, ...payload })
      : await run({ action: 'createEventType', ...payload });
    if (result) setEventTypeState(closed);
  };

  const saveSubscription = async (payload) => {
    const result = subscriptionState.record
      ? await run({ action: 'saveSubscription', subscription_id: subscriptionState.record.id, ...payload })
      : await run({ action: 'saveSubscription', ...payload });
    if (result) setSubscriptionState(closed);
  };

  const saveFlow = async (payload) => {
    const result = flowState.record
      ? await run({ action: 'saveFlow', flow_id: flowState.record.id, ...payload })
      : await run({ action: 'saveFlow', ...payload });
    if (result) setFlowState(closed);
  };

  const saveRule = async (payload) => {
    const result = ruleState.record
      ? await run({ action: 'saveRule', rule_id: ruleState.record.id, ...payload })
      : await run({ action: 'saveRule', ...payload });
    if (result) setRuleState(closed);
  };

  const saveConnector = async (payload) => {
    const result = connectorState.record
      ? await run({ action: 'saveConnector', connector_id: connectorState.record.id, ...payload })
      : await run({ action: 'saveConnector', ...payload });
    if (result) setConnectorState(closed);
  };

  const actions = data.canConfigure ? (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#A100FF] px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50"
        onClick={() => { setActionError(''); setPublishOpen(true); }}
        disabled={loading || !data.eventTypes.length}
      >
        <Send className="h-4 w-4" /> Publish event
      </button>
    </div>
  ) : null;

  const tabs = (
    <Tabs defaultValue="deliveries">
      <TabsList className="flex-wrap">
        <TabsTrigger value="deliveries">Deliveries ({data.counts.messages ?? 0})</TabsTrigger>
        <TabsTrigger value="subscriptions">Subscriptions ({data.counts.subscriptions ?? 0})</TabsTrigger>
        <TabsTrigger value="flows">Flows ({data.counts.flows ?? 0})</TabsTrigger>
        <TabsTrigger value="rules">Rules ({data.counts.rules ?? 0})</TabsTrigger>
        <TabsTrigger value="catalogue">Event catalogue ({data.counts.eventTypes ?? 0})</TabsTrigger>
        <TabsTrigger value="connectors">Connectors ({data.counts.connectors ?? 0})</TabsTrigger>
      </TabsList>

      {error && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
      {actionError && data.canConfigure && (
        <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{actionError}</p>
      )}

      <TabsContent value="deliveries" className="mt-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading deliveries…</p>
        ) : (
          <MessageTable
            messages={data.messages}
            busy={busy}
            onOpen={openMessage}
            onRetry={(row) => run({ action: 'retryMessage', message_id: row.id })}
            onReplay={(row) => run({ action: 'replayMessage', message_id: row.id })}
          />
        )}
      </TabsContent>

      <TabsContent value="subscriptions" className="mt-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading subscriptions…</p>
        ) : (
          <SubscriptionTable
            subscriptions={data.subscriptions}
            canConfigure={data.canConfigure}
            onNew={() => { setActionError(''); setSubscriptionState({ open: true, record: null }); }}
            onEdit={(row) => { setActionError(''); setSubscriptionState({ open: true, record: row }); }}
            onStatus={(row, status) => run({ action: 'setSubscriptionStatus', subscription_id: row.id, status })}
          />
        )}
      </TabsContent>

      <TabsContent value="flows" className="mt-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading flows…</p>
        ) : (
          <FlowTable
            flows={data.flows}
            canConfigure={data.canConfigure}
            onNew={() => { setActionError(''); setFlowState({ open: true, record: null }); }}
            onEdit={(row) => { setActionError(''); setFlowState({ open: true, record: row }); }}
            onValidate={(row) => ask({
              title: `Validate ${row.name} v${row.version}`,
              description: 'Validation checks every step against the workflows that really exist. Editing the steps afterwards clears this validation, so changed steps can never be published on an old check.',
              noteLabel: 'What you checked',
              submitLabel: 'Validate flow',
              submit: ({ note }) => run({ action: 'validateFlow', flow_id: row.id, note }),
            })}
            onPublish={(row) => ask({
              title: `Publish ${row.name} v${row.version}`,
              description: 'A published flow is immutable and can become a delivery target. Opening a new version later leaves this one exactly as it is.',
              noteLabel: 'Publication note',
              submitLabel: 'Publish flow',
              submit: ({ note }) => run({ action: 'publishFlow', flow_id: row.id, note }),
            })}
            onStatus={(row, status) => run({ action: 'setFlowStatus', flow_id: row.id, status })}
            onRevise={(row) => ask({
              title: `New version of ${row.name}`,
              description: `This opens version ${Number(row.version || 1) + 1} as a draft. Version ${row.version} stays live until the new version is validated and published.`,
              noteLabel: 'What changes in this version',
              submitLabel: 'Open new version',
              submit: ({ note }) => run({ action: 'reviseFlow', flow_id: row.id, note }),
            })}
          />
        )}
      </TabsContent>

      <TabsContent value="rules" className="mt-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading rules…</p>
        ) : (
          <RuleTable
            rules={data.rules}
            canConfigure={data.canConfigure}
            onNew={() => { setActionError(''); setRuleState({ open: true, record: null }); }}
            onEdit={(row) => { setActionError(''); setRuleState({ open: true, record: row }); }}
            onStatus={(row, status) => run({ action: 'setRuleStatus', rule_id: row.id, status })}
          />
        )}
      </TabsContent>

      <TabsContent value="catalogue" className="mt-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading the event catalogue…</p>
        ) : (
          <EventCatalogTable
            eventTypes={data.eventTypes}
            canConfigure={data.canConfigure}
            onNew={() => { setActionError(''); setEventTypeState({ open: true, record: null }); }}
            onEdit={(row) => { setActionError(''); setEventTypeState({ open: true, record: row }); }}
            onRetire={(row) => ask({
              title: `Retire ${row.name}`,
              description: 'A retired event type cannot carry new events. Deliveries already recorded stay on file.',
              noteLabel: 'Why this event type is retired',
              submitLabel: 'Retire event type',
              submit: ({ note }) => run({ action: 'retireEventType', event_type_id: row.id, note }),
            })}
          />
        )}
      </TabsContent>

      <TabsContent value="connectors" className="mt-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading connectors…</p>
        ) : (
          <ConnectorTable
            connectors={data.connectors}
            canManage={data.canManageConnectors}
            onNew={() => { setActionError(''); setConnectorState({ open: true, record: null }); }}
            onEdit={(row) => { setActionError(''); setConnectorState({ open: true, record: row }); }}
            onStatus={(row, status) => run({ action: 'setConnectorStatus', connector_id: row.id, status })}
          />
        )}
      </TabsContent>
    </Tabs>
  );

  return (
    <>
      <ModuleShell
        title="Enterprise Automation Fabric"
        subtitle="Events validated against a declared contract, redacted before they are stored, routed into existing published workflows, and kept with every attempt and failure reason."
        icon={Workflow}
        moduleKey="automation-fabric"
        workspaceKey="automation-fabric"
        search={null}
        actions={actions}
        insight={<FabricKpiStrip counts={data.counts} />}
        tabs={tabs}
      >
        <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p className="text-xs font-bold text-amber-900">
            The fabric does not run a second workflow engine. A delivery that reaches a published workflow starts it through the same launcher the Workflow Studio uses, so the run, its steps and its evidence are recorded once, in one place.
          </p>
        </div>
      </ModuleShell>

      <EventTypeDialog
        open={eventTypeState.open}
        onOpenChange={(open) => setEventTypeState(open ? eventTypeState : closed)}
        eventType={eventTypeState.record}
        catalogue={data.catalogue}
        busy={busy}
        error={actionError}
        onSave={saveEventType}
      />

      <SubscriptionDialog
        open={subscriptionState.open}
        onOpenChange={(open) => setSubscriptionState(open ? subscriptionState : closed)}
        subscription={subscriptionState.record}
        eventTypes={data.eventTypes}
        workflows={data.workflowTargets}
        flows={data.flows}
        connectors={data.connectors}
        defaults={data.defaults}
        busy={busy}
        error={actionError}
        onSave={saveSubscription}
      />

      <FlowDialog
        open={flowState.open}
        onOpenChange={(open) => setFlowState(open ? flowState : closed)}
        flow={flowState.record}
        eventTypes={data.eventTypes}
        workflows={data.workflowTargets}
        busy={busy}
        error={actionError}
        onSave={saveFlow}
      />

      <RuleDialog
        open={ruleState.open}
        onOpenChange={(open) => setRuleState(open ? ruleState : closed)}
        rule={ruleState.record}
        eventTypes={data.eventTypes}
        workflows={data.workflowTargets}
        flows={data.flows}
        busy={busy}
        error={actionError}
        onSave={saveRule}
      />

      <ConnectorDialog
        open={connectorState.open}
        onOpenChange={(open) => setConnectorState(open ? connectorState : closed)}
        connector={connectorState.record}
        eventTypes={data.eventTypes}
        defaults={data.defaults}
        busy={busy}
        error={actionError}
        onSave={saveConnector}
      />

      <PublishEventDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        eventTypes={data.eventTypes}
        connectors={data.connectors}
        busy={busy}
        error={actionError}
        onPublish={publish}
      />

      <MessageDialog
        open={messageState.open}
        onOpenChange={(open) => setMessageState(open ? messageState : { open: false, id: '', detail: null, loading: false })}
        detail={messageState.detail}
        loading={messageState.loading}
        busy={busy}
        onRetry={(message) => { run({ action: 'retryMessage', message_id: message.id }); }}
        onReplay={(message) => { run({ action: 'replayMessage', message_id: message.id }); }}
      />

      <DecisionDialog
        open={decision.open}
        onOpenChange={(open) => (open ? setDecision(decision) : closeDecision())}
        title={decision.config?.title}
        description={decision.config?.description}
        noteLabel={decision.config?.noteLabel}
        options={[]}
        submitLabel={decision.config?.submitLabel}
        busy={busy}
        error={actionError}
        onSubmit={submitDecision}
      />
    </>
  );
}