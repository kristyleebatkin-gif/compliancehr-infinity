import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FolderOpen, Loader2, Users, Heart, ClipboardList, Building2, ScrollText, Layers, CalendarClock, ClipboardCheck, AlertTriangle, Zap, Ambulance, ShieldPlus } from 'lucide-react';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import { cn } from '@/lib/utils';

/**
 * Documents Dashboard: one colour-coded card per subject/register in the vault,
 * with a live overview count and a full CSV export for each.
 */
const SUBJECTS = [
  { key: 'participants', title: 'Participants', icon: Heart, colour: '#db2777', soft: '#fdf2f8', blurb: 'Participant documents, plans and uploaded records', entity: 'ParticipantDocument', link: '/participants' },
  { key: 'staff', title: 'Staff Documents', icon: Users, colour: '#2563eb', soft: '#eff6ff', blurb: 'Employee contracts, checks and compliance files', entity: 'EmployeeDocument', link: '/our-employees' },
  { key: 'participant-forms', title: 'Participant Forms', icon: FolderOpen, colour: '#9333ea', soft: '#faf5ff', blurb: 'Official participant service forms and completed uploads', anchor: 'vault-participant' },
  { key: 'business', title: 'Business Plans', icon: Building2, colour: '#0891b2', soft: '#ecfeff', blurb: 'Business, strategic and operational plan templates', anchor: 'vault-business' },
  { key: 'policies', title: 'Policies & Procedures', icon: ScrollText, colour: '#4f46e5', soft: '#eef2ff', blurb: 'NDIS policy and procedure manual, all volumes', anchor: 'vault-business' },
  { key: 'registers', title: 'Registers', icon: Layers, colour: '#0d9488', soft: '#f0fdfa', blurb: 'Blank register templates for every compliance log', anchor: 'vault-business' },
  { key: 'meetings', title: 'Meetings', icon: CalendarClock, colour: '#6366f1', soft: '#eef2ff', blurb: 'Meeting records, minutes, actions and attendance', entity: 'Meeting', link: '/meetings' },
  { key: 'audit', title: 'Audit', icon: ClipboardCheck, colour: '#4f46e5', soft: '#eef2ff', blurb: 'Internal audits, NDIS audits and audit actions', entity: 'Audit', link: '/compliance' },
  { key: 'risk', title: 'Risk', icon: AlertTriangle, colour: '#ea580c', soft: '#fff7ed', blurb: 'Risk register, assessments and treatments', entity: 'Risk', link: '/risks' },
  { key: 'incident', title: 'Incident', icon: Zap, colour: '#dc2626', soft: '#fef2f2', blurb: 'Incident reports, investigations and follow-ups', entity: 'Incident', link: '/incidents' },
  { key: 'emergency', title: 'Emergency', icon: Ambulance, colour: '#b91c1c', soft: '#fef2f2', blurb: 'Emergency documents, drills and resources', entity: 'EmergencyDocument', link: '/emergency-response' },
  { key: 'infection', title: 'Infection Control', icon: ShieldPlus, colour: '#16a34a', soft: '#f0fdf4', blurb: 'Infection control checklists and standards evidence', entity: 'Checklist', link: '/checklists' },
];

export default function DocumentsDashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const results = await Promise.allSettled(
        SUBJECTS.filter((s) => s.entity).map((s) => base44.entities[s.entity].count({})),
      );
      if (!alive) return;
      const next = {};
      SUBJECTS.filter((s) => s.entity).forEach((s, i) => {
        next[s.key] = results[i].status === 'fulfilled' ? results[i].value : null;
      });
      setCounts(next);
    })();
    return () => { alive = false; };
  }, []);

  const open = (subject) => {
    if (subject.anchor) {
      document.getElementById(subject.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (subject.link) {
      navigate(subject.link);
    }
  };

  const exportSubject = async (subject) => {
    if (!subject.entity) return;
    const rows = await fetchAllRecords(base44.entities[subject.entity]);
    if (!rows.length) return;
    const columns = Object.keys(rows[0]).map((key) => ({ key, label: key }));
    downloadCsv(`${subject.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-register.csv`, columns, rows);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 shadow-md">
          <FolderOpen className="h-4 w-4 text-white" />
        </span>
        <h2 className="text-lg font-bold font-editorial text-foreground">Documents Dashboard</h2>
        <span className="h-1 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
        <Badge variant="outline" className="bg-accent/60 text-accent-foreground">{SUBJECTS.length} subjects &amp; topics</Badge>
        <span className="flex-1" />
        <span className="text-xs font-medium text-muted-foreground">Overview and full export for every subject</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SUBJECTS.map((subject) => {
          const Icon = subject.icon;
          const count = subject.entity ? counts[subject.key] : undefined;
          return (
            <div
              key={subject.key}
              role="button"
              tabIndex={0}
              onClick={() => open(subject)}
              onKeyDown={(e) => { if (e.key === 'Enter') open(subject); }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-panel transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2"
              style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 10px 28px -18px rgba(15,23,42,0.25)' }}
            >
              <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${subject.colour}, ${subject.colour}88)` }} />
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-200 group-hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${subject.colour}, ${subject.colour}b3)` }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold" style={{ color: subject.colour }}>{subject.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{subject.blurb}</p>
                  </div>
                  {subject.entity && (
                    <span
                      className="rounded-lg px-2.5 py-1 text-lg font-extrabold tabular-nums"
                      style={{ background: subject.soft, color: subject.colour }}
                    >
                      {count == null ? <Loader2 className="h-4 w-4 animate-spin" /> : count}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                  <span className="text-xs font-semibold" style={{ color: subject.colour }}>
                    {subject.anchor ? 'Open library' : subject.entity ? 'Open module' : ''}
                  </span>
                  {subject.entity && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px]"
                      onClick={(e) => { e.stopPropagation(); exportSubject(subject); }}
                    >
                      <Download className="h-3 w-3" />Export CSV
                    </Button>
                  )}
                </div>
              </div>
              <div className={cn('pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100')} style={{ background: `radial-gradient(400px circle at 20% -20%, ${subject.soft}, transparent)` }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}