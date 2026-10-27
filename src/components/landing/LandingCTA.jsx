import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

export default function LandingCTA({ onBookDemo }) {
  return (
    <section id="final-cta" className="w-full scroll-mt-20 py-6">
      <Reveal
        className="overflow-hidden rounded-3xl p-[3px] shadow-2xl"
        style={{
          background: 'linear-gradient(120deg, #0072FF 0%, #0A2B6D 28%, #5A00D6 62%, #FF2E9A 100%)',
        }}
      >
        <div
          className="rounded-[21px] px-6 py-12 sm:px-12 sm:py-16 text-center text-white"
          style={{
            background: 'linear-gradient(125deg, #0A2B6D 0%, #0072FF 42%, #5A00D6 78%, #FF2E9A 100%)',
          }}
        >
          <div className="mx-auto max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#00C6FF]" />
              Start Your 14-Day Free Trial Today
            </span>

            <h2 className="font-editorial text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Ready to Transform Compliance?
            </h2>

            <p className="mx-auto max-w-2xl text-base sm:text-lg font-medium leading-relaxed text-white/90">
              Manage compliance, workforce, participants and business operations from one connected platform.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onBookDemo && onBookDemo('Book a Personal Demo')}
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-white bg-white px-7 py-4 text-base font-extrabold text-[#0A2B6D] shadow-lg transition hover:bg-slate-100"
              >
                <Calendar className="h-5 w-5 text-[#5A00D6]" />
                <span>Book a Personal Demo</span>
              </button>

              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-white/40 bg-[#0A2B6D]/90 px-7 py-4 text-base font-extrabold text-white shadow-lg transition hover:bg-[#0A2B6D]"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5 text-white" />
              </Link>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#00C6FF]" />
                All 46 Connected Modules Included
              </span>
              <span>•</span>
              <span>356 NDIS Audit Checkpoints</span>
              <span>•</span>
              <span>Dedicated Australian Onboarding Support</span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}