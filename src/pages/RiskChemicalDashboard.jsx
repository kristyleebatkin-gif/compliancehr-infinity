import React from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw, ShieldAlert } from 'lucide-react';
import RiskChemicalSummary from '@/components/safety/RiskChemicalSummary';
import RiskChemicalBreakdown from '@/components/safety/RiskChemicalBreakdown';
import RiskChemicalDueList from '@/components/safety/RiskChemicalDueList';
import '@/components/executive/executiveGlass.css';

export default function RiskChemicalDashboard() {
  const queryClient = useQueryClient();
  return (
    <div className="mx-auto max-w-[1440px] space-y-4 p-3 md:p-5">
      <header className="executive-glass-surface rounded-xl border border-header-foreground/20 p-5 text-header-foreground shadow-panel">
        <Link to="/risks" className="inline-flex items-center gap-1 text-xs font-bold text-header-foreground hover:underline"><ArrowLeft className="h-3.5 w-3.5" />Risk register</Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-wider">Safety overview</p><h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold"><ShieldAlert className="h-6 w-6" />Risks &amp; Chemicals Dashboard</h1><p className="mt-2 text-sm">Monitor open risks, recorded hazard classes, risk reviews and asset service dates.</p></div>
          <button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ['risk-chemical-dashboard'] })} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-header-foreground/30 px-3 text-sm font-bold hover:bg-workspace-navy"><RefreshCw className="h-4 w-4" />Refresh</button>
        </div>
      </header>
      <p className="text-xs text-muted-foreground">Shows records available to your account. Service dates come from the asset register; chemical hazard classes are shown as recorded.</p>
      <RiskChemicalSummary />
      <div className="grid gap-4 lg:grid-cols-2"><RiskChemicalBreakdown kind="risk" /><RiskChemicalBreakdown kind="chemical" /></div>
      <div className="grid gap-4 lg:grid-cols-2"><RiskChemicalDueList kind="risk" /><RiskChemicalDueList kind="asset" /></div>
    </div>
  );
}