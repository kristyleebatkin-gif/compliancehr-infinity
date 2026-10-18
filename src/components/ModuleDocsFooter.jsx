import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Eye, ExternalLink, FileText, FolderOpen, Loader2 } from 'lucide-react';
import { differenceInCalendarDays, format } from 'date-fns';
import { cn } from '@/lib/utils';

// Module documents footer: shows the documents that belong to the module the
// user is in, neatly at the bottom of the page. Modules without their own
// document set show nothing, so the list stays accurate to the module.
const MODULE_DOCS = [
  {
    match: '/staff',
    title: 'Employee Documents',
    subtitle: 'Latest employee documents filed in the Document Vault.',
    entity: 'EmployeeDocument',
    query: { status: { $ne: 'Archived' } },
    sort: '-created_date',
    focus: 'employee',
    label: (d) => d.title || d.document_type || 'Untitled document',
    meta: (d) => [d.employee_name, d.document_type].filter(Boolean).join(' · '),
    date: (d) => d.expiry_date,
    dateLabel: 'Expiry',
  },
  {
    match: '/participants',
    title: 'Participant Documents',
    subtitle: 'Latest participant documents filed in the Document Vault.',
    entity: 'ParticipantDocument',
    query: {},
    sort: '-created_date',
    focus: 'participant',
    label: (d) => d.title || d.document_type || 'Untitled document',
    meta: (d) => [d.participant_name, d.document_type].filter(Boolean).join(' · '),
    date: (d) => d.review_date,
    dateLabel: 'Review',
  },
  {
    match: '/company-safe',
    title: 'Company Safe Documents',
    subtitle: 'Latest business documents stored in the Company Safe.',
    entity: 'CompanySafeDocument',
    query: {},
    sort: '-created_date',
    focus: 'business',
    label: (d) => d.title || d.document_type || 'Untitled document',
    meta: (d) => [d.category, d.owner_name].filter(Boolean).join(' · '),
    date: () => '',
    dateLabel: '',
  },
  {
    match: '/certificates',
    title: 'Training Certificates',
    subtitle: 'Latest certificates issued to your team.',
    entity: 'Certificate',
    query: {},
    sort: '-created_date',
    focus: 'employee',
    label: (d) => d.module_title || d.certificate_number || 'Certificate',
    meta: (d) => [d.staff_name, d.status].filter(Boolean).join(' · '),
    date: (d) => d.expiry_date,
    dateLabel: 'Expiry',
  },
  {
    match: '/checklists',
    title: 'Checklist Uploads',
    subtitle: 'Completed checklists and uploaded evidence.',
    entity: 'ChecklistDocument',
    query: {},
    sort: '-upload_date',
    focus: 'business',
    label: (d) => d.title || 'Untitled checklist',
    meta: (d) => [d.module_type, d.category, d.uploaded_by].filter(Boolean).join(' · '),
    date: (d) => d.upload_date,
    dateLabel: 'Uploaded',
  },
  {
    match: '/emergency-response',
    title: 'Emergency Documents',
    subtitle: 'Emergency plans, procedures and drill evidence.',
    entity: 'EmergencyDocument',
    query: {},
    sort: '-created_date',
    focus: 'business',
    label: (d) => d.title || 'Untitled document',
    meta: (d) => [d.doc_type, d.site_location].filter(Boolean).join(' · '),
    date: (d) => d.next_review_date,
    dateLabel: 'Next review',
  },
  {
    match: '/equipment-manuals',
    title: 'Equipment Manuals',
    subtitle: 'Operating manuals, MSDS and maintenance schedules.',
    entity: 'EquipmentManual',
    query: {},
    sort: '-created_date',
    focus: 'business',
    label: (d) => d.title || 'Untitled manual',
    meta: (d) => [d.equipment_name, d.manufacturer].filter(Boolean).join(' · '),
    date: (d) => d.review_date,
    dateLabel: 'Next review',
  },
];

const dateTone = (date) => {
  if (!date) return '';
  const days = differenceInCalendarDays(new Date(date), new Date());
  if (days < 0) return 'bg-danger/10 text-danger';
  if (days <= 30) return 'bg-warning/10 text-warning';
  return 'bg-safe/10 text-safe';
};

export default function ModuleDocsFooter() {
  const { pathname } = useLocation();
  const cfg = MODULE_DOCS.find((m) => pathname.startsWith(m.match));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState('');

  useEffect(() => {
    let alive = true;
    if (!cfg) return;
    setLoading(true);
    base44.entities[cfg.entity].filter(cfg.query, { sort: cfg.sort, limit: 8 })
      .then((page) => { if (alive) setItems(page.items || []); })
      .catch(() => { if (alive) setItems([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [cfg?.match]);

  if (!cfg) return null;

  const open = async (doc) => {
    setOpening(doc.id);
    try {
      if (doc.file_uri) {
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
        window.open(signed_url, '_blank');
      } else if (doc.file_url) {
        window.open(doc.file_url, '_blank');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOpening('');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 md:px-8">
      <section className="rounded-2xl border border-border/60 bg-card/80 shadow-panel backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg gradient-brand-soft">
              <FolderOpen className="h-5 w-5 text-brand" />
            </span>
            <div>
              <div className="font-heading text-base font-semibold">{cfg.title}</div>
              <div className="text-xs text-foreground/50">{cfg.subtitle}</div>
            </div>
          </div>
          <Link
            to={`/documents?focus=${cfg.focus}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            Open in Document Vault
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-foreground/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading documents…
            </div>
          ) : items.length === 0 ? (
            <div className="text-sm text-foreground/50">
              No documents filed yet for this module — uploads made here or in the Document Vault will appear below.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((d) => {
                const date = cfg.date(d);
                const tone = dateTone(date);
                return (
                  <div key={d.id} className="flex flex-col gap-2 rounded-xl border border-border/60 bg-white/70 p-3.5">
                    <div className="flex items-start gap-2">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold" title={cfg.label(d)}>{cfg.label(d)}</div>
                        <div className="truncate text-xs text-foreground/50" title={cfg.meta(d)}>{cfg.meta(d) || ' '}</div>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      {date ? (
                        <span className={cn('rounded-md px-2 py-0.5 text-[11px] font-semibold', tone)}>
                          {cfg.dateLabel}: {format(new Date(date), 'd MMM yyyy')}
                        </span>
                      ) : <span />}
                      {d.file_url || d.file_uri ? (
                        <button
                          onClick={() => open(d)}
                          disabled={opening === d.id}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold text-brand hover:bg-brand/5 disabled:opacity-50"
                        >
                          {opening === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                          View
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}