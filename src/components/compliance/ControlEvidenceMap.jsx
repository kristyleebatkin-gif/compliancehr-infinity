import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { NDIS_CORE_STANDARDS } from '@/lib/ndisPracticeStandards';

// Control-to-framework mapping: each NDIS Practice Standards control shows the
// app registers that hold its evidence, with a live record count per register.
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
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Every checklist item maps to its NDIS Practice Standards control and its evidence registers, counted live.
      </p>
      {NDIS_CORE_STANDARDS.map((s) => {
        const all = s.controls.flatMap((c) => c.evidence.map((e) => counts[e.entity] || 0));
        const ready = all.every((n) => n > 0);
        const started = all.some((n) => n > 0);
        return (
          <Card key={s.standard} className="shadow-panel">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-editorial text-lg font-semibold text-foreground">{s.standard}</h3>
                {ready ? (
                  <Badge className="bg-safe/10 text-safe border border-safe/30"><CheckCircle2 className="mr-1 h-3 w-3" />Evidence in place</Badge>
                ) : started ? (
                  <Badge className="bg-warning/10 text-warning border border-warning/30"><AlertTriangle className="mr-1 h-3 w-3" />Evidence building</Badge>
                ) : (
                  <Badge className="bg-danger/10 text-danger border border-danger/30"><AlertTriangle className="mr-1 h-3 w-3" />No evidence yet</Badge>
                )}
              </div>
              <div className="mt-3 space-y-2">
                {s.controls.map((c) => (
                  <div key={c.control} className="rounded-xl border border-border/60 bg-muted/30 p-3">
                    <p className="text-sm font-semibold text-foreground">{c.control}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {c.evidence.map((e) => {
                        const n = counts[e.entity];
                        return (
                          <span key={e.label} className="rounded-full border border-border/60 bg-card px-2.5 py-0.5 text-xs font-medium tabular-nums text-foreground/70">
                            {e.label}: {n === undefined ? '…' : n}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}