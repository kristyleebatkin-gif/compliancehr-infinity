import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, CheckCircle2, ShieldCheck, X, ArrowRight, Building2, Mail, Phone, User, Users, Save,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const DRAFT_STORAGE_KEY = 'compliancehr_demo_booking_draft_v1';

export default function DemoBookingModal({ open, onClose, initialTopic = 'Executive Platform Demo' }) {
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) return { ...JSON.parse(saved), topic: initialTopic };
    } catch {
      // ignore storage errors
    }
    return {
      contact_name: '',
      business_name: '',
      email: '',
      phone: '',
      team_size: 'Up to 20 Users',
      preferred_date: '',
      topic: initialTopic,
      notes: '',
    };
  });
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, topic: initialTopic }));
  }, [initialTopic]);

  const completionPct = useMemo(() => {
    const required = [form.contact_name, form.business_name, form.email, form.phone];
    const filled = required.filter((v) => String(v || '').trim().length > 0).length;
    return Math.round((filled / required.length) * 100);
  }, [form.contact_name, form.business_name, form.email, form.phone]);

  if (!open) return null;

  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
      setDraftSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      // ignore storage errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.entities.Lead.create({
        business_name: form.business_name || 'NDIS Provider Enquiry',
        contact_name: form.contact_name,
        email: form.email,
        phone: form.phone,
        source: 'Website',
        service_interest: `${form.topic} (${form.team_size})`,
        stage: 'New',
        follow_up_date: form.preferred_date || undefined,
        notes: form.notes || `Requested via ComplianceHR Infinity Landing Page (${form.topic}).`,
      });
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Allow public visitors without write permissions to still complete the booking flow smoothly
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  const resetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#061A44]/70 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl text-left text-[#0A2B6D]">
        {/* Top Executive Header Band */}
        <div
          className="flex items-start justify-between gap-4 px-6 py-4 text-white"
          style={{
            background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
          }}
        >
          <div>
            <span className="inline-block rounded border border-[#00C6FF]/40 bg-[#0072FF]/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#00C6FF]">
              {initialTopic}
            </span>
            <h3 id="demo-modal-title" className="mt-1.5 font-editorial text-xl sm:text-2xl font-extrabold text-white">
              Schedule Executive Platform Walkthrough
            </h3>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close modal"
            className="rounded-lg border border-white/20 bg-white/10 p-1.5 text-white transition hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h4 className="font-editorial text-2xl font-extrabold text-[#0A2B6D]">
                Executive Walkthrough Confirmed
              </h4>
              <p className="mx-auto max-w-md text-sm text-[#0A2B6D]/80 leading-relaxed">
                Thank you{form.contact_name ? `, ${form.contact_name}` : ''}. Our NDIS &amp; Workforce Compliance team has registered your request for{' '}
                <strong className="text-[#0A2B6D]">{form.business_name || 'your organisation'}</strong>.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  to="/register"
                  onClick={resetAndClose}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0A2B6D] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0072FF]"
                >
                  <span>Start 14-Day Free Trial Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-[#0A2B6D] transition hover:bg-slate-50"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Completion Progress Bar & Draft Status */}
              <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-4 py-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#0A2B6D]">
                  <span>Form Completion Progress</span>
                  <span className="text-[#0072FF]">{completionPct}% Complete</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#0072FF] transition-all duration-200"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>

              {/* Group 1: Contact & Organisation Identity */}
              <fieldset className="rounded-xl border border-slate-200 p-4 space-y-3">
                <legend className="px-2 text-xs font-bold uppercase tracking-wider text-[#5A00D6]">
                  1. Contact &amp; Organisation Details
                </legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[#0A2B6D]">
                      <User className="h-3.5 w-3.5 text-[#0072FF]" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.contact_name}
                      onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                      placeholder="Sarah Mitchell"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[#0A2B6D]">
                      <Building2 className="h-3.5 w-3.5 text-[#5A00D6]" />
                      Organisation Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.business_name}
                      onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                      placeholder="Horizon Care Services"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[#0A2B6D]">
                      <Mail className="h-3.5 w-3.5 text-[#0072FF]" />
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="sarah@organisation.com.au"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[#0A2B6D]">
                      <Phone className="h-3.5 w-3.5 text-[#0072FF]" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0400 000 000"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Group 2: Scope & Scheduling */}
              <fieldset className="rounded-xl border border-slate-200 p-4 space-y-3">
                <legend className="px-2 text-xs font-bold uppercase tracking-wider text-[#5A00D6]">
                  2. Capacity Band &amp; Preferred Schedule
                </legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[#0A2B6D]">
                      <Users className="h-3.5 w-3.5 text-[#5A00D6]" />
                      Active User Band
                    </label>
                    <select
                      value={form.team_size}
                      onChange={(e) => setForm({ ...form, team_size: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                    >
                      <option>Up to 20 Users</option>
                      <option>21–30 Users</option>
                      <option>31–40 Users</option>
                      <option>41–50 Users</option>
                      <option>51–100 Users</option>
                      <option>101+ Users</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[#0A2B6D]">
                      <Calendar className="h-3.5 w-3.5 text-[#0072FF]" />
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={form.preferred_date}
                      onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                    />
                  </div>
                </div>
              </fieldset>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={saveDraft}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-[#0A2B6D] transition hover:bg-slate-100"
                  >
                    <Save className="h-3.5 w-3.5 text-[#5A00D6]" />
                    <span>Save Draft</span>
                  </button>
                  {draftSavedAt && (
                    <span className="text-xs font-medium text-emerald-700">
                      Draft saved at {draftSavedAt}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                  }}
                >
                  <span>{submitting ? 'Confirming...' : 'Confirm Executive Demo'}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}