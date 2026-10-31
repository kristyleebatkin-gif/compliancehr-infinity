import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { AUDIT_PACK_SECTIONS, AUDIT_PACK_COLUMNS } from '@/lib/governanceFramework';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import { Download, Loader2, ShieldCheck } from 'lucide-react';

const keyOf = (sectionKey, source) => `${sectionKey}|${source.entity}|${source.label}`;

export default function NdisAuditPack() {
  const [counts, setCounts] = useState(null);
  const [building, setBuilding] = useState(false);
  const [packedAt, setPackedAt] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const sources = AUDIT_PACK_SECTIONS.flatMap((section) => section.sources.map((source) => ({ section, source })));
    Promise.all(sources.map(({ source }) => base44.entities[source.entity].count({}).catch(() => null)))
      .then((values) => {
        if (!active) return;
        setCounts(Object.fromEntries(sources.map(({ section, source }, index) => [keyOf(section.key, source), values[index]])));
      });
    return () => { active = false; };
  }, []);

  const readySources = counts
    ? Object.values(counts).filter((value) => Number(value) > 0).length
    : 0;
  const totalSources = AUDIT_PACK_SECTIONS.reduce((sum, section) => sum + section.sources.length, 0);

  const buildPack = async () => {
    setBuilding(true);
    setError('');
    try {
      const grouped = await Promise.all(
        AUDIT_PACK_SECTIONS.map(async (section) => {
          const lists = await Promise.all(
            section.sources.map(async (source) => {
              const records = await fetchAllRecords(base44.entities[source.entity], {}, '-created_date');
              return records.map((record) => ({
                section: section.key,
                category: source.label,
                record: record[source.title] || record.title || record.id,
                detail: source.meta ? record[source.meta] || '' : '',
                status: record.status || '',
                created: (record.created_date || '').slice(0, 10),
              }));
            })
          );
          return lists.flat();
        })
      );
      const rows = grouped.flat();
      if (rows.length === 0) {
        setError('There are no records to pack yet. Record evidence in the modules above and generate the pack again.');
        return;
      }
      downloadCsv(`ndis-audit-pack-${new Date().toISOString().slice(0, 10)}.csv`, AUDIT_PACK_COLUMNS, rows);
      setPackedAt(new Date());
    } catch (err) {
      setError(err?.message || 'The audit pack could not be generated.');
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-3.5">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">One Click NDIS Audit Pack</p>
          <p className="mt-1 max-w-3xl text-xs font-semibold text-[#0A2B6D]">
            Six evidence domains, {totalSources} source registers. The pack exports every record in each domain with
            its category, status and recorded date, ready to hand to an NDIS auditor.
          </p>
          <p className="mt-1 text-[11px] font-bold text-[#0A2B6D]">
            Readiness: {readySources} of {totalSources} sources hold records
            {packedAt ? ` · last pack generated ${packedAt.toLocaleString()}` : ''}
          </p>
        </div>
        <Button onClick={buildPack} disabled={building}>
          {building ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Generate audit pack
        </Button>
      </div>

      {error && <p className="rounded-xl border-2 border-[#FF2E9A] bg-white px-3 py-2 text-xs font-semibold text-[#FF2E9A]">{error}</p>}

      <div className="grid gap-2.5 md:grid-cols-2">
        {AUDIT_PACK_SECTIONS.map((section) => (
          <div key={section.key} className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A2B6D]">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </span>
              <p className="text-sm font-extrabold text-[#0A2B6D]">{section.key}</p>
            </div>
            <p className="mt-1 text-[11px] font-medium text-[#0A2B6D]">{section.blurb}</p>
            <div className="mt-2 space-y-1">
              {section.sources.map((source) => {
                const value = counts ? counts[keyOf(section.key, source)] : undefined;
                return (
                  <div key={source.label} className="flex items-center justify-between gap-2 rounded-lg bg-[#F5F0FF] px-2 py-1">
                    <span className="min-w-0 truncate text-[11px] font-bold text-[#0A2B6D]">{source.label}</span>
                    <span className="shrink-0 text-[11px] font-extrabold tabular-nums text-[#5A00D6]">
                      {counts === null ? '…' : (value === null || value === undefined ? '—' : value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}