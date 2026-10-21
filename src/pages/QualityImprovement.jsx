import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import RegisterInsights from '@/components/RegisterInsights';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QualityItemDialog from '@/components/quality/QualityItemDialog';
import { changeStatus } from '@/lib/statusLog';
import { downloadCsv } from '@/lib/csvExport';
import { useToast } from '@/components/ui/use-toast';
import { Download, Lightbulb, MessageSquarePlus, Wrench, Loader2, Send, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { format } from 'date-fns';
import QualityToolbar from '@/components/quality/QualityToolbar';

const STATUSES = ['New', 'In Progress', 'Implemented', 'Closed'];
const TABS = [
  { value: 'Idea', label: 'Ideas', legacy: 'Improvement Idea', icon: Lightbulb },
  { value: 'Suggestion', label: 'Suggestions', icon: MessageSquarePlus },
  { value: 'Corrective Action', label: 'Corrective Actions', icon: Wrench },
];

const exportColumns = [
  { key: 'title', label: 'Title' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' }, { key: 'description', label: 'Description' },
  { key: 'source', label: 'Source' }, { key: 'raised_by', label: 'Raised By' }, { key: 'raised_date', label: 'Raised Date' },
  { key: 'owner', label: 'Owner' }, { key: 'nominated_to', label: 'Nominated To' },
  { key: 'nominated_email', label: 'Nominated Email' }, { key: 'nominated_date', label: 'Nominated Date' },
  { key: 'target_date', label: 'Target Date' }, { key: 'completed_date', label: 'Completed Date' },
  { key: 'outcome', label: 'Outcome' }, { key: 'notes', label: 'Notes' }, { key: 'status_log', label: 'Status History' },
];

export default function QualityImprovement() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [sending, setSending] = useState('');
  const [defaultType, setDefaultType] = useState('Idea');
  const [activeTab, setActiveTab] = useState('Idea');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [itemPage, logPage, userPage] = await Promise.all([
        base44.entities.QualityItem.filter({}, { sort: '-created_date', limit: 300 }),
        base44.entities.StatusLog.filter({ entity_type: 'QualityItem' }, { sort: '-created_date', limit: 300 }),
        base44.entities.User.list().catch(() => []),
      ]);
      setItems(itemPage.items);
      setLogs(logPage.items);
      setUsers(userPage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const matchesTab = (item, tab) => item.type === tab.value || (tab.legacy && item.type === tab.legacy);

  const setStatus = async (item, status) => {
    if (status === item.status) return;
    await changeStatus({ entityType: 'QualityItem', entity: 'QualityItem', record: item, toStatus: status });
    await load();
  };

  const sendToResponsible = async (item) => {
    if (!item.nominated_email) {
      toast({ title: 'Nominate a person with an email first', variant: 'destructive' });
      return;
    }
    setSending(item.id);
    try {
      await base44.functions.invoke('sendAppEmail', {
        to: item.nominated_email,
        subject: `You are responsible for: ${item.title}`,
        body: `You have been nominated as the person responsible for the following ${item.type.toLowerCase()}.\n\nTitle: ${item.title}\nPriority: ${item.priority}\nStatus: ${item.status}\nTarget date: ${item.target_date ? format(new Date(item.target_date), 'd MMM yyyy') : 'Not set'}\n\nDetails: ${item.description || '-'}\nNotes: ${item.notes || '-'}\n\nPlease log into the portal to keep the status up to date.`,
      });
      await base44.entities.Notification.create({
        type: 'Quality Action',
        recipient: item.nominated_to,
        message: `${item.type} nominated to you: ${item.title}${item.target_date ? ` (target ${format(new Date(item.target_date), 'd MMM yyyy')})` : ''}`,
        read: false,
        linked_entity_type: 'QualityItem',
        linked_entity_id: item.id,
      });
      toast({ title: 'Sent', description: `Emailed to ${item.nominated_email} with an in-app alert.` });
    } catch (error) {
      toast({ title: 'Could not send', description: error.message, variant: 'destructive' });
    } finally {
      setSending('');
    }
  };

  const exportItems = (rows, name) => {
    downloadCsv(name, exportColumns, rows.map((i) => ({
      ...i,
      raised_date: i.raised_date || '', nominated_date: i.nominated_date || '', target_date: i.target_date || '',
      completed_date: i.completed_date || '', status_log: i.status_log || '',
    })));
    toast({ title: `${name} exported` });
  };

  const openNewFor = (tab) => { setDefaultType(tab.value); setEditing(null); setDialogOpen(true); };

  const ItemCard = ({ item }) => (
    <Card>
      <CardContent className="px-3 py-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <button className="text-left" onClick={() => { setEditing(item); setDialogOpen(true); }}>
            <p className="font-medium hover:underline">{item.title}</p>
            <p className="text-sm text-muted-foreground">
              {[[item.source], [item.raised_by ? `Raised by ${item.raised_by}` : ''], [item.raised_date ? format(new Date(item.raised_date), 'd MMM yyyy') : ''],
                [item.nominated_to ? `Nominated to ${item.nominated_to}` : ''], [item.target_date ? `Target ${format(new Date(item.target_date), 'd MMM yyyy')}` : '']]
                .map((p) => p[0]).filter(Boolean).join(' · ') || 'No details yet'}
            </p>
          </button>
          <div className="flex items-center gap-2">
            <Badge className={statusTone(item.status)}>{item.status}</Badge>
            <Select value={item.status} onValueChange={(v) => setStatus(item, v)}>
              <SelectTrigger className="h-7 w-[130px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        {item.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
        {item.outcome && <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium">Outcome:</span> {item.outcome}</p>}
        {item.status_log && <p className="mt-1 truncate text-xs text-muted-foreground" title={item.status_log}>{item.status_log.split('\n').slice(-1)[0]}</p>}
        <div className="mt-3 flex flex-wrap items-center justify-end gap-1.5">
          {item.type === 'Corrective Action' && (
            <Button variant="outline" size="sm" disabled={sending === item.id} onClick={() => sendToResponsible(item)}>
              {sending === item.id ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-2 h-3.5 w-3.5" />}Send to person responsible
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => { setEditing(item); setDialogOpen(true); }}>Edit</Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { if (confirm('Delete this item?')) { await base44.entities.QualityItem.delete(item.id); await load(); } }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="compact-module space-y-2">
      <ModuleShell
        icon={Lightbulb}
        title="Quality & Improvement"
        subtitle="Continuous improvement register: ideas, suggestions and corrective actions with owners, nominations, status history and exportable registers."
        moduleKey="quality"
        insightModule="quality"
        small={[
          ['Ideas', items.filter((i) => matchesTab(i, TABS[0])).length],
          ['Suggestions', items.filter((i) => matchesTab(i, TABS[1])).length],
          ['Corrective actions', items.filter((i) => matchesTab(i, TABS[2])).length],
          ['Still open', items.filter((i) => i.status === 'New' || i.status === 'In Progress').length],
        ].map(([label, value]) => (
          <div key={label}><p className="text-[10px] font-semibold uppercase tracking-wide">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums">{value}</p></div>
        ))}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <QualityToolbar tabs={TABS} activeTab={activeTab} onAdd={openNewFor} onExport={() => exportItems(items.filter((i) => matchesTab(i, TABS.find((t) => t.value === activeTab))), `${activeTab.toLowerCase().replace(/ /g, '-')}-register.csv`)} />
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-2 space-y-2">

            {loading ? (
              <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
            ) : items.filter((i) => matchesTab(i, tab)).length === 0 ? (
              <EmptyState icon={Lightbulb} modulePath="/quality" title={`No ${tab.label.toLowerCase()} recorded yet`} message="Raise your first idea, suggestion or corrective action." />
            ) : (
              <div className="space-y-3">
                {items.filter((i) => matchesTab(i, tab)).map((item) => <ItemCard key={item.id} item={item} />)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <QualityItemDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} users={users} onSaved={load} defaultType={defaultType} />
    </div>
  );
}