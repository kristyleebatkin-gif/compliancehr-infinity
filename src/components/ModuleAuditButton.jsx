import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { MODULE_AUDIT_ENTITIES, gatherModuleAudit, downloadModuleAuditReport } from '@/lib/moduleAuditReport';
import { base44 } from '@/api/base44Client';
import { Download, Loader2 } from 'lucide-react';

// Renders an internal audit report button for the current module screen.
// Hidden automatically on screens that have no audit scope (dashboard, hub pages).
export default function ModuleAuditButton() {
  const { pathname } = useLocation();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const seg = `/${pathname.split('/')[1] || ''}`;
  const module = MODULE_DIRECTORY.find((m) => m.path === seg);
  const inScope = module && MODULE_AUDIT_ENTITIES[seg];

  const run = async () => {
    if (!inScope) return;
    setBusy(true);
    try {
      const audit = await gatherModuleAudit(seg);
      let generatedBy = '';
      try { generatedBy = (await base44.auth.me())?.full_name || ''; } catch { }
      await downloadModuleAuditReport(audit, module.label, { generatedBy });
      toast({ title: `Internal audit report for ${module.label} downloaded and logged` });
    } catch (e) {
      toast({ title: 'Audit report failed', description: e?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  if (!inScope) return null;
  return (
    <Button variant="outline" size="sm" onClick={run} disabled={busy} className="shrink-0 rounded-lg border-border/60 bg-card/75 text-[13px] font-semibold shadow-sm hover:bg-muted">
      {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
      Audit report
    </Button>
  );
}