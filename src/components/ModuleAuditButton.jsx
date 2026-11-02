import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { MODULE_AUDIT_ENTITIES, gatherModuleAudit, downloadModuleAuditReport, resolveAuditModule } from '@/lib/moduleAuditReport';
import { base44 } from '@/api/base44Client';
import { Download, Loader2 } from 'lucide-react';

// Renders an internal audit report button for the current module screen.
// Hidden automatically on screens that have no audit scope (dashboard, hub pages).
export default function ModuleAuditButton() {
  const { pathname } = useLocation();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const seg = `/${pathname.split('/')[1] || ''}`;
  const module = resolveAuditModule(seg);
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
    <Button
      variant="outline"
      size="sm"
      onClick={run}
      disabled={busy}
      className="h-7 shrink-0 gap-1.5 rounded-full border-2 border-[#FF2E9A] bg-white px-3 py-1 text-[11px] font-extrabold text-[#0A2B6D] shadow-2xs hover:bg-[#F5F0FF] [&_svg]:mr-0 [&_svg]:size-3.5"
      style={{ borderColor: '#FF2E9A', color: '#0A2B6D' }}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" style={{ color: '#FF2E9A' }} />
      ) : (
        <Download className="h-3.5 w-3.5 shrink-0" style={{ color: '#FF2E9A' }} />
      )}
      <span style={{ color: '#0A2B6D' }}>Audit report</span>
    </Button>
  );
}