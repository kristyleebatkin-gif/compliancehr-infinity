import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, BookOpen, Compass, Wrench, Lightbulb, ListChecks, Layers } from 'lucide-react';
import { downloadModuleGuidePdf } from '@/lib/userGuidePdf';

function SectionBlock({ icon: Icon, title, accent, children }) {
  return (
    <Card className="overflow-hidden border-border/70">
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${accent}1f`, color: accent }}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <CardContent className="px-4 py-4">{children}</CardContent>
    </Card>
  );
}

export default function GuideReader({ moduleKey, guide, meta, accent, onBack }) {

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> All guides
        </Button>
        <div className="grow" />
        <Button size="sm" onClick={() => downloadModuleGuidePdf(moduleKey)} style={{ backgroundColor: accent, color: '#ffffff' }}>
          <Download className="h-4 w-4" /> Download this guide (PDF)
        </Button>
      </div>

      <Card className="overflow-hidden border-border/70">
        <div className="relative p-6" style={{ background: `linear-gradient(135deg, ${accent}1f 0%, ${accent}0a 100%)` }}>
          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full opacity-10" style={{ backgroundColor: accent }} />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm" style={{ backgroundColor: `${accent}26`, color: accent }}>
                <meta.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">{meta.label}</h2>
                {guide.tagline && <p className="text-sm font-medium" style={{ color: accent }}>{guide.tagline}</p>}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{guide.features?.length || 0} features</Badge>
              <Badge variant="secondary">{guide.steps?.length || 0} steps</Badge>
              <Badge variant="secondary">{guide.tools?.length || 0} tools</Badge>
              <Badge variant="secondary">{guide.tips?.length || 0} pro tips</Badge>
            </div>
          </div>
        </div>
      </Card>

      <SectionBlock icon={Compass} title="Purpose of this module" accent={accent}>
        <p className="text-sm leading-relaxed text-foreground/80">{guide.purpose}</p>
      </SectionBlock>

      {guide.features?.length > 0 && (
        <SectionBlock icon={Layers} title="What's inside" accent={accent}>
          <div className="grid gap-3 sm:grid-cols-2">
            {guide.features.map((feature) => (
              <div key={feature.name} className="rounded-lg border bg-card p-3">
                <p className="text-sm font-semibold" style={{ color: accent }}>{feature.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-foreground/70">{feature.detail}</p>
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {guide.steps?.length > 0 && (
        <SectionBlock icon={ListChecks} title="How it works, step by step" accent={accent}>
          <ol className="space-y-2.5">
            {guide.steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: accent, color: '#ffffff' }}>{index + 1}</span>
                <span className="text-sm leading-relaxed text-foreground/80">{step}</span>
              </li>
            ))}
          </ol>
        </SectionBlock>
      )}

      {guide.tools?.length > 0 && (
        <SectionBlock icon={Wrench} title="Tools & resources" accent={accent}>
          <div className="space-y-3">
            {guide.tools.map((tool) => (
              <div key={tool.name} className="rounded-lg border bg-card p-3">
                <p className="text-sm font-semibold text-foreground">{tool.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-foreground/70">{tool.detail}</p>
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {guide.tips?.length > 0 && (
        <SectionBlock icon={Lightbulb} title="Pro tips & good practice" accent={accent}>
          <ul className="space-y-2.5">
            {guide.tips.map((tip, index) => (
              <li key={index} className="flex gap-2.5">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
                <span className="text-sm leading-relaxed text-foreground/80">{tip}</span>
              </li>
            ))}
          </ul>
        </SectionBlock>
      )}
    </div>
  );
}