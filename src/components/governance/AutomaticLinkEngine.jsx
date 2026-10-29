import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import LinkHealthTable from '@/components/governance/LinkHealthTable';
import RecordLinkExplorer from '@/components/governance/RecordLinkExplorer';
import { buildLinkIndex, linkHealth, loadLinkUniverse } from '@/lib/universalLinkEngine';
import { Loader2, RefreshCw } from 'lucide-react';

export default function AutomaticLinkEngine() {
  const [recordsByType, setRecordsByType] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const universe = await loadLinkUniverse();
      setRecordsByType(universe);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const index = useMemo(() => (recordsByType ? buildLinkIndex(recordsByType) : null), [recordsByType]);
  const health = useMemo(() => (recordsByType && index ? linkHealth(recordsByType, index) : null), [recordsByType, index]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2 rounded-2xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-3.5">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">Universal Governance Link Engine</p>
          <p className="mt-1 text-xs font-semibold text-[#0A2B6D]">
            Every policy, procedure, form, register, record, risk, incident, complaint, training item, consent,
            acknowledgement and audit evidence item is linked automatically from the data you already record — shared
            participants, staff, document references, standards and subjects. Nothing is maintained by hand, and
            anything that cannot be linked is shown as standing alone.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}Rebuild links
        </Button>
      </div>

      {!health ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          <LinkHealthTable health={health} />
          <RecordLinkExplorer recordsByType={recordsByType} index={index} />
        </>
      )}
    </div>
  );
}