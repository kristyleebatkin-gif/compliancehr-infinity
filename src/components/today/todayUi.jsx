import React from 'react';

const TONES = {
  blue: 't-pill-blue',
  green: 't-pill-green',
  amber: 't-pill-amber',
  pink: 't-pill-pink',
  gray: 't-pill-gray'
};

export function Pill({ tone = 'gray', children }) {
  return <span className={`t-pill ${TONES[tone] || TONES.gray}`}>{children}</span>;
}

export function Panel({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`t-card flex min-w-0 flex-col p-4 ${className}`}>
      <header className="mb-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="t-title truncate text-[15px] font-extrabold">{title}</h2>
          {subtitle ? <p className="t-muted mt-0.5 truncate text-[11.5px]">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </section>
  );
}

export function Row({ children, className = '' }) {
  return <div className={`t-row flex items-center gap-2.5 px-1.5 py-2 ${className}`}>{children}</div>;
}

export function Empty({ children }) {
  return <p className="t-muted px-1.5 py-4 text-xs">{children}</p>;
}

export function initials(name) {
  return (name || 'Me')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function money(value) {
  const amount = Number(value || 0);
  return `$${amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}