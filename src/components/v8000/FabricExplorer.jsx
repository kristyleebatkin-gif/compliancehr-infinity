import React, { useMemo, useState } from 'react';
import { evidenceStateAt } from '@/lib/v8000Engine';
import FabricNodeDetail from '@/components/v8000/FabricNodeDetail';

const text = (value) => String(value ?? '').trim();

/** Framework → standard → control → evidence → finding → outcome, with node details on selection. */
export default function FabricExplorer({ standards = [], controls = [], evidence = [], findings = [], today }) {
  const frameworks = useMemo(
    () => ['all', ...new Set(standards.map((standard) => text(standard.framework) || 'No framework'))],
    [standards]
  );
  const [framework, setFramework] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const visible = useMemo(
    () => standards
      .filter((standard) => framework === 'all' || (text(standard.framework) || 'No framework') === framework)
      .sort((a, b) => text(a.standard_code).localeCompare(text(b.standard_code))),
    [standards, framework]
  );

  const selected = visible.find((standard) => standard.id === selectedId) || visible[0] || null;

  const controlsFor = (standard) => controls.filter((control) => control.standard_id === standard.id
    || (text(control.standard_code) && text(control.standard_code).toUpperCase() === text(standard.standard_code).toUpperCase()));

  if (!standards.length) {
    return (
      <div className="v8-panel p-4">
        <p className="v8-title">No framework, standard or obligation is recorded yet</p>
        <p className="v8-sub mt-1">
          The fabric traces the standards you actually hold. Add a standard and the controls that meet it in Evidence OS,
          then this view shows the chain from framework to outcome and every break in it.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <div className="v8-panel p-3">
        <label className="v8-muted font-bold uppercase tracking-wide" htmlFor="v8-framework">Framework</label>
        <select
          id="v8-framework"
          value={framework}
          onChange={(event) => { setFramework(event.target.value); setSelectedId(null); }}
          className="mt-1 w-full rounded-md border border-white/25 bg-[#0A2B6D] px-2 py-1.5 text-xs font-bold text-white"
        >
          {frameworks.map((option) => (
            <option key={option} value={option}>{option === 'all' ? 'All frameworks' : option}</option>
          ))}
        </select>

        <p className="v8-muted mt-2 font-bold uppercase tracking-wide">{visible.length} standard(s)</p>
        <div className="v8-scroll mt-1 space-y-1.5">
          {visible.map((standard) => {
            const linked = controlsFor(standard);
            const items = linked.flatMap((control) => evidence.filter((item) => item.control_id === control.id));
            const verified = items.filter((item) => evidenceStateAt(item, today) === 'verified').length;
            const open = linked.flatMap((control) => findings.filter((finding) => finding.control_id === control.id))
              .filter((finding) => finding.status !== 'Closed').length;
            return (
              <button
                key={standard.id}
                type="button"
                className="v8-row"
                aria-current={selected?.id === standard.id}
                onClick={() => setSelectedId(standard.id)}
              >
                <p className="text-xs font-extrabold text-white">{text(standard.standard_code) || 'No code'}</p>
                <p className="v8-sub">{text(standard.standard_title) || 'Untitled standard'}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="v8-chip" data-state={linked.length ? 'review' : 'risk'}>{linked.length} control(s)</span>
                  <span className="v8-chip" data-state={verified ? 'verified' : 'muted'}>{verified}/{items.length} verified</span>
                  {open > 0 && <span className="v8-chip" data-state="risk">{open} open</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="v8-panel p-3.5">
        {selected ? (
          <FabricNodeDetail
            standard={selected}
            controls={controls}
            evidence={evidence}
            findings={findings}
            today={today}
          />
        ) : (
          <p className="v8-sub">Select a standard to inspect its chain.</p>
        )}
      </div>
    </div>
  );
}