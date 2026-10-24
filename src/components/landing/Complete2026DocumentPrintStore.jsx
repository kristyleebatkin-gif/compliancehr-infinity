import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Printer, PackageCheck, FileText, ShieldCheck, CheckCircle2,
  ShoppingCart, Sparkles, Truck, BookOpen, Layers, ArrowRight, Mail, Copy, Download,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import Standard2026PrintableTemplatesSuite from '@/components/compliance/Standard2026PrintableTemplatesSuite';
import { downloadBusinessComplianceDocsBrochurePdf } from '@/lib/businessComplianceDocsBrochurePdf';

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
 * Professional Business Compliance Documents Package:
 * The ONLY standalone document package is $999 Outright OR $125/month on a 24-Month Business Subscription Plan
 * for Full Digital Suite Access (also included $0 free inside our $660–$1,035/mo Smart Enhanced App Plans).
 */
export const PRINT_AND_DOCUMENT_PACKAGES = [
  {
    id: 'all-2026-docs-digital',
    badge: 'OPTION 1 · $999 OUTRIGHT PURCHASE (FULL DIGITAL SUITE)',
    name: '1. Professional Business Compliance Documents Package — $999 Outright (Full Digital Suite · All 6 Binders · 125+ Docs)',
    format: 'Extensive Digital Suite Covering Almost Every Compliance Document to Help Complete Your Audits — One-Time $999 Outright Licence',
    docPrice: 999,
    monthlySubPrice: 125,
    monthlySubTermMonths: 24,
    printFee: 0,
    totalPrice: 999,
    priceDisplay: '$999 Outright',
    subNote: 'One-Time $999 Outright Purchase for Full Digital Suite Access (or choose $125/month on a 24-Month Business Subscription Plan)',
    color: '#2563eb',
    featured: true,
    highlights: [
      'Immediate lifetime digital access to all 6 Binders & 125+ extensive 2026 compliance documents',
      'Covers almost every document required to help your business prepare for and complete NDIS, HR & WHS audits',
      '1-Click Smart-Fill with your organisation name, ABN, logo & key personnel + Master Audit Checklists (CHR-AUD-001 & 002) included',
      'Check all relevant & specific regulatory requirements for your business so there is no doubt of your compliance audit outcome of success',
    ],
  },
  {
    id: 'all-2026-docs-digital-monthly',
    badge: 'OPTION 2 · $125/MONTH (24-MONTH SUBSCRIPTION PLAN)',
    name: '2. Professional Business Compliance Documents Package — $125/Month on a 24-Month Business Subscription Plan',
    format: 'Full Digital Suite Access (All 6 Binders · 125+ Extensive Audit & Compliance Documents) on a 24-Month Business Subscription Plan',
    docPrice: 125,
    monthlySubPrice: 125,
    monthlySubTermMonths: 24,
    printFee: 0,
    totalPrice: 125,
    priceDisplay: '$125 / month',
    subNote: '24-Month Business Subscription Plan for Full Digital Suite Access (or $999 Outright Purchase anytime)',
    color: '#7c3aed',
    featured: true,
    highlights: [
      'Just $125/month on a 24-month business subscription plan for immediate Day-1 full digital suite access',
      'Covers almost every compliance policy, contract, intake pack, consent, risk form, register & SOP manual',
      'Extensive documentation designed to help your team prepare for and complete NDIS, HR & WHS audits',
      'Review and verify all relevant & required items for your scope so there is no doubt of a successful audit outcome',
    ],
  },
];

export default function Complete2026DocumentPrintStore() {
  const { toast } = useToast();
  const [selectedPkgId, setSelectedPkgId] = useState('all-2026-docs-digital');
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
                Professional Business Compliance Documents Package · $999 Outright or $125/Month (24-Month Digital Suite Plan)
              </span>
              <span className="rounded-full bg-amber-300 px-2 py-0.5 font-body text-[8px] font-black text-blue-950">
                $999 OUTRIGHT OR $125/MO (24-MO PLAN) · EXTENSIVE 125+ AUDIT DOCUMENTS
              </span>
            </div>
            <p className="font-body text-[8.5px] font-bold text-white">
              Extensive documentation covering almost every compliance document needed to help complete your audits — check all relevant &amp; required standards for your business so there is no doubt of your compliance audit outcome of success!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              downloadBusinessComplianceDocsBrochurePdf({
                businessName: orderForm.businessName,
                abn: orderForm.abn,
              })
            }
            className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 font-body text-[8px] font-black text-blue-950 shadow-sm hover:bg-amber-200"
          >
            <Download className="h-3 w-3 text-blue-950" /> Download $999 / $125m Package Brochure (PDF)
          </button>
          <a
            href="#order-print-pack-form"
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-body text-[8px] font-black text-blue-950 shadow-sm hover:bg-pink-50"
          >
            <Printer className="h-3 w-3 text-pink-600" /> Order Printed Binders or Digital Pack
          </a>
        </div>
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
              Professional Business Compliance Documents Package: $999 Outright or $125/Month (24-Month Digital Suite Plan)
            </div>
            <p className="font-body text-[8px] font-semibold leading-snug text-blue-950">
              Access our **extensive 125+ document compliance library**—covering **almost every document** your business needs to prepare for and complete audits—for **$999 outright** or **$125/month on a 24-month subscription plan** for full digital suite access (or included free inside our $660–$1,035/mo Smart Enhanced App Plans). **Audit Outcome Assurance:** Please ensure your team checks and completes all relevant and required documents specific to your registration scope and regulatory obligations so there is **no doubt of your compliance audit outcome of success**.
            </p>
          </div>
        </div>
        <div className="lg:col-span-4 grid grid-cols-3 gap-1 text-center">
          <div className="rounded-lg border border-purple-300 bg-white p-1.5">
            <div className="font-editorial text-sm font-black text-purple-900">$999</div>
            <div className="font-body text-[6.8px] font-extrabold uppercase text-blue-950">Outright Digital Suite</div>
          </div>
          <div className="rounded-lg border border-pink-300 bg-white p-1.5">
            <div className="font-editorial text-sm font-black text-pink-700">$125/mo</div>
            <div className="font-body text-[6.8px] font-extrabold uppercase text-blue-950">24-Month Digital Plan</div>
          </div>
          <div className="rounded-lg border border-emerald-300 bg-white p-1.5">
            <div className="font-editorial text-sm font-black text-emerald-700">125+ Docs</div>
            <div className="font-body text-[6.8px] font-extrabold uppercase text-blue-950">Extensive Audit Suite</div>
          </div>
        </div>
      </div>

      {/* Audit Outcome Success & Comprehensive Verification Guidance Banner */}
      <div className="rounded-xl border-2 border-emerald-500 bg-gradient-to-r from-emerald-50/90 via-white to-blue-50/90 p-2 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <div className="font-body text-[9.5px] font-black uppercase tracking-wider text-emerald-950">
                Extensive Documentation Built for Audit Success — Verify Every Relevant Requirement for Complete Confidence
              </div>
              <p className="font-body text-[7.8px] font-bold text-blue-950 leading-snug">
                This extensive package includes **almost every compliance document** across Governance, NDIS Practice Standards, HR, Participant Safeguarding, WHS, Emergency Management, Finance, and 45 Module SOPs to help you complete your audits. To guarantee **there is no doubt of your compliance audit outcome of success**, businesses must carefully review, tailor, and check off all relevant and mandatory requirements that apply to their specific services, state legislation, and registration groups.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                downloadBusinessComplianceDocsBrochurePdf({
                  businessName: orderForm.businessName,
                  abn: orderForm.abn,
                })
              }
              className="inline-flex items-center gap-1 rounded-full border-2 border-emerald-700 bg-white px-2.5 py-1 font-body text-[7.5px] font-black uppercase tracking-wider text-emerald-950 shadow-sm hover:bg-emerald-50"
            >
              <Download className="h-3 w-3 text-emerald-700" /> Download Package Brochure (A4 PDF)
            </button>
            <span className="rounded-full bg-emerald-600 px-2.5 py-1 font-body text-[7.5px] font-black uppercase tracking-wider text-white">
              ✓ CHECK ALL RELEVANT REQUIREMENTS FOR 100% AUDIT SUCCESS
            </span>
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
            All 6 Binders Included in the $999 Outright or $125/Month (24-Month Plan) Package
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
                    Included in $999 Outright / $125m Plan
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
                  onClick={() => setSelectedPkgId('all-2026-docs-digital')}
                  className="rounded px-2 py-0.5 font-body text-[7px] font-black text-white"
                  style={{ background: b.color }}
                >
                  Select $999 / $125m Package
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive A4 Print-Ready 2026 Standard Document Template Studio */}
      <Standard2026PrintableTemplatesSuite />

      {/* Official Two-Way Pricing: $999 Outright OR $125/Month (24-Month Plan) */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-1 px-1">
          <span className="font-body text-[9.5px] font-black uppercase tracking-wider text-blue-950">
            Professional Business Compliance Documents Package — Choose $999 Outright or $125/Month (24-Month Subscription Plan)
          </span>
          <span className="font-body text-[7.8px] font-extrabold text-pink-700">
            Click either option to load it into the Order &amp; Subscription Form below
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                  <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
                    <span className="font-editorial text-xl sm:text-2xl font-black text-blue-950">
                      {pkg.priceDisplay || `$${pkg.totalPrice.toLocaleString()}`}
                    </span>
                    <span className="font-body text-[7.3px] font-extrabold text-purple-900">
                      AUD {pkg.printFee > 0 ? '(Printed & Delivered)' : pkg.monthlySubPrice ? '(Outright or 24-Mo Plan)' : '(Digital Access)'}
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
                    {p.name} — {p.priceDisplay || `$${p.totalPrice.toLocaleString()}`} AUD
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
                onClick={() =>
                  downloadBusinessComplianceDocsBrochurePdf({
                    businessName: orderForm.businessName,
                    abn: orderForm.abn,
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-blue-400 bg-blue-50 px-2.5 py-1.5 font-body text-[8px] font-black text-blue-950 hover:bg-blue-100"
              >
                <Download className="h-3 w-3 text-blue-700" /> Download $999 / $125m PDF Brochure
              </button>
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