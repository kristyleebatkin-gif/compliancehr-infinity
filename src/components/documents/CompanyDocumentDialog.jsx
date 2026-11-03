import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileCheck2 } from 'lucide-react';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-2 border-[#0A2B6D] bg-white p-0 sm:rounded-2xl shadow-xl">
        <div className="border-b-4 border-[#0072FF] bg-[#0A2B6D] px-5 py-4 text-white">
          <DialogHeader className="text-left">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-md bg-[#0072FF] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
              <FileCheck2 className="h-3.5 w-3.5 text-[#00C6FF]" />
              <span>Company Safe &amp; Document Vault</span>
            </div>
            <DialogTitle className="mt-1 font-editorial text-lg font-extrabold text-white">
              New company document
            </DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={save} className="grid gap-3.5 p-5 bg-white text-[#0A2B6D]">
          {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {[['name', 'Name *'], ['version', 'Version'], ['owner', 'Owner'], ['review_date', 'Next review'], ['file_url', 'File URL']].map(([key, label]) => (
              <div key={key} className="grid gap-1.5">
                <Label className="font-bold text-[#0A2B6D]" htmlFor={`company-${key}`}>{label}</Label>
                <Input
                  id={`company-${key}`}
                  required={key === 'name'}
                  type={key === 'review_date' ? 'date' : 'text'}
                  className="border-sky-200 bg-[#F8FAFC]"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="grid gap-1.5">
              <Label className="font-bold text-[#0A2B6D]">Category</Label>
              <Select value={form.category} onValueChange={(category) => setForm({ ...form, category })}>
                <SelectTrigger className="border-sky-200 bg-[#F8FAFC]"><SelectValue /></SelectTrigger>
                <SelectContent>{COMPANY_CATEGORIES.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="font-bold text-[#0A2B6D]">Status</Label>
              <Select value={form.status} onValueChange={(status) => setForm({ ...form, status })}>
                <SelectTrigger className="border-sky-200 bg-[#F8FAFC]"><SelectValue /></SelectTrigger>
                <SelectContent>{['Current', 'Review Required', 'Archived'].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={saving || !form.name.trim()} className="bg-[#0A2B6D] text-white hover:bg-[#0072FF]">
            {saving ? 'Saving...' : 'Save document'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}