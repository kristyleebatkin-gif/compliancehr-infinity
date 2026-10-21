import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import NdisNewsToolbar from '@/components/ndis/NdisNewsToolbar';
import NdisNewsDashboard from '@/components/ndis/NdisNewsDashboard';
import '@/components/ndis/ndisWorkspace.css';
import { useToast } from '@/components/ui/use-toast';
import NdisUpdateList from '@/components/ndis/NdisUpdateList';
import ModuleAuditButton from '@/components/ModuleAuditButton';
import ModuleAuditChecklistButton from '@/components/ModuleAuditChecklistButton';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';
import ModuleAlertsButton from '@/components/ModuleAlertsButton';
import { Newspaper, ExternalLink, Mail } from 'lucide-react';

const TYPE_FILTERS = ['News', 'Update', 'Consultation'];

const buildQuery = (tab, typeFilter, search) => {
  const conds = [];
  if (tab === 'newsletters') conds.push({ news_type: 'Newsletter' });
  else if (typeFilter !== 'all') conds.push({ news_type: typeFilter });
  const term = search.trim();
  if (term) conds.push({ $or: [
    { title: { $regex: term, $options: 'i' } },
    { summary: { $regex: term, $options: 'i' } },
    { category: { $regex: term, $options: 'i' } },
  ] });
  if (conds.length === 0) return {};
  if (conds.length === 1) return conds[0];
  return { $and: conds };
};

export default function NdisUpdates() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, recent: 0, byType: {} });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('updates');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const agg = await base44.entities.NdisUpdate.aggregate({ groupBy: 'news_type' });
      const byType = {};
      (agg.rows || []).forEach((row) => { byType[row.news_type] = row.count; });
      const total = await base44.entities.NdisUpdate.count({});
      const cutoff = format(new Date(Date.now() - 30 * 86400000), 'yyyy-MM-dd');
      const recent = await base44.entities.NdisUpdate.count({ published_date: { $gte: cutoff } });
      setStats({ total, recent, byType });
      const list = await base44.entities.NdisUpdate.filter(buildQuery(tab, typeFilter, search), { sort: '-published_date', limit: 60 });
      setItems(list.items);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, tab, search]);

  useEffect(() => { load(); }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await base44.functions.invoke('ndisNewsFetch', {});
      const fetched = Array.isArray(res.data?.items) ? res.data.items : [];
      if (!fetched.length) {
        toast({ title: 'No new items found from the NDIS sites right now' });
      } else {
        const cleaned = fetched.map((it) => ({
          title: it.title,
          published_date: it.published_date || undefined,
          source: ['NDIS Commission', 'NDIS Agency', 'Other'].includes(it.source) ? it.source : 'Other',
          news_type: ['News', 'Update', 'Newsletter', 'Consultation'].includes(it.news_type) ? it.news_type : 'News',
          category: it.category || undefined,
          summary: it.summary || undefined,
          url: it.url,
        }));
        const result = await base44.entities.NdisUpdate.upsert(cleaned, { key: 'url' });
        toast({ title: 'NDIS feed refreshed', description: `${result.created || 0} new and ${result.updated || 0} existing items from the NDIS sites.` });
      }
      await load();
    } catch (error) {
      toast({ title: 'Refresh failed', description: error.message, variant: 'destructive' });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="ndis-workspace space-y-4">
      <PageHeader title="NDIS Updates & News" subtitle="Summary of the latest NDIS news, pricing and practice updates, consultations and newsletters." icon={Newspaper} showCompliance={false} showAudit={false} />
      <div className="module-action-bar flex flex-wrap items-center gap-1 rounded-xl border border-primary/20 bg-card p-2 shadow-sm">
        <ModuleAlertsButton />
        <ModuleComplianceStrip path="/ndis-updates" />
        <span className="inline-flex shrink-0 items-center gap-1"><ModuleAuditChecklistButton /><ModuleAuditButton /></span>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <NdisNewsToolbar refresh={refresh} refreshing={refreshing} search={search} onSearch={setSearch} />
        <NdisNewsDashboard stats={stats} />
        <TabsContent value="updates">
          <div className="module-filter-bar mb-2 flex flex-wrap items-center">
            <p className="text-sm font-semibold">Filter by type</p>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {TYPE_FILTERS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>

          </div>
          <NdisUpdateList items={items} loading={loading} />
        </TabsContent>
        <TabsContent value="newsletters">
          <div className="mb-3 grid gap-3 md:grid-cols-2">
            <Card className="ndis-panel ndis-accent-evidence">
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5"><div className="rounded-lg bg-brand/10 p-2"><Mail className="h-4 w-4 text-brand" /></div><p className="font-semibold">NDIS Commission newsletters</p></div>
                <p className="mt-2 text-xs text-muted-foreground">Quarterly provider newsletters, alerts and bulletins from the NDIS Quality and Safeguards Commission.</p>
                <a href="https://www.ndiscommission.gov.au/newsletters" target="_blank" rel="noreferrer" className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold text-brand hover:bg-brand/5"><ExternalLink className="h-3 w-3" />Open newsletter page</a>
              </CardContent>
            </Card>
            <Card className="ndis-panel ndis-accent-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5"><div className="rounded-lg bg-brand/10 p-2"><Mail className="h-4 w-4 text-brand" /></div><p className="font-semibold">NDIA provider eNews &amp; bulletins</p></div>
                <p className="mt-2 text-xs text-muted-foreground">Provider bulletins and eNews from the National Disability Insurance Agency, including pricing announcements.</p>
                <a href="https://www.ndis.gov.au/news" target="_blank" rel="noreferrer" className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold text-brand hover:bg-brand/5"><ExternalLink className="h-3 w-3" />Open news page</a>
              </CardContent>
            </Card>
          </div>
          <NdisUpdateList items={items} loading={loading} emptyText="No newsletters fetched yet - use Refresh updates." />
        </TabsContent>
      </Tabs>
    </div>
  );
}