import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import '@/components/today/studio/studio.css';

export default function StudioShell({ title, subtitle, icon: Icon, onClose, actions, children }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className="studio-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="studio-panel">
        <header className="studio-head">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg,#0a2b6d 0%,#5a00d6 64%,#ff2e9a 128%)' }}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="t-title truncate text-[15px] font-extrabold">{title}</h2>
            {subtitle ? <p className="t-muted truncate text-[11px]">{subtitle}</p> : null}
          </div>
          {actions}
          <button type="button" onClick={onClose} className="t-btn t-btn-ghost" aria-label="Close">
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </header>
        <div className="studio-body">{children}</div>
      </div>
    </div>
  );
}