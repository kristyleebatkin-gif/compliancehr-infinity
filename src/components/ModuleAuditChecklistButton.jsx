import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { MODULE_AUDIT_ENTITIES, gatherModuleAudit, resolveAuditModule } from '@/lib/moduleAuditReport';
import { buildModuleAuditChecklist, buildCorrectiveActions } from '@/lib/moduleAuditChecklists';
import { downloadAuditChecklistPdf, printAuditChecklist } from '@/lib/auditChecklistPdf';
import { ClipboardCheck, Download, Loader2, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';

const itemTone = (status) => (status === 'Pass'
  ? 'bg-safe/10 text-safe'
  : status === 'Attention'
    ? 'bg-warning/10 text-warning'
    : 'bg-muted text-foreground/60');

// Openable per-module compliance audit checklist, evaluated live from the
// module's registers so it always shows the module's current compliance state.
export default function ModuleAuditChecklistButton() {
  const { pathname } = useLocation();
  const { toast } = useToast();
  const seg = `/${pathname.split('/')[1] || ''}`;
  const module = resolveAuditModule(seg);
  const inScope = module && MODULE_AUDIT_ENTITIES[seg];
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState(null);
  const [exporting, setExporting] = useState(false);

  const run = async () => {
    if (!inScope) return;
    setOpen(true);
    setLoading(true);
    setChecklist(null);
    try {
      const audit = await gatherModuleAudit(seg);
      setChecklist({
        label: module.label,
        ...buildModuleAuditChecklist(audit),
        actions: buildCorrectiveActions(audit),
      });
    } catch (e) {
      toast({ title: 'Checklist failed to load', description: e?.message || 'Please try again', variant: 'destructive' });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (!inScope) return null;

  const exportPdf = async () => {
    if (!checklist) return;
    setExporting(true);
    try {
      let generatedBy = '';
      try { generatedBy = (await base44.auth.me())?.full_name || ''; } catch { }
      downloadAuditChecklistPdf({
        moduleLabel: checklist.label,
        items: checklist.items,
        actions: checklist.actions,
        generatedBy,
      });
      toast({ title: 'Audit checklist PDF downloaded' });
    } catch (e) {
      toast({ title: 'Export failed', description: e?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const printNow = () => {
    if (!checklist) return;
    printAuditChecklist({
      moduleLabel: checklist.label,
      items: checklist.items,
      actions: checklist.actions,
    });
  };

  const passes = checklist?.items?.filter((i) => i.status === 'Pass').length || 0;
  const attentions = checklist?.items?.filter((i) => i.status === 'Attention').length || 0;

  return (
    <>
      <Button variant="outline" size="sm" onClick={run} className="h-7 shrink-0 gap-1 rounded-lg border-border/60 bg-card/75 px-2 text-[11px] font-semibold shadow-sm hover:bg-muted [&_svg]:mr-0 [&_svg]:size-3">
        <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />
        Audit checklist
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <DialogTitle className="font-display text-xl">
                Compliance Audit Checklist — {module.label}
              </DialogTitle>
              {checklist && !loading && (
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="outline" size="sm" onClick={printNow} className="rounded-lg border-border/60 bg-card/75 text-[13px] font-semibold shadow-sm hover:bg-muted">
                    <Printer className="mr-1.5 h-3.5 w-3.5" />
                    Print
                  </Button>
                  <Button size="sm" onClick={exportPdf} disabled={exporting} className="rounded-lg bg-primary text-[13px] font-semibold shadow-sm">
                    {exporting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                    Download PDF
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-foreground/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking live registers…
            </div>
          ) : checklist ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded-md bg-safe/10 px-2 py-1 text-safe">{passes} passed</span>
                <span className="rounded-md bg-warning/10 px-2 py-1 text-warning">{attentions} need attention</span>
                <span className="rounded-md bg-muted px-2 py-1 text-foreground/60">Evaluated live just now</span>
              </div>

              <ol className="space-y-2">
                {checklist.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-xl border border-border/60 bg-white/70 p-3">
                    <span className={cn('mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold', itemTone(item.status))}>
                      {item.status}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold leading-snug">{item.item}</div>
                      <div className="text-xs text-foreground/55">{item.evidence}</div>
                    </div>
                  </li>
                ))}
              </ol>

              {checklist.actions?.length > 0 && (
                <div className="rounded-xl border border-warning/40 bg-warning/5 p-4">
                  <div className="mb-2 text-sm font-bold text-warning">Corrective Action Register ({checklist.actions.length} open)</div>
                  <ul className="space-y-1.5 text-sm">
                    {checklist.actions.map((a, i) => (
                      <li key={i} className="flex items-start justify-between gap-3">
                        <span>{a.action}</span>
                        <span className="shrink-0 text-xs text-foreground/55">Owner: {a.owner} · Due {a.due}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-foreground/50">
                The Audit report button downloads this checklist with evidence and corrective actions, and logs the audit in the Internal Audit Register.
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}