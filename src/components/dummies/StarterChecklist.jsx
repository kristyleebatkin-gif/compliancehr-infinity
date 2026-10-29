import React, { useState, useEffect } from 'react';
import { STARTER_CHECKLIST } from '@/lib/ndisDummiesData';
import { Button } from '@/components/ui/button';
import { CheckSquare, Square, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'ndis_dummies_checklist_v1';

export default function StarterChecklist() {
  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(done)); } catch {}
  }, [done]);

  const completedCount = STARTER_CHECKLIST.filter((i) => done[i.id]).length;

  return (
    <div className="rounded-2xl border-2 border-foreground bg-card p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-foreground">Your NDIS Starter Checklist</h2>
          <p className="text-sm font-medium text-muted-foreground">
            Tick off each step as you get ready — your progress saves automatically on this device.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-primary-foreground">
            {completedCount} / {STARTER_CHECKLIST.length} Done
          </span>
          <Button size="sm" variant="outline" onClick={() => setDone({})}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      <div className="space-y-2.5">
        {STARTER_CHECKLIST.map((item) => {
          const checked = Boolean(done[item.id]);
          return (
            <button
              key={item.id}
              onClick={() => setDone({ ...done, [item.id]: !checked })}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left transition ${
                checked ? 'border-primary bg-secondary line-through opacity-80' : 'border-foreground bg-card'
              }`}
            >
              {checked ? <CheckSquare className="h-5 w-5 shrink-0 text-primary" /> : <Square className="h-5 w-5 shrink-0 text-foreground" />}
              <span className="text-sm font-bold text-foreground">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}