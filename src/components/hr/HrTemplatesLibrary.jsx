import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { downloadTemplatePdf } from '@/lib/hrTemplatePdf';
import { mergeHrTemplate, hasUnresolvedTokens } from '@/lib/hrTemplateMerge';
import { getCompanyBranding, loadCompanyBranding } from '@/lib/companyBranding';
import HrTemplateEditor from '@/components/hr/HrTemplateEditor';
import { Loader2, FileText, Download, Copy, Wand2, Pencil, Plus } from 'lucide-react';

const CATEGORY_TONES = {
  Letter: 'bg-brand/10 text-brand',
  Form: 'bg-teal/10 text-teal',
  Contract: 'bg-safe/10 text-safe',
  Notice: 'bg-warning/10 text-warning',
  Other: 'bg-muted text-foreground/60',
};

// HR document templates library: pick a standard letter or form, pick a staff
// member, and the template is instantly populated with their data ({{placeholders}}).
export default function HrTemplatesLibrary() {
  const [templates, setTemplates] = useState(null);
  const [staff, setStaff] = useState([]);
  const [branding, setBranding] = useState(getCompanyBranding());
  const [me, setMe] = useState(null);
  const [selected, setSelected] = useState(null); // template being used
  const [staffId, setStaffId] = useState('');
  const [busy, setBusy] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = new template
  const { toast } = useToast();
  const canEdit = me?.role === 'admin' || me?.role === 'Provider Administrator';

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [tplPage, staffPage, meUser] = await Promise.all([
          base44.entities.HrTemplate.filter({ active: true }, { sort: '-created_date', limit: 100 }),
          base44.entities.StaffProfile.list(),
          base44.auth.me().catch(() => null),
        ]);
        if (cancelled) return;
        setTemplates((tplPage.items || []).sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.title.localeCompare(b.title)));
        setStaff((Array.isArray(staffPage) ? staffPage : staffPage.items || []).sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '')));
        setMe(meUser);
      } finally {
        if (!cancelled) setTemplates((prev) => (prev === null ? [] : prev));
      }
    };
    load();
    loadCompanyBranding().then((b) => { if (!cancelled && b) setBranding(b); });
    return () => { cancelled = true; };
  }, []);

  const chosen = useMemo(() => staff.find((s) => s.id === staffId) || null, [staff, staffId]);

  const merged = useMemo(
    () => (selected ? mergeHrTemplate(selected.content, chosen, branding, me) : ''),
    [selected, chosen, branding, me],
  );
  const hasUnresolved = hasUnresolvedTokens(merged);

  const openTemplate = (tpl) => {
    setSelected(tpl);
    setStaffId('');
  };

  const download = () => {
    setBusy(true);
    try {
      downloadTemplatePdf({
        title: selected.title,
        code: 'HR-TPL',
        body: merged,
        completedBy: me ? (me.full_name || me.email) : '',
      });
      toast({ title: 'Document downloaded', description: selected.title });
    } finally {
      setBusy(false);
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(merged);
      toast({ title: 'Copied to clipboard' });
    } catch {
      toast({ title: 'Could not copy', variant: 'destructive' });
    }
  };

  if (!templates) {
    return <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-foreground/60">
      <Loader2 className="h-4 w-4 animate-spin" />Loading template library...
    </CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-panel">
        <CardContent className="p-5">
          <div className="mb-1 flex items-center gap-2 font-display text-base font-bold"><Wand2 className="h-4 w-4 text-brand" />HR templates library</div>
          <p className="text-xs font-medium text-muted-foreground">Standard letters and forms, ready to go. Pick a template, choose a staff member and it is instantly populated with their details — then download the PDF or copy the text.</p>
          {canEdit && (
            <Button size="sm" className="mt-3" onClick={() => { setEditing(null); setEditorOpen(true); }}>
              <Plus className="h-4 w-4" />New template
            </Button>
          )}
        </CardContent>
      </Card>

      {templates.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-sm text-foreground/60">No templates in the library yet.</CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="shadow-panel flex flex-col">
              <CardContent className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Badge className={`border-transparent text-[11px] ${CATEGORY_TONES[tpl.category] || CATEGORY_TONES.Other}`}>{tpl.category}</Badge>
                  <FileText className="h-4 w-4 text-foreground/30" />
                </div>
                <h3 className="font-display text-sm font-bold">{tpl.title}</h3>
                <p className="mt-1 flex-1 text-xs text-muted-foreground">{tpl.description}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => openTemplate(tpl)}>Use template</Button>
                  {canEdit && (
                    <Button size="sm" variant="outline" onClick={() => { setEditing(tpl); setEditorOpen(true); }}>
                      <Pencil className="h-4 w-4" />Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="h-4 w-4 text-brand" />{selected?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <Label>Populate with staff member</Label>
              <Select value={staffId} onValueChange={setStaffId}>
                <SelectTrigger><SelectValue placeholder="Choose a staff member..." /></SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.full_name}{s.position ? ` — ${s.position}` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasUnresolved && (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                Some placeholders could not be filled for this selection and are shown as-is — edit the text before sending.
              </p>
            )}
            <div className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 font-elegant text-sm leading-relaxed">
              {merged}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={download} disabled={busy || !merged}><Download className="h-4 w-4" />Download PDF</Button>
              <Button variant="outline" onClick={copyText} disabled={!merged}><Copy className="h-4 w-4" />Copy text</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <HrTemplateEditor
        open={editorOpen}
        template={editing}
        staff={staff}
        me={me}
        branding={branding}
        onSaved={async () => {
          const tplPage = await base44.entities.HrTemplate.filter({ active: true }, { sort: '-created_date', limit: 100 });
          setTemplates((tplPage.items || []).sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.title.localeCompare(b.title)));
        }}
        onClose={() => setEditorOpen(false)}
      />
    </div>
  );
}