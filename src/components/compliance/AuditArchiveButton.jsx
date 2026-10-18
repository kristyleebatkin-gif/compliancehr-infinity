import React, { useState } from 'react';
import JSZip from 'jszip';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { buildCsv } from '@/lib/csvExport';
import { Archive, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

/**
 * One-click compliance archive: bundles every uploaded compliance document
 * (staff, participant, company-safe, policies, checklists, audit files) into
 * a single ZIP with a manifest for audit records.
 */
const SOURCES = [
  {
    entity: 'EmployeeDocument',
    folder: '01-staff-documents',
    section: 'Staff Document',
    title: (d) => d.title,
    person: (d) => d.employee_name,
    type: (d) => d.document_type,
    date: (d) => d.expiry_date,
    resolveUri: (d) => d.file_uri || d.file_url,
    fileName: (d) => d.title,
    filter: { $or: [{ file_uri: { $exists: true, $ne: '' } }, { file_url: { $exists: true, $ne: '' } }], archived: { $ne: true } },
  },
  {
    entity: 'ParticipantDocument',
    folder: '02-participant-documents',
    section: 'Participant Document',
    title: (d) => d.title,
    person: (d) => d.participant_name,
    type: (d) => d.document_type,
    date: (d) => d.expiry_date,
    resolveUri: (d) => d.file_url,
    fileName: (d) => d.title,
    filter: { file_url: { $exists: true, $ne: '' } },
  },
  {
    entity: 'CompanySafeDocument',
    folder: '03-company-safe',
    section: 'Company Safe',
    title: (d) => d.title,
    person: (d) => d.owner_name,
    type: (d) => d.document_type,
    date: (d) => d.submitted_date,
    resolveUri: (d) => d.file_url,
    fileName: (d) => d.file_name || d.title,
    filter: { file_url: { $exists: true, $ne: '' } },
  },
  {
    entity: 'Policy',
    folder: '04-policies',
    section: 'Policy',
    title: (d) => d.document_name,
    type: (d) => d.category,
    date: (d) => d.review_date,
    resolveUri: (d) => d.file_url,
    fileName: (d) => d.document_name,
    filter: { file_url: { $exists: true, $ne: '' } },
  },
  {
    entity: 'ChecklistDocument',
    folder: '05-checklists',
    section: 'Checklist',
    title: (d) => d.title,
    type: (d) => d.category,
    date: (d) => d.upload_date,
    resolveUri: (d) => d.file_url,
    fileName: (d) => d.file_name || d.title,
    filter: { file_url: { $exists: true, $ne: '' } },
  },
  {
    entity: 'ComplianceChecklistEntry',
    folder: '05-checklists',
    section: 'Completed Checklist',
    title: (d) => d.title,
    person: (d) => d.completed_by,
    date: (d) => d.completed_date,
    resolveUri: (d) => d.file_uri,
    fileName: (d) => d.file_name || d.title,
    filter: { file_uri: { $exists: true, $ne: '' } },
  },
  {
    entity: 'AuditChecklistFile',
    folder: '06-audit-files',
    section: 'Audit Checklist File',
    title: (d) => d.title,
    person: (d) => d.uploaded_by,
    resolveUri: (d) => d.file_uri,
    fileName: (d) => d.file_name || d.title,
    filter: { file_uri: { $exists: true, $ne: '' } },
  },
];

const safeName = (label) => (label || '').replace(/[<>:"/\\|?*]+/g, '-').trim() || 'document';

const extensionFor = (record, url, blobType) => {
  const fromName = (record.file_name || record.file_uri || '').match(/\.[a-z0-9]{1,8}$/i)?.[0];
  if (fromName) return fromName;
  try {
    const fromUrl = decodeURIComponent(new URL(url, window.location.origin).pathname).match(/\.[a-z0-9]{1,8}$/i)?.[0];
    if (fromUrl) return fromUrl;
  } catch { /* relative or invalid url */ }
  const mimeMap = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'text/csv': '.csv',
    'text/plain': '.txt',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  };
  return mimeMap[blobType] || '';
};

async function fetchBlob(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  if (!blob.size) throw new Error('Empty file');
  return blob;
}

export default function AuditArchiveButton({ variant = 'outline' }) {
  const { toast } = useToast();
  const [bundling, setBundling] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const archive = async () => {
    setBundling(true);
    setProgress({ done: 0, total: 0 });
    try {
      // 1. Collect records that carry a file across all compliance entities.
      const jobs = [];
      for (const source of SOURCES) {
        const page = await base44.entities[source.entity].filter(source.filter, { sort: '-created_date', limit: 500 });
        for (const record of page.items) {
          jobs.push({ source, record });
        }
      }
      setProgress({ done: 0, total: jobs.length });

      const zip = new JSZip();
      const manifestRows = [];
      const usedNames = new Map();

      // 2. Resolve each file (private files get a signed URL) and add to the ZIP.
      for (const { source, record } of jobs) {
        const base = safeName(source.title(record));
        const count = (usedNames.get(`${source.folder}/${base}`) || 0) + 1;
        usedNames.set(`${source.folder}/${base}`, count);
        const nameWithCount = count > 1 ? `${base} (${count})` : base;

        let fileLabel = 'missing file';
        let status = 'No file attached';
        let blob = null;
        let blobType = '';
        try {
          const uri = source.resolveUri(record);
          if (uri) {
            const url = /^https?:\/\//i.test(uri) ? uri : (await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri })).signed_url;
            blob = await fetchBlob(url);
            blobType = blob.type;
            fileLabel = url;
            status = 'Included';
          }
        } catch (error) {
          status = `Could not retrieve (${error.message})`;
        }

        let entryName = `${source.folder}/${nameWithCount}`;
        if (blob) {
          const extension = extensionFor(record, fileLabel, blobType);
          entryName = `${source.folder}/${nameWithCount}${extension}`;
          zip.file(entryName, blob);
        }

        manifestRows.push({
          folder: source.folder,
          section: source.section,
          title: source.title(record) || '',
          person: source.person?.(record) || '',
          type: source.type?.(record) || '',
          date: source.date?.(record) || '',
          file: entryName,
          status,
        });
        setProgress((p) => ({ done: p.done + 1, total: p.total }));
      }

      // 3. Manifest and README, then download.
      zip.file('manifest.csv', buildCsv([
        { key: 'folder', label: 'Folder' },
        { key: 'section', label: 'Section' },
        { key: 'title', label: 'Document' },
        { key: 'person', label: 'Person' },
        { key: 'type', label: 'Type' },
        { key: 'date', label: 'Date (expiry / review / completed)' },
        { key: 'file', label: 'File in archive' },
        { key: 'status', label: 'Status' },
      ], manifestRows));
      const bundled = manifestRows.filter((r) => r.status === 'Included').length;
      zip.file('README.txt', [
        'Compliance Audit Archive',
        `Generated: ${format(new Date(), "d MMM yyyy, h:mma")}`,
        `Documents bundled: ${bundled} of ${manifestRows.length}`,
        '',
        'Contents: staff documents, participant documents, company-safe files,',
        'policies, checklists and audit checklist files, with a manifest.csv',
        'listing every record, its folder and retrieval status.',
      ].join('\n'));

      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      const url = URL.createObjectURL(zipBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `compliance-audit-archive-${format(new Date(), 'yyyy-MM-dd')}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Audit archive ready',
        description: `${bundled} of ${manifestRows.length} documents bundled into one ZIP.`,
      });
    } finally {
      setBundling(false);
      setProgress({ done: 0, total: 0 });
    }
  };

  return (
    <Button variant={variant} onClick={archive} disabled={bundling}>
      {bundling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
      {bundling
        ? `Bundling… ${progress.done}/${progress.total}`
        : 'Download full audit archive (ZIP)'}
    </Button>
  );
}