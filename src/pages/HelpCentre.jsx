import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LifeBuoy, Search, Phone, AlertTriangle, ChevronDown, MessagesSquare, BookOpen, Library, Lightbulb, Siren, Stethoscope, Activity, Bot, Headset, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { USER_GUIDES } from '@/lib/userGuidesContent';
import { moduleGuides } from '@/lib/moduleGuides';
import { HELP_ARTICLES, HELP_CATEGORIES } from '@/lib/helpCentreContent';
import { SELF_CHECKS } from '@/lib/helpCentreExtras';
import SupportTickets from '@/components/help/SupportTickets';
import AiTroubleshooter from '@/components/help/AiTroubleshooter';
import SystemHealth from '@/components/help/SystemHealth';
import CommonProblems from '@/components/help/CommonProblems';
import AssistantsGuide from '@/components/help/AssistantsGuide';
import TechSupportForm from '@/components/help/TechSupportForm';

const ESCALATIONS = [
  { name: 'Emergency (police, fire, ambulance)', phone: '000', note: 'Immediate danger to life' },
  { name: '13HEALTH', phone: '13 43 25 84', note: 'Medical or medication concerns' },
  { name: 'Poisons Information Line', phone: '13 11 26', note: 'Chemical exposure or suspected overdose' },
  { name: 'Lifeline', phone: '13 11 14', note: 'Crisis support, 24/7' },
  { name: 'NDIS Quality & Safeguards Commission', phone: '1800 035 544', note: 'Complaints and reportable incidents' },
  { name: 'healthdirect', phone: '1800 022 222', note: 'Non-urgent nurse advice, 24/7' },
];

export default function HelpCentre() {
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get('tab') || 'guides');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [openGuide, setOpenGuide] = useState(null);
  const [openArticle, setOpenArticle] = useState(null);
  const q = query.trim().toLowerCase();

  const guides = useMemo(() => Object.entries(moduleGuides).filter(([, g]) =>
    !q || g.title.toLowerCase().includes(q) || (g.purpose || '').toLowerCase().includes(q) || g.steps.join(' ').toLowerCase().includes(q)
  ), [q]);

  const articles = useMemo(() => HELP_ARTICLES.filter((a) =>
    (category === 'All' || a.category === category) &&
    (!q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q) || a.tags.includes(q))
  ), [q, category]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-sky-700 via-violet-700 to-violet-700 p-6 text-white shadow-panel">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-pink-500/30 blur-2xl" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-cyan-400/25 blur-2xl" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/10 p-3"><LifeBuoy className="h-7 w-7" /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Help Centre</h1>
              <p className="text-sm text-violet-200">Self-help guides for every module, how-to answers, escalation contacts and a direct line to support.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="tel:000" className="inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2.5 text-sm font-bold text-white hover:bg-danger/90"><Phone className="h-4 w-4" />Emergency 000</a>
          </div>
        </div>
        <div className="relative mt-4 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-200" />
          <Input
            className="border-white/20 bg-white/10 pl-9 text-white placeholder:text-violet-200"
            placeholder="Search every guide and how-to article..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="guides"><BookOpen className="mr-1.5 inline h-3.5 w-3.5" />Module guides</TabsTrigger>
          <TabsTrigger value="manuals"><Library className="mr-1.5 inline h-3.5 w-3.5" />User guides</TabsTrigger>
          <TabsTrigger value="howtos"><Lightbulb className="mr-1.5 inline h-3.5 w-3.5" />Quick how-tos</TabsTrigger>
          <TabsTrigger value="troubleshoot"><Stethoscope className="mr-1.5 inline h-3.5 w-3.5" />AI troubleshooter</TabsTrigger>
          <TabsTrigger value="assistants" className="text-purple-700 data-[state=active]:text-purple-700"><Bot className="mr-1.5 inline h-3.5 w-3.5" />Personal assistants</TabsTrigger>
          <TabsTrigger value="health"><Activity className="mr-1.5 inline h-3.5 w-3.5" />System health &amp; quick fixes</TabsTrigger>
          <TabsTrigger value="tech-support" className="text-sky-700 data-[state=active]:text-sky-700"><Headset className="mr-1.5 inline h-3.5 w-3.5" />Technical support</TabsTrigger>
          <TabsTrigger value="support"><MessagesSquare className="mr-1.5 inline h-3.5 w-3.5" />Support desk</TabsTrigger>
          <TabsTrigger value="escalate"><Siren className="mr-1.5 inline h-3.5 w-3.5" />Escalation contacts</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <CommonProblems />
        </div>

        <TabsContent value="manuals" className="mt-4">
          <Card className="border-primary/30 bg-primary/5"><CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-primary">Complete User Guide Library</p>
                <p className="mt-0.5 text-sm text-foreground/70">
                  Extensive, professional guides for all {Object.keys(USER_GUIDES).length} modules — every feature, process, tool and resource, each downloadable as a branded PDF, plus the full library in one document.
                </p>
              </div>
              <Button asChild><Link to="/user-guides">Open User Guides</Link></Button>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="guides" className="mt-4">
          {guides.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
              No guide matches "{query}". Try the Quick how-tos tab, or raise a support request.
              <div className="mt-3"><Button size="sm" onClick={() => setTab('support')}>Ask support</Button></div>
            </CardContent></Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {guides.map(([path, g]) => (
                <Card key={path}>
                  <CardContent className="p-4">
                    <button className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setOpenGuide(openGuide === path ? null : path)}>
                      <div className="min-w-0">
                        <p className="font-semibold">{g.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{g.purpose}</p>
                      </div>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-foreground/40 transition-transform ${openGuide === path ? 'rotate-180' : ''}`} />
                    </button>
                    {openGuide === path && (
                      <ol className="mt-3 space-y-2 border-t border-border/60 pt-3">
                        {g.steps.map((s, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">{i + 1}</span>
                            <p className="text-sm text-foreground/80">{s}</p>
                          </li>
                        ))}
                      </ol>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="howtos" className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All topics</SelectItem>
                {HELP_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {articles.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
              No article matches your search. Raise a support request and we will help.
              <div className="mt-3"><Button size="sm" onClick={() => setTab('support')}>Ask support</Button></div>
            </CardContent></Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {articles.map((a) => (
                <Card key={a.title}>
                  <CardContent className="p-4">
                    <button className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setOpenArticle(openArticle === a.title ? null : a.title)}>
                      <div className="min-w-0">
                        <p className="font-semibold">{a.title}</p>
                        <Badge variant="secondary" className="mt-1 text-[10px]">{a.category}</Badge>
                      </div>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-foreground/40 transition-transform ${openArticle === a.title ? 'rotate-180' : ''}`} />
                    </button>
                    {openArticle === a.title && (
                      <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3 text-sm text-foreground/80">
                        {a.body.split('\n').filter(Boolean).map((line, i) => <p key={i}>{line}</p>)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="troubleshoot" className="mt-4 space-y-4">
          <AiTroubleshooter onAskSupport={() => setTab('support')} />
          <Card><CardContent className="p-5">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-brand/10 p-2"><ClipboardList className="h-4 w-4 text-brand" /></div>
              <p className="font-bold">Other quick checks before you raise a request</p>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {SELF_CHECKS.map((c, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card p-2.5 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">{i + 1}</span>
                  <p className="text-foreground/80">{c}</p>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="assistants" className="mt-4">
          <AssistantsGuide />
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <SystemHealth />
        </TabsContent>

        <TabsContent value="tech-support" className="mt-4">
          <TechSupportForm />
        </TabsContent>

        <TabsContent value="support" className="mt-4">
          <SupportTickets />
        </TabsContent>

        <TabsContent value="escalate" className="mt-4">
          <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-danger" />
              <p className="font-bold text-danger">Use these numbers before anything else in an emergency</p>
            </div>
            <p className="mt-1 text-xs text-foreground/70">Log the event in the Incident Clinic or Risk Reporting afterwards so the registers stay complete.</p>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ESCALATIONS.map((e) => (
              <Card key={e.phone}>
                <CardContent className="p-4">
                  <p className="font-semibold">{e.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{e.note}</p>
                  <a href={`tel:${e.phone.replace(/\s/g, '')}`} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm font-bold text-white hover:bg-brand/90">
                    <Phone className="h-3.5 w-3.5" />Call {e.phone}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}