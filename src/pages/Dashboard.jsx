import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, FolderOpen, ClipboardList, AlertTriangle, Megaphone, Plus, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

const today = new Date();
const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
const fromISO = format(today, 'yyyy-MM-dd');
const toISO = format(in30Days, 'yyyy-MM-dd');

const QuickLink = ({ to, icon: Icon, title, desc }) => (
  <Link to={to} className="flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50">
    <div className="rounded-lg bg-muted p-2"><Icon className="h-5 w-5 text-muted-foreground" /></div>
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  </Link>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ staff: 0, docs: 0, expiring: 0, tasks: 0, incidents: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const [staff, docs, expiring, tasks, incidents, news] = await Promise.all([
      base44.entities.StaffProfile.count({ status: 'Active' }),
      base44.entities.EmployeeDocument.count({}),
      base44.entities.EmployeeDocument.count({ expiry_date: { $gte: fromISO, $lte: toISO }, status: { $ne: 'Archived' } }),
      base44.entities.Task.count({ status: { $ne: 'done' } }),
      base44.entities.Incident.count({ status: { $in: ['Open', 'Investigating'] } }),
      base44.entities.Announcement.filter({}, { sort: '-created_date', limit: 5, fields: ['title', 'body', 'audience', 'posted_by', 'created_date'] }),
    ]);
    setStats({ staff, docs, expiring, tasks, incidents });
    setAnnouncements(news.items);
    setLoading(false);
  };

  useEffect(() => { load().catch(() => { setLoading(false); }); }, []);

  const post = async () => {
    if (!newTitle.trim()) return;
    setPosting(true);
    try {
      await base44.entities.Announcement.create({ title: newTitle, body: newBody, posted_by: 'Management' });
      setNewTitle('');
      setNewBody('');
      await load();
    } finally {
      setPosting(false);
    }
  };

  const cards = [
    { label: 'Active staff', value: stats.staff, icon: Users },
    { label: 'Documents on file', value: stats.docs, icon: FolderOpen },
    { label: 'Expiring in 30 days', value: stats.expiring, icon: AlertTriangle },
    { label: 'Open tasks', value: stats.tasks, icon: ClipboardList },
    { label: 'Open incidents', value: stats.incidents, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Compliance overview across your organisation.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                    </div>
                    <p className="mt-2 text-2xl font-bold">{c.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Megaphone className="h-5 w-5" /> Announcements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {announcements.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
                {announcements.map((a) => (
                  <div key={a.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{a.title}</p>
                      <Badge variant="outline">{a.audience}</Badge>
                    </div>
                    {a.body && <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>}
                  </div>
                ))}
                <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                  <Input placeholder="Announcement title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                  <Input placeholder="Details (optional)" value={newBody} onChange={(e) => setNewBody(e.target.value)} />
                  <Button size="sm" onClick={post} disabled={posting || !newTitle.trim()}>
                    <Plus className="mr-1 h-4 w-4" /> Post announcement
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="h-5 w-5" /> Quick links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <QuickLink to="/staff" icon={Users} title="Staff Profiles" desc="Manage your team" />
                  <QuickLink to="/documents" icon={FolderOpen} title="Document Vault" desc="Track employee documents" />
                  <QuickLink to="/compliance" icon={ShieldCheck} title="Compliance Centre" desc="Policies & legal requirements" />
                  <QuickLink to="/tasks" icon={ClipboardList} title="Tasks" desc="Open compliance actions" />
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}