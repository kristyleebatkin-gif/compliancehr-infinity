import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/ui/use-toast';
import { Eye, Zap, SlidersHorizontal, Sparkles, Mail, Loader2, RefreshCw, Search, AlertTriangle, Clock } from 'lucide-react';

const GROUPS = [
  { key: 'visualise', label: 'Visualise', icon: Eye, tone: 'text-blue-600 bg-blue-50' },
  { key: 'automate', label: 'Automate', icon: Zap, tone: 'text-amber-600 bg-amber-50' },
  { key: 'refine', label: 'Refine', icon: SlidersHorizontal, tone: 'text-emerald-600 bg-emerald-50' },
];

export default function SuggestionsHub() {
  const { toast } = useToast();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [emailing, setEmailing] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('moduleReview', {});
      setReview(res.data);
    } catch (e) {
      setError(e?.message || 'Could not load the review.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const emailDigest = async () => {
    setEmailing(true);
    try {
      await base44.functions.invoke('suggestionsDigest', {});
      toast({ title: 'Digest emailed', description: 'The full suggestions digest is on its way to your inbox.' });
    } catch (e) {
      toast({ title: 'Could not email digest', description: e?.message || 'Please try again.', variant: 'destructive' });
    }
    setEmailing(false);
  };

  const modules = (review?.modules || []).filter((m) =>
    m.label.toLowerCase().includes(search.toLowerCase())
  );
  const overdueModules = (review?.modules || []).filter((m) => (m.overdue || 0) > 0 || (m.expiring || 0) > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suggestions Hub"
        subtitle="A live review of every module: what to visualise, automate and refine, generated from real register numbers."
        showAlerts={false}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button size="sm" onClick={emailDigest} disabled={emailing || loading}>
              {emailing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Email digest
            </Button>
          </div>
        }
      />

      {loading && (
        <Card><CardContent className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Reviewing every module...
        </CardContent></Card>
      )}

      {error && !loading && (
        <Card><CardContent className="p-8 text-center text-sm text-destructive">{error}</CardContent></Card>
      )}

      {review && !loading && (
        <>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              ['Modules reviewed', review.moduleCount, 'from-violet-500 via-purple-500 to-fuchsia-500'],
              ['Total suggestions', review.suggestionCount, 'from-sky-500 via-blue-600 to-indigo-600'],
              ['Needs attention', overdueModules, 'from-amber-500 via-orange-500 to-rose-500'],
              ['Generated', new Date(review.generated_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }), 'from-emerald-500 via-teal-500 to-cyan-600'],
            ].map(([label, value, grad]) => (
              <div key={label} className={`rounded-2xl bg-gradient-to-br p-3.5 text-white shadow-md ${grad}`}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/85">{label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search modules..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>

          {modules.length === 0 ? (
            <EmptyState title="No modules match" text="Try a different module name." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {modules.map((m) => (
                <Card key={m.key} className={m.overdue > 0 ? 'border-warning/60' : ''}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-heading font-bold text-base leading-tight">{m.label}</h3>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant="secondary">{m.total} records</Badge>
                          <Badge variant="secondary">{m.open} open</Badge>
                          {m.overdue !== null && m.overdue > 0 && <Badge className="bg-danger text-white">{m.overdue} overdue</Badge>}
                          {m.expiring !== null && m.expiring > 0 && <Badge className="bg-warning text-white">{m.expiring} due in 30d</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {GROUPS.map(({ key, label, icon: Icon, tone }) => (
                        <div key={key}>
                          <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>
                            <Icon className="h-3.5 w-3.5" /> {label}
                          </div>
                          <ul className="mt-1 space-y-1 pl-1">
                            {(m[key] || []).map((s, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex gap-1.5"><span className="text-primary/50">•</span>{s}</li>
                            ))}
                            {!(m[key] || []).length && <li className="text-xs text-muted-foreground/60">No suggestions generated.</li>}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}