import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Star,
  Clock,
  Bookmark,
  FileBarChart2,
  Zap,
  Users,
  UserCheck,
  ShieldCheck,
  Building2,
  Crown,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const ROLE_3_CLICK_PORTALS = [
  {
    id: 'participants',
    role: 'Participants',
    badge: '≤ 3 Clicks',
    icon: Users,
    links: [
      { label: 'My Profile', to: '/my-profile' },
      { label: 'My Goals', to: '/goals' },
      { label: 'My Services', to: '/programs' },
      { label: 'My Schedule', to: '/roster' },
      { label: 'My Forms', to: '/intake/participant' },
      { label: 'My Documents', to: '/my-profile?tab=documents' },
      { label: 'My Communications', to: '/communications' },
    ],
  },
  {
    id: 'staff',
    role: 'Staff',
    badge: '≤ 3 Clicks',
    icon: UserCheck,
    links: [
      { label: 'My Participants', to: '/our-participants' },
      { label: 'My Tasks', to: '/tasks' },
      { label: 'My Reviews', to: '/review-due' },
      { label: 'My Communications', to: '/communications' },
      { label: 'My Schedule', to: '/roster' },
      { label: 'My Training', to: '/training' },
    ],
  },
  {
    id: 'managers',
    role: 'Managers',
    badge: '≤ 3 Clicks',
    icon: Building2,
    links: [
      { label: 'Team Dashboard', to: '/dashboard' },
      { label: 'Reviews', to: '/review-due' },
      { label: 'Approvals', to: '/operations-centre' },
      { label: 'Incidents', to: '/incidents' },
      { label: 'Risks', to: '/risks' },
      { label: 'Compliance', to: '/compliance' },
    ],
  },
  {
    id: 'provider-admins',
    role: 'Provider Administrators',
    badge: 'Full Control',
    icon: ShieldCheck,
    links: [
      { label: 'Full Platform Administration', to: '/users' },
      { label: 'Company Safe & Governance', to: '/company-safe' },
      { label: 'Consent & Authority Standard', to: '/compliance' },
      { label: 'Document Vault Control', to: '/documents' },
      { label: 'HR & Workforce Hub', to: '/hr' },
      { label: 'Operations Control Centre', to: '/operations-centre' },
    ],
  },
  {
    id: 'executives',
    role: 'Executives',
    badge: 'Board & Audit',
    icon: Crown,
    links: [
      { label: 'Compliance', to: '/compliance' },
      { label: 'Governance', to: '/ndis-portal' },
      { label: 'Quality', to: '/quality' },
      { label: 'Risk', to: '/risks' },
      { label: 'Audit', to: '/auditor-portal' },
      { label: 'Reporting', to: '/analytics' },
      { label: 'Performance', to: '/operations-centre' },
    ],
  },
];

const DEFAULT_FAVOURITES = [
  { label: 'Participant & Employee Consent Register', to: '/compliance' },
  { label: 'Checklists & Assessments Standard', to: '/checklists' },
  { label: 'Auditor Permission Portal', to: '/auditor-portal' },
  { label: 'Document Vault', to: '/documents' },
  { label: 'Company Safe', to: '/company-safe' },
];

const DEFAULT_SAVED_VIEWS = [
  { name: 'Active Consents & Expiries (30d)', to: '/compliance' },
  { name: 'NDIS & Aged Care Clinical Assessments', to: '/checklists' },
  { name: 'High-Priority SIRS & Reportable Incidents', to: '/incidents' },
  { name: 'Unreconciled Finance & NDIS Claims', to: '/invoicing' },
];

const DEFAULT_SAVED_REPORTS = [
  { name: 'Consent Register & Audit Visibility Pack', to: '/compliance' },
  { name: 'Medication & Information Sharing Consent Report', to: '/compliance' },
  { name: 'Monthly Board Governance & Risk Pack', to: '/operations-centre' },
  { name: 'Assessment & Checklist Evidence Pack', to: '/checklists' },
];

const QUICK_ACTIONS = [
  { label: 'Record Consent', to: '/compliance' },
  { label: 'New Assessment / Checklist', to: '/checklists' },
  { label: 'Log Incident', to: '/incidents/new' },
  { label: 'Log Risk Assessment', to: '/risks/submit' },
  { label: 'Upload to Document Vault', to: '/documents' },
  { label: 'Open Company Safe', to: '/company-safe' },
];

export default function EasyAccessVisibilityHub() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activePersona, setActivePersona] = useState('ALL');
  const [favourites, setFavourites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chr_easy_favourites_v1') || 'null') || DEFAULT_FAVOURITES;
    } catch {
      return DEFAULT_FAVOURITES;
    }
  });
  const [savedViews, setSavedViews] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chr_easy_views_v1') || 'null') || DEFAULT_SAVED_VIEWS;
    } catch {
      return DEFAULT_SAVED_VIEWS;
    }
  });
  const [recentItems, setRecentItems] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem('chr_easy_recent_v1') || 'null') || [
          { label: 'Consent & Authority Register', to: '/compliance', time: 'Just now' },
          { label: 'Checklists & Assessments', to: '/checklists', time: 'Today' },
          { label: 'Operations Control Centre', to: '/operations-centre', time: 'Today' },
          { label: 'Document Vault', to: '/documents', time: 'Today' },
        ]
      );
    } catch {
      return [];
    }
  });

  const recordRecentVisit = (label, to) => {
    const next = [
      { label, to, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ...recentItems.filter((r) => r.label !== label),
    ].slice(0, 6);
    setRecentItems(next);
    try {
      localStorage.setItem('chr_easy_recent_v1', JSON.stringify(next));
    } catch {}
    navigate(to);
  };

  const toggleFavourite = (item) => {
    const exists = favourites.some((f) => f.label === item.label);
    const next = exists
      ? favourites.filter((f) => f.label !== item.label)
      : [item, ...favourites];
    setFavourites(next);
    try {
      localStorage.setItem('chr_easy_favourites_v1', JSON.stringify(next));
    } catch {}
    toast({
      title: exists ? 'Removed from Favourites' : 'Pinned to Favourites',
      description: `${item.label} is now accessible in 1 click.`,
    });
  };

  const filteredPortals = useMemo(() => {
    return ROLE_3_CLICK_PORTALS.filter((p) => {
      if (activePersona !== 'ALL' && p.id !== activePersona) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.role.toLowerCase().includes(q) ||
        p.links.some((l) => l.label.toLowerCase().includes(q))
      );
    });
  }, [activePersona, searchQuery]);

  return (
    <section
      aria-label="Easy Access & Complete Visibility Standard (3-Click Navigation)"
      className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-sm space-y-3"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
            Easy Access &amp; Complete Visibility Standard · ≤ 3 Clicks Anywhere
          </span>
          <h3 className="text-sm sm:text-base font-extrabold text-[#0A2B6D]">
            Role-Based 3-Click Portals · Global Search · Saved Views · Saved Reports · Favourites · Quick Actions · Recent Items
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5A00D6]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Global 3-click search across roles & views..."
              className="h-8 pl-8 text-xs"
            />
          </div>
          {['ALL', 'participants', 'staff', 'managers', 'provider-admins', 'executives'].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setActivePersona(id)}
              className={`rounded-lg px-2.5 py-1 text-[10.5px] font-extrabold uppercase transition ${
                activePersona === id
                  ? 'bg-[#0A2B6D] text-white'
                  : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
              }`}
            >
              {id === 'ALL' ? 'All 5 Roles' : id.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 5 ROLE PORTALS (PARTICIPANTS, STAFF, MANAGERS, PROVIDER ADMINISTRATORS, EXECUTIVES) */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        {filteredPortals.map((portal) => {
          const Icon = portal.icon;
          return (
            <div
              key={portal.id}
              className="flex flex-col justify-between rounded-xl border-2 border-[#0A2B6D] bg-white p-3"
            >
              <div>
                <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 font-extrabold text-xs text-[#0A2B6D]">
                    <Icon className="h-4 w-4 text-[#0072FF]" />
                    <span>{portal.role}</span>
                  </div>
                  <Badge className="bg-[#5A00D6] text-white text-[9px]">{portal.badge}</Badge>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  {portal.links.map((lnk) => (
                    <div key={lnk.label} className="flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => recordRecentVisit(lnk.label, lnk.to)}
                        className="flex-1 rounded-md px-2 py-1 text-left text-[11px] font-bold text-[#0A2B6D] hover:bg-[#F5F0FF] hover:text-[#5A00D6]"
                      >
                        → {lnk.label}
                      </button>
                      <button
                        type="button"
                        title="Pin to Favourites"
                        onClick={() => toggleFavourite(lnk)}
                        className="p-1 text-[#A100FF] hover:opacity-80"
                      >
                        <Star className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SAVED VIEWS, SAVED REPORTS, FAVOURITES, QUICK ACTIONS & RECENT ITEMS */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        {/* Favourites */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0A2B6D]">
            <Star className="h-3.5 w-3.5 text-[#FF2E9A]" />
            <span>Favourites</span>
          </div>
          <div className="mt-2 space-y-1">
            {favourites.map((fav) => (
              <button
                key={fav.label}
                type="button"
                onClick={() => recordRecentVisit(fav.label, fav.to)}
                className="flex w-full items-center justify-between rounded-md bg-white px-2 py-1 text-left text-[11px] font-bold text-[#0A2B6D] hover:text-[#0072FF]"
              >
                <span>{fav.label}</span>
                <ArrowUpRight className="h-3 w-3 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Saved Views */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0A2B6D]">
              <Bookmark className="h-3.5 w-3.5 text-[#0072FF]" />
              <span>Saved Views</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = [
                  { name: `Custom View (${new Date().toLocaleDateString()})`, to: window.location.pathname },
                  ...savedViews,
                ].slice(0, 5);
                setSavedViews(next);
                try {
                  localStorage.setItem('chr_easy_views_v1', JSON.stringify(next));
                } catch {}
                toast({ title: 'Current View Saved', description: 'Added to your 1-click Saved Views.' });
              }}
              className="text-[10px] font-extrabold text-[#5A00D6] hover:underline"
            >
              + Save Current
            </button>
          </div>
          <div className="mt-2 space-y-1">
            {savedViews.map((sv) => (
              <button
                key={sv.name}
                type="button"
                onClick={() => recordRecentVisit(sv.name, sv.to)}
                className="flex w-full items-center justify-between rounded-md bg-white px-2 py-1 text-left text-[11px] font-bold text-[#0A2B6D] hover:text-[#0072FF]"
              >
                <span>{sv.name}</span>
                <ArrowUpRight className="h-3 w-3 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Saved Reports */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0A2B6D]">
            <FileBarChart2 className="h-3.5 w-3.5 text-[#5A00D6]" />
            <span>Saved Reports</span>
          </div>
          <div className="mt-2 space-y-1">
            {DEFAULT_SAVED_REPORTS.map((sr) => (
              <button
                key={sr.name}
                type="button"
                onClick={() => recordRecentVisit(sr.name, sr.to)}
                className="flex w-full items-center justify-between rounded-md bg-white px-2 py-1 text-left text-[11px] font-bold text-[#0A2B6D] hover:text-[#0072FF]"
              >
                <span>{sr.name}</span>
                <ArrowUpRight className="h-3 w-3 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0A2B6D]">
            <Zap className="h-3.5 w-3.5 text-[#FF2E9A]" />
            <span>Quick Actions</span>
          </div>
          <div className="mt-2 space-y-1">
            {QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.label}
                type="button"
                onClick={() => recordRecentVisit(qa.label, qa.to)}
                className="flex w-full items-center justify-between rounded-md bg-white px-2 py-1 text-left text-[11px] font-bold text-[#0A2B6D] hover:text-[#0072FF]"
              >
                <span>{qa.label}</span>
                <Plus className="h-3 w-3 shrink-0 text-[#5A00D6]" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Items */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0A2B6D]">
            <Clock className="h-3.5 w-3.5 text-[#0072FF]" />
            <span>Recent Items</span>
          </div>
          <div className="mt-2 space-y-1">
            {recentItems.map((ri) => (
              <button
                key={ri.label}
                type="button"
                onClick={() => navigate(ri.to)}
                className="flex w-full items-center justify-between rounded-md bg-white px-2 py-1 text-left text-[11px] font-bold text-[#0A2B6D] hover:text-[#0072FF]"
              >
                <span>{ri.label}</span>
                <span className="text-[9.5px] text-muted-foreground">{ri.time}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}