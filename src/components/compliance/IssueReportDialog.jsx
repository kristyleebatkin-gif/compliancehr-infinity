import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { downloadComplianceIssuesReport } from '@/lib/complianceIssuesPdf';
import { CATEGORIES } from '@/lib/complianceIssues.js';

export default function IssueReportDialog({ open, onOpenChange, issues }) {
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filtered = useMemo(() => issues.filter((i) => {
    if (status !== 'all' && i.status !== status) return false;
    if (category !== 'all' && (i.category || 'Other') !== category) return false;
    if (from && (i.date_logged || '') < from) return false;
    if (to && (i.date_logged || '') > to) return false;
    return true;
  }), [issues, status, category, from, to]);

  const download = () => {
    const parts = [];
    if (status !== 'all') parts.push(`Status: ${status}`);
    if (category !== 'all') parts.push(`Category: ${category}`);
    if (from) parts.push(`Logged from ${from}`);
    if (to) parts.push(`Logged to ${to}`);
    downloadComplianceIssuesReport(filtered, {
      subtitle: parts.length ? `Filtered report (${parts.join(', ')}). ${filtered.length} issue(s) included.` : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compliance issues report</DialogTitle>
          <DialogDescription>Filter the register, then download the branded PDF report. {filtered.length} issue(s) match.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Logged from</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Logged to</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          </div>
          <Button onClick={download} disabled={filtered.length === 0}>Download PDF report ({filtered.length})</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}