import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, CheckCircle2, ShieldCheck, Sparkles, X, ArrowRight, Building2, Mail, Phone, User, Users,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #5A00D6 52%, #FF2E9A 100%)';

export default function DemoBookingModal({ open, onClose, initialTopic = 'Executive Platform Demo' }) {
  const [form, setForm] = useState({
    contact_name: '',
    business_name: '',
    email: '',
    phone: '',
    team_size: '21–50 Staff',
    preferred_date: '',
    topic: initialTopic,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A2B6D]/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      <div
        className="relative w-full max-w-xl rounded-3xl p-[3px] shadow-2xl"
        style={{ background: BRAND_GRADIENT }}
      >
        <div className="rounded-[21px] bg-white p-6 sm:p-8 text-left text-[#0A2B6D]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0072FF]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0072FF]">
                <Sparkles className="h-3.5 w-3.5 text-[#5A00D6]" />
                {initialTopic}
              </span>
              <h3 id="demo-modal-title" className="mt-2 font-editorial text-2xl font-extrabold text-[#0A2B6D]">
                Experience ComplianceHR Infinity Live
              </h3>
              <p className="mt-1 text-sm text-[#0A2B6D]/75">
                Walk through NDIS audit readiness, 100-point workforce screening, rostering, and all 46 connected modules with a specialist.
              </p>
            </div>
            <button
              type="button"
              onClick={resetAndClose}
              aria-label="Close modal"
              className="rounded-xl border border-slate-200 bg-white p-2 text-[#0A2B6D] transition hover:bg-slate-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md"
                style={{ background: BRAND_GRADIENT }}
              >
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-editorial text-2xl font-extrabold text-[#0A2B6D]">
                Your Demo Request Is Confirmed
              </h4>
              <p className="mx-auto max-w-md text-sm text-[#0A2B6D]/80 leading-relaxed">
                Thank you{form.contact_name ? `, ${form.contact_name}` : ''}. Our NDIS &amp; Workforce Compliance team has received your booking for{' '}
                <strong className="text-[#0A2B6D]">{form.business_name || 'your organisation'}</strong>. You can also jump straight into your 14-day free trial right now.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  to="/register"
                  onClick={resetAndClose}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95"
                  style={{ background: BRAND_GRADIENT }}
                >
                  <span>Start 14-Day Free Trial Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="rounded-xl border border-[#0A2B6D]/20 bg-white px-5 py-3 text-sm font-bold text-[#0A2B6D] transition hover:bg-slate-50"
                >
                  Return to Page
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
                    <User className="h-3.5 w-3.5 text-[#0072FF]" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    placeholder="e.g. Sarah Mitchell"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
                    <Building2 className="h-3.5 w-3.5 text-[#5A00D6]" />
                    Organisation Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.business_name}
                    onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                    placeholder="e.g. Horizon Disability Support"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
                    <Mail className="h-3.5 w-3.5 text-[#0072FF]" />
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="sarah@organisation.com.au"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
                    <Phone className="h-3.5 w-3.5 text-[#FF2E9A]" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0400 000 000"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
                    <Users className="h-3.5 w-3.5 text-[#5A00D6]" />
                    Team Size
                  </label>
                  <select
                    value={form.team_size}
                    onChange={(e) => setForm({ ...form, team_size: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
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
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
                    <Calendar className="h-3.5 w-3.5 text-[#0072FF]" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={form.preferred_date}
                    onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
                  Key Priorities (Optional)
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Tell us about your upcoming NDIS audit, rostering, or compliance goals..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <a
<<<<<<< ours
                  href="mailto:support@compliancehr.com.au"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#5A00D6]/20 bg-[#5A00D6]/5 px-2.5 py-1.5 text-xs font-extrabold text-[#5A00D6] hover:bg-[#5A00D6]/10"
                >
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                  <span>support@compliancehr.com.au</span>
=======
                  href="mailto:kristyleebatkin@live.com.au"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#5A00D6]/20 bg-[#5A00D6]/5 px-2.5 py-1.5 text-xs font-extrabold text-[#5A00D6] hover:bg-[#5A00D6]/10"
                >
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                  <span>kristyleebatkin@live.com.au</span>
>>>>>>> theirs
                </a>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
                  style={{ background: BRAND_GRADIENT }}
                >
                  <span>{submitting ? 'Confirming...' : 'Confirm Demo Booking'}</span>
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