import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { downloadTemplatePdf } from '@/lib/hrTemplatePdf';
import { mergeHrTemplate, hasUnresolvedTokens } from '@/lib/hrTemplateMerge';
import { getCompanyBranding, loadCompanyBranding } from '@/lib/companyBranding';
import { FileText, Download } from 'lucide-react';

/**
 * Generate an HR document for one staff member: pick a template, it is
 * instantly merged with this staff member's data, then download the PDF.
 */
export default function StaffTemplateGenerator({ staff }) {
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [branding, setBranding] = useState(getCompanyBranding());
  const [busy, setBusy] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    let cancelled = false;
    base44.auth.me().then((user) => { if (!cancelled) setMe(user); }).catch((error) => console.error(error));
    base44.entities.HrTemplate.filter({ active: true }, { sort: '-created_date', limit: 100 })
      .then((page) => { if (!cancelled) setTemplates(page.items || []); })
      .catch((error) => console.error(error));
    loadCompanyBranding().then((b) => { if (!cancelled && b) setBranding(b); });
    return () => { cancelled = true; };
  }, []);

  const selected = templates.find((t) => t.id === selectedId) || null;

  const merged = useMemo(
    () => (selected ? mergeHrTemplate(selected.content, staff, branding, me) : ''),
    [selected, staff, branding, me],
  );

  const download = () => {
    if (!selected) return;
    setBusy(true);
    try {
      downloadTemplatePdf({
        title: selected.title,
        body: merged,
        completedBy: me ? (me.full_name || me.email) : '',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground/60">Generate HR Document</h3>
      </div>
      <p className="mt-1 text-xs text-foreground/50">
        Pick a template and it is instantly populated with {staff.full_name}'s details.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="sm:flex-1">
            <SelectValue placeholder="Select a template..." />
          </SelectTrigger>
          <SelectContent>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="sm:self-start" disabled={!selected || busy} onClick={download}>
          <Download className="h-4 w-4" />Download PDF
        </Button>
      </div>
      {selected && (
        <div className="mt-3">
          {hasUnresolvedTokens(merged) && (
            <p className="mb-2 text-xs font-medium text-warning">Some details are missing on this staff profile — those spots stay blank for manual fill-in.</p>
          )}
          <div className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/40 p-3 text-xs leading-relaxed text-foreground/80">
            {merged}
          </div>
        </div>
      )}
    </div>
  );
}