import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  ShieldAlert, Clock, CheckCircle2, PlusCircle, ArrowRight, FileWarning, Sparkles,
} from 'lucide-react';

export default function StatutoryIncidentLifecycleChain({ incident, canEdit, onUpdated }) {
  const [linkedRisks, setLinkedRisks] = useState([]);
  const [linkedCapas, setLinkedCapas] = useState([]);
  const [creatingRisk, setCreatingRisk] = useState(false);
  const [creatingCapa, setCreatingCapa] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadLinkedRecords = async () => {
    if (!incident?.id) return;
    try {
      const [risksRes, capasRes] = await Promise.all([
        base44.entities.Risk.filter({ source_entity_id: incident.id }, { sort: '-created_date', limit: 10 }).catch(() => ({ items: [] })),
        base44.entities.QualityItem.filter({ source_record_id: incident.id }, { sort: '-created_date', limit: 10 }).catch(() => ({ items: [] })),
      ]);
      setLinkedRisks(risksRes?.items || []);
      setLinkedCapas(capasRes?.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLinkedRecords();
  }, [incident?.id]);

  const handleEscalateToRisk = async () => {
    if (!incident || creatingRisk) return;
    setCreatingRisk(true);
    setFeedbackMsg('');
    try {
      const rating =
        incident.severity === 'Critical' || incident.severity === 'High'
          ? incident.severity
          : 'Medium';
      await base44.entities.Risk.create({
        title: `Risk from Incident: ${incident.title}`,
        report_type: 'Risk',
        category: incident.category === 'Medical' || incident.category === 'Medication Error' ? 'Clinical' : 'Participant',
        rating,
        likelihood: 'Possible',
        consequence: rating === 'Critical' ? 'Severe' : rating === 'High' ? 'Major' : 'Moderate',
        status: 'Assessed',
        participant_id: incident.participant_id || '',
        participant_name: incident.participant_name || '',
        description: incident.description || `Escalated from Incident ${incident.incident_id || incident.id}`,
        hazards_identified: incident.hazards_identified || '',
        control_measures: incident.control_measures || incident.immediate_actions || '',
        source_entity_type: 'Incident',
        source_entity_id: incident.id,
        identified_date: new Date().toISOString().slice(0, 10),
      });
      await base44.functions
        .invoke('logUserAction', {
          action: 'Escalate Incident to Risk Register',
          entity_type: 'Incident',
          record_id: incident.id,
          record_title: incident.title,
        })
        .catch(() => {});
      await loadLinkedRecords();
      setFeedbackMsg('Linked Risk Register entry created and traceable to this incident.');
    } finally {
      setCreatingRisk(false);
    }
  };

  const handleCreateLinkedCapa = async () => {
    if (!incident || creatingCapa) return;
    setCreatingCapa(true);
    setFeedbackMsg('');
    try {
      const targetDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
      await base44.entities.QualityItem.create({
        title: `CAPA — Preventative Action for: ${incident.title}`,
        type: 'Corrective Action',
        source_type: 'Incident',
        source_record_id: incident.id,
        source: `Incident ${incident.incident_id || incident.id}`,
        ndis_standard: 'Core Module 2: Provider Governance & Operational Management (Incident Management)',
        aged_care_standard: incident.aged_care_standard || 'Standard 2: The Organisation',
        description:
          incident.control_measures ||
          incident.immediate_actions ||
          `Preventative corrective action raised from incident "${incident.title}".`,
        priority: incident.severity === 'Critical' || incident.severity === 'High' ? 'High' : 'Medium',
        status: 'In Progress',
        raised_by: incident.reported_by || 'Compliance Officer',
        raised_date: new Date().toISOString().slice(0, 10),
        target_date: targetDate,
      });
      await base44.functions
        .invoke('logUserAction', {
          action: 'Create Linked Quality CAPA from Incident',
          entity_type: 'Incident',
          record_id: incident.id,
          record_title: incident.title,
        })
        .catch(() => {});
      await loadLinkedRecords();
      if (onUpdated) onUpdated();
      setFeedbackMsg('Linked Continuous Improvement (CAPA) action created in the Quality Register.');
    } finally {
      setCreatingCapa(false);
    }
  };

  const step1Done = Boolean(incident?.immediate_actions || incident?.description);
  const step2Done =
    (!incident?.requires_ndis_report && !incident?.sirs_reportable) ||
    Boolean(incident?.initial_notified_at || incident?.sirs_notified_at);
  const step3Done = Boolean(incident?.participant_or_nominee_notified_at);
  const step4Done = linkedRisks.length > 0 || Boolean(incident?.risk_assessment);
  const step5Done = linkedCapas.length > 0 || incident?.status === 'Resolved' || incident?.status === 'Closed';

  const steps = [
    {
      num: 1,
      title: 'Triage & Immediate Safety',
      detail: step1Done ? 'Immediate safety actions documented' : 'Record immediate actions taken',
      done: step1Done,
    },
    {
      num: 2,
      title: 'Statutory 24h / 5d Notification',
      detail: incident?.requires_ndis_report
        ? incident?.initial_notified_at
          ? `NDIS Notified (${incident.ndis_commission_reference || 'Submitted'})`
          : 'NDIS 24h / 5-Day Report Pending'
        : incident?.sirs_reportable
        ? incident?.sirs_notified_at
          ? `SIRS Notified (${incident.sirs_priority})`
          : `Aged Care SIRS (${incident.sirs_priority || 'Priority 1'}) Pending`
        : 'Assessed — Non-Reportable Internally Managed',
      done: step2Done,
    },
    {
      num: 3,
      title: 'Participant / Nominee Open Disclosure',
      detail: step3Done
        ? `Notified: ${incident.participant_or_nominee_notified_at}`
        : 'Log open disclosure conversation with participant/nominee',
      done: step3Done,
    },
    {
      num: 4,
      title: 'Linked Risk Assessment',
      detail:
        linkedRisks.length > 0
          ? `${linkedRisks.length} Linked Risk Register record(s)`
          : 'Escalate hazard/risk to Risk Register',
      done: step4Done,
    },
    {
      num: 5,
      title: 'Preventative CAPA & Closure',
      detail:
        linkedCapas.length > 0
          ? `${linkedCapas.length} Linked Quality CAPA item(s)`
          : 'Create preventative CAPA in Quality Register',
      done: step5Done,
    },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-sm">
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-white"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-[#00C6FF]" />
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
              Closed-Loop Statutory Safeguard Chain
            </span>
            <h3 className="text-sm font-extrabold text-white">
              5-Stage Incident → Statutory Notice → Risk → Continuous Improvement (CAPA)
            </h3>
          </div>
        </div>

        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleEscalateToRisk}
              disabled={creatingRisk}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              <FileWarning className="h-3.5 w-3.5 text-amber-300" />
              <span>{creatingRisk ? 'Linking Risk…' : '1-Click Escalate to Risk'}</span>
            </button>

            <button
              type="button"
              onClick={handleCreateLinkedCapa}
              disabled={creatingCapa}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0072FF] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#00C6FF] hover:text-[#0A2B6D] disabled:opacity-50"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>{creatingCapa ? 'Creating CAPA…' : '1-Click Create Linked CAPA'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {feedbackMsg && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-extrabold text-emerald-900">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              {feedbackMsg}
            </span>
          </div>
        )}

        {/* 5-Stage Visual Step Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s) => (
            <div
              key={s.num}
              className={`rounded-xl border p-3 transition ${
                s.done
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-sky-200 bg-[#F0F7FF]/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0A2B6D] text-xs font-extrabold text-white">
                  {s.num}
                </span>
                {s.done ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-extrabold text-amber-800">
                    <Clock className="h-3 w-3 text-amber-600" />
                    Action
                  </span>
                )}
              </div>
              <div className="mt-2 text-xs font-extrabold text-[#0A2B6D]">{s.title}</div>
              <p className="mt-1 text-[11px] font-semibold leading-snug text-slate-600">
                {s.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Linked Traceability Records Summary */}
        {(linkedRisks.length > 0 || linkedCapas.length > 0) && (
          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#0A2B6D]">
                  Linked Risk Register Entries ({linkedRisks.length})
                </span>
                <Link
                  to="/risks"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0072FF] hover:underline"
                >
                  Open Risk Register <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="mt-2 space-y-1">
                {linkedRisks.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-xs border border-slate-200"
                  >
                    <span className="font-bold text-[#0A2B6D] truncate">{r.title}</span>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200">
                      {r.rating} · {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#0A2B6D]">
                  Linked Quality / CAPA Actions ({linkedCapas.length})
                </span>
                <Link
                  to="/quality"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0072FF] hover:underline"
                >
                  Open Quality Register <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="mt-2 space-y-1">
                {linkedCapas.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-xs border border-slate-200"
                  >
                    <span className="font-bold text-[#0A2B6D] truncate">{c.title}</span>
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-extrabold text-[#0072FF] border border-sky-200">
                      {c.type} · {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}