import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldCheck } from 'lucide-react';

const TILES = [
  { label: 'Status-trail entries', color: '#4f46e5', bg: 'rgba(79,70,229,0.12)' },
  { label: 'Platform audit-log entries', color: '#db2777', bg: 'rgba(219,39,119,0.12)' },
  { label: 'Controlled user accounts', color: '#0d9488', bg: 'rgba(13,148,136,0.12)' },
];

export default function LiveSecurityEvidence() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      base44.entities.StatusLog.count({}),
      base44.entities.AuditLog.count({}),
      base44.entities.User.list(),
    ]).then((results) => {
      if (alive) setStats(results.map((result, index) => result.status === 'fulfilled' ? (index === 2 ? result.value.length : result.value) : null));
    });
    return () => { alive = false; };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-violet-300 bg-card shadow-panel">
      <div
        className="comm-panel-bar flex items-center gap-2 px-5 py-3 text-white"
        style={{ background: 'linear-gradient(120deg, #2563eb 0%, #7c3aed 52%, #ec4899 100%)' }}
      >
        <ShieldCheck className="h-4 w-4" />
        <span className="text-sm font-extrabold">Live Security &amp; Compliance Evidence</span>
      </div>
      <div className="p-4">
        {stats ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {TILES.map((tile, index) => (
              <div
                key={tile.label}
                className="rounded-xl border-2 p-4 shadow-sm"
                style={{
                  borderColor: `${tile.color}66`,
                  borderTop: `4px solid ${tile.color}`,
                  background: `linear-gradient(145deg, ${tile.bg}, #ffffff)`,
                }}
              >
                <p className="text-2xl font-extrabold tabular-nums" style={{ color: tile.color }}>
                  {stats[index] === null ? '—' : stats[index].toLocaleString()}
                </p>
                <p className="mt-1 text-xs font-extrabold text-foreground/85">{tile.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Collecting evidence...
          </div>
        )}
      </div>
    </div>
  );
}