import React from 'react';
import { Download } from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { downloadCsv } from '@/lib/csvExport';

const landingSections = [
  ['Navigation', 'Page links, quick workspaces, sign-in, demo and trial controls'],
  ['The Complete Compliance & Workforce Operating System', 'Introductory information, governance checkpoints, assurance cards and dashboard preview'],
  ['Built From Frontline & Governance Experience to Give People Their Time Back', 'Founder profile, two videos, narration controls and scripts'],
  ['Every Operational Action Captures Audit Evidence Automatically', 'Evidence points and workspace information'],
  ['45 Master Registers That Maintain Themselves', 'Register statistics, routing pipeline and core registers'],
  ['Executive Governance & Operational Telemetry', 'Executive dashboard preview, metrics and charts'],
  ['One Unified Operating System Across Every Department', 'Operating-system pillars and their information'],
  ['Verified Platform Scale Across Modules, Checkpoints, Registers & Security', 'Platform statistics'],
  ['Built for Regulated Care, Clinical Governance & Audit Integrity', 'Platform benefits'],
  ['Three Stages to Continuous Audit Readiness', 'Three-stage overview'],
  ['Trusted by Executive, Quality & Operations Leaders', 'Testimonials'],
  ['Smart Enhanced All-In-One Elite Packages', 'Subscription packages, document package, plan benefits and feature comparison'],
  ['Explore All 46 Connected Modules & Governance Scopes', 'Module directory, filters, search, table, cards and CSV export'],
  ['Frequently Asked Questions', 'Eight questions and answers'],
  ['Remote Access Without the Headaches', 'Remote access status and links'],
  ['Deploy a Unified Compliance, Risk & Workforce Operating System', 'Platform facts, demo and trial links'],
  ['Footer', 'Architectural pillars, workspace links and access and support links'],
];

export default function SectionInventoryDownload() {
  const download = () => {
    const rows = [
      ...landingSections.map(([section, contents]) => ({ area: 'Landing page', section, contents, scope: 'Overview only' })),
      ...MODULE_DIRECTORY.map((module) => ({ area: module.group, section: module.label, contents: module.blurb, scope: 'Directory summary only; detailed sections not yet inventoried' })),
    ];
    downloadCsv('compliancehr-section-overview.csv', [
      { key: 'area', label: 'Area' }, { key: 'section', label: 'Section' },
      { key: 'contents', label: 'Contents summary' }, { key: 'scope', label: 'Report coverage' },
    ], rows);
  };
  return <button type="button" onClick={download} className="inline-flex min-h-9 items-center gap-1 rounded-md border border-border bg-card px-3 text-xs font-bold text-foreground"><Download className="h-4 w-4" />Download section overview</button>;
}