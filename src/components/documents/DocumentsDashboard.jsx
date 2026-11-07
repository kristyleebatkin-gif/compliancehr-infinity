import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Users, Heart, Building2, ScrollText, Layers, CalendarClock, ClipboardCheck, AlertTriangle, Zap, Ambulance, ShieldPlus, Target, MessageSquare, Boxes, Share2, FileSignature, HeartHandshake, Recycle, Scale, Briefcase, UserCog, Award } from 'lucide-react';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import DocumentSubjectCard from '@/components/documents/DocumentSubjectCard';
import { companySafeBusinessQuery as safeUploadQuery } from '@/lib/companySafeVault';

/**
 * Documents Dashboard: one colour-coded card per subject/register in the vault,
 * with a live overview count and a full CSV export for each.
 */
const SUBJECTS = [
  { key: 'staff', title: 'Staff Documents', icon: Users, colour: '#2563eb', soft: '#eff6ff', blurb: 'Employee contracts, checks, badges and compliance files', entity: 'EmployeeDocument', anchor: 'staff-docs' },
  { key: 'participants', title: 'Participants', icon: Heart, colour: '#db2777', soft: '#fdf2f8', blurb: 'Participant documents, plans and uploaded records', entity: 'ParticipantDocument', anchor: 'participant-docs' },
  { key: 'goals', title: 'Goal Progress', icon: Target, colour: '#0d9488', soft: '#f0fdfa', blurb: 'Participant goals, progress notes and reports', entity: 'Goal', link: '/goals' },
  { key: 'business-doc', title: 'Business Documents', icon: Briefcase, colour: '#0891b2', soft: '#ecfeff', blurb: 'Company safe documents, certificates and registrations', entity: 'CompanyDocument', anchor: 'vault-subject-business-doc' },
  { key: 'business', title: 'Business Plans', icon: Building2, colour: '#0369a1', soft: '#eff6ff', blurb: 'Business, strategic and operational plan templates', anchor: 'vault-business' },
  { key: 'policies', title: 'Policies & Procedures', icon: ScrollText, colour: '#4f46e5', soft: '#eef2ff', blurb: 'NDIS policy and procedure manual, every volume', anchor: 'vault-business' },
  { key: 'registers', title: 'Registers', icon: Layers, colour: '#7c3aed', soft: '#faf5ff', blurb: 'Blank register templates for every compliance log', anchor: 'vault-business' },
  { key: 'waste', title: 'Waste Management', icon: Recycle, colour: '#16a34a', soft: '#f0fdf4', blurb: 'Waste management plan and clinical waste handling templates', anchor: 'vault-business' },
  { key: 'delegation', title: 'Delegation', icon: UserCog, colour: '#b45309', soft: '#fffbeb', blurb: 'Delegation of authority register and authorisation templates', anchor: 'vault-business' },
  { key: 'conflict', title: 'Conflict of Interest', icon: Scale, colour: '#be123c', soft: '#fff1f2', blurb: 'Conflict of interest register and policy templates', anchor: 'vault-business' },
  { key: 'consents', title: 'Consents', icon: FileSignature, colour: '#9333ea', soft: '#faf5ff', blurb: 'Information sharing consents and audit consents', entity: 'InformationSharingConsent', link: '/compliance' },
  { key: 'advocate', title: 'Act as Advocate', icon: HeartHandshake, colour: '#db2777', soft: '#fdf2f8', blurb: 'Authority to act as advocate and nominee forms', link: '/participants' },
  { key: 'quality', title: 'Quality & Improvement', icon: Award, colour: '#4338ca', soft: '#eef2ff', blurb: 'Quality items, improvement actions and reviews', entity: 'QualityItem', link: '/quality' },
  { key: 'feedback', title: 'Feedback', icon: MessageSquare, colour: '#e11d48', soft: '#fff1f2', blurb: 'Feedback, complaints and satisfaction surveys', entity: 'Feedback', link: '/feedback' },
  { key: 'assets', title: 'Asset Management', icon: Boxes, colour: '#ca8a04', soft: '#fefce8', blurb: 'Asset register, maintenance and compliance reviews', entity: 'Asset', link: '/assets' },
  { key: 'referral', title: 'Referral', icon: Share2, colour: '#0ea5e9', soft: '#f0f9ff', blurb: 'Referrals, community services and support letters', entity: 'Referral', link: '/referrals' },
  { key: 'meetings', title: 'Meetings', icon: CalendarClock, colour: '#6366f1', soft: '#eef2ff', blurb: 'Meeting records, minutes, actions and attendance', entity: 'Meeting', link: '/meetings' },
  { key: 'audit', title: 'Audit', icon: ClipboardCheck, colour: '#4f46e5', soft: '#eef2ff', blurb: 'Internal audits, NDIS audits and audit actions', entity: 'Audit', link: '/compliance' },
  { key: 'risk', title: 'Risk', icon: AlertTriangle, colour: '#ea580c', soft: '#fff7ed', blurb: 'Risk register, assessments and treatments', entity: 'Risk', link: '/risks' },
  { key: 'incident', title: 'Incident', icon: Zap, colour: '#dc2626', soft: '#fef2f2', blurb: 'Incident reports, investigations and follow-ups', entity: 'Incident', link: '/incidents' },
  { key: 'emergency', title: 'Emergency', icon: Ambulance, colour: '#b91c1c', soft: '#fef2f2', blurb: 'Emergency documents, drills and resources', entity: 'EmergencyDocument', link: '/emergency-response' },
  { key: 'infection', title: 'Infection Control', icon: ShieldPlus, colour: '#15803d', soft: '#f0fdf4', blurb: 'Infection control checklists and standards evidence', entity: 'Checklist', link: '/checklists' },
];

export default function DocumentsDashboard({ role, focus }) {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [expanded, setExpanded] = useState(null);
  useEffect(() => {
    const section = { business: 'business', policies: 'policies', registers: 'registers', company: 'business-doc' }[focus];
    if (section) setExpanded(section);
  }, [focus]);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const results = await Promise.allSettled(
        SUBJECTS.filter((s) => s.entity).map(async (s) => s.key === 'business-doc'
          ? (await base44.entities.CompanyDocument.count({ status: { $ne: 'Archived' } })) + (await base44.entities.FormsLibraryDocument.count(safeUploadQuery))
          : base44.entities[s.entity].count({})), 
      );
      if (!alive) return;
      const next = {};
      SUBJECTS.filter((s) => s.entity).forEach((s, i) => {
        next[s.key] = results[i].status === 'fulfilled' ? results[i].value : null;
      });
      setCounts(next);
    };
    refresh();
    const unsubscribeUploads = base44.entities.FormsLibraryDocument.subscribe(refresh);
    const unsubscribeCompany = base44.entities.CompanyDocument.subscribe(refresh);
    return () => { alive = false; unsubscribeUploads(); unsubscribeCompany(); };
  }, []);

  const open = (subject) => {
    if (['business-doc', 'business', 'policies', 'registers'].includes(subject.key)) {
      setExpanded((current) => current === subject.key ? null : subject.key);
    } else if (subject.anchor === 'vault-business') {
      setExpanded('business');
      requestAnimationFrame(() => document.getElementById('vault-subject-business')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } else if (subject.anchor) {
      document.getElementById(subject.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (subject.link) {
      navigate(subject.link);
    }
  };

  const exportSubject = async (subject) => {
    if (!subject.entity) return;
    const rows = subject.key === 'business-doc'
      ? (await Promise.all([
        fetchAllRecords(base44.entities.CompanyDocument, { status: { $ne: 'Archived' } }).then((records) => records.map((record) => ({ ...record, title: record.name, document_type: record.category, source: 'CompanyDocument' }))),
        fetchAllRecords(base44.entities.FormsLibraryDocument, safeUploadQuery).then((records) => records.map((record) => ({ ...record, source: 'FormsLibraryDocument' }))),
      ])).flat()
      : await fetchAllRecords(base44.entities[subject.entity]);
    if (!rows.length) return;
    const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))].map((key) => ({ key, label: key }));
    downloadCsv(`${subject.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-register.csv`, columns, rows);
  };

  return (
    <div id="vault-dashboard" className="scroll-mt-24 space-y-2">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 p-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 shadow-md">
          <FolderOpen className="h-4 w-4 text-white" />
        </span>
        <h2 className="text-sm font-bold text-foreground">Document libraries &amp; subject dashboard</h2>
        <span className="h-1 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
        <Badge variant="outline" className="bg-accent/60 text-accent-foreground">{SUBJECTS.length} subjects &amp; topics</Badge>
        <span className="flex-1" />
        <span className="text-xs font-medium text-muted-foreground">Overview and full export for every subject</span>
      </div>

      <div className="grid items-start gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {SUBJECTS.map((subject) => <DocumentSubjectCard key={subject.key} subject={subject} count={counts[subject.key]} expanded={expanded === subject.key} onOpen={open} onExport={exportSubject} role={role} />)}
      </div>
    </div>
  );
}