import React, { useEffect, useState } from 'react';
import { Sparkles, Palette, Target, FileText, Mic, ArrowUpRight, Loader2 } from 'lucide-react';
import { Panel } from '@/components/today/todayUi';
import StudioShell from '@/components/today/studio/StudioShell';
import { migrateLocalStudio } from '@/components/today/studio/studioData';
import AssistantStudio from '@/components/today/studio/AssistantStudio';
import DesignStudio from '@/components/today/studio/DesignStudio';
import CrmStudio from '@/components/today/studio/CrmStudio';
import DocsStudio from '@/components/today/studio/DocsStudio';
import MeetingStudio from '@/components/today/studio/MeetingStudio';

const TOOLS = [
  {
    id: 'assistant',
    name: 'Assistant',
    blurb: 'Ask, plan and draft anything',
    subtitle: 'Your AI assistant — it can see today’s dashboard',
    icon: Sparkles,
    tint: 'linear-gradient(135deg,#0a2b6d 0%,#5a00d6 100%)'
  },
  {
    id: 'design',
    name: 'Design studio',
    blurb: 'Posts, flyers, certificates',
    subtitle: 'Create on-brand graphics and download them as images',
    icon: Palette,
    tint: 'linear-gradient(135deg,#ff2e9a 0%,#ff9e6d 100%)'
  },
  {
    id: 'crm',
    name: 'Smart CRM',
    blurb: 'Pipeline and next best action',
    subtitle: 'Live enquiry pipeline with suggested follow-ups',
    icon: Target,
    tint: 'linear-gradient(135deg,#0072ff 0%,#39e6ff 100%)'
  },
  {
    id: 'docs',
    name: 'Docs & files',
    blurb: 'Write, store and export',
    subtitle: 'Minutes, policies and letters you can export anywhere',
    icon: FileText,
    tint: 'linear-gradient(135deg,#10a070 0%,#8ce0c0 100%)'
  },
  {
    id: 'meetings',
    name: 'Meeting notes',
    blurb: 'Record, transcribe, summarise',
    subtitle: 'Recordings stay private; summaries and actions come back to you',
    icon: Mic,
    tint: 'linear-gradient(135deg,#5a00d6 0%,#b026ff 100%)'
  }
];

export default function StudioLauncher({
  context,
  title = 'Sherelle’s workbench',
  subtitle = 'Five studios in one — built for the iPad and the MacBook'
}) {
  const [active, setActive] = useState(null);
  const [ready, setReady] = useState(false);
  const tool = TOOLS.find((item) => item.id === active);

  useEffect(() => {
    let cancelled = false;
    migrateLocalStudio()
      .catch(() => null)
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Panel
        title={title}
        subtitle={subtitle}
        action={<span className="t-pill t-pill-gray">{TOOLS.length} tools</span>}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {TOOLS.map(({ id, name, blurb, icon: Icon, tint }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className="studio-tile group"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-sm" style={{ background: tint }}>
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="t-title flex items-center gap-1 text-[12.5px] font-extrabold">
                  {name}
                  <ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-70" />
                </span>
                <span className="t-muted mt-0.5 block text-[10.5px] leading-snug">{blurb}</span>
              </span>
            </button>
          ))}
        </div>
      </Panel>

      {tool ? (
        <StudioShell title={tool.name} subtitle={tool.subtitle} icon={tool.icon} onClose={() => setActive(null)}>
          {!ready ? (
            <p className="t-muted flex items-center gap-2 text-xs font-semibold">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Moving anything saved on this device into the app…
            </p>
          ) : null}
          {ready && tool.id === 'assistant' ? <AssistantStudio context={context} /> : null}
          {ready && tool.id === 'design' ? <DesignStudio /> : null}
          {ready && tool.id === 'crm' ? <CrmStudio /> : null}
          {ready && tool.id === 'docs' ? <DocsStudio /> : null}
          {ready && tool.id === 'meetings' ? <MeetingStudio /> : null}
        </StudioShell>
      ) : null}
    </>
  );
}