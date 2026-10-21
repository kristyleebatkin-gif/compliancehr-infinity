import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Download, Library, Search } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import GuideReader from '@/components/guides/GuideReader';
import { USER_GUIDES } from '@/lib/userGuidesContent';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { downloadFullLibraryPdf, downloadModuleGuidePdf } from '@/lib/userGuidePdf';

// Guide module accents, grouped so the library reads as one designed system.
const ACCENTS = {
  overview: ['#4f46e5', '#818cf8'],
  care: ['#0d9488', '#2dd4bf'],
  safety: ['#dc2626', '#f87171'],
  finance: ['#059669', '#34d399'],
  people: ['#7c3aed', '#a78bfa'],
  operations: ['#2563eb', '#60a5fa'],
  growth: ['#d97706', '#fbbf24'],
  support: ['#64748b', '#94a3b8'],
};

const ACCENT_BY_KEY = {
  dashboard: ACCENTS.overview, users: ACCENTS.overview, documents: ACCENTS.overview, 'company-safe': ACCENTS.overview, help: ACCENTS.support,
  participants: ACCENTS.care, goals: ACCENTS.care, 'visual-boards': ACCENTS.care, 'community-referral': ACCENTS.care, 'community-council': ACCENTS.care,
  incidents: ACCENTS.safety, risks: ACCENTS.safety, 'emergency-response': ACCENTS.safety, 'equipment-manuals': ACCENTS.safety,
  invoicing: ACCENTS.finance, quotes: ACCENTS.finance, receipts: ACCENTS.finance, procurement: ACCENTS.finance, assets: ACCENTS.finance,
  staff: ACCENTS.people, 'human-resources': ACCENTS.people, training: ACCENTS.people, 'volunteering-placements': ACCENTS.people, 'key-contacts': ACCENTS.people,
  intake: ACCENTS.operations, rostering: ACCENTS.operations, tasks: ACCENTS.operations, meetings: ACCENTS.operations, certificates: ACCENTS.operations,
  compliance: ACCENTS.growth, 'ndis-provider': ACCENTS.growth, 'ndis-news': ACCENTS.growth, quality: ACCENTS.growth, programs: ACCENTS.growth,
  communications: ACCENTS.growth, analytics: ACCENTS.growth, crm: ACCENTS.growth, projects: ACCENTS.growth, feedback: ACCENTS.growth,
};
ACCENT_BY_KEY.intake = ACCENTS.operations;

const GROUPS = [
  { id: 'work', label: 'Work & service delivery', keys: ['dashboard', 'intake', 'participants', 'staff', 'rostering', 'goals', 'visual-boards', 'tasks'] },
  { id: 'safe', label: 'Safety & compliance', keys: ['incidents', 'risks', 'emergency-response', 'compliance', 'quality', 'ndis-provider', 'ndis-news', 'certificates'] },
  { id: 'money', label: 'Money & assets', keys: ['invoicing', 'quotes', 'receipts', 'procurement', 'assets', 'equipment-manuals'] },
  { id: 'people', label: 'People & communications', keys: ['communications', 'meetings', 'training', 'human-resources', 'volunteering-placements', 'key-contacts', 'feedback'] },
  { id: 'business', label: 'Business & records', keys: ['documents', 'company-safe', 'users', 'analytics', 'crm', 'projects', 'programs', 'community-referral', 'community-council', 'help'] },
];

function matches(meta, guide, term) {
  const haystack = `${meta.label} ${meta.blurb} ${guide?.tagline || ''} ${guide?.purpose || ''}`.toLowerCase();
  return haystack.includes(term);
}

export default function UserGuides() {
  const [selectedKey, setSelectedKey] = useState(null);
  const [search, setSearch] = useState('');

  const term = search.trim().toLowerCase();

  const guides = useMemo(() => (
    MODULE_DIRECTORY
      .filter((m) => USER_GUIDES[m.key])
      .map((m) => ({ meta: m, guide: USER_GUIDES[m.key], accent: ACCENT_BY_KEY[m.key] || ACCENTS.overview }))
  ), []);

  const filteredGroups = useMemo(() => (
    GROUPS
      .map((group) => ({
        ...group,
        items: guides.filter((g) => group.keys.includes(g.meta.key) && (!term || matches(g.meta, g.guide, term) || JSON.stringify(g.guide).toLowerCase().includes(term))),
      }))
      .filter((group) => group.items.length > 0)
  ), [guides, term]);

  const totalFeatures = guides.reduce((sum, g) => sum + (g.guide.features?.length || 0), 0);

  if (selectedKey) {
    const entry = guides.find((g) => g.meta.key === selectedKey);
    if (entry) {
      return (
        <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-6">
          <ModuleShell
            title="User Guides"
            subtitle="The complete operating manual for every module in the platform."
            icon={BookOpen}
            moduleKey="user-guides"
          />
          <GuideReader
            moduleKey={selectedKey}
            guide={entry.guide}
            meta={entry.meta}
            accent={entry.accent}
            onBack={() => setSelectedKey(null)}
          />
        </div>
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
      <ModuleShell
        title="User Guides"
        subtitle={`Professional guides for all ${guides.length} modules — every feature, process, tool and resource, each one downloadable as a branded PDF.`}
        icon={BookOpen}
        moduleKey="user-guides"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search every guide, feature, tool and step..."
            className="pl-9"
          />
        </div>
        <Button onClick={downloadFullLibraryPdf} className="w-full sm:w-auto">
          <Library className="h-4 w-4" /> Download complete library (PDF)
        </Button>
        <Button variant="outline" onClick={downloadFullLibraryPdf} className="sm:hidden">
          <Download className="h-4 w-4" /> Full library
        </Button>
      </div>

      {filteredGroups.map((group) => (
        <section key={group.id} className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map(({ meta, guide, accent }) => (
              <Card
                key={meta.key}
                className="group cursor-pointer overflow-hidden border-border/70 transition-shadow hover:shadow-md"
                onClick={() => setSelectedKey(meta.key)}
              >
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent[0]}1a`, color: accent[0] }}>
                      <meta.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{meta.label}</p>
                      <p className="text-xs text-muted-foreground">{guide.tagline}</p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-foreground/70">{guide.purpose}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{guide.features?.length || 0} features · {guide.steps?.length || 0} steps</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={(e) => { e.stopPropagation(); downloadModuleGuidePdf(meta.key); }}
                    >
                      <Download className="h-3.5 w-3.5" /> PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}

      {filteredGroups.length === 0 && (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No guides match "{search}". Try another word.</CardContent></Card>
      )}

      <p className="pt-2 text-center text-xs text-muted-foreground">
        {guides.length} module guides · {totalFeatures} documented features · every guide available as a branded PDF
      </p>
    </div>
  );
}