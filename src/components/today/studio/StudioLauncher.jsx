import React, { useState } from 'react';
import { Sparkles, Palette, Target, FileText, Mic, ArrowUpRight } from 'lucide-react';
import { Panel } from '@/components/today/todayUi';
import StudioShell from '@/components/today/studio/StudioShell';
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

export default function StudioLauncher({ context }) {
  const [active, setActive] = useState(null);
  const tool = TOOLS.find((item) => item.id === active);

  return (
    <>
      <Panel
        title="Sherelle’s workbench"
        subtitle="Five studios in one — built for the iPad and the MacBook"
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
          {tool.id === 'assistant' ? <AssistantStudio context={context} /> : null}
          {tool.id === 'design' ? <DesignStudio /> : null}
          {tool.id === 'crm' ? <CrmStudio /> : null}
          {tool.id === 'docs' ? <DocsStudio /> : null}
          {tool.id === 'meetings' ? <MeetingStudio /> : null}
        </StudioShell>
      ) : null}
    </>
  );
}