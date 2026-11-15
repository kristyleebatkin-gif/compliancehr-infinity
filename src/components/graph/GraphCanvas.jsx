import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NODE_TYPES, neighbours } from '@/lib/knowledgeGraph';

const WIDTH = 1000;
const HEIGHT = 720;
const PER_TYPE_LIMIT = 34;

const TYPE_COLOUR = {
  standard: '#0072FF', control: '#5A00D6', evidence: '#0E9F6E', finding: '#E11D48',
  policy: '#0EA5A5', form: '#D97706', audit: '#7C3AED', capa: '#0F766E',
  risk: '#EA580C', issue: '#9333EA', recommendation: '#2563EB',
};

// A deterministic radial map of the graph: one ring per object type, busiest records
// largest and nearest the middle of their ring. No physics loop, so it renders the same
// every time and stays honest about what is in the registers.
export default function GraphCanvas({ graph }) {
  const [hidden, setHidden] = useState([]);
  const [focus, setFocus] = useState('');

  const layout = useMemo(() => {
    const shown = new Map();
    const rings = NODE_TYPES.filter((type) => !hidden.includes(type.key));
    rings.forEach((type, ringIndex) => {
      const degree = (node) => (graph.adjacency.get(node.id) || []).length;
      const nodes = [...graph.nodes.values()]
        .filter((node) => node.typeKey === type.key)
        .sort((a, b) => degree(b) - degree(a));
      const radius = 110 + ringIndex * 54;
      nodes.slice(0, PER_TYPE_LIMIT).forEach((node, index) => {
        const angle = (index / Math.max(Math.min(nodes.length, PER_TYPE_LIMIT), 1)) * Math.PI * 2 + ringIndex * 0.55;
        shown.set(node.id, {
          ...node,
          x: WIDTH / 2 + Math.cos(angle) * radius,
          y: HEIGHT / 2 + Math.sin(angle) * radius,
          size: 5 + Math.min(9, degree(node)),
          degree: degree(node),
          ringTotal: nodes.length,
        });
      });
    });
    return shown;
  }, [graph, hidden]);

  const edges = useMemo(
    () => graph.edges.filter((edge) => layout.has(edge.from) && layout.has(edge.to)),
    [graph, layout]
  );

  const focusNode = focus ? layout.get(focus) : null;
  const linked = focusNode ? neighbours(graph, focusNode.id) : [];
  const skipped = [...layout.values()].reduce((total, node) => total + Math.max(0, node.ringTotal - PER_TYPE_LIMIT), 0);

  const toggle = (key) => setHidden((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));

  return (
    <section aria-label="Knowledge graph canvas" className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {NODE_TYPES.map((type) => {
          const off = hidden.includes(type.key);
          return (
            <button
              key={type.key}
              type="button"
              onClick={() => toggle(type.key)}
              aria-pressed={!off}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${off ? 'border-border bg-transparent text-muted-foreground' : 'border-border bg-card text-foreground'}`}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: off ? 'currentColor' : TYPE_COLOUR[type.key] }} />
              {type.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label="Register relationship map">
          <rect width={WIDTH} height={HEIGHT} fill="transparent" />
          {edges.map((edge) => {
            const from = layout.get(edge.from);
            const to = layout.get(edge.to);
            const active = focus && (edge.from === focus || edge.to === focus);
            return (
              <line
                key={edge.id}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={active ? '#5A00D6' : '#0A2B6D'}
                strokeWidth={active ? 1.6 : 0.7}
                opacity={focus ? (active ? 0.85 : 0.07) : 0.2}
              />
            );
          })}
          {[...layout.values()].map((node) => {
            const isFocus = node.id === focus;
            const connected = focus ? linked.some((entry) => entry.id === node.id) : false;
            return (
              <g key={node.id} onClick={() => setFocus(node.id)} className="cursor-pointer">
                <circle
                  cx={node.x} cy={node.y} r={node.size + (isFocus ? 4 : 0)}
                  fill={TYPE_COLOUR[node.typeKey] || '#0072FF'}
                  opacity={focus && !isFocus && !connected ? 0.25 : 1}
                  stroke={isFocus ? '#0A2B6D' : 'transparent'}
                  strokeWidth={isFocus ? 2 : 0}
                />
                {(isFocus || node.degree >= 6) && (
                  <text x={node.x + 9} y={node.y + 4} fontSize="11" fill="#0A2B6D" className="pointer-events-none">
                    {node.title.slice(0, 34)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {layout.size} records drawn · {edges.length} relationships shown
          {skipped > 0 ? ` · ${skipped} lower-activity records hidden per ring to keep the map readable` : ''}
        </span>
        {focus && <Button size="sm" variant="outline" onClick={() => setFocus('')}>Clear focus</Button>}
      </div>

      {focusNode ? (
        <div className="rounded-xl border border-border bg-card p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{focusNode.typeLabel}</p>
          <h3 className="text-sm font-extrabold text-foreground">{focusNode.title}</h3>
          {focusNode.detail && <p className="text-xs text-muted-foreground">{focusNode.detail}</p>}
          {linked.length ? (
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {linked.map((entry) => (
                <li key={`${entry.id}-${entry.relationship}`}>
                  <button
                    type="button"
                    onClick={() => setFocus(entry.id)}
                    className="w-full rounded-lg border border-border px-2.5 py-1.5 text-left text-xs hover:border-primary"
                  >
                    <span className="font-bold text-foreground">{entry.typeLabel}</span>
                    <span className="text-muted-foreground"> · {entry.title}</span>
                    <span className="mt-0.5 block text-[11px] font-semibold text-primary">
                      {entry.relationshipLabel || entry.relationship}
                      {entry.source && entry.source !== 'Derived' ? ` · ${entry.source}` : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
              This record has no relationship yet. Add one in the Links register or complete the record it should trace to.
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
          Select any record on the map to see what it is connected to and how.
        </p>
      )}
    </section>
  );
}