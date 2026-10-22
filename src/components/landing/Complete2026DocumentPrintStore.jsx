import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Printer, PackageCheck, FileText, ShieldCheck, CheckCircle2,
  ShoppingCart, Sparkles, Truck, BookOpen, Layers, ArrowRight, Mail, Copy,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const HEADER_GRADIENT =
  'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';
const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

/**
 * Every Document Needed for Compliance in 2026 — Organized into 6 Complete Binders (125+ Documents)
 */
export const COMPLETE_2026_BINDERS = [
  {
    id: 'binder-1',
    binderNumber: 'Binder 1',
    title: 'Governance, Policies & NDIS Practice Standards Suite (28 Docs)',
    color: '#4f46e5',
    digitalIncluded: 'Included in App & Digital Suite',
    singleBinderPrintPrice: 440,
    docs: [
      'Master Compliance Audit Checklist (CHR-AUD-001 & CHR-AUD-002 · 17 Categories · 356 Checkpoints)',
      'Complete 2026 NDIS Practice Standards Policy & Procedure Manual (All 8 Core Modules)',
      'Corporate Governance Charter, Conflict of Interest & Delegations Matrix',
      'Privacy, Dignity, Confidentiality & Notifiable Data Breach (NDB) Response Plan',
      'Continuous Improvement Register (CIR), Internal Audit Schedule & Board Report Templates',
    ],
  },
  {
    id: 'binder-2',
    binderNumber: 'Binder 2',
    title: 'Human Resources, 100-Point Staff Files & Training Suite (24 Docs)',
    color: '#7c3aed',
    digitalIncluded: 'Included in App & Digital Suite',
    singleBinderPrintPrice: 420,
    docs: [
      '2026 Fair Work & NDIS Compliant Employment Contracts (Full-Time, Part-Time, Casual)',
      'Support Worker, Team Leader & Key Personnel Position Descriptions',
      '100-Point Staff File Checklist, NDIS Worker Screening, Blue Card & Police Check Logs',
      'Staff Onboarding & Induction Pack, Code of Conduct & Buddy Shift Sign-Off Forms',
      '360° Annual Performance Appraisal, Supervision Log & Volunteer Placement Deeds',
    ],
  },
  {
    id: 'binder-3',
    binderNumber: 'Binder 3',
    title: 'Participant Intake, Service Agreements, Plans & Consents (26 Docs)',
    color: '#db2777',
    digitalIncluded: 'Included in App & Digital Suite',
    singleBinderPrintPrice: 440,
    docs: [
      '2026 NDIS Participant Service Agreement & Schedule of Supports',
      'Complete Participant Intake Pack, Easy-Read Charter of Rights & Welcome Handbook',
      '3-Part Informed Consent Forms (Information Sharing, Advocacy & Medication Supervision)',
      'Individual Support Plan, Goal Attainment Tracker & 10-Weekly / 3-Monthly Review Forms',
      'Daily Shift Progress Notes, MAR Medication Charts & Safe Transition/Exit Plans',
    ],
  },
  {
    id: 'binder-4',
    binderNumber: 'Binder 4',
    title: 'Incidents, WHS Risk Matrix, Emergency Plans & Drills (22 Docs)',
    color: '#dc2626',
    digitalIncluded: 'Included in App & Digital Suite',
    singleBinderPrintPrice: 420,
    docs: [
      'NDIS Reportable Incident 24-Hour & 5-Day Notification Forms + Root-Cause Investigation',
      'Enterprise, Individual & Home Environment 6-Monthly Risk Assessment Forms',
      'Hierarchy of Controls Register, Pre-Shift Take-5 Safety Booklets & Vehicle Safety Checks',
      'Emergency & Disaster Management Plan + Personal Emergency Evacuation Plans (PEEPs)',
      '6-Monthly Fire Drill Log, First Aid / Disaster Kit Checklists, Chemical MSDS & Visitor Sign-In Book',
    ],
  },
  {
    id: 'binder-5',
    binderNumber: 'Binder 5',
    title: 'Rostering, NDIS Price Guide Invoicing, Quotes & Procurement (14 Docs)',
    color: '#16a34a',
    digitalIncluded: 'Included in App & Digital Suite',
    singleBinderPrintPrice: 360,
    docs: [
      'Weekly Roster Sign-Off Sheets, Shift Exception Logs & Staff Availability Forms',
      '2026 NDIS Price Guide Compliant Tax Invoice & Claim Reconciliation Templates',
      'Itemised NDIS Service Quote Templates & Participant Budget Utilisation Statements',
      'Approved Supplier Vetting Form, Purchase Orders & 3-Way Match Verification Sheets',
      'Expense Reimbursement Vouchers, Receipt Logs & Payroll Variation Sign-Offs',
    ],
  },
  {
    id: 'binder-6',
    binderNumber: 'Binder 6',
    title: 'Meetings, Communications, Easy-Read Visuals & 45 SOP Manuals (15 Docs)',
    color: '#0891b2',
    digitalIncluded: 'Included in App & Digital Suite',
    singleBinderPrintPrice: 390,
    docs: [
      '2026 Governance Board & Staff Meeting Agendas, Quorum & Formal Resolution Minutes',
      'Complaints & Feedback Register, Procedural Fairness Forms & Satisfaction Surveys',
      'Easy-Read Visual Daily Routines, Communication Symbol Boards & Auslan Prompt Cards',
      'Complete Step-by-Step Standard Operating Procedure (SOP) Manuals for All 45 Modules',
      'Laminated Wall Posters (Emergency Numbers, Complaints Pathway, NDIS Charter of Rights)',
    ],
  },
];

/**
 * 2026 Compliance Document & Professional Print Ordering Packages
 * Pricing carefully accounts for high-grade colour printing, heavy-duty binders,
 * custom mylar tab dividers, lamination, staff assembly time, packaging & tracked courier shipping.
 */
export const PRINT_AND_DOCUMENT_PACKAGES = [
  {
    id: 'audit-checklist-digital',
    badge: 'DIGITAL AUDIT DOC',
    name: '1. Digital 2026 Master Compliance Audit Checklist (CHR-AUD-001 & 002)',
    format: 'Instant Digital Smart-Fill & Printable PDF (11 Pages · 17 Categories · 356 Checkpoints)',
    docPrice: 355,
    printFee: 0,
    totalPrice: 355,
    subNote: 'OR $0 (INCLUDED FREE) with any Monthly App Subscription ($660–$1,035/mo)',
    color: '#6d28d9',
    highlights: [
      'Both Executive Gold (CHR-AUD-001) & Infinity Purple (CHR-AUD-002) editions',
      '17 Audit Categories & 356 Checkpoints across 11 pages',
      'Interactive Yes / No / N/A ticks + unlimited self-printing licence',
    ],
  },
  {
    id: 'audit-checklist-printed',
    badge: 'PRINTED & BOUND BINDER',
    name: '2. Printed & Tab-Indexed Master Compliance Audit Checklist Binder',
    format: 'Heavyweight 160gsm Full-Colour Print + Tabbed Audit Presentation Binder + Courier Delivery',
    docPrice: 355,
    printFee: 140,
    totalPrice: 495,
    subNote: '$355 Audit Checklist + $140 Professional Colour Printing, Binding & Express Shipping',
    color: '#d97706',
    highlights: [
      'Professionally printed in full vibrant colour on heavyweight 160gsm paper',
      'Presented in a wipe-clean Executive Audit Ring Binder with 17 category tabs',
      'Includes laminated Compliance Status Key & Express Tracked Courier Delivery',
    ],
  },
  {
    id: 'all-2026-docs-digital',
    badge: 'ALL 125+ DIGITAL DOCS',
    name: '3. Complete 2026 Digital Compliance Document Library (All 6 Binders · 125+ Docs)',
    format: 'Every Document Needed for 2026 Compliance (Policies, HR, Participant, WHS, Finance & SOPs)',
    docPrice: 1495,
    printFee: 0,
    totalPrice: 1495,
    subNote: 'OR $0 (100% INCLUDED FREE) inside every Smart Enhanced Monthly App Subscription!',
    color: '#2563eb',
    highlights: [
      'All 125+ 2026-compliant policies, contracts, intake packs, consents, risk forms & SOPs',
      '1-Click Smart-Fill with your organisation name, ABN, logo & key personnel',
      'Includes the $355 Master Compliance Audit Checklist (CHR-AUD-001 & 002)',
    ],
  },
  {
    id: 'all-2026-docs-printed-box',
    badge: 'MOST POPULAR PRINT PACK · 6 BINDERS DELIVERED',
    name: '4. Complete 2026 Printed & Tab-Indexed Master Compliance 6-Binder Office Box Set',
    format: 'All 125+ Compliance Documents Professionally Printed, Tab-Indexed & Delivered in 6 Arch Binders',
    docPrice: 1495,
    printFee: 995,
    totalPrice: 2490,
    subNote: '$1,495 Full 125+ Doc Suite + $995 Commercial Colour Printing, 6 Binders, Lamination & Courier',
    color: '#db2777',
    featured: true,
    highlights: [
      'We do all the printing, sorting, hole-punching, mylar tab-indexing & binder assembly for you',
      '6 Heavy-Duty Colour-Coded Arch Lever Binders (Governance, HR, Participants, Safety, Finance, SOPs)',
      'Custom-branded with your Business Name, ABN & Logo on every cover spine & document header',
      'Includes 10 Pre-Printed Participant Intake Folders + 10 Staff Onboarding Folders + Laminated Wall Posters',
    ],
  },
  {
    id: 'subscriber-print-upgrade',
    badge: 'FOR MONTHLY APP SUBSCRIBERS',
    name: '5. App Subscriber Print-Only Upgrade (6 Printed Binders + Wall Posters Delivered)',
    format: 'Already on a $660–$1,035/mo Plan? Your Digital Docs are Free — Only Pay for Printing & Delivery!',
    docPrice: 0,
    printFee: 995,
    totalPrice: 995,
    subNote: 'Digital Suite is $0 for App Subscribers — $995 covers 1,200+ colour pages, 6 binders & courier!',
    color: '#0d9488',
    highlights: [
      'Exclusive rate for active ComplianceHR Infinity Monthly Subscribers ($660–$1,035/mo)',
      'Covers commercial colour printing of all 125+ documents (1,200+ pages), 6 binders & tabs',
      'Includes Laminated Emergency/Rights Wall Posters + 20 Laminated Staff ID Badges & Lanyards',
    ],
  },
  {
    id: 'custom-print-refill',
    badge: 'PRINT REFILL PACK',
    name: '6. Printed Onboarding & Safety Station Refill Pack (20 Folders + Visitor/Take-5 Books)',
    format: '10 Participant Welcome Folders + 10 Staff HR Folders + 5 Take-5 Books + Visitor Sign-In Book',
    docPrice: 250,
    printFee: 240,
    totalPrice: 490,
    subNote: '$250 Document Pack + $240 Printing, Folder Presentation & Tracked Delivery',
    color: '#16a34a',
    highlights: [
      '10 Printed & Bound Participant Welcome, Service Agreement & 3-Part Consent Folders',
      '10 Printed & Bound Employee Onboarding, Contract & 100-Point Screening Folders',
      '5 Printed Pre-Shift Take-5 Safety Pocket Books + 1 Printed Reception Visitor Sign-In Register',
    ],
  },
];

export default function Complete2026DocumentPrintStore() {
  const { toast } = useToast();
  const [selectedPkgId, setSelectedPkgId] = useState('all-2026-docs-printed-box');
  const [orderForm, setOrderForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    shippingAddress: '',
    abn: '',
    quantity: 1,
    notes: 'Please custom-brand all printed headers and binder spines with our business details.',
  });
  const [submitting, setSubmitting] = useState(false);

  const selectedPkg =
    PRINT_AND_DOCUMENT_PACKAGES.find((p) => p.id === selectedPkgId) ||
    PRINT_AND_DOCUMENT_PACKAGES[3];

  const totalOrderAmount = selectedPkg.totalPrice * (Number(orderForm.quantity) || 1);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.businessName.trim() || !orderForm.email.trim()) {
      toast({
        title: 'Enter Business Name & Email',
        description: 'Please provide your business name and email so we can process your print/document order.',
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const summary = [
        `2026 COMPLIANCE DOCUMENT & PRINT ORDER`,
        `Package: ${selectedPkg.name}`,
        `Format: ${selectedPkg.format}`,
        `Quantity: ${orderForm.quantity}`,
        `Document Value: $${selectedPkg.docPrice} | Printing, Binding & Delivery: $${selectedPkg.printFee}`,
        `Total Order Investment: $${totalOrderAmount.toLocaleString()} AUD`,
        `Business: ${orderForm.businessName} (ABN: ${orderForm.abn || 'TBA'})`,
        `Contact: ${orderForm.contactName} | ${orderForm.phone} | ${orderForm.email}`,
        `Delivery Address: ${orderForm.shippingAddress || 'Digital / To be confirmed'}`,
        `Custom Branding Notes: ${orderForm.notes}`,
      ].join('\n');

      await base44.entities.FormSubmission.create({
        form_title: `2026 Document & Print Order — ${selectedPkg.name}`,
        category: '2026 Compliance Document & Print Order',
        submitted_by: `${orderForm.contactName || orderForm.businessName} (${orderForm.email})`,
        submitted_date: today,
        submission_method: 'Online',
        online_document: true,
        status: 'Submitted',
        review_outcome: 'Pending Review',
        submission_summary: summary,
        data: JSON.stringify({ package: selectedPkg, order: orderForm, totalOrderAmount }),
      }).catch(() => {});

      await base44.functions
        .invoke('sendAppEmail', {
          to: 'kristyleebatkin@live.com.au',
          subject: `New 2026 Document & Print Order ($${totalOrderAmount}): ${orderForm.businessName}`,
          body: summary,
        })
        .catch(() => {});

      toast({
        title: '2026 Compliance Document & Print Order Logged!',
        description: `Order for "${selectedPkg.name}" ($${totalOrderAmount.toLocaleString()}) has been recorded.`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="complete-2026-docs-print-store"
      className="scroll-mt-14 rounded-2xl border-2 border-purple-600 bg-white p-2 sm:p-3 shadow-md space-y-2.5"
    >
      {/* Top Header Banner — App Colours + White Body Font */}
      <div
        className="app-section-card-header flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 text-white shadow-sm"
        style={{ background: HEADER_GRADIENT }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 shadow">
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
                Every Document Needed for 2026 Compliance · Digital Smart-Fill &amp; Professional Printed Binder Ordering
              </span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 font-body text-[8px] font-black text-white">
                125+ COMPLIANT 2026 DOCUMENTS · 6 PRINTED ARCH BINDERS · DELIVERED TO YOUR DOOR
              </span>
            </div>
            <p className="font-body text-[8.5px] font-bold text-white">
              Not just the app and not just audit checklists — get EVERY 2026 policy, contract, intake pack, consent, risk form, register &amp; SOP manual digitally or professionally printed, bound &amp; shipped!
            </p>
          </div>
        </div>

        <a
          href="#order-print-pack-form"
          className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-body text-[8px] font-black text-blue-950 shadow-sm hover:bg-pink-50"
        >
          <Printer className="h-3 w-3 text-pink-600" /> Order Printed Binders or Digital Pack
        </a>
      </div>

      {/* Why Print Pricing Matters Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-center rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-50/80 via-white to-purple-50/80 p-2">
        <div className="lg:col-span-8 flex items-start sm:items-center gap-2">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow"
            style={{ background: HEADER_GRADIENT }}
          >
            <Printer className="h-4 w-4 text-white" />
          </span>
          <div>
            <div className="font-body text-[10.5px] font-black text-blue-950">
              Why Our Printed Hard-Copy Packages Include Dedicated Commercial Print, Binding &amp; Courier Pricing
            </div>
            <p className="font-body text-[8px] font-semibold leading-snug text-blue-950">
              Printing 1,200+ full-colour pages across **125+ 2026-compliant documents**, assembling **6 heavy-duty Arch Lever Binders** with custom mylar tab dividers, laminating emergency &amp; charter wall posters, and shipping via tracked courier requires real commercial printing &amp; labour. Our pricing transparently separates the **Digital Document Value** (which is **100% FREE** inside every monthly app subscription!) from the **Professional Printing, Binding &amp; Delivery Service ($140–$995)**.
            </p>
          </div>
        </div>
        <div className="lg:col-span-4 grid grid-cols-3 gap-1 text-center">
          <div className="rounded-lg border border-purple-300 bg-white p-1.5">
            <div className="font-editorial text-sm font-black text-purple-900">125+</div>
            <div className="font-body text-[6.8px] font-extrabold uppercase text-blue-950">2026 Compliant Docs</div>
          </div>
          <div className="rounded-lg border border-pink-300 bg-white p-1.5">
            <div className="font-editorial text-sm font-black text-pink-700">6 Binders</div>
            <div className="font-body text-[6.8px] font-extrabold uppercase text-blue-950">Printed &amp; Tabbed</div>
          </div>
          <div className="rounded-lg border border-emerald-300 bg-white p-1.5">
            <div className="font-editorial text-sm font-black text-emerald-700">$0 Digital</div>
            <div className="font-body text-[6.8px] font-extrabold uppercase text-blue-950">In Monthly Plans</div>
          </div>
        </div>
      </div>

      {/* What's Inside the 6 Complete 2026 Compliance Binders (125+ Documents) */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-1 px-1">
          <span className="font-body text-[9.5px] font-black uppercase tracking-wider text-blue-950">
            What You Get: All 6 Complete 2026 Compliance Binders (125+ Smart-Fill &amp; Print-Ready Documents)
          </span>
          <span className="font-body text-[7.8px] font-extrabold text-purple-800">
            Order Individual Binders ($360–$440 Printed) or the Full 6-Binder Office Box Set
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {COMPLETE_2026_BINDERS.map((b) => (
            <div
              key={b.id}
              className="flex flex-col justify-between overflow-hidden rounded-xl border-2 bg-white shadow-sm"
              style={{ borderColor: b.color }}
            >
              <div>
                <div
                  className="app-section-card-header flex items-center justify-between gap-1.5 px-2.5 py-1.5 text-white"
                  style={{ background: HEADER_GRADIENT }}
                >
                  <span className="rounded-full bg-white/20 px-2 py-0.5 font-body text-[7.5px] font-black uppercase text-white">
                    {b.binderNumber}
                  </span>
                  <span className="font-body text-[7.5px] font-extrabold text-white">
                    Single Printed Binder: ${b.singleBinderPrintPrice}
                  </span>
                </div>
                <div className="p-2 space-y-1">
                  <h4 className="font-body text-[10px] font-black text-blue-950 leading-snug">
                    {b.title}
                  </h4>
                  <ul className="space-y-0.5">
                    {b.docs.map((d) => (
                      <li
                        key={d}
                        className="flex items-start gap-1 font-body text-[7.4px] font-bold leading-tight text-blue-950"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-3 w-3 shrink-0"
                          style={{ color: b.color }}
                        />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="border-t border-purple-100 bg-purple-50/40 px-2 py-1 flex items-center justify-between">
                <span className="font-body text-[7px] font-extrabold text-emerald-800">
                  ✓ {b.digitalIncluded}
                </span>
                <a
                  href="#order-print-pack-form"
                  onClick={() => setSelectedPkgId('all-2026-docs-printed-box')}
                  className="rounded px-2 py-0.5 font-body text-[7px] font-black text-white"
                  style={{ background: b.color }}
                >
                  Order Printed
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6 Clear Pricing & Print Ordering Options */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-1 px-1">
          <span className="font-body text-[9.5px] font-black uppercase tracking-wider text-blue-950">
            2026 Document &amp; Professional Print Pricing (Covers Printing, Heavy-Duty Binders, Tabs, Lamination &amp; Delivery)
          </span>
          <span className="font-body text-[7.8px] font-extrabold text-pink-700">
            Click any package to load it into the Order &amp; Quote Form below
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {PRINT_AND_DOCUMENT_PACKAGES.map((pkg) => {
            const isSelected = selectedPkgId === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPkgId(pkg.id)}
                className={`cursor-pointer flex flex-col justify-between rounded-xl border-2 bg-white p-2 shadow-sm transition-all ${
                  isSelected || pkg.featured ? 'ring-2 ring-pink-500 shadow-md' : ''
                }`}
                style={{
                  borderColor: pkg.color,
                  borderTopWidth: '4px',
                  background: `linear-gradient(155deg, ${pkg.color}12 0%, #ffffff 85%)`,
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="rounded-full px-2 py-0.5 font-body text-[6.8px] font-black uppercase tracking-wider text-white"
                      style={{ background: pkg.featured ? HEADER_GRADIENT : pkg.color }}
                    >
                      {pkg.badge}
                    </span>
                    {pkg.printFee > 0 ? (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 font-body text-[6.8px] font-black text-amber-950">
                        Includes ${pkg.printFee} Print &amp; Post
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-body text-[6.8px] font-black text-emerald-950">
                        Digital Download
                      </span>
                    )}
                  </div>

                  <h4 className="mt-1 font-body text-[10px] font-black text-blue-950 leading-snug">
                    {pkg.name}
                  </h4>
                  <p className="font-body text-[7.3px] font-bold text-purple-800 leading-tight">
                    {pkg.format}
                  </p>

                  {/* Transparent Price Breakdown */}
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="font-editorial text-xl sm:text-2xl font-black text-blue-950">
                      ${pkg.totalPrice.toLocaleString()}
                    </span>
                    <span className="font-body text-[7.3px] font-extrabold text-purple-900">
                      AUD {pkg.printFee > 0 ? '(Printed & Delivered)' : '(Instant Digital)'}
                    </span>
                  </div>
                  <div className="rounded border border-purple-200 bg-white/90 px-1.5 py-0.5 font-body text-[7px] font-extrabold text-blue-950">
                    {pkg.subNote}
                  </div>

                  <ul className="mt-1.5 space-y-0.5">
                    {pkg.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-1 font-body text-[7.3px] font-bold leading-tight text-blue-950"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-3 w-3 shrink-0"
                          style={{ color: pkg.color }}
                        />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-2 pt-1 border-t border-purple-100 flex items-center justify-between gap-1">
                  <a
                    href="#order-print-pack-form"
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className="flex-1 text-center rounded-lg px-2 py-1 font-body text-[7.8px] font-black text-white shadow-sm"
                    style={{ background: isSelected ? HEADER_GRADIENT : pkg.color }}
                  >
                    {isSelected ? '✓ Selected for Order below' : 'Select & Order This Pack'}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive 2026 Compliance Document & Print Order Form */}
      <form
        id="order-print-pack-form"
        onSubmit={handleSubmitOrder}
        className="overflow-hidden rounded-2xl border-2 border-pink-500 bg-white shadow-md"
      >
        <div
          className="app-section-card-header flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-white"
          style={{ background: HEADER_GRADIENT }}
        >
          <div className="flex items-center gap-1.5">
            <ShoppingCart className="h-4 w-4 text-white" />
            <h3 className="font-body text-xs sm:text-sm font-black uppercase tracking-wider text-white">
              2026 Compliance Document &amp; Printed Binder Ordering Desk
            </h3>
          </div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-body text-[8px] font-black text-white">
            Selected: {selectedPkg.name} (${totalOrderAmount.toLocaleString()} AUD)
          </span>
        </div>

        <div className="p-2.5 space-y-2 text-[8px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="md:col-span-2">
              <label className="font-extrabold text-blue-950">Select 2026 Document / Print Package *</label>
              <select
                value={selectedPkgId}
                onChange={(e) => setSelectedPkgId(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-purple-300 bg-purple-50/50 px-2 py-1.5 font-bold text-blue-950"
              >
                {PRINT_AND_DOCUMENT_PACKAGES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${p.totalPrice.toLocaleString()} AUD
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-extrabold text-blue-950">Business / Provider Name *</label>
              <input
                type="text"
                required
                value={orderForm.businessName}
                onChange={(e) => setOrderForm({ ...orderForm, businessName: e.target.value })}
                placeholder="Your Business Name (for printed headers)"
                className="mt-0.5 w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 font-bold text-blue-950"
              />
            </div>
            <div>
              <label className="font-extrabold text-blue-950">ABN (Printed on Every Document)</label>
              <input
                type="text"
                value={orderForm.abn}
                onChange={(e) => setOrderForm({ ...orderForm, abn: e.target.value })}
                placeholder="XX XXX XXX XXX"
                className="mt-0.5 w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 font-bold text-blue-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <label className="font-extrabold text-blue-950">Contact Person</label>
              <input
                type="text"
                value={orderForm.contactName}
                onChange={(e) => setOrderForm({ ...orderForm, contactName: e.target.value })}
                placeholder="Full Name"
                className="mt-0.5 w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 font-bold text-blue-950"
              />
            </div>
            <div>
              <label className="font-extrabold text-blue-950">Email Address *</label>
              <input
                type="email"
                required
                value={orderForm.email}
                onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                placeholder="you@provider.com.au"
                className="mt-0.5 w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 font-bold text-blue-950"
              />
            </div>
            <div>
              <label className="font-extrabold text-blue-950">Phone Number</label>
              <input
                type="tel"
                value={orderForm.phone}
                onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                placeholder="04XX XXX XXX"
                className="mt-0.5 w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 font-bold text-blue-950"
              />
            </div>
            <div>
              <label className="font-extrabold text-blue-950">Number of Office Sets</label>
              <input
                type="number"
                min={1}
                max={50}
                value={orderForm.quantity}
                onChange={(e) => setOrderForm({ ...orderForm, quantity: Number(e.target.value) || 1 })}
                className="mt-0.5 w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 font-bold text-blue-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="font-extrabold text-blue-950">
                Courier Delivery Address (for Printed Binders &amp; Laminated Posters)
              </label>
              <input
                type="text"
                value={orderForm.shippingAddress}
                onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
                placeholder="Street Address, Suburb, State, Postcode"
                className="mt-0.5 w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 font-semibold text-blue-950"
              />
            </div>
            <div>
              <label className="font-extrabold text-blue-950">Custom Logo &amp; Branding Instructions</label>
              <input
                type="text"
                value={orderForm.notes}
                onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                className="mt-0.5 w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 font-semibold text-blue-950"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-purple-200 bg-purple-50/50 p-2">
            <div className="font-body text-[8.5px] font-black text-blue-950">
              Order Summary: <span className="text-purple-800">{selectedPkg.name}</span> × {orderForm.quantity} ={' '}
              <span className="text-pink-700 text-sm">${totalOrderAmount.toLocaleString()} AUD</span>{' '}
              <span className="text-[7.5px] font-bold text-blue-900">
                (Docs: ${selectedPkg.docPrice * orderForm.quantity} + Commercial Printing, Binders &amp; Courier: ${selectedPkg.printFee * orderForm.quantity})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 rounded-lg border border-purple-400 bg-white px-2.5 py-1.5 font-body text-[8px] font-black text-purple-950 hover:bg-purple-100"
              >
                <Printer className="h-3 w-3 text-purple-700" /> Print Order Quote
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1 rounded-lg px-3.5 py-1.5 font-body text-[8.5px] font-black text-white shadow-sm"
                style={{ background: HEADER_GRADIENT }}
              >
                <PackageCheck className="h-3.5 w-3.5 text-white" />
                {submitting
                  ? 'Submitting Order…'
                  : `Submit 2026 Document & Print Order ($${totalOrderAmount.toLocaleString()})`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}