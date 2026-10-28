import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowUpRight, ShieldCheck, Layers } from 'lucide-react';

const PARTICIPANT_13_SECTIONS = [
  { id: 'overview', label: 'Overview', to: '#overview' },
  { id: 'goals', label: 'Goals', to: '/goals' },
  { id: 'services', label: 'Services', to: '/programs' },
  { id: 'risks', label: 'Risks', to: '/risks' },
  { id: 'incidents', label: 'Incidents', to: '/incidents' },
  { id: 'reviews', label: 'Reviews (3-Monthly)', to: '/review-due' },
  { id: 'consents', label: 'Consents (18 Types)', to: '/compliance' },
  { id: 'assessments', label: 'Assessments', to: '/checklists' },
  { id: 'emergency', label: 'Emergency Information', to: '/emergency-response' },
  { id: 'documents', label: 'Documents (Vault)', to: '/documents' },
  { id: 'communications', label: 'Communications', to: '/communications' },
  { id: 'audit-history', label: 'Audit History', to: '/auditor-portal' },
  { id: 'compliance-status', label: 'Compliance Status', to: '/compliance' },
];

const EMPLOYEE_13_SECTIONS = [
  { id: 'overview', label: 'Overview', to: '#overview' },
  { id: 'position', label: 'Position', to: '/hr' },
  { id: 'department', label: 'Department', to: '/hr' },
  { id: 'competencies', label: 'Competencies', to: '/training' },
  { id: 'skills-assessments', label: 'Skills Assessments', to: '/training' },
  { id: 'certifications', label: 'Certifications', to: '/certificates' },
  { id: 'qualifications', label: 'Qualifications', to: '/documents' },
  { id: 'reviews', label: 'Reviews (12-Monthly)', to: '/hr' },
  { id: 'consents', label: 'Consents (12 Types)', to: '/compliance' },
  { id: 'compliance-status', label: 'Compliance Status', to: '/compliance' },
  { id: 'documents', label: 'Documents (Vault)', to: '/documents' },
  { id: 'communications', label: 'Communications', to: '/communications' },
  { id: 'audit-history', label: 'Audit History', to: '/auditor-portal' },
];

export default function CompleteProfile13SectionNavigator({ kind = 'staff', profile }) {
  const isParticipant = kind === 'participant';
  const sections = isParticipant ? PARTICIPANT_13_SECTIONS : EMPLOYEE_13_SECTIONS;
  const [selectedSection, setSelectedSection] = useState('overview');

  return (
    <section
      aria-label="Complete 13-Section Profile View & Multiple Access Paths"
      className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-3.5 shadow-sm space-y-2.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#0072FF]" />
            <span>
              Complete 13-Section {isParticipant ? 'Participant' : 'Employee'} Profile Standard · Multi-Path Linked
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-extrabold text-[#0A2B6D]">
            {profile?.full_name || (isParticipant ? 'Participant Profile' : 'Employee Profile')} — All 13 Mandatory Profile Domains &amp; NDIS Evidence Links
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="bg-[#0072FF] text-white text-[10px]">13 / 13 Domains Connected</Badge>
          <Badge className="bg-[#5A00D6] text-white text-[10px]">
            Owner: {isParticipant ? 'Support Coordinator / Manager' : 'HR & Compliance Manager'}
          </Badge>
        </div>
      </div>

      {/* 13 Section Pills */}
      <div className="flex flex-wrap gap-1.5">
        {sections.map((sec, idx) => {
          const isInternal = sec.to.startsWith('#');
          if (isInternal) {
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedSection(sec.id)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
                  selectedSection === sec.id
                    ? 'bg-[#0A2B6D] text-white'
                    : 'border border-slate-200 bg-[#F5F0FF] text-[#0A2B6D] hover:border-[#0072FF]'
                }`}
              >
                <CheckCircle2 className="h-3 w-3 text-[#00C6FF]" />
                <span>
                  {idx + 1}. {sec.label}
                </span>
              </button>
            );
          }
          return (
            <Link
              key={sec.id}
              to={sec.to}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#0A2B6D] transition hover:border-[#0072FF] hover:bg-[#F5F0FF]"
            >
              <span>
                {idx + 1}. {sec.label}
              </span>
              <ArrowUpRight className="h-3 w-3 text-[#5A00D6]" />
            </Link>
          );
        })}
      </div>

      {/* Multiple Access Paths Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F5F0FF] px-3 py-1.5 text-[11px] font-bold text-[#0A2B6D]">
        <span className="inline-flex items-center gap-1 text-[#5A00D6]">
          <Layers className="h-3.5 w-3.5" />
          Single-Source Record Accessible From:
        </span>
        <div className="flex flex-wrap gap-2">
          <Link to="/compliance" className="underline hover:text-[#0072FF]">Consent Register</Link>
          <span>·</span>
          <Link to="/compliance" className="underline hover:text-[#0072FF]">Compliance Module</Link>
          <span>·</span>
          <Link to="/documents" className="underline hover:text-[#0072FF]">Document Vault</Link>
          <span>·</span>
          <Link to="/review-due" className="underline hover:text-[#0072FF]">Related Reviews</Link>
          <span>·</span>
          <Link to="/auditor-portal" className="underline hover:text-[#0072FF]">Related Audits</Link>
        </div>
      </div>
    </section>
  );
}