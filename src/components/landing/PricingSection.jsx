import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

const PRICING_TIERS = [
  { users: 'Up to 20 users', monthly: '200', yearly: '2,000', featured: true },
  { users: '21–30 users', monthly: '250', yearly: '2,500' },
  { users: '31–40 users', monthly: '300', yearly: '3,000' },
  { users: '41–50 users', monthly: '350', yearly: '3,500' },
  { users: '51–100 users', monthly: '450', yearly: '4,500' },
  { users: '101+ users', monthly: '600', yearly: '6,500' },
];

const INCLUDED = [
  '14-day free trial',
  'Access to the complete ComplianceHR platform',
  'Role-based access for your team and participants',
  'Compliance records, reporting and audit tools',
  'Incident, risk, training and document management',
];
const TIER_STYLES = [
  'from-violet-100/80 to-fuchsia-50 dark:from-violet-950/50 dark:to-fuchsia-950/30',
  'from-blue-100/80 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/30',
  'from-emerald-100/80 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/30',
  'from-amber-100/80 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/30',
  'from-pink-100/80 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/30',
  'from-indigo-100/80 to-violet-50 dark:from-indigo-950/50 dark:to-violet-950/30',
];

export default function PricingSection() {
  return (
    <section id="pricing" className="mx-auto my-8 max-w-6xl rounded-[2.5rem] border border-violet-200 bg-gradient-to-br from-violet-100 via-white to-cyan-100 px-4 py-20 shadow-xl shadow-violet-500/10 dark:border-violet-900 dark:from-violet-950/30 dark:via-background dark:to-cyan-950/30 md:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-fuchsia-500/20">
          <Sparkles className="h-3.5 w-3.5" />
          Start with a 14-day free trial
        </div>
        <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Simple pricing that grows with your team
        </h2>
        <p className="mt-4 text-lg text-foreground/60">
          Choose monthly repayments on a 12-month agreement or pay yearly upfront.
        </p>
      </div>

      <div className="mt-12 overflow-hidden rounded-2xl border border-violet-200 bg-card shadow-xl shadow-violet-500/5 dark:border-violet-900">
        <div className="hidden grid-cols-[1.2fr_1fr_1fr] bg-gradient-to-r from-violet-700 to-blue-600 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white sm:grid">
          <div>Access users</div>
          <div>Monthly repayment</div>
          <div>Yearly upfront</div>
        </div>
        <div className="divide-y divide-border/60">
          {PRICING_TIERS.map((tier, index) => (
            <div
              key={tier.users}
              className={`grid gap-4 bg-gradient-to-r px-5 py-5 transition-colors hover:brightness-[0.98] sm:grid-cols-[1.2fr_1fr_1fr] sm:items-center sm:px-6 ${TIER_STYLES[index]}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{tier.users}</span>
                {tier.featured && (
                  <span className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                    Starting plan
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-foreground/45 sm:hidden">
                  Monthly repayment
                </div>
                <div className="mt-1 sm:mt-0">
                  <span className="text-2xl font-bold text-foreground">${tier.monthly}</span>
                  <span className="text-sm text-foreground/50"> / month</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-foreground/45 sm:hidden">
                  Yearly upfront
                </div>
                <div className="mt-1 sm:mt-0">
                  <span className="text-2xl font-bold text-foreground">${tier.yearly}</span>
                  <span className="text-sm text-foreground/50"> / year</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 rounded-2xl border border-cyan-200 bg-gradient-to-r from-violet-100 via-blue-50 to-cyan-100 p-6 shadow-lg shadow-cyan-500/10 dark:border-cyan-900 dark:from-violet-950/30 dark:via-blue-950/20 dark:to-cyan-950/30 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">Every plan includes</h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground/70">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Link
          to="/register"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand/90"
        >
          Start free trial
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-foreground/45">
        Monthly repayments require a 12-month agreement. User tiers are based on the number of users with platform access.
      </p>
    </section>
  );
}