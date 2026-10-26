import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users, FolderOpen, ClipboardList, AlertTriangle, Megaphone, Plus, ShieldCheck, ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { getTilePalette, getHeaderView, getSymbolView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const QUICK_LINKS = [
  { to: '/staff', icon: Users, title: 'Staff Profiles', desc: 'Manage your team & credentials' },
  { to: '/documents', icon: FolderOpen, title: 'Document Vault', desc: 'Track employee & participant documents' },
  { to: '/compliance', icon: ShieldCheck, title: 'Compliance Centre', desc: 'Policies, audits & legal requirements' },
  { to: '/tasks', icon: ClipboardList, title: 'Tasks & Actions', desc: 'Open compliance & operational actions' },
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
    { label: 'Active staff', value: stats.staff, icon: Users, to: '/staff' },
    { label: 'Documents on file', value: stats.docs, icon: FolderOpen, to: '/documents' },
    { label: 'Expiring in 30 days', value: stats.expiring, icon: AlertTriangle, to: '/documents' },
    { label: 'Open tasks', value: stats.tasks, icon: ClipboardList, to: '/tasks' },
    { label: 'Open incidents', value: stats.incidents, icon: AlertTriangle, to: '/incidents' },
  ];

  return (
    <section
      className="rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="rounded-[16px] bg-white p-4 sm:p-5 space-y-4">
        {/* 5-Card Compliance KPI Strip in Mixed Full Colours */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {cards.map((c, idx) => {
            const Icon = c.icon;
            const tile = getTilePalette(idx);
            const sym = getSymbolView(idx);
            return (
              <Link
                key={c.label}
                to={c.to}
                className="group rounded-2xl border-2 border-[#0A2B6D] p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ backgroundColor: tile.bg, color: tile.text }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white shadow-2xs">
                    <Icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" style={{ color: tile.text }} />
                </div>
                <p className="mt-2 text-xs font-extrabold uppercase tracking-wider" style={{ color: tile.subtext }}>
                  {c.label}
                </p>
                <p className="mt-1 font-editorial text-2xl font-extrabold tabular-nums" style={{ color: tile.text }}>
                  {c.value}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Announcements & Quick Links Grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 space-y-3 shadow-sm">
            <span
              className="inline-flex min-h-[36px] items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-xs font-extrabold text-white shadow-2xs"
              style={{ background: getHeaderView(3) }}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                <Megaphone className="h-3 w-3 text-white" />
              </span>
              <span>Organisation Announcements</span>
            </span>

            {announcements.length === 0 ? (
              <p className="text-xs font-extrabold text-[#5A00D6]">
                No announcements posted yet. Share an update with your team below.
              </p>
            ) : (
              <div className="space-y-2">
                {announcements.map((a, idx) => {
                  const tile = getTilePalette(idx + 5);
                  return (
                    <div
                      key={a.id}
                      className="rounded-2xl border-2 border-[#0A2B6D] p-3 shadow-2xs"
                      style={{ backgroundColor: tile.bg, color: tile.text }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs sm:text-sm font-extrabold" style={{ color: tile.text }}>{a.title}</p>
                        <span className="rounded-full border border-[#0A2B6D] bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]">
                          {a.audience || 'All Staff'}
                        </span>
                      </div>
                      {a.body && (
                        <p className="mt-1 text-xs font-bold leading-relaxed" style={{ color: tile.subtext }}>
                          {a.body}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2 rounded-2xl border-2 border-[#0A2B6D] bg-white p-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                Post New Announcement
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Announcement title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="border-2 border-[#0A2B6D] bg-white font-bold text-[#0A2B6D]"
                />
                <Input
                  placeholder="Details (optional)"
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="border-2 border-[#0A2B6D] bg-white font-bold text-[#0A2B6D]"
                />
              </div>
              <Button
                size="sm"
                onClick={post}
                disabled={posting || !newTitle.trim()}
                className="rounded-full border-2 border-[#0A2B6D] font-extrabold text-white"
                style={{ background: getHeaderView(0) }}
              >
                <Plus className="mr-1 h-4 w-4 text-white" /> Post announcement
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 space-y-2.5 shadow-sm">
            <span
              className="inline-flex min-h-[36px] items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-xs font-extrabold text-white shadow-2xs"
              style={{ background: getHeaderView(4) }}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                <ShieldCheck className="h-3 w-3 text-white" />
              </span>
              <span>Quick Links</span>
            </span>

            {QUICK_LINKS.map((q, idx) => {
              const Icon = q.icon;
              const tile = getTilePalette(idx + 2);
              const sym = getSymbolView(idx + 2);
              return (
                <Link
                  key={q.to}
                  to={q.to}
                  className="flex items-start gap-3 rounded-2xl border-2 border-[#0A2B6D] p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  style={{ backgroundColor: tile.bg, color: tile.text }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white shadow-2xs">
                    <Icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-extrabold" style={{ color: tile.text }}>{q.title}</p>
                    <p className="text-xs font-bold" style={{ color: tile.subtext }}>{q.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}