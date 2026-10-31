import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

export default function LandingCTA({ onBookDemo }) {
  return (
    <section id="final-cta" className="w-full scroll-mt-20">
      <Reveal
        className="relative overflow-hidden rounded-3xl border border-indigo-900/20 px-6 py-10 sm:px-10 sm:py-12 text-white shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
        }}
      >
        <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 text-left space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              <span>14-Day Free Trial · Full 46-Module Access</span>
            </span>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight"
              style={{ color: '#FFFFFF' }}
            >
              Ready to Transform Compliance?
            </h2>

            <p className="max-w-2xl text-base sm:text-lg font-medium leading-relaxed text-slate-200">
              Manage compliance, workforce, participants and business operations from one connected platform.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-slate-200">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-indigo-300" />
                46 Connected Modules
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-indigo-300" />
                356 NDIS Audit Checkpoints
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-indigo-300" />
                100+ Tailored NDIS &amp; HR Documents
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-5 sm:p-6 backdrop-blur-md">
            <Link
              to="/register"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-indigo-600 px-5 py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg transition hover:bg-indigo-500"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5 shrink-0 text-white" />
            </Link>

            <button
              type="button"
              onClick={() => onBookDemo && onBookDemo('Book a Personal Demo')}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm sm:text-base font-semibold text-slate-900 shadow-lg transition hover:bg-slate-50"
            >
              <Calendar className="h-5 w-5 shrink-0 text-indigo-600" />
              <span>Book a Demo</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 pt-1 text-xs font-medium text-slate-200 text-center">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-indigo-300" />
              <span>Set up in minutes · Dedicated Australian support</span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}