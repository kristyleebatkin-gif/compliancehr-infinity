import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import {
  RefreshCw, Download, LayoutDashboard, ExternalLink,
  ClipboardList, CalendarDays, Target, Sparkles, AlertTriangle,
  FileText, Receipt, FileSignature, GraduationCap, CalendarClock,
  CheckSquare, MessageSquare, ShieldCheck, BarChart3, FolderOpen,
  Mail, FolderKanban, UsersRound, ShoppingCart, Siren, Package,
  Activity, Heart, Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';

const MODULES = [
  { key: 'intake', title: 'Intake Centre', href: '/intake', icon: ClipboardList, bar: 'bg-violet-500' },
  { key: 'rostering', title: 'Rostering', href: '/roster', icon: CalendarDays, bar: 'bg-blue-500' },
  { key: 'goals', title: 'Goal Progress', href: '/goals', icon: Target, bar: 'bg-emerald-500' },
  { key: 'programs', title: 'Programs & Events', href: '/programs', icon: Sparkles, bar: 'bg-pink-500' },
  { key: 'risks', title: 'Risk Reporting', href: '/risks', icon: AlertTriangle, bar: 'bg-red-500' },
  { key: 'invoicing', title: 'Invoicing', href: '/invoicing', icon: FileText, bar: 'bg-green-600' },
  { key: 'receipts', title: 'Receipts', href: '/receipts', icon: Receipt, bar: 'bg-teal-500' },
  { key: 'quotes', title: 'Quotes', href: '/quotes', icon: FileSignature, bar: 'bg-indigo-500' },
  { key: 'training', title: 'Training Centre', href: '/training', icon: GraduationCap, bar: 'bg-cyan-500' },
  { key: 'meetings', title: 'Meeting Centre', href: '/meetings', icon: CalendarClock, bar: 'bg-amber-500' },
  { key: 'tasks', title: 'Tasks', href: '/tasks', icon: CheckSquare, bar: 'bg-orange-500' },
  { key: 'feedback', title: 'Feedback & Surveys', href: '/feedback', icon: MessageSquare, bar: 'bg-rose-500' },
  { key: 'quality', title: 'Quality & Improvement', href: '/quality', icon: ShieldCheck, bar: 'bg-emerald-600' },
  { key: 'analytics', title: 'Business Analytics', href: '/analytics', icon: BarChart3, bar: 'bg-fuchsia-500' },
  { key: 'documents', title: 'Document Vault', href: '/documents', icon: FolderOpen, bar: 'bg-slate-500' },
  { key: 'communications', title: 'Communication Centre', href: '/communications', icon: Mail, bar: 'bg-sky-500' },
  { key: 'projects', title: 'Projects', href: '/projects', icon: FolderKanban, bar: 'bg-purple-500' },
  { key: 'crm', title: 'CRM & Leads', href: '/crm', icon: UsersRound, bar: 'bg-pink-600' },
  { key: 'procurement', title: 'Procurement', href: '/procurement', icon: ShoppingCart, bar: 'bg-lime-600' },
  { key: 'emergency', title: 'Emergency Response', href: '/emergency-response', icon: Siren, bar: 'bg-red-600' },
  { key: 'assets', title: 'Asset Management', href: '/assets', icon: Package, bar: 'bg-amber-600' },
  { key: 'incidents', title: 'Incident Analytics', href: '/incident-analytics', icon: Activity, bar: 'bg-orange-600' },
  { key: 'volunteers', title: 'Volunteering & Placements', href: '/volunteers', icon: Heart, bar: 'bg-rose-600' },
  { key: 'hr', title: 'HR Hub', href: '/hr', icon: Briefcase, bar: 'bg-indigo-600' },
];

const ADMIN_ROLES = ['admin', 'Provider Administrator', 'Administration'];

const csvCell = (value) => '"' + String(value ?? '').replace(/"/g, '""') + '"';

function ModuleCard({ mod }) {
  const max = Math.max(1, ...mod.breakdown.map((b) => b.count));
  const extraCounts = Object.entries(mod.counts || {});
  const colour = moduleKeyColour(mod.key);
  return (
    <Link to={mod.href} className="group rounded-2xl border p-4 shadow-panel transition-shadow hover:shadow-lg" style={{ borderColor: `${colour}99`, background: `linear-gradient(125deg, ${colour}40, ${colour}14)`, boxShadow: `inset 0 4px 0 ${colour}` }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: colour }}>
            <mod.icon className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold text-foreground">{mod.title}</span>
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-3xl font-extrabold text-foreground">{mod.total}</span>
        <span className="text-xs font-semibold text-muted-foreground">live records</span>
      </div>
      <div className="mt-3 space-y-1.5">
        {mod.breakdown.slice(0, 5).map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-28 shrink-0 break-words text-xs font-semibold text-foreground">{item.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full" style={{ width: `${Math.round((item.count / max) * 100)}%`, background: colour }} />
            </div>
            <span className="w-8 text-right text-[11px] font-bold text-foreground">{item.count}</span>
          </div>
        ))}
        {mod.breakdown.length === 0 && <p className="text-[11px] text-muted-foreground">No status breakdown yet.</p>}
      </div>
      {extraCounts.length > 0 && (
        <p className="mt-3 text-xs font-semibold text-foreground">
          {extraCounts.map(([entity, count]) => `${entity}: ${count}`).join(' · ')}
        </p>
      )}
    </Link>
  );
}

export default function LiveDashboards() {
  const { role } = useRole();
  const [modules, setModules] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const isAdmin = ADMIN_ROLES.includes(role);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('liveModuleOverview', {});
      setModules(res.data.modules || []);
      setGeneratedAt(res.data.generated_at);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const exportLog = async () => {
    setExporting(true);
    try {
      const rows = [];
      let cursor;
      do {
        const page = await base44.entities.ModuleDailyStatus.list({ sort: '-snapshot_date', limit: 500, cursor });
        rows.push(...page.items);
        cursor = page.next_cursor;
      } while (cursor);
      const lines = ['Module,Snapshot Date,Total Records,Status Breakdown,Captured At'];
      rows.forEach((row) => {
        lines.push([row.module, row.snapshot_date, row.total, row.breakdown_json, row.captured_at].map(csvCell).join(','));
      });
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `module-daily-status-log-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="gradient-brand flex h-7 w-7 items-center justify-center rounded-lg shadow-sm">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-bold font-editorial text-foreground/80">Live module dashboards</span>
          {generatedAt && <span className="text-xs text-muted-foreground">Updated {new Date(generatedAt).toLocaleTimeString()}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={exportLog} disabled={exporting}>
              <Download className="h-3.5 w-3.5" /> {exporting ? 'Exporting…' : 'Export daily status log'}
            </Button>
          )}
        </div>
      </div>
      {loading && !modules ? (
        <div className="flex items-center justify-center rounded-2xl border bg-card p-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
        </div>
      ) : modules ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((mod) => {
            const meta = MODULES.find((m) => m.key === mod.key) || { title: mod.key, href: '/dashboard', bar: 'bg-primary', icon: LayoutDashboard };
            return <ModuleCard key={mod.key} mod={{ ...meta, ...mod, title: meta.title }} />;
          })}
        </div>
      ) : null}
    </div>
  );
}