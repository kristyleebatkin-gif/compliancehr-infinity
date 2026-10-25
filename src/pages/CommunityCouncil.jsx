import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MapPin, ExternalLink, Phone, Mail, CalendarDays, Search, Loader2,
  Building2, Heart, PartyPopper, HeartHandshake, Sparkles,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LocalServices from '@/components/referral/LocalServices';
import AutoRegisterInsights from '@/components/AutoRegisterInsights';
import ModuleShell from '@/components/module/ModuleShell';
import ModuleAlertsButton from '@/components/ModuleAlertsButton';
import ProgramsEvents from '@/pages/ProgramsEvents';
import ReferralSupport from '@/pages/ReferralSupport';

const safeUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

export default function CommunityCouncil() {
  const [activeTab, setActiveTab] = useState('all');
  const [postcode, setPostcode] = useState('2000');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runLookup = async (pc) => {
    const clean = String(pc || '').trim();
    if (!/^\d{4}$/.test(clean)) {
      setError('Enter a valid 4-digit Australian postcode.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('councilLookup', { postcode: clean });
      setResult(res.data);
      localStorage.setItem('community-council-postcode', clean);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Lookup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('community-council-postcode');
    if (saved && /^\d{4}$/.test(saved)) {
      setPostcode(saved);
      runLookup(saved);
    }
  }, []);

  const council = result?.council_name;
  const website = safeUrl(result?.website);
  const whatsOn = safeUrl(result?.whats_on_url);
  const events = Array.isArray(result?.events) ? result.events : [];

  const councilSection = (
    <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md">
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0A2B6D] px-4 py-2.5 text-white"
        style={{ background: 'var(--header-gradient)' }}
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#00C6FF]" />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">Local Government &amp; Postcode Directory</span>
            <h3 className="text-sm font-extrabold text-white">Local Council Lookup &amp; What&apos;s On Community Events</h3>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/50 p-3.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">Australian Postcode Lookup</label>
          <p className="mb-2.5 text-xs font-medium text-[#0A2B6D]/80">Enter your 4-digit Australian postcode to look up the local council, contact details, and community events.</p>
          <div className="flex flex-wrap gap-2">
            <Input
              className="max-w-40 border-2 border-[#0A2B6D] bg-white font-bold text-[#0A2B6D]"
              inputMode="numeric"
              maxLength={4}
              placeholder="e.g. 2000"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(e) => { if (e.key === 'Enter') runLookup(postcode); }}
            />
            <Button className="border-2 border-[#0A2B6D] font-extrabold" onClick={() => runLookup(postcode)} disabled={loading || postcode.length !== 4}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {loading ? 'Searching...' : 'Find My Council'}
            </Button>
          </div>
          {error && <p className="mt-3 rounded-lg border border-[#FF2E9A] bg-pink-50 px-3 py-2 text-xs font-bold text-[#0A2B6D]">{error}</p>}
        </div>

        {result && council && !loading && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-2 border-[#0A2B6D]">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg border-2 border-[#0A2B6D] bg-[#F5F0FF] p-2.5"><Building2 className="h-5 w-5 text-[#5A00D6]" /></div>
                    <div>
                      <p className="text-base font-extrabold text-[#0A2B6D]">{council}</p>
                      <p className="text-xs font-semibold text-[#5A00D6]">Local council for postcode {postcode}{result?.state ? ` · ${result.state}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {website && <a href={website} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg border-2 border-[#0A2B6D] bg-[#0072FF] px-3 text-xs font-extrabold text-white hover:opacity-95"><ExternalLink className="h-3.5 w-3.5" />Website</a>}
                    {whatsOn && <a href={whatsOn} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg border-2 border-[#0A2B6D] bg-[#5A00D6] px-3 text-xs font-extrabold text-white hover:opacity-95"><CalendarDays className="h-3.5 w-3.5" />What&apos;s On</a>}
                  </div>
                </div>
                <div className="mt-3 grid gap-2 border-t border-[#0A2B6D]/20 pt-3 text-xs font-semibold text-[#0A2B6D] sm:grid-cols-2">
                  {result?.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" /><a className="font-bold hover:underline" href={`tel:${String(result.phone).replace(/\s/g, '')}`}>{result.phone}</a></p>}
                  {result?.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0 text-[#5A00D6]" /><a className="font-bold hover:underline" href={`mailto:${result.email}`}>{result.email}</a></p>}
                  {result?.address && <p className="flex items-start gap-2 sm:col-span-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FF2E9A]" />{result.address}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#0A2B6D]">
              <CardContent className="p-4">
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]"><CalendarDays className="h-4 w-4 text-[#0072FF]" />What&apos;s On — Local Council Events</p>
                {events.length === 0 ? (
                  <p className="mt-2 text-xs font-medium text-[#0A2B6D]/80">No upcoming council events verified right now{whatsOn ? ' — check the council What\'s On link.' : '.'}</p>
                ) : (
                  <ul className="mt-2.5 space-y-2">
                    {events.map((e, i) => {
                      const url = safeUrl(e?.url);
                      return (
                        <li key={i} className="flex items-start justify-between gap-3 rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/35 p-2.5">
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-[#0A2B6D]">{e?.title}</p>
                            <p className="text-[11px] font-medium text-[#5A00D6]">{[e?.date, e?.venue].filter(Boolean).join(' · ') || 'Details on council website'}</p>
                          </div>
                          {url && <a href={url} target="_blank" rel="noreferrer" className="shrink-0 rounded-md border border-[#0A2B6D] bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]">Open</a>}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <ModuleShell
          icon={MapPin}
          moduleKey="community-council"
          title="Community, Programs & Referral Support Hub"
          subtitle="Unified Community & Council lookup, Program & Event Design Centre, Referral & Crisis Support, and Local Support Services in one professional hub."
          insight={<AutoRegisterInsights placement="header" />}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <a href="tel:000" className="inline-flex h-8 items-center gap-1.5 rounded-lg border-2 border-[#0A2B6D] bg-[#FF2E9A] px-3 text-xs font-extrabold text-white hover:opacity-95">
                <Phone className="h-3.5 w-3.5" />Emergency 000
              </a>
              <ModuleAlertsButton />
            </div>
          }
          tabs={
            <TabsList className="flex flex-wrap gap-1.5 h-auto rounded-xl border-2 border-[#0A2B6D] bg-white p-1.5 shadow-sm">
              <TabsTrigger value="all" className="border border-[#0A2B6D]/40 font-extrabold">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> All Community, Programs &amp; Referrals
              </TabsTrigger>
              <TabsTrigger value="programs" className="border border-[#0A2B6D]/40 font-extrabold">
                <PartyPopper className="mr-1.5 h-3.5 w-3.5" /> Programs &amp; Events Centre
              </TabsTrigger>
              <TabsTrigger value="referrals" className="border border-[#0A2B6D]/40 font-extrabold">
                <HeartHandshake className="mr-1.5 h-3.5 w-3.5" /> Referral &amp; Crisis Support
              </TabsTrigger>
              <TabsTrigger value="council" className="border border-[#0A2B6D]/40 font-extrabold">
                <Building2 className="mr-1.5 h-3.5 w-3.5" /> Local Council &amp; Postcode
              </TabsTrigger>
              <TabsTrigger value="services" className="border border-[#0A2B6D]/40 font-extrabold">
                <Heart className="mr-1.5 h-3.5 w-3.5" /> Local Support Services
              </TabsTrigger>
            </TabsList>
          }
        />

        <TabsContent value="all" className="space-y-4">
          {/* 1. Programs & Events in the same modular */}
          <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md">
            <div
              className="flex items-center justify-between border-b-2 border-[#0A2B6D] px-4 py-2.5 text-white"
              style={{ background: 'var(--header-gradient)' }}
            >
              <div className="flex items-center gap-2">
                <PartyPopper className="h-4 w-4 text-[#00C6FF]" />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">Community Programs &amp; Events</span>
                  <h3 className="text-sm font-extrabold text-white">Program Design, Calendar, Adverts &amp; Participant Invitations</h3>
                </div>
              </div>
            </div>
            <div className="p-3">
              <ProgramsEvents embedded />
            </div>
          </section>

          {/* 2. Referral & Support merged into Community */}
          <section className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md">
            <div
              className="flex items-center justify-between border-b-2 border-[#0A2B6D] px-4 py-2.5 text-white"
              style={{ background: 'var(--header-gradient)' }}
            >
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-[#FF6EDB]" />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">Merged Referral &amp; Support Suite</span>
                  <h3 className="text-sm font-extrabold text-white">Crisis Information, Local Services, Resource Library, Referral Form &amp; Log</h3>
                </div>
              </div>
            </div>
            <div className="p-3">
              <ReferralSupport embedded />
            </div>
          </section>

          {/* 3. Local Council Lookup */}
          {councilSection}
        </TabsContent>

        <TabsContent value="programs" className="mt-2">
          <ProgramsEvents embedded />
        </TabsContent>

        <TabsContent value="referrals" className="mt-2">
          <ReferralSupport embedded />
        </TabsContent>

        <TabsContent value="council" className="mt-2">
          {councilSection}
        </TabsContent>

        <TabsContent value="services" className="mt-2">
          <LocalServices />
        </TabsContent>
      </Tabs>
    </div>
  );
}