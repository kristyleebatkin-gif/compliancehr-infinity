import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { NDIS_CORE_STANDARDS, NDIS_STANDARD_COLOURS } from '@/lib/ndisPracticeStandards';
import StandardEvidence from '@/components/compliance/StandardEvidence';
import { openDocumentInViewer } from '@/lib/openDocument';

// NDIS Practice Standards map: vibrant, colourful cards - each principal gets
// its fixed module colour, live evidence counts per control, and its own
// evidence upload/download so auditors can file proof to the right standard.
export default function ControlEvidenceMap() {
  const [counts, setCounts] = useState({});

  const entities = useMemo(() => {
    const set = new Set();
    NDIS_CORE_STANDARDS.forEach((s) => s.controls.forEach((c) => c.evidence.forEach((e) => set.add(e.entity))));
    return Array.from(set);
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.all(
      entities.map((name) =>
        base44.entities[name].count({}).then((n) => [name, n]).catch(() => [name, 0]),
      ),
    ).then((rows) => { if (alive) setCounts(Object.fromEntries(rows)); });
    return () => { alive = false; };
  }, [entities]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#6d28d9]">
        NDIS Practice Standards - every control maps to its evidence registers and filed evidence, counted live.
      </p>
      {NDIS_CORE_STANDARDS.map((s) => {
        const colour = NDIS_STANDARD_COLOURS[s.standard] || '#6d28d9';
        const all = s.controls.flatMap((c) => c.evidence.map((e) => counts[e.entity] || 0));
        const ready = all.every((n) => n > 0);
        const started = all.some((n) => n > 0);
        return (
          <Card key={s.standard} className="shadow-panel" style={{ borderTop: `4px solid ${colour}` }}>
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-heading text-sm font-bold leading-snug" style={{ color: colour }}>{s.standard}</h3>
                {ready ? (
                  <Badge className="bg-safe/10 text-safe border border-safe/30"><CheckCircle2 className="mr-1 h-3 w-3" />Evidence in place</Badge>
                ) : started ? (
                  <Badge className="bg-warning/10 text-warning border border-warning/30"><AlertTriangle className="mr-1 h-3 w-3" />Evidence building</Badge>
                ) : (
                  <Badge className="bg-danger/10 text-danger border border-danger/30"><AlertTriangle className="mr-1 h-3 w-3" />No evidence yet</Badge>
                )}
              </div>
              <div className="mt-2 space-y-1">
                {s.controls.map((c) => (
                  <div key={c.control} className="rounded-lg border border-border/60 p-2" style={{ background: `${colour}0d` }}>
                    <p className="text-xs font-bold leading-snug" style={{ color: colour }}>{c.control}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {c.evidence.map((e) => {
                        const n = counts[e.entity];
                        return (
                          <button
                            key={e.label}
                            type="button"
                            onClick={async () => {
                              try {
                                const page = await base44.entities[e.entity].list({ sort: '-created_date', limit: 1 });
                                const first = page?.items?.[0];
                                if (first) {
                                  await openDocumentInViewer({ ...first, category: e.label, module: s.standard });
                                  return;
                                }
                              } catch {
                                // fallback below
                              }
                              await openDocumentInViewer({
                                title: `${e.label} — ${c.control}`,
                                category: s.standard,
                                module: 'NDIS Practice Standards Evidence Map',
                                description: `Evidence register "${e.label}" (${e.entity}) mapped to ${s.standard} — ${c.control}. Live count: ${n ?? 0}.`,
                              });
                            }}
                            className="rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums transition hover:opacity-90"
                            style={{ backgroundColor: `${colour}1f`, borderColor: `${colour}55`, color: colour }}
                          >
                            {e.label}: {n === undefined ? '…' : n} · Open
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <StandardEvidence standard={s.standard} controls={s.controls.map((c) => c.control)} colour={colour} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}