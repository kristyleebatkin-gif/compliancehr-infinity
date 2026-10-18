import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

const PRICING_TIERS = [
  { users: 'Up to 20 users', monthly: '500', yearly: '6,000', featured: true },
  { users: '21–30 users', monthly: '563', yearly: '6,750' },
  { users: '31–40 users', monthly: '625', yearly: '7,500' },
  { users: '41–50 users', monthly: '688', yearly: '8,250' },
  { users: '51–100 users', monthly: '750', yearly: '9,000' },
  { users: '101+ users', monthly: '875', yearly: '10,500' },
];

const INCLUDED = [
  '14-day free trial',
  'Access to the complete ComplianceHR platform',
  'Role-based access for your team and participants',
  'Compliance records, reporting and audit tools',
  'Express two-minute audits with branded reports',
  'Incident, risk, training and document management',
];

export default function PricingSection() {
  return (
    <section id="pricing" className="mx-auto my-10 max-w-6xl scroll-mt-16 rounded-[2.5rem] border border-slate-200 bg-gradient-to-b from-white via-white to-violet-50/60 px-4 py-20 shadow-xl shadow-violet-500/10 dark:border-white/10 dark:from-card dark:via-card dark:to-violet-950/25 md:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-fuchsia-50/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-700 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300">
          <Sparkles className="h-3.5 w-3.5" />
          Start with a 14-day free trial
        </div>
        <h2 className="mt-5 font-editorial text-3xl font-medium tracking-tight text-foreground md:text-[2.6rem] md:leading-tight">
          Simple pricing that <span className="font-editorial-italic bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">grows with your team</span>
        </h2>
        <p className="mt-4 text-lg text-foreground/60">
          Choose monthly repayments on a 24-month lock-in agreement or pay yearly upfront. Every plan starts with a 14-day free trial.
        </p>
      </div>

      <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-card shadow-xl shadow-slate-900/5 dark:border-white/10">
        <div className="hidden grid-cols-[1.2fr_1fr_1fr] bg-slate-950 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white sm:grid dark:bg-slate-900">
          <div>Access users</div>
          <div>Monthly repayment</div>
          <div>Yearly upfront</div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/10">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.users}
              className="grid gap-4 px-5 py-5 transition-colors hover:bg-violet-50/50 dark:hover:bg-white/5 sm:grid-cols-[1.2fr_1fr_1fr] sm:items-center sm:px-6"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-foreground">{tier.users}</span>
                {tier.featured && (
                  <span className="rounded-full bg-slate-950 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white dark:bg-white dark:text-slate-950">
                    Starting plan
                  </span>
                )}
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-foreground/40 sm:hidden">
                  Monthly repayment
                </div>
                <div className="mt-1 sm:mt-0">
                  <span className="font-editorial text-3xl font-semibold text-foreground">${tier.monthly}</span>
                  <span className="text-sm text-foreground/50"> / month</span>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-foreground/40 sm:hidden">
                  Yearly upfront
                </div>
                <div className="mt-1 sm:mt-0">
                  <span className="font-editorial text-3xl font-semibold text-foreground">${tier.yearly}</span>
                  <span className="text-sm text-foreground/50"> / year</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-white/10 dark:bg-card/80 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div>
          <h3 className="font-editorial text-xl font-semibold text-foreground">Every plan includes</h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground/70">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Link
          to="/register"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl dark:bg-white dark:text-slate-950"
        >
          Start free trial
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-foreground/45">
        Monthly repayments require a 24-month lock-in agreement, with a yearly upfront option also available. All plans begin with a 14-day free trial. User tiers are based on the number of users with platform access.
      </p>
    </section>
  );
}