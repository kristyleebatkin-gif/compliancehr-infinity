import React from 'react';
import { Download, FileText } from 'lucide-react';

export default function TemplateDownloadButton({ label, onClick }) {
  return <button onClick={onClick} className="flex min-w-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-xs hover:bg-accent">
    <FileText className="h-4 w-4 shrink-0 text-primary" />
    <span className="min-w-0 flex-1 break-words">{label}</span>
    <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
  </button>;
}