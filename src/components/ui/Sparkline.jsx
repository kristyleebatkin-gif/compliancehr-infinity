// Tiny dependency-free sparkline for register tables and KPI cards.
export default function Sparkline({ values = [], width = 72, height = 22, strokeWidth = 1.5, className = '' }) {
  const clean = (Array.isArray(values) ? values : []).map((v) => Number(v) || 0);
  if (!clean.length) return null;
  const max = Math.max(...clean);
  const min = Math.min(...clean);
  const range = max - min || 1;
  const step = clean.length > 1 ? (width - 4) / (clean.length - 1) : 0;
  const point = (v, i) => [
    (2 + i * step).toFixed(1),
    (height - 2 - ((v - min) / range) * (height - 4)).toFixed(1),
  ];
  const last = point(clean[clean.length - 1], clean.length - 1);
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <polyline
        points={clean.map((v, i) => point(v, i).join(',')).join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="2" fill="currentColor" />
    </svg>
  );
}