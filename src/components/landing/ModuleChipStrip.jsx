import React from 'react';
import { Link } from 'react-router-dom';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleColour } from '@/lib/moduleColours';

// Every module shown as its own coloured chip, straight from the app directory.
export default function ModuleChipStrip() {
  return (
    <div className="mx-auto mt-12 max-w-5xl">
      <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.2em] text-foreground/40">
        Every module · One business super platform
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {MODULE_DIRECTORY.map((m) => {
          const Icon = m.icon;
          const c = moduleColour(m.label);
          return (
            <Link
              key={m.key}
              to={m.path}
              className="group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: `${c}45`, backgroundColor: `${c}12`, color: c }}
              title={m.blurb}
            >
              <Icon className="h-3.5 w-3.5" />
              {m.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}