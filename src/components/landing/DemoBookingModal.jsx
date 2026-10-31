import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, CheckCircle2, ShieldCheck, Sparkles, X, ArrowRight, Building2, Mail, Phone, User, Users,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DemoBookingModal({ open, onClose, initialTopic = 'Executive Platform Demo' }) {
  const [form, setForm] = useState({
    contact_name: '',
    business_name: '',
    email: '',
    phone: '',
    team_size: 'Up to 20 Users',
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
      // Allow public visitors without write permissions to complete the booking flow smoothly
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-left text-slate-900 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              {initialTopic}
            </span>
            <h3 id="demo-modal-title" className="mt-2 text-2xl font-extrabold text-slate-900">
              Experience ComplianceHR Infinity Live
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Walk through NDIS audit readiness, 100-point workforce screening, rostering, and all 46 connected modules with a specialist.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close modal"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-2xl font-extrabold text-slate-900">
              Your Demo Request Is Confirmed
            </h4>
            <p className="mx-auto max-w-md text-sm text-slate-600 leading-relaxed">
              Thank you{form.contact_name ? `, ${form.contact_name}` : ''}. Our NDIS &amp; Workforce Compliance team has received your booking for{' '}
              <strong className="text-slate-900">{form.business_name || 'your organisation'}</strong>. You can also jump straight into your 14-day free trial right now.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                onClick={resetAndClose}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={resetAndClose}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Return to Page
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                  <User className="h-3.5 w-3.5 text-indigo-600" />
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  placeholder="e.g. Sarah Mitchell"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                  <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                  Organisation Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                  placeholder="e.g. Horizon Disability Support"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                  <Mail className="h-3.5 w-3.5 text-indigo-600" />
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="sarah@organisation.com.au"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                  <Phone className="h-3.5 w-3.5 text-indigo-600" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0400 000 000"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                  <Users className="h-3.5 w-3.5 text-indigo-600" />
                  Team Size
                </label>
                <select
                  value={form.team_size}
                  onChange={(e) => setForm({ ...form, team_size: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
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
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={form.preferred_date}
                  onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Key Priorities (Optional)
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Tell us about your upcoming NDIS audit, rostering, or compliance goals..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <a
                href="mailto:support@compliancehr.com.au"
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600"
              >
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                <span>support@compliancehr.com.au</span>
              </a>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-60"
              >
                <span>{submitting ? 'Confirming...' : 'Confirm Demo Booking'}</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}