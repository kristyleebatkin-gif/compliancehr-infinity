import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const COMPANY_CATEGORIES = ['Policies', 'Templates', 'Certificates', 'Registrations', 'Licences', 'Financial', 'Other'];
const BLANK = { name: '', category: 'Other', version: '', owner: '', review_date: '', status: 'Current', file_url: '' };
export default function CompanyDocumentDialog({ open, onOpenChange, onSaved }) {
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      await base44.entities.CompanyDocument.create(form);
      setForm(BLANK); onOpenChange(false); await onSaved();
    } catch (error) { setError(error.message); } finally { setSaving(false); }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent>
    <DialogHeader><DialogTitle>New company document</DialogTitle></DialogHeader>
    <form onSubmit={save} className="grid gap-3">
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {[['name', 'Name *'], ['version', 'Version'], ['owner', 'Owner'], ['review_date', 'Next review'], ['file_url', 'File URL']].map(([key, label]) => <div key={key} className="grid gap-1.5"><Label htmlFor={`company-${key}`}>{label}</Label><Input id={`company-${key}`} required={key === 'name'} type={key === 'review_date' ? 'date' : 'text'} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></div>)}
        <div className="grid gap-1.5"><Label>Category</Label><Select value={form.category} onValueChange={(category) => setForm({ ...form, category })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COMPANY_CATEGORIES.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select></div>
        <div className="grid gap-1.5"><Label>Status</Label><Select value={form.status} onValueChange={(status) => setForm({ ...form, status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Current', 'Review Required', 'Archived'].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <Button type="submit" disabled={saving || !form.name.trim()}>{saving ? 'Saving...' : 'Save document'}</Button>
    </form>
  </DialogContent></Dialog>;
}