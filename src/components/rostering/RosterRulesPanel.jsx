import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// Compact controls for the configurable roster validation rules.
export default function RosterRulesPanel({ rules, onUpdated }) {
  const [saving, setSaving] = useState(null);
  if (!rules || rules.length === 0) return null;

  const toggle = async (rule) => {
    setSaving(rule.id);
    try {
      await base44.entities.RosterValidationRule.update(rule.id, { enabled: !rule.enabled });
      onUpdated?.({ ...rule, enabled: !rule.enabled });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/50 pt-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-foreground/60">Validation rules</span>
      {rules.map((rule) => (
        <label key={rule.id} className="flex items-center gap-2 text-xs">
          <Switch
            checked={rule.enabled !== false}
            disabled={saving === rule.id}
            onCheckedChange={() => toggle(rule)}
          />
          <span className={rule.enabled !== false ? 'font-medium' : 'text-foreground/50 line-through'}>{rule.label}</span>
          {rule.severity === 'Critical' && <Badge className="border-transparent bg-danger/15 text-danger">Critical</Badge>}
        </label>
      ))}
    </div>
  );
}