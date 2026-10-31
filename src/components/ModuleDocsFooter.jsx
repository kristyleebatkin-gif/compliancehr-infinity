import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Eye, ExternalLink, FileText, FolderOpen, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { safeUrl } from '@/lib/safeUrl';
import '@/components/employeeDocumentsCompact.css';

const MODULE_DOCS = [
  {
    match: '/our-employees',
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
    match: '/our-participants',
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
    const profileId = pathname.split('/')[2];
    const scope =
      profileId && cfg.entity === 'EmployeeDocument'
        ? { employee_id: profileId }
        : profileId && cfg.entity === 'ParticipantDocument'
          ? { participant_id: profileId }
          : {};
    base44.entities[cfg.entity]
      .filter({ ...cfg.query, ...scope }, { sort: cfg.sort, limit: 8 })
      .then((page) => {
        if (alive) setItems(page.items || []);
      })
      .catch(() => {
        if (alive) setItems([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [cfg?.match, pathname]);

  if (!cfg) return null;

  const open = async (doc) => {
    setOpening(doc.id);
    try {
      if (doc.file_uri) {
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
          file_uri: doc.file_uri,
        });
        window.open(signed_url, '_blank');
      } else if (safeUrl(doc.file_url)) {
        window.open(safeUrl(doc.file_url), '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOpening('');
    }
  };

  return (
    <div
      className={cn(
        'mx-auto max-w-[1440px] px-4 pb-10 pt-4 sm:px-6 lg:px-8',
        ['EmployeeDocument', 'ParticipantDocument'].includes(cfg.entity) && 'employee-documents-footer'
      )}
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700">
              <FolderOpen className="h-3.5 w-3.5 text-indigo-600" />
              <span>{cfg.title}</span>
            </span>
            <div className="text-xs font-medium text-slate-600">
              {cfg.subtitle}
            </div>
          </div>
          <Link
            to={`/documents?focus=${cfg.focus}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-indigo-700"
          >
            <span>Open in Document Vault</span>
            <ExternalLink className="h-3.5 w-3.5 text-white" />
          </Link>
        </div>

        <div>
          {loading ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> Loading documents…
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <div className="text-xs font-medium text-slate-600">
                No documents filed yet for {cfg.title}. Upload a record or generate a controlled template to populate this register automatically.
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/documents?focus=${cfg.focus}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  + Upload Document
                </Link>
                <Link
                  to="/checklists"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Complete Controlled Form
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((d) => {
                const date = cfg.date(d);
                return (
                  <div
                    key={d.id}
                    className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <FileText className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900" title={cfg.label(d)}>
                          {cfg.label(d)}
                        </div>
                        <div className="text-[11px] font-medium text-slate-500" title={cfg.meta(d)}>
                          {cfg.meta(d) || ' '}
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      {date ? (
                        <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {cfg.dateLabel}: {format(new Date(date), 'd MMM yyyy')}
                        </span>
                      ) : (
                        <span />
                      )}
                      {d.file_url || d.file_uri ? (
                        <button
                          onClick={() => open(d)}
                          disabled={opening === d.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          {opening === d.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Eye className="h-3 w-3 text-indigo-600" />
                          )}
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