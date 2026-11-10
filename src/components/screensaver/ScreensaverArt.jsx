import React from 'react';

// Background artwork for a screensaver design: gradient plus its motif layer.
export default function ScreensaverArt({ design }) {
  if (!design) return null;
  return (
    <div className="absolute inset-0" style={{ background: design.gradient }} aria-hidden="true">
      <div className={`sa-art sa-motif-${design.motif}`} style={{ '--sa-accent': design.accent }} />
    </div>
  );
}