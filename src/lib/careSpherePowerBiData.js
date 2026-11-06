// CareSphere Power BI 12-Page Executive Command Centre Data Specification
// Midnight Command Visual Standard (#081018, #162235, #1E293B, #39E6FF, #22C55E, #FBBF24, #EF4444, #FFFFFF)

export const POWER_BI_PAGES = [
  {
    id: 'p1_command',
    pageNum: 1,
    label: 'Executive Command Centre',
    shortLabel: 'Executive Command Centre',
    icon: 'shield',
    group: 'Executive',
    presenterRole: 'Board Chair / Chief Executive Officer',
    speakerNotes:
      'Welcome to the CareSphere Executive Command Centre. Five of our six constitutional indices exceed target today: GEI is at 89, OHI at 87, Ω∞ Readiness at 82, Assurance Confidence at 92, and Lineage Quality at 92. Benefits Realisation is at 84 against an 85 target and is actively tracked in our Q3 workforce sprint.',
    boardTalkingPoints: [
      'Enterprise RAG Status is GREEN (Ω∞ Ready) with DirectLake live telemetry.',
      'Top risk R1 (AI Governance) is under active treatment with citation locks enforced.',
      'Net validated benefits stand at +$1.10M with a 76% ROI and 6.8-month payback.',
    ],
    decisionPrompt: 'Note the Q2 Executive Command posture and endorse focus on BRI +1pt uplift.',
  },
  {
    id: 'p2_governance',
    pageNum: 2,
    label: 'Governance',
    shortLabel: 'Governance Performance',
    icon: 'governance',
    group: 'Governance & Performance',
    presenterRole: 'Enterprise Governance Officer',
    speakerNotes:
      'Governance Effectiveness (GEI) has risen steadily from 68 in FY25 to 79 in FY26 and 89 in FY27, outperforming our >85 constitutional threshold. Assurance (92) and Strategy (90) lead our maturity profile.',
    boardTalkingPoints: [
      '100% of 48 financial and clinical delegations are signed and verified.',
      'Drill-through traces every capability directly to its assessment, finding, and action.',
      'Digital, Data & AI Committee Charter update is ready for Board ratification.',
    ],
    decisionPrompt: 'Ratify updated Digital, Data & AI Committee Charter (ACT-GOV-01).',
  },
  {
    id: 'p3_health',
    pageNum: 3,
    label: 'Organisation Health',
    shortLabel: 'Organisation Health',
    icon: 'health',
    group: 'Governance & Performance',
    presenterRole: 'Chief Operating Officer',
    speakerNotes:
      'Our Organisation Health Index (OHI) sits at 87/100 (Healthy), up 22 points over two fiscal cycles (65 → 78 → 87). All eight weighted dimensions are performing above 80, led by Data (91) and Strategy (90).',
    boardTalkingPoints: [
      'Operations maintains a 96.4% roster fill and service continuity rate.',
      'Workforce (83) is supported by a proactive 30-day worker screening renewal sprint.',
      'Each radar dimension drills directly into its contributing KPI and action plan.',
    ],
    decisionPrompt: 'Endorse the Q3 Workforce & Benefits health uplift action plans.',
  },
  {
    id: 'p4_readiness',
    pageNum: 4,
    label: 'Ω∞ Readiness',
    shortLabel: 'Ω∞ Readiness',
    icon: 'readiness',
    group: 'Executive Management',
    presenterRole: 'Chief Transformation & Readiness Lead',
    speakerNotes:
      'The Ω∞ Readiness Index has reached 82/100 (Ready), progressing from 58 in FY25 and 73 in FY26. Eight of nine enterprise domains are in Ready status, with Benefits (69) placed on Watch for accelerated realisation.',
    boardTalkingPoints: [
      'Governance (89), Data (88), and Strategic (86) anchor our readiness posture.',
      'AI Readiness (76) crossed the >75 threshold following guardrail certification.',
      'Benefits domain (69) has a dedicated recovery sprint led by the Chief Benefits Officer.',
    ],
    decisionPrompt: 'Approve the Phase 6 Ω∞ Readiness sustainment schedule.',
  },
  {
    id: 'p5_risk',
    pageNum: 5,
    label: 'Risk',
    shortLabel: 'Enterprise Risk',
    icon: 'risk',
    group: 'Audit & Risk',
    presenterRole: 'Chief Risk Officer',
    speakerNotes:
      'Our 5×5 Enterprise Risk Heatmap plots our top five strategic risks (R1–R5). Critical risks have decreased from 3 in Q1 to 1 in Q4, and total open risks reduced from 22 to 14.',
    boardTalkingPoints: [
      'R1 AI Governance (Score 20, Extreme) is trending Down with mandatory human-in-the-loop controls.',
      'R2 Workforce Sustainability (Score 16) and R3 Cyber Resilience (Score 15) have funded treatments.',
      'All Top 10 enterprise risks have named owners and binding due dates.',
    ],
    decisionPrompt: 'Note the Q4 Risk Exposure reduction and approve R1–R3 treatment milestones.',
  },
  {
    id: 'p6_assurance',
    pageNum: 6,
    label: 'Assurance',
    shortLabel: 'Assurance Dashboard',
    icon: 'assurance',
    group: 'Audit & Risk',
    presenterRole: 'Chief Assurance Officer',
    speakerNotes:
      'Three Lines of Defence assurance coverage has reached 92% (up from 74% in FY25). Compliance rate stands at 96.4% and control effectiveness is verified at 91.8% with zero critical audit findings open.',
    boardTalkingPoints: [
      'Zero Critical findings across Line 1 (Ops), Line 2 (GRC), and Line 3 (Independent Audit).',
      'Only 7 total open findings remain, well inside our <10 tolerance ceiling.',
      'All 356 NDIS and Strengthened Aged Care controls are mapped to immutable evidence.',
    ],
    decisionPrompt: 'Accept the Q2 Three Lines of Defence Assurance Statement.',
  },
  {
    id: 'p7_capa',
    pageNum: 7,
    label: 'Corrective Actions',
    shortLabel: 'Corrective Actions',
    icon: 'capa',
    group: 'Audit & Risk',
    presenterRole: 'Quality & Improvement Lead',
    speakerNotes:
      'Corrective and Preventive Actions (CAPA) maintain a 95.8% closure rate with an average age of 18.4 days against a 30-day SLA. Importantly, zero actions sit in the 90+ day bucket.',
    boardTalkingPoints: [
      '14 open actions across all 9 modules; only 1 Critical action (in the 0–30 day bucket).',
      '2 overdue actions have been automatically escalated to Line-2 GRC oversight.',
      'Closed-loop verification requires evidence attachment before any CAPA can close.',
    ],
    decisionPrompt: 'Note the 95.8% CAPA closure velocity and zero >90-day backlog.',
  },
  {
    id: 'p8_benefits',
    pageNum: 8,
    label: 'Benefits',
    shortLabel: 'Benefits Realisation',
    icon: 'benefit',
    group: 'Governance & Performance',
    presenterRole: 'Chief Benefits Officer',
    speakerNotes:
      'Against a -$1.45M capital investment, CareSphere SME-GARM has delivered +$2.55M in gross validated value (+$1.10M Net Benefit), representing a 76% ROI and a 6.8-month payback period.',
    boardTalkingPoints: [
      'Workforce Optimisation (+$0.88M) and Executive Productivity (+$0.62M) are the largest value drivers.',
      'Operational Efficiency (+$0.59M) and Risk Avoidance (+$0.46M) are fully evidence-verified.',
      'Benefits Achievement Gauge is at 84%, 1 point shy of the >85% target.',
    ],
    decisionPrompt: 'Approve the Q3 Benefits Realisation schedule to lift BRI from 84% to 88%.',
  },
  {
    id: 'p9_raid',
    pageNum: 9,
    label: 'RAID',
    shortLabel: 'RAID Analytics',
    icon: 'raid',
    group: 'Executive Management',
    presenterRole: 'Head of Portfolio & Program Delivery',
    speakerNotes:
      'Active RAID telemetry tracks 17 Risks, 24 Assumptions, 8 Issues, and 12 Dependencies. Issue volume has dropped 43% since July (from 14 down to 8), with zero issues aged over 60 days.',
    boardTalkingPoints: [
      '75% of open issues (6 of 8) are less than 30 days old.',
      'Cross-program dependencies decreased from 15 to 12 following OneLake consolidation.',
      'Only 1 Extreme risk remains across the entire enterprise portfolio.',
    ],
    decisionPrompt: 'Note the downward trajectory across all four RAID categories.',
  },
  {
    id: 'p10_exec_actions',
    pageNum: 10,
    label: 'Executive Actions',
    shortLabel: 'Executive Actions',
    icon: 'actions',
    group: 'Executive Management',
    presenterRole: 'Chief Executive Officer',
    speakerNotes:
      'We have completed 48 executive actions year-to-date, with 12 currently open, 3 marked Critical Priority, and 1 overdue. Every executive action traces directly from Owner to Committee to Board Decision.',
    boardTalkingPoints: [
      'EXE-01 (AI Prompt Guardrail Lock) and EXE-03 (Fabric DirectLake Certification) are Green.',
      'EXE-04 (External Portal Cyber Finding) is prioritized for closure by 15 November.',
      'Click any row to inspect the 4-stage Action → Owner → Committee → Board Decision chain.',
    ],
    decisionPrompt: 'Endorse executive priority on EXE-04 and EXE-02.',
  },
  {
    id: 'p11_board_decisions',
    pageNum: 11,
    label: 'Board Decisions',
    shortLabel: 'Board Decisions',
    icon: 'board',
    group: 'Board Reporting',
    presenterRole: 'Board Chair & Company Secretary',
    speakerNotes:
      'The Board Decision Register records 4 Approved constitutional resolutions, 1 Deferred item, 0 Rejected items, and 1 Open resolution (DEC-2026-05: Phase 6 Enterprise Digital Twin Expansion) for vote today.',
    boardTalkingPoints: [
      'DEC-2026-01 through DEC-2026-04 are formally approved and bound into the audit trail.',
      'Directors can record live voting outcomes (Approved, Deferred, Rejected, Open) directly on screen.',
      'All resolutions automatically sync with committee minutes and executive action owners.',
    ],
    decisionPrompt: 'Vote on DEC-2026-05 (Phase 6 Enterprise Digital Twin Expansion Business Case).',
  },
  {
    id: 'p12_fabric_ai',
    pageNum: 12,
    label: 'Fabric & AI',
    shortLabel: 'Fabric, Data & AI Governance',
    icon: 'ai',
    group: 'Data & AI Governance',
    presenterRole: 'Chief Data Officer & AI Governance Lead',
    speakerNotes:
      'Our 8-stage Microsoft Fabric architecture connects all 45 operational registers through OneLake, Lakehouse, and Warehouse into our DirectLake Semantic Model. Data Quality is 94.2%, LQI is 92.0%, Traceability is 96.8%, and AI Governance Maturity is 89.5%.',
    boardTalkingPoints: [
      'Sovereign AU-East OneLake storage with Row-Level Security across all 9 Fact and 10 Dimension tables.',
      'Lineage Quality Index (92.0%) exceeds our >90% constitutional benchmark.',
      'Constitutional Principle: Purpose Directs. Ownership Commits. Evidence Proves. Readiness Sustains.',
    ],
    decisionPrompt: 'Confirm annual certification of the Microsoft Fabric & AI Governance architecture.',
  },
];

export const ROLE_DRILL_THROUGH_PATHS = [
  { id: 'Board Reporting', label: 'Board Reporting', targetPage: 'p11_board_decisions', color: '#39E6FF' },
  { id: 'Audit & Risk', label: 'Audit & Risk', targetPage: 'p5_risk', color: '#FBBF24' },
  { id: 'Governance & Performance', label: 'Governance & Performance', targetPage: 'p2_governance', color: '#22C55E' },
  { id: 'Executive Management', label: 'Executive Management', targetPage: 'p10_exec_actions', color: '#39E6FF' },
  { id: 'Data & AI Governance', label: 'Data & AI Governance', targetPage: 'p12_fabric_ai', color: '#22C55E' },
];

// Page 1: Top Row 6 KPI Cards (Exact Sample Values from Spec)
export const PAGE1_TOP_KPIS = [
  { code: 'GEI', label: 'Governance Effectiveness Index', value: 89, target: '>85', targetNum: 85, status: 'Green', color: '#22C55E', targetPage: 'p2_governance' },
  { code: 'OHI', label: 'Organisation Health Index', value: 87, target: '>85', targetNum: 85, status: 'Green', color: '#22C55E', targetPage: 'p3_health' },
  { code: 'ORI', label: 'Ω∞ Readiness Index', value: 82, target: '>80', targetNum: 80, status: 'Ready', color: '#39E6FF', targetPage: 'p4_readiness' },
  { code: 'BRI', label: 'Benefits Realisation Index', value: 84, target: '>85', targetNum: 85, status: 'Amber (-1)', color: '#FBBF24', targetPage: 'p8_benefits' },
  { code: 'ACS', label: 'Assurance Confidence Score', value: 92, target: '>90', targetNum: 90, status: 'Green', color: '#22C55E', targetPage: 'p6_assurance' },
  { code: 'LQI', label: 'Lineage Quality Index', value: 92, target: '>90', targetNum: 90, status: 'Green', color: '#39E6FF', targetPage: 'p12_fabric_ai' },
];

// Page 2: Governance Performance
export const PAGE2_GOVERNANCE_DATA = {
  gauge: { current: 89, target: 85, status: 'Green' },
  trend: [
    { period: 'FY25', score: 68 },
    { period: 'FY26', score: 79 },
    { period: 'FY27', score: 89 },
  ],
  maturityBreakdown: [
    { domain: 'Strategy', score: 90 },
    { domain: 'Governance', score: 89 },
    { domain: 'Risk', score: 85 },
    { domain: 'Assurance', score: 92 },
    { domain: 'Benefits', score: 84 },
  ],
  drillThrough: [
    {
      capability: 'Board Charter & Delegations Control',
      assessment: 'FY27 Q2 Constitutional Maturity Review (Score: 92/100)',
      finding: 'All 48 financial & clinical delegations signed; 1 sub-committee terms update due.',
      action: 'ACT-GOV-01: Ratify updated Digital, Data & AI Committee Charter at Board.',
    },
    {
      capability: 'Statutory Policy & Control Lifecycle',
      assessment: 'NDIS & Strengthened Aged Care Standards Assessment (Score: 89/100)',
      finding: '356 controls mapped; 2 operational procedures scheduled for biennial review.',
      action: 'ACT-GOV-02: Complete Line-2 sign-off on revised Medication Management SOP.',
    },
    {
      capability: 'Benefits & Investment Decision Rights',
      assessment: 'Capital & Digital Value Realisation Audit (Score: 84/100)',
      finding: 'Workforce optimisation benefit tracking 1pt below >85 target threshold.',
      action: 'ACT-GOV-03: Accelerate automated roster shift-fill rollout across Region B.',
    },
  ],
};

// Page 3: Organisation Health
export const PAGE3_ORG_HEALTH_DATA = {
  gauge: { score: 87, max: 100, status: 'Healthy' },
  trend: [
    { period: 'FY25', score: 65 },
    { period: 'FY26', score: 78 },
    { period: 'FY27', score: 87 },
  ],
  radarDimensions: [
    { dimension: 'Strategy', weight: '15%', score: 90, kpi: 'Strategic Initiative On-Time Rate (92%)', actionPlan: 'Maintain quarterly OKR alignment cadence' },
    { dimension: 'Governance', weight: '15%', score: 89, kpi: 'Charter & Delegation Compliance (100%)', actionPlan: 'Automate committee resolution tracking in Fabric' },
    { dimension: 'Risk', weight: '15%', score: 86, kpi: 'Risks Within Appetite (94%)', actionPlan: 'Close 2 high-priority cyber & AI risk treatments' },
    { dimension: 'Operations', weight: '15%', score: 88, kpi: 'Roster Fill & Service Continuity (96.4%)', actionPlan: 'Expand 60-second frontline rapid capture' },
    { dimension: 'Workforce', weight: '10%', score: 83, kpi: 'Worker Screening & Retention Rate (89%)', actionPlan: 'Launch proactive 30-day credential renewal sprint' },
    { dimension: 'Digital', weight: '10%', score: 87, kpi: 'Platform Uptime & Adoption (99.4%)', actionPlan: 'Complete mobile offline sync optimisation' },
    { dimension: 'Data', weight: '10%', score: 91, kpi: 'Lineage Quality Index (92%)', actionPlan: 'Enforce DirectLake schema validation gates' },
    { dimension: 'Benefits', weight: '10%', score: 84, kpi: 'Benefits Realisation Index (84%)', actionPlan: 'Re-baseline Q3 workforce productivity targets' },
  ],
};

// Page 4: Ω∞ Readiness
export const PAGE4_READINESS_DATA = {
  gauge: { score: 82, max: 100, status: 'Ready' },
  trend: [
    { period: 'FY25', score: 58 },
    { period: 'FY26', score: 73 },
    { period: 'FY27', score: 82 },
  ],
  domains: [
    { domain: 'Strategic', score: 86, status: 'Ready', owner: 'CEO / Strategy' },
    { domain: 'Operational', score: 84, status: 'Ready', owner: 'COO / Operations' },
    { domain: 'Workforce', score: 78, status: 'Ready', owner: 'Workforce Director' },
    { domain: 'Digital', score: 83, status: 'Ready', owner: 'CTO / Digital Lead' },
    { domain: 'Data', score: 88, status: 'Ready', owner: 'Chief Data Officer' },
    { domain: 'AI', score: 76, status: 'Ready', owner: 'AI Governance Lead' },
    { domain: 'Governance', score: 89, status: 'Ready', owner: 'Governance Officer' },
    { domain: 'Assurance', score: 85, status: 'Ready', owner: 'Chief Assurance Officer' },
    { domain: 'Benefits', score: 69, status: 'Watch', owner: 'Chief Benefits Officer' },
  ],
};

// Page 5: Enterprise Risk (5x5 Plot R1-R5 + Top 10 Risk Register)
export const PAGE5_ENTERPRISE_RISKS = [
  { id: 'R1', title: 'R1 AI Governance & Model Hallucination Drift', owner: 'AI Governance Lead', impact: 5, likelihood: 4, score: 20, rating: 'Extreme', trend: 'Down', dueDate: '2026-11-30' },
  { id: 'R2', title: 'R2 Workforce Sustainability & Screening Expiry', owner: 'Workforce Director', impact: 4, likelihood: 4, score: 16, rating: 'High', trend: 'Stable', dueDate: '2026-12-05' },
  { id: 'R3', title: 'R3 Cyber Resilience & Sovereign Data Breach', owner: 'Chief Information Security Officer', impact: 5, likelihood: 3, score: 15, rating: 'High', trend: 'Down', dueDate: '2026-11-25' },
  { id: 'R4', title: 'R4 Data Governance & OneLake Lineage Drift', owner: 'Chief Data Officer', impact: 4, likelihood: 3, score: 12, rating: 'Medium', trend: 'Down', dueDate: '2026-12-10' },
  { id: 'R5', title: 'R5 Benefits Delivery & ROI Schedule Slippage', owner: 'Chief Benefits Officer', impact: 3, likelihood: 4, score: 12, rating: 'Medium', trend: 'Up', dueDate: '2026-12-15' },
  { id: 'R6', title: 'R6 Statutory NDIS / SIRS 24h Notification Delay', owner: 'Chief Risk Officer', impact: 5, likelihood: 2, score: 10, rating: 'Medium', trend: 'Down', dueDate: '2026-11-20' },
  { id: 'R7', title: 'R7 Clinical Medication Supervision Non-Conformance', owner: 'Clinical Governance Lead', impact: 4, likelihood: 2, score: 8, rating: 'Medium', trend: 'Stable', dueDate: '2026-12-01' },
  { id: 'R8', title: 'R8 Third-Party Supplier & Contractor Compliance Gap', owner: 'Procurement Manager', impact: 3, likelihood: 3, score: 9, rating: 'Medium', trend: 'Down', dueDate: '2026-12-18' },
  { id: 'R9', title: 'R9 NDIS Price Guide Margin Compression on SIL', owner: 'Chief Financial Officer', impact: 3, likelihood: 2, score: 6, rating: 'Low', trend: 'Stable', dueDate: '2026-12-22' },
  { id: 'R10', title: 'R10 Board Action & Committee Escalation Latency', owner: 'Governance Officer', impact: 2, likelihood: 2, score: 4, rating: 'Low', trend: 'Down', dueDate: '2026-12-30' },
];

export const PAGE5_EXPOSURE_TREND = [
  { period: 'Q1', critical: 3, high: 6, open: 22 },
  { period: 'Q2', critical: 2, high: 5, open: 19 },
  { period: 'Q3', critical: 1, high: 3, open: 17 },
  { period: 'Q4', critical: 1, high: 2, open: 14 },
];

// Page 6: Assurance Dashboard
export const PAGE6_ASSURANCE_DATA = {
  kpis: [
    { label: 'Assurance Coverage', value: '92%', target: '>90%', color: '#22C55E' },
    { label: 'Open Findings', value: '7', target: '<10', color: '#39E6FF' },
    { label: 'Compliance Rate', value: '96.4%', target: '>95%', color: '#22C55E' },
    { label: 'Control Effectiveness', value: '91.8%', target: '>90%', color: '#22C55E' },
  ],
  findingsBySeverity: [
    { line: 'Line 1 (Ops)', critical: 0, high: 1, medium: 2, low: 3 },
    { line: 'Line 2 (GRC)', critical: 0, high: 1, medium: 1, low: 2 },
    { line: 'Line 3 (Audit)', critical: 0, high: 0, medium: 1, low: 2 },
  ],
  coverageTrend: [
    { period: 'FY25', coverage: 74 },
    { period: 'FY26', coverage: 85 },
    { period: 'FY27', coverage: 92 },
  ],
};

// Page 7: Corrective Actions
export const PAGE7_CAPA_DATA = {
  kpis: [
    { label: 'Open Actions', value: '14', sub: 'Across 9 Modules', color: '#39E6FF' },
    { label: 'Overdue Actions', value: '2', sub: 'Escalated to Line 2', color: '#FBBF24' },
    { label: 'Closure Rate', value: '95.8%', sub: 'Target >95%', color: '#22C55E' },
    { label: 'Average Age', value: '18.4 Days', sub: 'SLA <30 Days', color: '#22C55E' },
  ],
  ageBuckets: ['0-30', '31-60', '61-90', '90+'],
  heatmapRows: [
    { severity: 'Critical', color: '#EF4444', buckets: { '0-30': 1, '31-60': 0, '61-90': 0, '90+': 0 } },
    { severity: 'High', color: '#F97316', buckets: { '0-30': 3, '31-60': 1, '61-90': 0, '90+': 0 } },
    { severity: 'Medium', color: '#FBBF24', buckets: { '0-30': 4, '31-60': 2, '61-90': 1, '90+': 0 } },
    { severity: 'Low', color: '#22C55E', buckets: { '0-30': 1, '31-60': 1, '61-90': 0, '90+': 0 } },
  ],
};

// Page 8: Benefits Realisation
export const PAGE8_BENEFITS_WATERFALL = {
  roi: '76%',
  payback: '6.8 months',
  achievement: 84,
  steps: [
    { step: 'Investment', amount: -1.45, display: '-$1.45M', type: 'outflow', color: '#EF4444' },
    { step: 'Executive Productivity', amount: 0.62, display: '+$0.62M', type: 'inflow', color: '#39E6FF' },
    { step: 'Workforce Optimisation', amount: 0.88, display: '+$0.88M', type: 'inflow', color: '#39E6FF' },
    { step: 'Operational Efficiency', amount: 0.59, display: '+$0.59M', type: 'inflow', color: '#22C55E' },
    { step: 'Risk Avoidance', amount: 0.46, display: '+$0.46M', type: 'inflow', color: '#22C55E' },
    { step: 'Net Benefit', amount: 1.10, display: '+$1.10M Net (+$2.55M Gross)', type: 'net', color: '#22C55E' },
  ],
};

// Page 9: RAID Analytics
export const PAGE9_RAID_DATA = {
  kpis: [
    { measure: 'Risks', value: 17, color: '#EF4444' },
    { measure: 'Assumptions', value: 24, color: '#39E6FF' },
    { measure: 'Issues', value: 8, color: '#FBBF24' },
    { measure: 'Dependencies', value: 12, color: '#22C55E' },
  ],
  trend: [
    { month: 'Jul', risks: 22, assumptions: 26, issues: 14, dependencies: 15 },
    { month: 'Aug', risks: 20, assumptions: 25, issues: 11, dependencies: 14 },
    { month: 'Sep', risks: 19, assumptions: 24, issues: 9, dependencies: 13 },
    { month: 'Oct', risks: 17, assumptions: 24, issues: 8, dependencies: 12 },
  ],
  issuesByAge: [
    { bucket: '0–14 Days', count: 4 },
    { bucket: '15–30 Days', count: 2 },
    { bucket: '31–60 Days', count: 2 },
    { bucket: '60+ Days', count: 0 },
  ],
  risksBySeverity: [
    { severity: 'Extreme', count: 1, color: '#EF4444' },
    { severity: 'High', count: 4, color: '#F97316' },
    { severity: 'Medium', count: 8, color: '#FBBF24' },
    { severity: 'Low', count: 4, color: '#22C55E' },
  ],
};

// Page 10: Executive Actions
export const PAGE10_EXECUTIVE_ACTIONS = {
  kpis: [
    { label: 'Open Executive Actions', value: 12, color: '#39E6FF' },
    { label: 'Overdue Actions', value: 1, color: '#FBBF24' },
    { label: 'Critical Actions', value: 3, color: '#EF4444' },
    { label: 'Completed Actions', value: 48, color: '#22C55E' },
  ],
  actions: [
    {
      id: 'EXE-01',
      action: 'Enforce Mandatory AI Prompt Guardrail & Citation Lock across Clinical Notes',
      owner: 'AI Governance Lead',
      dueDate: '2026-11-18',
      status: 'In Progress',
      rag: 'Green',
      committee: 'Digital, Data & AI Committee',
      boardDecision: 'DEC-2026-01: Approve Constitutional AI Charter',
    },
    {
      id: 'EXE-02',
      action: 'Complete Automated 30-Day Worker Screening Renewal Sprint (Region B)',
      owner: 'Workforce Director',
      dueDate: '2026-11-14',
      status: 'At Watch',
      rag: 'Amber',
      committee: 'Governance & Performance Committee',
      boardDecision: 'DEC-2026-02: Endorse Workforce Readiness Uplift',
    },
    {
      id: 'EXE-03',
      action: 'Certify Microsoft Fabric DirectLake Semantic Model for Q4 Board Pack',
      owner: 'Chief Data Officer',
      dueDate: '2026-11-22',
      status: 'On Track',
      rag: 'Green',
      committee: 'Digital, Data & AI Committee',
      boardDecision: 'DEC-2026-03: Certify OneLake Enterprise Lineage',
    },
    {
      id: 'EXE-04',
      action: 'Close Remaining High-Risk Cyber Penetration Finding on External Portal',
      owner: 'Chief Risk Officer',
      dueDate: '2026-11-15',
      status: 'Critical Priority',
      rag: 'Red',
      committee: 'Audit & Risk Committee',
      boardDecision: 'DEC-2026-04: Mandate Zero-Trust Entra MFA',
    },
    {
      id: 'EXE-05',
      action: 'Reconcile Q4 NDIS SIL Claims Against Updated Price Guide Line Items',
      owner: 'Chief Benefits Officer',
      dueDate: '2026-11-28',
      status: 'On Track',
      rag: 'Green',
      committee: 'Governance & Performance Committee',
      boardDecision: 'DEC-2026-05: Approve Benefits Realisation Plan',
    },
  ],
};

// Page 11: Board Decisions
export const PAGE11_BOARD_DECISIONS = [
  { id: 'DEC-2026-01', decision: 'Approve CareSphere SME-GARM Constitutional AI Governance Charter', owner: 'AI Governance Lead', committee: 'Digital, Data & AI Committee', status: 'Approved' },
  { id: 'DEC-2026-02', decision: 'Endorse FY27 Workforce Sustainability & Screening Automation Budget', owner: 'Workforce Director', committee: 'Governance & Performance Committee', status: 'Approved' },
  { id: 'DEC-2026-03', decision: 'Certify Microsoft Fabric OneLake & Power BI DirectLake Semantic Model', owner: 'Chief Data Officer', committee: 'Digital, Data & AI Committee', status: 'Approved' },
  { id: 'DEC-2026-04', decision: 'Mandate Hardware MFA & Zero-Tolerance Appetite on Sovereign Data', owner: 'Chief Risk Officer', committee: 'Audit & Risk Committee', status: 'Approved' },
  { id: 'DEC-2026-05', decision: 'Approve Phase 6 Enterprise Digital Twin Expansion Business Case', owner: 'Chief Benefits Officer', committee: 'Full Board of Directors', status: 'Open' },
  { id: 'DEC-2026-06', decision: 'Defer Regional Legacy Archive Decommissioning Pending Line-3 Audit', owner: 'Chief Assurance Officer', committee: 'Audit & Risk Committee', status: 'Deferred' },
];

// Page 12: Fabric, Data & AI Governance
export const PAGE12_FABRIC_AI_DATA = {
  kpis: [
    { label: 'Data Quality', value: '94.2%', target: '>90%', color: '#22C55E' },
    { label: 'Lineage Quality Index (LQI)', value: '92.0%', target: '>90%', color: '#39E6FF' },
    { label: 'Traceability Coverage', value: '96.8%', target: '>95%', color: '#22C55E' },
    { label: 'AI Governance Maturity', value: '89.5%', target: '>85%', color: '#39E6FF' },
  ],
  architectureFlow: [
    { step: 1, name: 'Source Systems', sub: '45 CareSphere Operational Registers' },
    { step: 2, name: 'Microsoft Fabric', sub: 'Unified Data & Ingestion Plane' },
    { step: 3, name: 'OneLake', sub: 'Sovereign AU-East Tenant Storage' },
    { step: 4, name: 'Lakehouse', sub: 'Bronze / Silver Delta Tables' },
    { step: 5, name: 'Warehouse', sub: '9 Fact Tables · 10 Dimensions' },
    { step: 6, name: 'Semantic Model', sub: 'DirectLake Constitutional DAX' },
    { step: 7, name: 'Power BI', sub: '12-Page Widescreen Report Suite' },
    { step: 8, name: 'Executive Dashboards', sub: 'Board & Committee Command Centre' },
  ],
};