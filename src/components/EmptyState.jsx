import React from 'react';
import { moduleColour } from '@/lib/moduleColours';

// Designed empty state: module-accented icon tile on a soft gradient wash,
// Fraunces heading, one muted supporting line and an optional call to action.
export default function EmptyState({ icon: Icon, title, message, subtitle, action, modulePath = 'General' }) {
  const accent = moduleColour(modulePath);
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {Icon && (
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: `radial-gradient(circle at 30% 25%, ${accent}22, ${accent}0d)`, border: `1px solid ${accent}26` }}
        >
          <Icon className="h-7 w-7" style={{ color: accent }} />
        </div>
      )}
      <div className="font-editorial text-lg font-semibold text-foreground">{title}</div>
      {(message || subtitle) && <div className="mt-1.5 max-w-sm text-sm text-foreground/50">{message || subtitle}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}