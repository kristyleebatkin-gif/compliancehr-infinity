import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Download, Loader2 } from 'lucide-react';

const MODULES = [
  ['StaffProfile', 'Staff Profiles'],
  ['EmployeeDocument', 'Employee Documents'],
  ['Task', 'Tasks'],
  ['Policy', 'Policies'],
  ['LegalRequirement', 'Legal Requirements'],
  ['TrainingModule', 'Training Modules'],
  ['Certificate', 'Certificates'],
  ['ParticipantProfile', 'Participants'],
  ['Incident', 'Incidents'],
  ['Risk', 'Risks'],
  ['Shift', 'Shifts'],
  ['Feedback', 'Feedback & Complaints'],
  ['Checklist', 'Checklists'],
  ['Asset', 'Assets'],
  ['Invoice', 'Invoices'],
  ['Meeting', 'Meetings'],
  ['EmergencyDrill', 'Emergency Drills'],
  ['Event', 'Programs & Events'],
  ['Announcement', 'Announcements'],
  ['Audit', 'Audits'],
  ['Intake', 'Intake & Referrals'],
  ['Goal', 'Goals'],
  ['QualityItem', 'Quality & Improvement'],
  ['Survey', 'Surveys'],
  ['Contact', 'Key Contacts'],
  ['Volunteer', 'Volunteers'],
  ['CompanyDocument', 'Company Safe'],
  ['EquipmentManual', 'Equipment Manuals'],
  ['InsurancePolicy', 'Insurance Policies'],
  ['Receipt', 'Receipts'],
];

export default function DataControl() {
  const [selected, setSelected] = useState('StaffProfile');
  const [count, setCount] = useState(null);
  const [counting, setCounting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const runCount = useCallback(async (entityName) => {
    setCounting(true);
    setCount(null);
    try {
      setCount(await base44.entities[entityName].count({}));
    } finally {
      setCounting(false);
    }
  }, []);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const rows = [];
      let cursor;
      do {
        const page = await base44.entities[selected].filter({}, { limit: 500, cursor });
        rows.push(...page.items);
        cursor = page.next_cursor;
      } while (cursor);

      if (rows.length === 0) return;
      const cols = Object.keys(rows[0]);
      const csv = [
        cols.join(','),
        ...rows.map((r) => cols.map((c) => {
          const v = r[c] == null ? '' : String(r[c]);
          return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v;
        }).join(',')),
      ].join('\n');

      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selected}_export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Database className="h-6 w-6" /> Data Control</h1>
        <p className="text-sm text-muted-foreground">Inspect record counts and export any module to CSV.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Module</Label>
              <Select value={selected} onValueChange={(v) => { setSelected(v); runCount(v); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODULES.map(([id, label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-sm text-muted-foreground">
                Records:{' '}
                {counting ? <Loader2 className="inline h-4 w-4 animate-spin" /> : count != null ? <span className="font-semibold text-foreground">{count}</span> : 'select a module'}
              </div>
              <Button onClick={exportCsv} disabled={exporting}>
                {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}