import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users, FolderOpen, ClipboardList, AlertTriangle, Megaphone, Plus, ShieldCheck, ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';

const QUICK_LINKS = [
  { to: '/staff', icon: Users, title: 'Staff Profiles', desc: 'Manage your team & credentials', color: '#0072FF' },
  { to: '/documents', icon: FolderOpen, title: 'Document Vault', desc: 'Track employee & participant documents', color: '#0A2B6D' },
  { to: '/compliance', icon: ShieldCheck, title: 'Compliance Centre', desc: 'Policies, audits & legal requirements', color: '#5A00D6' },
  { to: '/tasks', icon: ClipboardList, title: 'Tasks & Actions', desc: 'Open compliance & operational actions', color: '#FF2E9A' },
];

export default function OriginalPublishedOverview() {
  const [stats, setStats] = useState({ staff: 0, docs: 0, expiring: 0, tasks: 0, incidents: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    const today = new Date();
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const fromISO = format(today, 'yyyy-MM-dd');
    const toISO = format(in30Days, 'yyyy-MM-dd');

    const [staff, docs, expiring, tasks, incidents, news] = await Promise.all([
      base44.entities.StaffProfile.count({ status: 'Active' }).catch(() => 0),
      base44.entities.EmployeeDocument.count({}).catch(() => 0),
      base44.entities.EmployeeDocument.count({
        expiry_date: { $gte: fromISO, $lte: toISO },
        status: { $ne: 'Archived' },
      }).catch(() => 0),
      base44.entities.TodoTask.count({ status: { $nin: ['Completed', 'Finalised', 'Cancelled'] } }).catch(() => 0),
      base44.entities.Incident.count({ status: { $nin: ['Resolved', 'Closed'] } }).catch(() => 0),
      base44.entities.Announcement.filter({}, { sort: '-created_date', limit: 5 }).catch(() => ({ items: [] })),
    ]);

    setStats({
      staff: Number(staff) || 0,
      docs: Number(docs) || 0,
      expiring: Number(expiring) || 0,
      tasks: Number(tasks) || 0,
      incidents: Number(incidents) || 0,
    });
    setAnnouncements(Array.isArray(news?.items) ? news.items : Array.isArray(news) ? news : []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const post = async () => {
    if (!newTitle.trim()) return;
    setPosting(true);
    try {
      await base44.entities.Announcement.create({
        title: newTitle.trim(),
        body: newBody.trim(),
        audience: 'All Staff',
        posted_by: 'Management',
      });
      setNewTitle('');
      setNewBody('');
      await load();
    } finally {
      setPosting(false);
    }
  };

  const cards = [
    { label: 'Active staff', value: stats.staff, icon: Users, color: '#0072FF', to: '/staff' },
    { label: 'Documents on file', value: stats.docs, icon: FolderOpen, color: '#0A2B6D', to: '/documents' },
    { label: 'Expiring in 30 days', value: stats.expiring, icon: AlertTriangle, color: '#5A00D6', to: '/documents' },
    { label: 'Open tasks', value: stats.tasks, icon: ClipboardList, color: '#A100FF', to: '/tasks' },
    { label: 'Open incidents', value: stats.incidents, icon: AlertTriangle, color: '#FF2E9A', to: '/incidents' },
  ];

  return (
    <section className="space-y-4">
      {/* Original Published 5-Card Compliance KPI Strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.to}
              className="group rounded-xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{
                borderColor: `${c.color}55`,
                borderTopWidth: '4px',
                borderTopColor: c.color,
                background: `linear-gradient(135deg, ${c.color}14 0%, #ffffff 80%)`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm"
                  style={{ background: c.color }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
              </div>
              <p className="mt-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-2xl font-black tabular-nums text-foreground">{c.value}</p>
            </Link>
          );
        })}
      </div>

      {/* Original Published Announcements & Quick Links Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <Megaphone className="h-5 w-5" /> Organisation Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements posted yet. Share an update with your team below.</p>
            ) : (
              <div className="space-y-2">
                {announcements.map((a) => (
                  <div key={a.id} className="rounded-xl border border-violet-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-foreground">{a.title}</p>
                      <Badge variant="outline" className="border-violet-300 bg-violet-50 text-violet-800">
                        {a.audience || 'All Staff'}
                      </Badge>
                    </div>
                    {a.body && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.body}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 rounded-xl border border-violet-200 bg-violet-50/40 p-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-violet-900">Post New Announcement</div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Announcement title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-white"
                />
                <Input
                  placeholder="Details (optional)"
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="bg-white"
                />
              </div>
              <Button size="sm" onClick={post} disabled={posting || !newTitle.trim()}>
                <Plus className="mr-1 h-4 w-4" /> Post announcement
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <ShieldCheck className="h-5 w-5" /> Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {QUICK_LINKS.map((q) => {
              const Icon = q.icon;
              return (
                <Link
                  key={q.to}
                  to={q.to}
                  className="flex items-start gap-3 rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  style={{
                    borderColor: `${q.color}45`,
                    background: `linear-gradient(135deg, ${q.color}12 0%, #ffffff 85%)`,
                  }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
                    style={{ background: q.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">{q.title}</p>
                    <p className="text-xs text-muted-foreground">{q.desc}</p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}