import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

export default function LandingCTA({ onBookDemo }) {
  return (
    <section id="final-cta" className="w-full scroll-mt-20">
      <Reveal
        className="overflow-hidden rounded-3xl p-[3px] shadow-2xl"
        style={{
          background: 'linear-gradient(120deg, #0072FF 0%, #0A2B6D 28%, #5A00D6 62%, #FF2E9A 100%)',
        }}
      >
        <div
          className="relative overflow-hidden rounded-[21px] px-6 py-10 sm:px-10 sm:py-12 text-white"
          style={{
            background: 'linear-gradient(125deg, #0A2B6D 0%, #0072FF 40%, #5A00D6 75%, #FF2E9A 100%)',
          }}
        >
          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Left 7 Columns: Headline & Value Proposition */}
            <div className="lg:col-span-7 text-left space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-[#00C6FF]" />
                <span>14-Day Free Trial · Full 46-Module Access</span>
              </span>

              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Ready to Transform Compliance?
              </h2>

              <p className="max-w-2xl text-base sm:text-lg font-medium leading-relaxed text-white/90">
                Manage compliance, workforce, participants and business operations from one connected platform.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-bold text-white/90">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#00C6FF]" />
                  46 Connected Modules
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#00C6FF]" />
                  356 NDIS Audit Checkpoints
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#00C6FF]" />
                  100+ Tailored NDIS &amp; HR Documents
                </span>
              </div>
            </div>

            {/* Right 5 Columns: Action Buttons & Executive Trust Card */}
            <div className="lg:col-span-5 flex flex-col justify-center gap-3.5 rounded-2xl border border-white/25 bg-white/15 p-6 backdrop-blur-md shadow-xl">
              <button
                type="button"
                onClick={() => onBookDemo && onBookDemo('Book a Personal Demo')}
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-white bg-white px-6 py-4 text-base font-extrabold text-[#0A2B6D] shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <Calendar className="h-5 w-5 text-[#5A00D6]" />
                <span>Book a Demo</span>
              </button>

              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-white/40 bg-[#0A2B6D] px-6 py-4 text-base font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0A2B6D]/90"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5 text-[#00C6FF]" />
              </Link>

              <div className="flex items-center justify-center gap-2 pt-1 text-xs font-bold text-white/90">
                <ShieldCheck className="h-4 w-4 text-[#00C6FF]" />
                <span>Set up in minutes · Dedicated Australian onboarding support</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}