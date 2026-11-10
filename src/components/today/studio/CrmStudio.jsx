import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles, Copy, ArrowUpRight, Flame } from 'lucide-react';
import { Empty, money } from '@/components/today/todayUi';
import { readStore, writeStore, formatWhen } from '@/components/today/studio/studioStore';

const STAGES = ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
const STAGE_COLOUR = {
  New: '#0072ff',
  Contacted: '#5a00d6',
  'Proposal Sent': '#d68400',
  Negotiation: '#ff2e9a',
  Won: '#10a070',
  Lost: '#4b6392'
};

const today = () => new Date().toISOString().slice(0, 10);

export default function CrmStudio() {
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState(() => readStore('crm-notes', {}));
  const [advice, setAdvice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.entities.Lead.list({ sort: '-updated_date', limit: 200 })
      .then((page) => setLeads(Array.isArray(page) ? page : page?.items || []))
      .catch((err) => setError(err?.message || 'The pipeline could not be loaded.'));
  }, []);

  useEffect(() => {
    writeStore('crm-notes', notes);
  }, [notes]);

  const selected = (leads || []).find((lead) => lead.id === selectedId) || null;

  const pipeline = useMemo(() => {
    const rows = STAGES.map((stage) => ({ stage, count: 0, value: 0 }));
    (leads || []).forEach((lead) => {
      const row = rows.find((item) => item.stage === (lead.stage || 'New'));
      if (row) {
        row.count += 1;
        row.value += Number(lead.value || 0);
      }
    });
    return rows;
  }, [leads]);

  const hot = useMemo(() => {
    const limit = today();
    return (leads || [])
      .filter((lead) => lead.stage !== 'Won' && lead.stage !== 'Lost' && lead.follow_up_date && lead.follow_up_date <= limit)
      .sort((a, b) => String(a.follow_up_date).localeCompare(String(b.follow_up_date)))
      .slice(0, 6);
  }, [leads]);

  const openValue = useMemo(
    () => (leads || []).filter((lead) => lead.stage !== 'Won' && lead.stage !== 'Lost').reduce((sum, lead) => sum + Number(lead.value || 0), 0),
    [leads]
  );

  const askAdvice = async () => {
    if (!selected || busy) return;
    setBusy(true);
    setError('');
    setCopied(false);
    try {
      const res = await base44.functions.invoke('studioAi', {
        task: 'crm',
        lead: {
          name: selected.business_name,
          contact: selected.contact_name,
          interest: selected.service_interest,
          stage: selected.stage,
          value: selected.value,
          followUp: selected.follow_up_date,
          notes: notes[selected.id] || selected.notes
        }
      });
      setAdvice(res?.data || null);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'No guidance came back right now.');
    } finally {
      setBusy(false);
    }
  };

  const copyDraft = async () => {
    if (!advice) return;
    try {
      await navigator.clipboard.writeText(`Subject: ${advice.email_subject}\n\n${advice.email_body}`);
      setCopied(true);
    } catch {
      setError('Copying is blocked by this browser — select the text instead.');
    }
  };

  return (
    <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1fr)_330px]">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {pipeline.map((row) => (
            <div key={row.stage} className="t-card p-3">
              <p className="t-muted text-[10px] font-extrabold uppercase tracking-[0.12em]">{row.stage}</p>
              <p className="t-title mt-1 text-[19px] font-extrabold" style={{ color: STAGE_COLOUR[row.stage] }}>{row.count}</p>
              <p className="t-muted text-[10.5px] font-semibold">{money(row.value)}</p>
            </div>
          ))}
        </div>

        <div className="t-card p-3">
          <p className="t-title flex items-center gap-1.5 text-[13px] font-extrabold">
            <Flame className="h-3.5 w-3.5 text-[#ff2e9a]" /> Needs you today
          </p>
          <p className="t-muted mt-0.5 text-[11px]">Follow-ups that are due or overdue · open pipeline {money(openValue)}</p>
          {leads === null ? (
            <p className="t-muted mt-3 flex items-center gap-2 text-xs"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading pipeline…</p>
          ) : hot.length === 0 ? (
            <Empty>Nothing overdue — every follow-up is either done or not yet due.</Empty>
          ) : (
            <div className="mt-2 space-y-1">
              {hot.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(lead.id);
                    setAdvice(null);
                  }}
                  className="t-row flex w-full items-center gap-2 px-2 py-2 text-left"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: STAGE_COLOUR[lead.stage] || '#4b6392' }} />
                  <span className="min-w-0 flex-1">
                    <span className="t-title block truncate text-[12.5px] font-bold">{lead.business_name}</span>
                    <span className="t-muted block truncate text-[10.5px]">
                      {lead.contact_name || 'No contact'} · due {formatWhen(lead.follow_up_date)}
                    </span>
                  </span>
                  <span className="t-muted shrink-0 text-[10.5px] font-bold">{money(lead.value)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="t-card p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="t-title text-[13px] font-extrabold">All enquiries</p>
            <Link to="/crm" className="t-muted flex items-center gap-0.5 text-[11px] font-bold hover:underline">
              Open CRM hub <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {leads === null ? (
            <p className="t-muted mt-2 flex items-center gap-2 text-xs"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…</p>
          ) : leads.length === 0 ? (
            <Empty>No enquiries recorded yet. New website enquiries arrive here automatically.</Empty>
          ) : (
            <div className="mt-1.5 max-h-[230px] space-y-0.5 overflow-y-auto">
              {leads.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(lead.id);
                    setAdvice(null);
                  }}
                  className="t-row flex w-full items-center gap-2 px-2 py-1.5 text-left"
                  style={lead.id === selectedId ? { background: 'var(--t-hover)' } : undefined}
                >
                  <span className="min-w-0 flex-1">
                    <span className="t-title block truncate text-[12px] font-bold">{lead.business_name}</span>
                    <span className="t-muted block truncate text-[10px]">{lead.service_interest || lead.source || 'Enquiry'}</span>
                  </span>
                  <span className="t-pill t-pill-gray" style={{ color: STAGE_COLOUR[lead.stage] }}>{lead.stage || 'New'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {selected ? (
          <>
            <div className="t-card space-y-1.5 p-3">
              <p className="t-title text-[14px] font-extrabold">{selected.business_name}</p>
              <p className="t-muted text-[11.5px]">{selected.contact_name || 'No contact person'} {selected.phone ? `· ${selected.phone}` : ''}</p>
              <p className="t-muted text-[11.5px]">{selected.email || 'No email recorded'}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="t-pill t-pill-gray">{selected.stage || 'New'}</span>
                <span className="t-pill t-pill-blue">{money(selected.value)}</span>
                {selected.follow_up_date ? <span className="t-pill t-pill-amber">Due {formatWhen(selected.follow_up_date)}</span> : null}
              </div>
            </div>

            <div className="t-card space-y-1.5 p-3">
              <span className="studio-label">Your notes on this enquiry</span>
              <textarea
                value={notes[selected.id] || ''}
                onChange={(event) => setNotes((prev) => ({ ...prev, [selected.id]: event.target.value }))}
                rows={4}
                placeholder="What was said, what they need, what you promised…"
                className="studio-textarea"
              />
              <button type="button" onClick={askAdvice} disabled={busy} className="t-btn t-btn-primary w-full disabled:opacity-50">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} What should I do next?
              </button>
            </div>

            {advice ? (
              <div className="t-card space-y-2 p-3">
                <div>
                  <span className="studio-label">Next step</span>
                  <p className="t-title text-[12.5px] font-semibold leading-relaxed">{advice.next_step}</p>
                </div>
                <div>
                  <span className="studio-label">Draft follow-up</span>
                  <p className="t-title text-[12px] font-bold">{advice.email_subject}</p>
                  <p className="t-muted mt-1 max-h-[190px] overflow-y-auto whitespace-pre-wrap text-[12px] leading-relaxed">{advice.email_body}</p>
                </div>
                <button type="button" onClick={copyDraft} className="t-btn t-btn-ghost w-full">
                  <Copy className="h-3.5 w-3.5" /> {copied ? 'Copied' : 'Copy the email'}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="t-card p-3">
            <Empty>Pick an enquiry to see its detail, keep your notes and get a next step.</Empty>
          </div>
        )}

        {error ? <p className="text-[11px] font-semibold text-[#FF2E9A]">{error}</p> : null}
      </div>
    </div>
  );
}