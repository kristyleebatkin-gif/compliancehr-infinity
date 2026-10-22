import React from 'react';
import { MessagesSquare } from 'lucide-react';

export default function CommunicationHeader({ subtitle = '' }) {
  return (
    <header
      className="app-page-header relative flex items-center overflow-hidden rounded-2xl px-4 shadow-lg font-body text-white"
      style={{
        background: 'var(--header-gradient)',
        fontFamily: 'var(--font-body)',
        color: '#ffffff',
      }}
    >
      <div className="relative flex min-w-0 w-full items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-md ring-1 ring-white/30">
          <MessagesSquare className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1 font-body text-white">
          <h1 className="font-body text-2xl font-bold leading-8 tracking-tight text-white">
            Communication Centre
          </h1>
          {subtitle && (
            <p className="mt-0.5 line-clamp-2 font-body text-sm font-semibold leading-5 text-white">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}