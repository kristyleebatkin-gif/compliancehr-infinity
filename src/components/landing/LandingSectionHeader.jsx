import React from 'react';

export default function LandingSectionHeader({
  badge,
  icon: Icon,
  title,
  description,
  id,
}) {
  return (
    <div
      id={id}
      className="flex flex-col gap-4 border-b border-slate-200 pb-5 text-left xl:flex-row xl:items-end xl:justify-between"
    >
      <div className="min-w-0">
        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600 sm:text-xs">
          {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-indigo-600" /> : null}
          <span>{badge}</span>
        </span>
        <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="max-w-md text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
          {description}
        </p>
      ) : null}
    </div>
  );
}