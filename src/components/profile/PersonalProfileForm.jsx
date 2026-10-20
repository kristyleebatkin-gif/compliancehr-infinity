import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, CheckCircle2 } from 'lucide-react';

export default function PersonalProfileForm({ fields, form, onChange, onSave, saving, saved, readOnly = false }) {
  if (readOnly) return <p className="text-sm text-muted-foreground">Read-only view. Support team and management can make updates.</p>;
  return (
    <Card className="rounded-2xl border-border/60 shadow-none">
      <CardContent className="space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map(([key, label, kind]) => <div key={key} className={kind === 'textarea' ? 'sm:col-span-2' : ''}>
            <Label htmlFor={`personal-${key}`}>{label}</Label>
            {kind === 'textarea' ? <Textarea id={`personal-${key}`} rows={3} value={form[key] || ''} onChange={(e) => onChange(key, e.target.value)} /> : <Input id={`personal-${key}`} value={form[key] || ''} onChange={(e) => onChange(key, e.target.value)} />}
          </div>)}
        </div>
        <div className="flex items-center gap-3"><Button onClick={onSave} disabled={saving}><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save changes'}</Button>{saved && <span className="flex items-center gap-1.5 text-sm font-medium text-safe"><CheckCircle2 className="h-4 w-4" />Saved</span>}</div>
      </CardContent>
    </Card>
  );
}