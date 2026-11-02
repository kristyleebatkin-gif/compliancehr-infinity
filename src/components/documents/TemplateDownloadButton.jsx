import React from 'react';
import { Download, Eye, FileText } from 'lucide-react';
import { openDocumentInViewer } from '@/lib/openDocument';

export default function TemplateDownloadButton({ label, onClick }) {
  const handleOpenAndDownload = () => {
    openDocumentInViewer({
      title: label,
      category: 'Official Controlled Template',
      module: 'Document Vault & Policy Manual',
      status: 'Approved Template',
    });
    if (onClick) onClick();
  };
  return (
    <button
      type="button"
      onClick={handleOpenAndDownload}
      className="flex min-w-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-xs hover:bg-accent"
    >
      <FileText className="h-4 w-4 shrink-0 text-primary" />
      <span className="min-w-0 flex-1 break-words font-semibold">{label}</span>
      <Eye className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
      <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </button>
  );
}