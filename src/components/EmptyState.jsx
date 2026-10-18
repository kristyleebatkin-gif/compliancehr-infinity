import React from 'react';

export default function EmptyState({ icon: Icon, title, message, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div className="text-sm font-semibold">{title}</div>
      {(message || subtitle) && <div className="mt-1 max-w-sm text-sm text-foreground/50">{message || subtitle}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}