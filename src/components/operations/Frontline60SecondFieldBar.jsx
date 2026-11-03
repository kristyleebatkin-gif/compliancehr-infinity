import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Zap, CheckCircle2, ShieldAlert, Send, Clock, HeartHandshake,
} from 'lucide-react';

export default function Frontline60SecondFieldBar() {
  const [participants, setParticipants] = useState([]);
  const [goals, setGoals] = useState([]);
  const [preShiftChecks, setPreShiftChecks] = useState({
    ppeAndEnvironmentSafe: true,
    consentAndSupportPlanRead: true,
    medicationAndRiskChecked: true,
  });
  const [form, setForm] = useState({
    participant_name: '',
    goal: '',
    note_summary: '',
    medication_supervised: 'No',
    incident_occurred: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [savedBanner, setSavedBanner] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [partRes, goalRes] = await Promise.all([
          base44.entities.ParticipantProfile.filter({}, { limit: 50 }).catch(() => ({ items: [] })),
          base44.entities.ParticipantGoalProgress.filter({}, { limit: 50 }).catch(() => ({ items: [] })),
        ]);
        if (cancelled) return;
        const pList = partRes?.items || [];
        const gList = goalRes?.items || [];
        setParticipants(pList);
        setGoals(gList);
        if (pList[0]?.full_name) {
          setForm((f) => ({ ...f, participant_name: pList[0].full_name }));
        }
        if (gList[0]?.goal_title || gList[0]?.title) {
          setForm((f) => ({ ...f, goal: gList[0].goal_title || gList[0].title }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const allPreShiftChecked =
    preShiftChecks.ppeAndEnvironmentSafe &&
    preShiftChecks.consentAndRiskChecked !== false &&
    preShiftChecks.consentAndSupportPlanRead &&
    preShiftChecks.medicationAndRiskChecked;

  const handleQuickLog = async (e) => {
    e.preventDefault();
    if (!form.note_summary.trim() || submitting) return;
    setSubmitting(true);
    setSavedBanner('');
    try {
      const me = await base44.auth.me().catch(() => null);
      const todayStr = new Date().toISOString().slice(0, 10);
      const timeStr = new Date().toTimeString().slice(0, 5);

      await base44.entities.CommunicationEntry.create({
        entry_kind: 'Shift Note',
        person_type: 'Participant',
        person_name: form.participant_name || 'Assigned Participant',
        note_type: '60-Second Rapid Field Shift Note',
        goal: form.goal || 'Daily Living & Independence Goal',
        medication_supervised: form.medication_supervised,
        subject: `Rapid Shift Note — ${form.participant_name || 'Participant'} (${todayStr})`,
        body: form.note_summary.trim(),
        issues_concerns: form.incident_occurred ? 'Incident flagged during shift — escalated to Incident Clinic' : 'None reported',
        entry_date: todayStr,
        entry_time: timeStr,
        sender_name: me?.full_name || 'Support Worker',
        sender_email: me?.email || '',
        lifecycle_status: 'Delivered',
        goal_note_created: Boolean(form.goal),
      });

      setForm((f) => ({ ...f, note_summary: '', incident_occurred: false }));
      setSavedBanner('60-Second Shift Note & Goal Progress logged to Communication Centre and Participant File.');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] shadow-md"
      style={{
        background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
      }}
    >
      <div className="flex flex-col gap-3 border-b border-white/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/20">
            <Zap className="h-4 w-4 text-[#00C6FF]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                Support Worker 60-Second Express Field Bar
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-400/30">
                <Clock className="h-3 w-3" />
                Zero-Friction Mobile Capture
              </span>
            </div>
            <p className="text-xs font-semibold text-white/85">
              Complete your 3-point pre-shift safety check and submit a goal-linked shift note in under 60 seconds.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/incidents/submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-rose-500"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Report Urgent Incident (24h SIRS/NDIS)</span>
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 space-y-3">
        {/* 3-Toggle Pre-Shift Check */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-200 bg-[#F0F7FF] px-3.5 py-2.5">
          <span className="text-xs font-extrabold text-[#0A2B6D] flex items-center gap-1.5">
            <HeartHandshake className="h-4 w-4 text-[#0072FF]" />
            Pre-Shift Safety &amp; Consent Verification:
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { key: 'ppeAndEnvironmentSafe', label: '1. Take-5 Site Safe' },
              { key: 'consentAndSupportPlanRead', label: '2. Support Plan & Consent Checked' },
              { key: 'medicationAndRiskChecked', label: '3. Medication & Risk Controls Active' },
            ].map((item) => (
              <label
                key={item.key}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-extrabold text-[#0A2B6D]"
              >
                <input
                  type="checkbox"
                  checked={preShiftChecks[item.key]}
                  onChange={(e) =>
                    setPreShiftChecks((s) => ({ ...s, [item.key]: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-sky-300 accent-[#0072FF]"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 60-Second Rapid Shift Note Form */}
        <form onSubmit={handleQuickLog} className="grid grid-cols-1 gap-2.5 md:grid-cols-12 items-end">
          <div className="md:col-span-3">
            <label className="block text-[11px] font-extrabold text-[#0A2B6D] mb-1">
              Participant
            </label>
            <input
              type="text"
              list="rapid-participants-list"
              value={form.participant_name}
              onChange={(e) => setForm((f) => ({ ...f, participant_name: e.target.value }))}
              placeholder="Participant name…"
              className="h-9 w-full rounded-lg border border-sky-200 bg-[#F8FAFC] px-2.5 text-xs font-semibold text-[#0A2B6D]"
            />
            <datalist id="rapid-participants-list">
              {participants.map((p) => (
                <option key={p.id} value={p.full_name} />
              ))}
            </datalist>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-extrabold text-[#0A2B6D] mb-1">
              Linked NDIS / Care Goal
            </label>
            <input
              type="text"
              list="rapid-goals-list"
              value={form.goal}
              onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
              placeholder="Goal progressed today…"
              className="h-9 w-full rounded-lg border border-sky-200 bg-[#F8FAFC] px-2.5 text-xs font-semibold text-[#0A2B6D]"
            />
            <datalist id="rapid-goals-list">
              {goals.map((g) => (
                <option key={g.id} value={g.goal_title || g.title} />
              ))}
            </datalist>
          </div>

          <div className="md:col-span-4">
            <label className="block text-[11px] font-extrabold text-[#0A2B6D] mb-1">
              60-Second Shift Outcome Note
            </label>
            <input
              type="text"
              required
              value={form.note_summary}
              onChange={(e) => setForm((f) => ({ ...f, note_summary: e.target.value }))}
              placeholder="Supports delivered, participant choice exercised & outcome…"
              className="h-9 w-full rounded-lg border border-sky-200 bg-[#F8FAFC] px-2.5 text-xs font-semibold text-[#0A2B6D]"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting || !allPreShiftChecked}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#0A2B6D] px-3 text-xs font-extrabold text-white transition hover:bg-[#0072FF] disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5 text-[#00C6FF]" />
              <span>{submitting ? 'Saving…' : 'Log Shift Note'}</span>
            </button>
          </div>
        </form>

        {savedBanner && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-extrabold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{savedBanner}</span>
          </div>
        )}
      </div>
    </section>
  );
}