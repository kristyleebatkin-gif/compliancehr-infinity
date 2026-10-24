import { jsPDF } from 'jspdf';

/**
 * Generates an Executive A4 PDF Brochure for the Professional Business Compliance Documents Package:
 * - $999 Outright Purchase OR $125/month on a 24-Month Business Subscription Plan for Full Digital Suite Access
 * - Complete 6-Binder (125+ Document) Breakdown covering almost every compliance document needed for audits
 * - Official Audit Outcome & Regulatory Verification Assurance Notice
 */
export function downloadBusinessComplianceDocsBrochurePdf({
  organisation = 'ComplianceHR Infinity',
  businessName = '',
  abn = '',
} = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;
  const M = 10;
  const contentW = W - M * 2;

  // Outer Frame
  doc.setDrawColor(109, 40, 217);
  doc.setLineWidth(0.6);
  doc.rect(M - 2, M - 2, W - (M - 2) * 2, H - (M - 2) * 2, 'S');

  // Top Header Banner (Blue -> Purple -> Pink)
  doc.setFillColor(37, 99, 235);
  doc.rect(M, M, contentW * 0.45, 24, 'F');
  doc.setFillColor(124, 58, 237);
  doc.rect(M + contentW * 0.45, M, contentW * 0.15, 24, 'F');
  doc.setFillColor(236, 72, 153);
  doc.rect(M + contentW * 0.6, M, contentW * 0.4, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(
    'OFFICIAL 2026 PRODUCT & PRICING BROCHURE · SOFTWARE: COMPLIANCEHR INFINITY',
    M + 3,
    M + 5.2
  );
  doc.setFontSize(12);
  doc.text(
    'PROFESSIONAL BUSINESS COMPLIANCE DOCUMENTS PACKAGE',
    M + 3,
    M + 11.8
  );
  doc.setFontSize(8.2);
  doc.text(
    '$999 OUTRIGHT OR $125 / MONTH ON A 24-MONTH SUBSCRIPTION PLAN FOR FULL DIGITAL SUITE ACCESS',
    M + 3,
    M + 17.2
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.text(
    'Complete Control. Greater Confidence. Brighter Success. · Developer: Kristy Lee Whelan · 0402 165 668 · kristyleebatkin@live.com.au',
    M + 3,
    M + 21.8
  );

  let y = M + 27;

  // Section 1: Two Flexible Ways to Access the Full Digital Suite + Print Options
  doc.setFillColor(37, 99, 235);
  doc.rect(M, y, contentW, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(
    '1. FLEXIBLE BUSINESS PRICING OPTIONS — FULL DIGITAL SUITE ACCESS & PRINTED BINDER UPGRADES',
    M + 2.5,
    y + 3.9
  );
  y += 6.5;

  const pricingOptions = [
    {
      badge: 'OPTION A · OUTRIGHT DIGITAL SUITE',
      price: '$999 AUD Outright',
      sub: 'One-Time Outright Business Licence',
      bullets: [
        'Immediate lifetime digital access to all 6 Binders (125+ 2026 documents)',
        '1-Click Smart-Fill with your Business Name, ABN, Logo & Key Personnel',
        'Includes both $355 Master Audit Checklists (CHR-AUD-001 & CHR-AUD-002)',
      ],
      rgb: [37, 99, 235],
    },
    {
      badge: 'OPTION B · 24-MONTH SUBSCRIPTION PLAN',
      price: '$125 / Month',
      sub: '24-Month Business Subscription Plan',
      bullets: [
        'Full Digital Suite Access (all 125+ documents & 6 Binders) from Day 1',
        'Spread your compliance documentation investment over 24 monthly payments',
        'Includes ongoing 2026 NDIS, HR, WHS & Governance template updates',
      ],
      rgb: [124, 58, 237],
    },
    {
      badge: 'OPTION C · PRINTED 6-BINDER BOX SET',
      price: '$1,994 Printed Set',
      sub: 'Or $0 Digital Inside Full App Plans',
      bullets: [
        '$999 Digital Document Suite + $995 Commercial Colour Printing & 6 Arch Binders',
        'Custom-branded spines, mylar tab dividers, laminated posters & courier delivery',
        'Full Digital Suite is also 100% INCLUDED FREE in $660-$1,035/mo App Plans!',
      ],
      rgb: [219, 39, 119],
    },
  ];

  const colW = (contentW - 4) / 3;
  const cardH = 31;
  pricingOptions.forEach((opt, i) => {
    const cx = M + i * (colW + 2);
    doc.setFillColor(250, 249, 255);
    doc.setDrawColor(...opt.rgb);
    doc.setLineWidth(0.5);
    doc.rect(cx, y, colW, cardH, 'FD');

    doc.setFillColor(...opt.rgb);
    doc.rect(cx, y, colW, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(opt.badge, cx + 2, y + 3.5);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text(opt.price, cx + 2, y + 10.5);

    doc.setTextColor(...opt.rgb);
    doc.setFontSize(6.5);
    doc.text(opt.sub, cx + 2, y + 14.3);

    doc.setTextColor(30, 27, 75);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    let by = y + 18.2;
    opt.bullets.forEach((b) => {
      const wrapped = doc.splitTextToSize(`• ${b}`, colW - 4);
      doc.text(wrapped, cx + 2, by);
      by += wrapped.length * 3.1 + 0.6;
    });
  });

  y += cardH + 3.5;

  // Section 2: Extensive 6-Binder Catalog (125+ Documents — Almost Every Document Needed for Audits)
  doc.setFillColor(124, 58, 237);
  doc.rect(M, y, contentW, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(
    '2. EXTENSIVE 6-BINDER SUITE (125+ DOCUMENTS) — ALMOST EVERY DOCUMENT TO HELP COMPLETE YOUR AUDITS',
    M + 2.5,
    y + 3.9
  );
  y += 6.5;

  const binders = [
    {
      num: 'BINDER 1 · GOVERNANCE & NDIS STANDARDS (28 DOCS)',
      color: [79, 70, 229],
      items: [
        'Master Compliance Audit Checklists (CHR-AUD-001 & 002 · 17 Categories · 356 Checkpoints)',
        'Complete 2026 NDIS Practice Standards Policy & Procedure Manual (All 8 Core Modules)',
        'Corporate Governance Charter, Conflict of Interest, Delegations & Privacy/NDB Response Plan',
        'Continuous Improvement Register (CIR), Internal Audit Schedule & Board Report Templates',
      ],
    },
    {
      num: 'BINDER 2 · HUMAN RESOURCES, 100-PT FILES & TRAINING (24 DOCS)',
      color: [124, 58, 237],
      items: [
        '2026 Fair Work & NDIS Compliant Employment Contracts (Full-Time, Part-Time, Casual)',
        'Support Worker, Team Leader & Key Personnel Position Descriptions',
        '100-Point Staff File Checklist, NDIS Worker Screening, Blue Card & Police Check Logs',
        'Onboarding & Induction Pack, Code of Conduct, Buddy Shifts & 360° Appraisals',
      ],
    },
    {
      num: 'BINDER 3 · PARTICIPANT INTAKE, AGREEMENTS & CONSENTS (26 DOCS)',
      color: [219, 39, 119],
      items: [
        '2026 NDIS Participant Service Agreement, Schedule of Supports & Welcome Handbook',
        '3-Part Informed Consent Forms (Information Sharing, Advocacy & Medication Supervision)',
        'Individual Support Plan, Goal Attainment Tracker & 10-Weekly / 3-Monthly Review Forms',
        'Daily Shift Progress Notes, MAR Medication Charts & Safe Transition/Exit Plans',
      ],
    },
    {
      num: 'BINDER 4 · INCIDENTS, WHS RISK MATRIX & EMERGENCY DRILLS (22 DOCS)',
      color: [220, 38, 38],
      items: [
        'NDIS Reportable Incident 24-Hour & 5-Day Notification Forms + Root-Cause Investigation',
        'Enterprise, Individual & Home Environment 6-Monthly Risk Assessment Forms',
        'Hierarchy of Controls Register, Pre-Shift Take-5 Booklets & Vehicle Safety Checks',
        'Emergency & Disaster Management Plan, PEEPs, 6-Mo Fire Drills, Kits & MSDS Register',
      ],
    },
    {
      num: 'BINDER 5 · ROSTERING, NDIS INVOICING, QUOTES & FINANCE (14 DOCS)',
      color: [22, 163, 74],
      items: [
        'Weekly Roster Sign-Off Sheets, Shift Exception Logs & Staff Availability Forms',
        '2026 NDIS Price Guide Compliant Tax Invoice & Claim Reconciliation Templates',
        'Itemised NDIS Service Quote Templates & Participant Budget Utilisation Statements',
        'Approved Supplier Vetting, Purchase Orders, 3-Way Match & Expense Vouchers',
      ],
    },
    {
      num: 'BINDER 6 · MEETINGS, COMMS, VISUAL BOARDS & 45 SOP MANUALS (15 DOCS)',
      color: [8, 145, 178],
      items: [
        '2026 Governance Board & Staff Meeting Agendas, Quorum & Formal Resolution Minutes',
        'Complaints & Feedback Register, Procedural Fairness Forms & Satisfaction Surveys',
        'Easy-Read Visual Daily Routines, Communication Symbol Boards & Auslan Prompts',
        'Step-by-Step SOP Manuals for All 45 Modules + Laminated Rights/Emergency Wall Posters',
      ],
    },
  ];

  const bColW = (contentW - 3) / 2;
  const bCardH = 32;
  binders.forEach((b, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const bx = M + col * (bColW + 3);
    const by = y + row * (bCardH + 2.2);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...b.color);
    doc.setLineWidth(0.45);
    doc.rect(bx, by, bColW, bCardH, 'FD');

    doc.setFillColor(...b.color);
    doc.rect(bx, by, bColW, 4.8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.text(b.num, bx + 2, by + 3.4);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    let iy = by + 8.2;
    b.items.forEach((it) => {
      const lines = doc.splitTextToSize(`✓ ${it}`, bColW - 4);
      doc.text(lines, bx + 2, iy);
      iy += lines.length * 2.95 + 0.4;
    });
  });

  y += 3 * (bCardH + 2.2) + 1.5;

  // Section 3: Audit Success & Mandatory Regulatory Verification Notice
  doc.setFillColor(22, 163, 74);
  doc.rect(M, y, contentW, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.3);
  doc.text(
    '3. IMPORTANT AUDIT OUTCOME ASSURANCE — CHECK ALL RELEVANT & REQUIRED STANDARDS FOR SUCCESS',
    M + 2.5,
    y + 3.9
  );
  y += 5.5;

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.5);
  doc.rect(M, y, contentW, 24, 'FD');

  doc.setTextColor(20, 83, 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text(
    'EXTENSIVE DOCUMENTATION DESIGNED TO HELP YOUR BUSINESS COMPLETE COMPLIANCE AUDITS WITH CONFIDENCE:',
    M + 3,
    y + 4.8
  );

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const assuranceParagraph =
    'This Professional Business Compliance Documents Package ($999 Outright or $125/month on a 24-month subscription plan) provides an extensive library of almost every compliance document, policy, contract, consent, register, risk assessment, and checklist needed to help your team prepare for and complete NDIS, HR, WHS, and organisational governance audits. To ensure there is NO DOUBT of your compliance audit outcome of success, your business and key personnel must carefully check, tailor, complete, and verify all relevant and mandatory requirements specific to your registration groups, state/federal legislation, and operational scope prior to audit submission.';
  const wrappedAssurance = doc.splitTextToSize(assuranceParagraph, contentW - 6);
  doc.text(wrappedAssurance, M + 3, y + 9);

  y += 26.5;

  // Section 4: Business Order & Subscription Selection Slip
  doc.setFillColor(219, 39, 119);
  doc.rect(M, y, contentW, 5.2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text(
    '4. ORDER / SUBSCRIPTION SELECTION & AUDIT READINESS ACKNOWLEDGEMENT',
    M + 2.5,
    y + 3.7
  );
  y += 5.2;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(190, 190, 220);
  doc.rect(M, y, contentW, 25, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.text(
    '[  ] $999 AUD Outright — Full Digital Suite Access (All 6 Binders · 125+ Documents)',
    M + 3,
    y + 5
  );
  doc.text(
    '[  ] $125 / Month (24-Month Business Subscription Plan) — Full Digital Suite Access',
    M + 3,
    y + 9.5
  );
  doc.text(
    '[  ] $1,994 AUD — Complete 6-Binder Printed & Tab-Indexed Office Box Set + Full Digital Suite',
    M + 3,
    y + 14
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(
    `Business Name: ${businessName || '______________________________________'}    ABN: ${abn || '_______________________'}`,
    M + 3,
    y + 19.2
  );
  doc.setFont('helvetica', 'bold');
  doc.text(
    'Authorised Representative Signature: _______________________________    Date: ____/____/2026',
    M + 3,
    y + 23.5
  );

  // Footer
  doc.setTextColor(88, 28, 135);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.text(
    'CHR-DOC-BROCHURE-2026 · Software: ComplianceHR Infinity · Developer: Kristy Lee Whelan · 0402 165 668 · kristyleebatkin@live.com.au',
    M,
    H - 4.5
  );

  doc.save('ComplianceHR-2026-Professional-Business-Compliance-Documents-Brochure.pdf');
}