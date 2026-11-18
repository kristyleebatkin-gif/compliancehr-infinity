import React, { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PortfolioRollupCard from '@/components/strategy/PortfolioRollupCard';
import CapabilityMaturityTable from '@/components/strategy/CapabilityMaturityTable';
import DueObjectiveList from '@/components/strategy/DueObjectiveList';
import { StrategyEmpty } from '@/components/strategy/strategyKit';

/** Board and executive view: strategy rollups, what is due, and how much maturity is proven. */
export default function BoardStrategyView({ rollups = [], dueObjectives = [], capabilityRollups = [], meta = {}, counts = {} } = {}) {
  const [portfolioId, setPortfolioId] = useState('all');
  const [status, setStatus] = useState('all');
  const [attention, setAttention] = useState('all');
  const [domain, setDomain] = useState('all');

  const domains = useMemo(() => [...new Set(capabilityRollups.map((row) => row.domain).filter(Boolean))], [capabilityRollups]);

  const portfolios = rollups.filter((row) => (portfolioId === 'all' || row.id === portfolioId)
    && (status === 'all' || row.status === status)
    && (attention === 'all' || (attention === 'Overdue' && row.overdueObjectives > 0) || (attention === 'Due soon' && row.dueSoonObjectives > 0)));

  const due = dueObjectives.filter((row) => (portfolioId === 'all' || row.portfolio_id === portfolioId)
    && (attention === 'all' || row.due === attention));

  const capabilities = capabilityRollups.filter((row) => domain === 'all' || row.domain === domain);

  const filtered = portfolioId !== 'all' || status !== 'all' || attention !== 'all' || domain !== 'all';

  return (
    <div className="space-y-4">
      <div className="module-filter-bar flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <div className="min-w-[200px]">
          <label className="text-[10px] font-bold uppercase text-[#0A2B6D]/60" htmlFor="board-portfolio">Portfolio</label>
          <Select value={portfolioId} onValueChange={setPortfolioId}>
            <SelectTrigger id="board-portfolio"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All portfolios</SelectItem>
              {rollups.map((row) => <SelectItem key={row.id} value={row.id}>{row.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[160px]">
          <label className="text-[10px] font-bold uppercase text-[#0A2B6D]/60" htmlFor="board-status">Portfolio status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="board-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              {(meta.portfolioStatuses || []).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[170px]">
          <label className="text-[10px] font-bold uppercase text-[#0A2B6D]/60" htmlFor="board-attention">Needs attention</label>
          <Select value={attention} onValueChange={setAttention}>
            <SelectTrigger id="board-attention"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Every objective</SelectItem>
              <SelectItem value="Overdue">Overdue only</SelectItem>
              <SelectItem value="Due soon">Due in 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[170px]">
          <label className="text-[10px] font-bold uppercase text-[#0A2B6D]/60" htmlFor="board-domain">Capability domain</label>
          <Select value={domain} onValueChange={setDomain}>
            <SelectTrigger id="board-domain"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Every domain</SelectItem>
              {domains.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <p className="ml-auto text-[11px] text-[#0A2B6D]/60">
          {counts.portfolios ?? 0} portfolios · {counts.objectives ?? 0} objectives · average progress {counts.progress === null || counts.progress === undefined ? 'unknown' : `${counts.progress}%`}
        </p>
      </div>

      {!rollups.length ? (
        <StrategyEmpty
          title="No portfolio recorded yet"
          body="A portfolio is the top of the strategy chain: portfolio, then program, objective and benefit. Record one to start rolling up real measures; nothing here is pre-filled."
        />
      ) : !portfolios.length ? (
        <StrategyEmpty title="No portfolio matches these filters" body={filtered ? 'Clear or widen the filters to see the rest of the strategy.' : 'Nothing to show yet.'} />
      ) : (
        <div className="space-y-3">
          {portfolios.map((portfolio) => <PortfolioRollupCard key={portfolio.id} portfolio={portfolio} />)}
        </div>
      )}

      <DueObjectiveList objectives={due} />
      <CapabilityMaturityTable capabilities={capabilities} />
    </div>
  );
}