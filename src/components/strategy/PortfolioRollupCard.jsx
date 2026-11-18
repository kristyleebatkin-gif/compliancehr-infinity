import React from 'react';
import { Table } from '@/components/ui/table';
import { DueBadge, ProgressBar, StatusBadge, TableBody, TableCell, TableHead, TableHeader, TableRow, money } from '@/components/strategy/strategyKit';

const dueTone = (state) => (state === 'Overdue' ? 'text-rose-700' : state === 'Due soon' ? 'text-amber-700' : 'text-[#0A2B6D]/70');

/** One portfolio rolled up to its programs, with the objectives behind each figure. */
export default function PortfolioRollupCard({ portfolio } = {}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-2xs">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-4">
        <div className="min-w-[220px]">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-[#0A2B6D]">{portfolio.name}</h3>
            <StatusBadge status={portfolio.status} />
            <DueBadge state={portfolio.reviewState} />
          </div>
          <p className="mt-1 text-[11px] text-[#0A2B6D]/70">
            {portfolio.portfolio_key} · Sponsor {portfolio.sponsor || 'not named'}
          </p>
          <p className="mt-1 max-w-xl text-[11px] text-[#0A2B6D]/70">{portfolio.strategy_alignment}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-right sm:grid-cols-3">
          <div>
            <div className="text-[10px] font-bold uppercase text-[#0A2B6D]/60">Progress</div>
            <ProgressBar value={portfolio.progress} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-[#0A2B6D]/60">Objectives</div>
            <div className="text-sm font-bold text-[#0A2B6D]">{portfolio.objectiveCount}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-[#0A2B6D]/60">Validated benefit</div>
            <div className="text-sm font-bold text-[#0A2B6D]">{money(portfolio.benefitValue)}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-[#0A2B6D]/60">Overdue</div>
            <div className={`text-sm font-bold ${dueTone(portfolio.overdueObjectives ? 'Overdue' : 'On track')}`}>{portfolio.overdueObjectives}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-[#0A2B6D]/60">Achieved</div>
            <div className="text-sm font-bold text-[#0A2B6D]">{portfolio.achievedObjectives}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-[#0A2B6D]/60">Review due</div>
            <div className="text-sm font-bold text-[#0A2B6D]">{portfolio.review_due || '—'}</div>
          </div>
        </div>
      </div>

      {!portfolio.programs.length ? (
        <p className="p-4 text-xs text-[#0A2B6D]/70">No program has been linked to this portfolio yet, so there is nothing to roll up.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Objectives</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Overdue</TableHead>
                <TableHead>Target date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolio.programs.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="min-w-[200px]">
                    <div className="text-xs font-bold text-[#0A2B6D]">{program.name}</div>
                    <div className="text-[11px] text-[#0A2B6D]/60">{program.program_key} · {program.sponsor || 'no sponsor'}</div>
                    {program.objectives.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {program.objectives.slice(0, 4).map((objective) => (
                          <li key={objective.id} className={`text-[11px] ${dueTone(objective.due)}`}>
                            {objective.name} · {objective.progress === null ? 'no measure' : `${objective.progress}%`} · {objective.due}
                          </li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                  <TableCell><StatusBadge status={program.status} /></TableCell>
                  <TableCell className="text-xs text-[#0A2B6D]">{program.objectiveCount}</TableCell>
                  <TableCell><ProgressBar value={program.progress} /></TableCell>
                  <TableCell className={`text-xs font-bold ${dueTone(program.overdueObjectives ? 'Overdue' : 'On track')}`}>{program.overdueObjectives}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">{program.target_date || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}