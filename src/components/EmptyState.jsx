import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen, ClipboardCheck, Sparkles } from 'lucide-react';
import { moduleColour } from '@/lib/moduleColours';

// No Empty Sections Rule: Where information does not yet exist, always display
// helpful guidance, quick actions, and create buttons — never large empty areas.
export default function EmptyState({
  icon: Icon,
  title,
  message,
  subtitle,
  action,
  modulePath = 'General',
  createHref = '/record-intelligence',
  createLabel = 'Create / File Record',
}) {
  const accent = moduleColour(modulePath);
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#0A2B6D]/25 bg-[#F5F0FF]/35 px-5 py-6 text-center">
      {Icon && (
        <div
          className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-2xs"
          style={{ border: `2px solid ${accent}` }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
      )}
      <div className="font-editorial text-sm sm:text-base font-extrabold text-[#0A2B6D]">
        {title || 'Ready for Your First Entry'}
      </div>
      <div className="mt-1 max-w-md text-xs font-semibold text-[#0A2B6D]/80">
        {message ||
          subtitle ||
          'No records are filed in this view yet. Use the quick actions below to create a record, upload evidence to the Document Vault, or launch a controlled form.'}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {action || (
          <Link
            to={createHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2B6D] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-2xs transition hover:bg-[#5A00D6]"
          >
            <Plus className="h-3.5 w-3.5 text-[#00C6FF]" />
            <span>{createLabel}</span>
          </Link>
        )}
        <Link
          to="/documents"
          className="inline-flex items-center gap-1 rounded-full border border-[#0A2B6D]/30 bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] transition hover:border-[#0072FF]"
        >
          <FolderOpen className="h-3.5 w-3.5 text-[#0072FF]" />
          <span>Open Document Vault</span>
        </Link>
        <Link
          to="/checklists"
          className="inline-flex items-center gap-1 rounded-full border border-[#0A2B6D]/30 bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] transition hover:border-[#5A00D6]"
        >
          <ClipboardCheck className="h-3.5 w-3.5 text-[#5A00D6]" />
          <span>Open Forms &amp; Checklists</span>
        </Link>
        <Link
          to="/registers"
          className="inline-flex items-center gap-1 rounded-full border border-[#0A2B6D]/30 bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] transition hover:border-[#FF2E9A]"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#FF2E9A]" />
          <span>View 45 Master Registers</span>
        </Link>
      </div>
    </div>
  );
}