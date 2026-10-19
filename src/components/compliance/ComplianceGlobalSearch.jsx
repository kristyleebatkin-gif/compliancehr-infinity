import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Search, Users, FileText, BadgeCheck, ListTodo, Loader2, X } from 'lucide-react';

const DOC_STATUSES = ['Current', 'Expiring Soon', 'Expired', 'Archived'];
const QUICK_CHIPS = [
  { label: 'Expired documents', value: 'Expired' },
  { label: 'Expiring soon', value: 'Expiring Soon' },
  { label: 'Current documents', value: 'Current' },
  { label: 'Overdue tasks', value: 'Overdue' },
  { label: 'Pending tasks', value: 'Pending' },
  { label: 'Completed tasks', value: 'Completed' },
];

const DEBOUNCE_MS = 300;

// Global search + advanced filters for the Compliance Hub: find any staff
// member, document, certificate or compliance task in a few clicks.
export default function ComplianceGlobalSearch() {
  const [term, setTerm] = useState('');
  const [staffFilter, setStaffFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [staffOptions, setStaffOptions] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    base44.entities.StaffProfile.filter({}, { limit: 500, fields: ['full_name', 'position'] })
      .then((p) => setStaffOptions((p.items || []).filter((s) => s.full_name)))
      .catch(() => setStaffOptions([]));
  }, []);

  const query = useMemo(() => {
    const clean = term.trim();
    return clean.length >= 2 || staffFilter !== 'all' || statusFilter !== 'all' ? { term: clean, staffFilter, statusFilter } : null;
  }, [term, staffFilter, statusFilter]);

  useEffect(() => {
    if (!query) { setResults(null); setSearched(false); return; }
    let cancelled = false;
    const handle = setTimeout(() => {
      setLoading(true);
      const run = async () => {
        const { term: t, staffFilter: sf, statusFilter: stf } = query;
        const rx = t ? { $regex: t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } : null;
        const staffMatch = sf === 'all' ? null : sf;
        const staffRx = staffMatch ? staffMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null;
        const staffCond = (field) => (staffRx ? [{ [field]: { $regex: staffRx, $options: 'i' } }] : []);

        // Staff results only show for a name search without a status filter.
        const staffSearch = t && !stf ? { $or: [{ full_name: rx }, { position: rx }] } : { no_match: true };

        const docsQ = {
          $and: [
            ...(rx ? [{ $or: [{ title: rx }, { document_type: rx }] }] : []),
            ...(staffCond('employee_name')),
            ...(stf !== 'all' && DOC_STATUSES.includes(stf) ? [{ status: stf }] : []),
          ],
        };
        const certsQ = {
          $and: [
            ...(rx ? [{ $or: [{ module_title: rx }] }] : []),
            ...(staffCond('staff_name')),
            ...(stf !== 'all' && DOC_STATUSES.includes(stf) ? [{ status: stf }] : []),
          ],
        };
        const tasksQ = {
          $and: [
            ...(rx ? [{ $or: [{ title: rx }, { assigned_to: rx }] }] : []),
            ...(staffCond('assigned_to')),
            ...(stf !== 'all' && !DOC_STATUSES.includes(stf) ? [{ status: stf }] : []),
          ],
        };

        const [staffP, docsP, certsP, tasksP] = await Promise.all([
          base44.entities.StaffProfile.filter(staffSearch, { limit: 8, fields: ['full_name', 'position'] }),
          base44.entities.EmployeeDocument.filter(docsQ, { limit: 15, fields: ['title', 'document_type', 'employee_name', 'employee_id', 'status', 'expiry_date'] }),
          base44.entities.Certificate.filter(certsQ, { limit: 15, fields: ['module_title', 'staff_name', 'staff_id', 'status', 'expiry_date'] }),
          base44.entities.TodoTask.filter(tasksQ, { limit: 15, fields: ['title', 'assigned_to', 'status', 'due_date', 'priority'] }),
        ]);
        if (cancelled) return;
        setResults({
          staff: (staffP.items || []).filter((s) => s.full_name),
          docs: docsP.items || [],
          certs: certsP.items || [],
          tasks: tasksP.items || [],
        });
        setSearched(true);
        setLoading(false);
      };
      run().catch(() => { if (!cancelled) { setResults({ staff: [], docs: [], certs: [], tasks: [] }); setSearched(true); setLoading(false); } });
    }, DEBOUNCE_MS);
    return () => { cancelled = true; clearTimeout(handle); };
  }, [query]);

  const active = !!query;
  const resultCount = results ? results.staff.length + results.docs.length + results.certs.length + results.tasks.length : 0;
  const hasFilters = staffFilter !== 'all' || statusFilter !== 'all';

  return (
    <Card className="shadow-panel">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[16rem] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search staff, documents, certificates or tasks…"
              className="pl-9"
            />
            {term && (
              <button aria-label="Clear search" onClick={() => setTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="w-[11rem]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All staff</SelectItem>
              {staffOptions.map((s) => <SelectItem key={s.id} value={s.full_name}>{s.full_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[11rem]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              {DOC_STATUSES.map((s) => <SelectItem key={s} value={s}>{s} (documents)</SelectItem>)}
              {['Pending', 'In Progress', 'Overdue', 'Completed'].map((s) => <SelectItem key={s} value={s}>{s} (tasks)</SelectItem>)}
            </SelectContent>
          </Select>
          {hasFilters && (
            <button onClick={() => { setStaffFilter('all'); setStatusFilter('all'); }} className="text-xs font-semibold text-muted-foreground underline-offset-2 hover:underline">
              Clear filters
            </button>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Quick find:</span>
          {QUICK_CHIPS.map((c) => (
            <button
              key={c.value}
              onClick={() => setStatusFilter(statusFilter === c.value ? 'all' : c.value)}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${statusFilter === c.value ? 'border-transparent bg-primary text-primary-foreground' : 'border-border bg-muted/50 hover:bg-accent'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="mt-4 flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Searching…
          </div>
        )}

        {!loading && searched && results && !loading && (
          <div className="mt-4 space-y-4">
            {resultCount === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No matches. Try a different name, document title or status.</p>
            )}

            {results.staff.length > 0 && (
              <Group icon={Users} title="Staff members">
                {results.staff.map((s) => (
                  <Link key={s.id} to={`/staff/${s.id}`} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent">
                    <span className="min-w-0 flex-1 truncate font-semibold">{s.full_name}</span>
                    <span className="truncate text-xs text-muted-foreground">{s.position}</span>
                  </Link>
                ))}
              </Group>
            )}

            {results.docs.length > 0 && (
              <Group icon={FileText} title="Documents">
                {results.docs.map((d) => <RecordRow key={d.id} record={d} staffId={d.employee_id} staffName={d.employee_name} title={d.title} kind={d.document_type} />)}
              </Group>
            )}

            {results.certs.length > 0 && (
              <Group icon={BadgeCheck} title="Certificates">
                {results.certs.map((c) => <RecordRow key={c.id} record={c} staffId={c.staff_id} staffName={c.staff_name} title={c.module_title} kind="Certificate" />)}
              </Group>
            )}

            {results.tasks.length > 0 && (
              <Group icon={ListTodo} title="Compliance tasks">
                {results.tasks.map((t) => <RecordRow key={t.id} record={t} staffName={t.assigned_to} title={t.title} kind="Task" dueDate={t.due_date} />)}
              </Group>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const Group = ({ icon: Icon, title, children }) => (
  <div>
    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
      <Icon className="h-3.5 w-3.5" /> {title}
    </div>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const RecordRow = ({ record, staffId, staffName, title, kind, dueDate }) => {
  const body = (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent">
      <span className="min-w-0 flex-1 truncate font-semibold">{title}</span>
      <span className="truncate text-xs text-muted-foreground">{staffName}</span>
      {dueDate && <span className="text-xs tabular-nums text-muted-foreground">due {format(new Date(`${dueDate}T00:00:00`), 'd MMM yyyy')}</span>}
      <Badge className={`border-transparent text-xs ${statusTone(record.status) || ''}`}>{record.status || 'Pending'}</Badge>
    </div>
  );
  return staffId ? <Link to={`/staff/${staffId}`}>{body}</Link> : body;
};