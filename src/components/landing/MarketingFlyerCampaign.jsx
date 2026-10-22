import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Printer, Copy, Mail, CheckCircle2, ShieldCheck,
  ClipboardCheck, CalendarDays, Layers, ArrowRight, Zap, Building2,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const HEADER_GRADIENT =
  'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';
const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

export const CAMPAIGN_FLYERS = [
  {
    id: 'flyer-super-platform',
    badge: 'CAMPAIGN FLYER #1 · FLAGSHIP SUPER-PLATFORM',
    headline: 'The World’s #1 All-In-One NDIS, HR, Safety & Compliance Super-Platform',
    subheadline: 'Replace 8 Disconnected Software Subscriptions ($4,080+/mo) With One Smart Enhanced Platform',
    priceCallout: 'From $660/mo (Includes +$160/mo Elite Plan & $355 Master Audit Doc FREE) · 14-Day $0 Trial',
    accent: '#2563eb',
    points: [
      '45 Connected Modules + 16 Communication Centre Modulars in One Login',
      'Dual Interactive Workspace: Executive Office Wall View + General Profile Data View',
      'Includes $160/mo Elite Plan (2,500 Message Credits & 20,000 Integration Credits)',
      '100+ Automated Backend Functions & 65+ 24/7 Compliance Workflows',
      '100-Point Staff Screening, NDIS Price Guide Invoicing, Smart Rostering & LMS Academy',
    ],
    cta: 'Start Your 14-Day $0 Upfront Free Trial Today at ComplianceHR Infinity',
  },
  {
    id: 'flyer-master-audit',
    badge: 'CAMPAIGN FLYER #2 · ALL 125+ 2026 DOCS & PRINTED BINDERS',
    headline: 'Every Document Needed for 2026 Compliance — Digital OR Printed, Bound & Delivered!',
    subheadline: '125+ Policies, Contracts, Intake Packs, Consents, Risk Forms & 356-Checkpoint Audit Checklists',
    priceCallout: '$355 Audit Doc ($495 Printed) · $1,495 All 125+ Digital Docs (FREE in App Plan) · $2,490 Printed 6-Binder Box Set!',
    accent: '#7c3aed',
    points: [
      'All 125+ 2026 NDIS, HR, WHS, Participant, Finance & Governance Documents Included Free in Monthly Plans',
      'Need Hard Copies? Order the 6-Binder Professionally Printed, Tab-Indexed & Laminated Office Box Set ($2,490)',
      'Active Monthly App Subscribers get the 6-Binder Printed Box Set for just $995 (Print & Courier Only!)',
      'Includes Printed Participant Welcome Folders, Staff 100-Point HR Folders, Take-5 Books & Wall Posters',
      'Includes Both Executive Gold (CHR-AUD-001) & Infinity Purple (CHR-AUD-002) 356-Checkpoint Audit Checklists',
    ],
    cta: 'Order Your Printed 6-Binder Compliance Box Set or Claim Digital Suite Free in Plan',
  },
  {
    id: 'flyer-smart-docs',
    badge: 'CAMPAIGN FLYER #3 · 2026 SMART-FILL DOCS & AUDITOR PORTAL',
    headline: 'Zero-Stress NDIS & HR Audits With 2026 Smart-Fill Compliant Documents',
    subheadline: 'Auto-Fill Organisation, Staff & Participant Records Into 2026 Compliant Forms in 1 Click',
    priceCallout: 'Consent-Gated External Auditor Portal + 45 Smart-Fill 2026 Document Templates',
    accent: '#db2777',
    points: [
      '1-Click Smart-Fill populates ABN, Key Personnel, Staff Screening & Participant NDIS Plans',
      'Service-Role Protected 3-Part Consents (Information Sharing, Advocacy & Medication)',
      '24-Hour & 5-Day NDIS Commission Reportable Incident Timers & Root-Cause Workflows',
      'Dedicated Read-Only External Auditor Portal filtered strictly by verified audit consent',
      'Digital Signatures, Policy Version Diffing & Staff Read-Receipt Acknowledgements',
    ],
    cta: 'Make Every Audit Effortless — Book a Demo or Start Your 14-Day Free Trial',
  },
  {
    id: 'flyer-meetings-tasks',
    badge: 'CAMPAIGN FLYER #4 · MASTERPIECE MEETINGS & TASK COMMAND',
    headline: 'Turn Every Meeting, Shift Note & Audit Finding Into Completed Action',
    subheadline: 'Masterpiece Meeting Centre + 16-Modular Comms Hub + Gamified Task Command Board',
    priceCallout: 'Automated 30-Completed-Task & 30-Action Batch PDF/CSV Reports Built In',
    accent: '#0d9488',
    points: [
      'Smart-Fill 2026 Meeting Agendas, Quorum, Formal Resolutions & Printable PDF Minutes',
      '1-Click Extract Meeting Decisions to Assigned Staff Tasks & Continuous Improvement',
      'Shared To-Do Command Board with Digital Supervisor Sign-Off & Season Leaderboard',
      'Professional Branded HTML Emails with Auto-Attached Business & Key Personnel Contacts',
      'Live Silver Screen Weather & NDIS Commission News + Instant Staff ID Badge Studio',
    ],
    cta: 'Unite Your Whole Team Under ComplianceHR Infinity — Try Free for 14 Days',
  },
];

export default function MarketingFlyerCampaign({ compact = false }) {
  const { toast } = useToast();
  const [selectedFlyerId, setSelectedFlyerId] = useState('all');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendingId, setSendingId] = useState(null);

  const visibleFlyers =
    selectedFlyerId === 'all'
      ? CAMPAIGN_FLYERS
      : CAMPAIGN_FLYERS.filter((f) => f.id === selectedFlyerId);

  const copyFlyerPitch = (flyer) => {
    const text = [
      `COMPLIANCEHR INFINITY — ${flyer.badge}`,
      `Complete Control. Greater Confidence. Brighter Success.`,
      ``,
      flyer.headline,
      flyer.subheadline,
      flyer.priceCallout,
      ``,
      ...flyer.points.map((p) => `✓ ${p}`),
      ``,
      flyer.cta,
      `Developer: Kristy Lee Whelan | 0402 165 668 | kristyleebatkin@live.com.au`,
    ].join('\n');
    navigator.clipboard?.writeText(text);
    toast({
      title: 'Campaign Flyer Pitch Copied!',
      description: 'Ready to paste into LinkedIn, Facebook, SMS, or email campaigns.',
    });
  };

  const emailFlyerCampaign = async (flyer) => {
    if (!recipientEmail.trim()) {
      toast({
        title: 'Enter recipient email',
        description: 'Type an email address in the campaign bar to send this flyer.',
        variant: 'destructive',
      });
      return;
    }
    setSendingId(flyer.id);
    try {
      const body = [
        `COMPLIANCEHR INFINITY — ${flyer.headline}`,
        `Complete Control. Greater Confidence. Brighter Success.`,
        ``,
        flyer.subheadline,
        flyer.priceCallout,
        ``,
        `KEY HIGHLIGHTS:`,
        ...flyer.points.map((p) => `• ${p}`),
        ``,
        flyer.cta,
        ``,
        `Software: ComplianceHR Infinity`,
        `Developer: Kristy Lee Whelan | 0402 165 668 | kristyleebatkin@live.com.au`,
      ].join('\n');
      await base44.functions.invoke('sendAppEmail', {
        to: recipientEmail.trim(),
        subject: `ComplianceHR Infinity Campaign: ${flyer.headline}`,
        body,
      });
      toast({
        title: 'Marketing Flyer Sent!',
        description: `Emailed "${flyer.headline}" to ${recipientEmail.trim()}.`,
      });
    } catch (err) {
      toast({
        title: 'Campaign ready to share',
        description: err?.message || 'Copied pitch to clipboard so you can share anywhere.',
      });
      copyFlyerPitch(flyer);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <section
      id="marketing-flyer-campaign"
      className="rounded-2xl border-2 border-purple-600 bg-white p-2 sm:p-3 shadow-md space-y-2"
    >
      {/* Top Header — App Gradient + Crisp White Body Font */}
      <div
        className="app-section-card-header flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 text-white shadow-sm"
        style={{ background: HEADER_GRADIENT }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-9 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 shadow">
            <Image
              src={CHR_LOGO}
              alt="ComplianceHR Infinity"
              fittingType="fit"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-body text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                ComplianceHR Infinity · Ready-to-Launch Marketing Flyer Campaign Studio
              </span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 font-body text-[8px] font-black text-white">
                4 PRINT &amp; DIGITAL CAMPAIGN FLYERS · 1-CLICK SHARE &amp; PDF PRINT
              </span>
            </div>
            <p className="font-body text-[8.5px] font-bold text-white">
              Promote &amp; sell your Smart Enhanced All-In-One Subscriptions ($660–$1,035/mo including +$160/mo Elite Plan) &amp; the $355 Master Compliance Audit Checklist.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-body text-[8px] font-black text-blue-950 shadow-sm hover:bg-pink-50"
          >
            <Printer className="h-3 w-3 text-pink-600" /> Print / Save Flyers as PDF
          </button>
        </div>
      </div>

      {/* Campaign Controls & Direct Email Dispatcher */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-xl border border-purple-200 bg-purple-50/50 p-1.5">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedFlyerId('all')}
            className={`rounded-full px-2.5 py-0.5 font-body text-[7.8px] font-extrabold ${
              selectedFlyerId === 'all'
                ? 'text-white shadow-sm'
                : 'border border-purple-200 bg-white text-blue-950 hover:bg-purple-100'
            }`}
            style={selectedFlyerId === 'all' ? { background: HEADER_GRADIENT } : undefined}
          >
            All 4 Campaign Flyers
          </button>
          {CAMPAIGN_FLYERS.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFlyerId(f.id)}
              className="rounded-full px-2.5 py-0.5 font-body text-[7.8px] font-extrabold"
              style={
                selectedFlyerId === f.id
                  ? { background: f.accent, color: '#ffffff' }
                  : { background: '#ffffff', color: f.accent, border: `1px solid ${f.accent}55` }
              }
            >
              Flyer #{i + 1}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="Enter prospect/team email to send flyer…"
            className="h-6 w-52 rounded-full border border-purple-300 bg-white px-2.5 font-body text-[8px] font-bold text-blue-950 placeholder:text-purple-400 focus:outline-none"
          />
        </div>
      </div>

      {/* 4 High-Impact Promotional Flyers Grid */}
      <div
        className={`grid grid-cols-1 ${
          selectedFlyerId === 'all' ? 'md:grid-cols-2' : 'md:grid-cols-1'
        } gap-2`}
      >
        {visibleFlyers.map((flyer) => (
          <div
            key={flyer.id}
            className="flex flex-col justify-between overflow-hidden rounded-2xl border-2 bg-white shadow-md"
            style={{ borderColor: flyer.accent }}
          >
            {/* Flyer Top Header Band — App Gradient + White Body Font */}
            <div>
              <div
                className="app-section-card-header px-3 py-2 text-white"
                style={{ background: HEADER_GRADIENT }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white/20 px-2 py-0.5 font-body text-[7.5px] font-black uppercase tracking-wider text-white">
                    {flyer.badge}
                  </span>
                  <span className="font-body text-[7.5px] font-extrabold text-white">
                    ComplianceHR Infinity · 2026 Campaign
                  </span>
                </div>
                <h3 className="mt-1 font-body text-xs sm:text-sm font-black leading-snug text-white">
                  {flyer.headline}
                </h3>
                <p className="mt-0.5 font-body text-[8px] font-bold text-white">
                  {flyer.subheadline}
                </p>
              </div>

              {/* Flyer Body with Official Logo & Value Proposition */}
              <div className="p-2.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-purple-200 bg-gradient-to-r from-blue-50/70 via-white to-pink-50/70 p-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-purple-200 bg-white p-0.5 shadow-sm">
                      <Image
                        src={CHR_LOGO}
                        alt="ComplianceHR Infinity"
                        fittingType="fit"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-body text-[9px] font-black text-blue-950">
                        Software: ComplianceHR Infinity
                      </div>
                      <div className="font-body text-[7.5px] font-extrabold text-purple-800">
                        Complete Control. Greater Confidence. Brighter Success.
                      </div>
                      <div className="font-body text-[7px] font-bold text-pink-700">
                        Developer: Kristy Lee Whelan · 0402 165 668 · kristyleebatkin@live.com.au
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price / Offer Callout Ribbon */}
                <div
                  className="rounded-lg px-2.5 py-1 font-body text-[8px] font-black text-white shadow-sm text-center"
                  style={{ background: flyer.accent }}
                >
                  {flyer.priceCallout}
                </div>

                {/* Bullet Points */}
                <ul className="space-y-1">
                  {flyer.points.map((pt) => (
                    <li
                      key={pt}
                      className="flex items-start gap-1.5 font-body text-[8px] font-bold leading-snug text-blue-950"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        style={{ color: flyer.accent }}
                      />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Flyer Footer Bar + 1-Click Campaign Actions */}
            <div className="border-t border-purple-100 bg-purple-50/40 px-2.5 py-2 space-y-1.5">
              <div className="font-body text-[7.8px] font-black text-blue-950 text-center">
                {flyer.cta}
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => copyFlyerPitch(flyer)}
                  className="flex items-center justify-center gap-1 rounded-lg border border-purple-300 bg-white px-2 py-1 font-body text-[7.5px] font-black text-purple-950 hover:bg-purple-100"
                >
                  <Copy className="h-2.5 w-2.5 text-purple-700" /> Copy Ad Text
                </button>
                <button
                  type="button"
                  disabled={sendingId === flyer.id}
                  onClick={() => emailFlyerCampaign(flyer)}
                  className="flex items-center justify-center gap-1 rounded-lg border border-blue-300 bg-white px-2 py-1 font-body text-[7.5px] font-black text-blue-950 hover:bg-blue-50"
                >
                  <Mail className="h-2.5 w-2.5 text-blue-700" />
                  {sendingId === flyer.id ? 'Sending…' : 'Email Flyer'}
                </button>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-1 rounded-lg px-2 py-1 font-body text-[7.5px] font-black text-white shadow-sm"
                  style={{ background: HEADER_GRADIENT }}
                >
                  Start $0 Trial <ArrowRight className="h-2.5 w-2.5 text-white" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}