import React from 'react';
import { CRITICALITY, RATING_BANDS } from '@/lib/masterAssuranceCatalogue';
import { MATRIX_STATE_ORDER, MATRIX_STATES } from '@/lib/auditMatrixScoring';
import { cn } from '@/lib/utils';

export default function ScoringModelCard() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <section className="rounded-xl border border-border bg-card p-4 shadow-2xs">
        <h2 className="text-sm font-extrabold text-foreground">Criticality weighting</h2>
        <p className="mb-2 text-xs text-muted-foreground">Criticality defines weights. Generated checkpoint assignments are draft proposals. Maximum points, pass thresholds and applicability require an approved assessment rubric.</p>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="px-2 py-1.5">Criticality</th>
              <th className="px-2 py-1.5">Score</th>


            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Object.entries(CRITICALITY).map(([label, config]) => (
              <tr key={label}>
                <td className="px-2 py-1.5">
                  <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-bold', config.tone)}>{label}</span>
                </td>
                <td className="px-2 py-1.5 text-sm font-bold text-foreground">{config.score}</td>


              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-2xs">
        <h2 className="text-sm font-extrabold text-foreground">Compliance rating</h2>
        <p className="mb-2 text-xs text-muted-foreground">Compliance score = achieved points ÷ available points × 100.</p>
        <ul className="space-y-1.5">
          {RATING_BANDS.map((band, index) => (
            <li key={band.label} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {band.min}–{index === 0 ? 100 : RATING_BANDS[index - 1].min - 1}
              </span>
              <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-bold', band.tone)}>{band.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-2xs lg:col-span-2">
        <h2 className="text-sm font-extrabold text-foreground">Assessment status</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {MATRIX_STATE_ORDER.map((key) => (
            <div key={key} className="rounded-lg border border-border p-2.5">
              <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-bold', MATRIX_STATES[key].tone)}>
                {MATRIX_STATES[key].label}
              </span>
              <p className="mt-1.5 text-xs font-semibold text-foreground">
                No score available
              </p>
              <p className="text-[11px] font-medium text-muted-foreground">
                Explicit reviewed mappings, applicability and version-pinned assessment results are required. Shared standard codes never establish checkpoint compliance.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
