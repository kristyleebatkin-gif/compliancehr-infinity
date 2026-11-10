import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Panel, Pill, Empty } from '@/components/today/todayUi';

const draft = (update) => [
  `NDIS update: ${update.title}`,
  `${update.source || 'NDIS'} · ${update.published_date || ''}`.trim(),
  '1. Read the update and note what changed.',
  '2. Check affected policies, service agreements and participant documents.',
  '3. Update the compliance register and record the evidence.'
];

export default function NdisUpdatesPanel({ updates }) {
  const { toast } = useToast();
  const [openId, setOpenId] = useState(null);

  const makeTodo = async (update) => {
    try {
      await navigator.clipboard.writeText(draft(update).join('\n'));
      toast({ title: 'To-do list copied', description: 'Paste it into Tasks to assign owners.' });
    } catch {
      toast({ title: 'Copy failed', description: 'Your browser blocked clipboard access.', variant: 'destructive' });
    }
  };

  return (
    <Panel title="NDIS & Aged Care" subtitle="Latest sector updates" action={<Pill tone="pink">Live</Pill>}>
      {updates.length === 0 ? (
        <Empty>No sector updates have been pulled in yet.</Empty>
      ) : (
        <div className="space-y-1.5">
          {updates.map((update) => (
            <div key={update.id} className="t-row px-1.5 py-2">
              <p className="t-title text-[12.5px] font-bold leading-snug">{update.title}</p>
              <p className="t-muted mt-0.5 text-[10.5px] font-semibold">
                {update.source || 'NDIS'} · {update.published_date || 'Undated'}
              </p>
              {openId === update.id ? (
                <p className="t-muted mt-1.5 text-[11.5px] leading-relaxed">
                  {update.summary || 'No summary supplied. Open the update to read the details.'} This touches policy,
                  service agreements and your evidence register.
                </p>
              ) : null}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setOpenId(openId === update.id ? null : update.id)}
                  className="t-btn t-btn-ghost !px-2 !py-1 !text-[10.5px]"
                >
                  {openId === update.id ? 'Hide impact' : 'Preview impact'}
                </button>
                <button type="button" onClick={() => makeTodo(update)} className="t-btn t-btn-ghost !px-2 !py-1 !text-[10.5px]">
                  Make to-do list
                </button>
                {update.url ? (
                  <a href={update.url} target="_blank" rel="noreferrer" className="t-btn t-btn-ghost !px-2 !py-1 !text-[10.5px]">
                    Source
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}