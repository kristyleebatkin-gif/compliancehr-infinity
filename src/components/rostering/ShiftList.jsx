import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { statusTone } from '@/lib/statusStyles';
import { downloadCsv } from '@/lib/csvExport';
import { SHIFT_CSV_COLUMNS, SHIFT_STATUSES, shiftHours } from '@/lib/rostering';
import { ClockButton } from '@/components/rostering/ApprovalsPanel';

export default function ShiftList({ shifts, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');

  const staffOptions = useMemo(() => {
    const names = new Set(shifts.map((s) => s.employee_name).filter(Boolean));
    return Array.from(names).sort();
  }, [shifts]);

  const filtered = useMemo(() => shifts.filter((s) => {
    const text = `${s.employee_name || ''} ${s.participant_name || ''} ${s.location || ''}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (status !== 'all' && s.status !== status) return false;
    if (staffFilter !== 'all' && (s.employee_name || '') !== (staffFilter === 'unassigned' ? '' : staffFilter)) return false;
    return true;
  }), [shifts, search, status, staffFilter]);

  const exportCsv = () => {
    downloadCsv(`shift-register-${format(new Date(), 'yyyy-MM-dd')}.csv`, SHIFT_CSV_COLUMNS,
      filtered.map((s) => ({ ...s, hours: shiftHours(s.start_time, s.end_time).toFixed(2) })));
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input placeholder="Search staff, participant, location…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {SHIFT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All staff</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {staffOptions.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCsv} className="ml-auto">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No shifts match the filters.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{s.employee_name || 'Unassigned'}</p>
                    {s.participant_name && <span className="text-sm text-muted-foreground">→ {s.participant_name}</span>}
                    <Badge className={statusTone(s.status)}>{s.status}</Badge>
                    {s.approval_status === 'Pending Approval' && <Badge className="bg-warning/10 text-warning">Approval pending</Badge>}
                    {s.invoiced && <Badge className="bg-safe/10 text-safe">Invoiced</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {[
                      format(new Date(s.date), 'EEE d MMM yyyy'),
                      s.start_time && s.end_time ? `${s.start_time}–${s.end_time}` : s.start_time,
                      s.service_type,
                      s.location,
                      shiftHours(s.start_time, s.end_time) ? `${shiftHours(s.start_time, s.end_time)}h` : '',
                    ].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <ClockButton shift={s} onChanged={onAdvance} />
                  <Button variant="ghost" size="icon" onClick={() => onEdit(s)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(s)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}