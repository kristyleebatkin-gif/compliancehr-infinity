import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StaffProfileCard from '@/components/staff/StaffProfileCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Search, Users, ShieldCheck, Trophy, Download } from 'lucide-react';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import CertificationOverview from '@/components/staff/CertificationOverview';
import StaffRecognition from '@/components/staff/StaffRecognition';

import { getCompanyBranding } from '@/lib/companyBranding';

import BulkActionBar from '@/components/BulkActionBar';
import { useToast } from '@/components/ui/use-toast';

const generateEmployeeNumber = () => `EMP${Math.floor(100000 + Math.random() * 900000)}`;

const ROLES = ['Support Worker', 'Team Leader', 'Compliance Manager', 'Administration', 'Management'];
const STATUSES = ['Active', 'On Leave', 'Inactive'];


export default function Staff({ embedded = false }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const branding = getCompanyBranding();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', position: '', role: 'Support Worker', status: 'Active', start_date: '', supervisor: '', emergency_contact: '' });
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const toggle = (id) => setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const load = useCallback(async (term) => {
    setLoading(true);
    try {
      const query = term ? { full_name: { $regex: term, $options: 'i' } } : {};
      const page = await base44.entities.StaffProfile.filter(query, { sort: '-created_date', limit: 50 });
      setStaff(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(search); }, [load, search]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.full_name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.StaffProfile.create({ ...form, employee_number: form.employee_number || generateEmployeeNumber() });
      setForm({ full_name: '', email: '', phone: '', position: '', role: 'Support Worker', status: 'Active', start_date: '', supervisor: '', emergency_contact: '' });
      setOpen(false);
      await load(search);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.StaffProfile.delete(id);
    await load(search);
  };

  const STAFF_EXPORT_COLUMNS = [
    { key: 'full_name', label: 'Full Name' }, { key: 'employee_number', label: 'Employee Number' },
    { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' },
    { key: 'position', label: 'Position' }, { key: 'role', label: 'Role' },
    { key: 'app_role', label: 'App Role (Permissions)' }, { key: 'status', label: 'Status' },
    { key: 'start_date', label: 'Start Date' }, { key: 'supervisor', label: 'Supervisor' },
    { key: 'emergency_contact', label: 'Emergency Contact' }, { key: 'emergency_contact_phone', label: 'Emergency Contact Phone' },
    { key: 'notes', label: 'Notes' },
  ];

  const exportRows = (rows, name) => downloadCsv(name, STAFF_EXPORT_COLUMNS, rows);

  const exportRegister = async () => {
    const rows = await fetchAllRecords(base44.entities.StaffProfile, {}, 'full_name');
    exportRows(rows, 'Staff-Register.csv');
  };

  const bulkExport = () => exportRows(staff.filter((s) => selected.has(s.id)), 'Staff-Register-Selected.csv');

  const bulkStatus = async (status) => {
    setBusy(true);
    try {
      await base44.entities.StaffProfile.updateMany({ id: { $in: [...selected] } }, { $set: { status } });
      setSelected(new Set());
      await load(search);
      toast({ title: `Status set to ${status}` });
    } finally {
      setBusy(false);
    }
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} staff member(s)? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await base44.entities.StaffProfile.deleteMany({ id: { $in: [...selected] } });
      setSelected(new Set());
      await load(search);
      toast({ title: 'Selected staff deleted' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-2.5 pb-4 pt-2 md:px-4 [&>div:first-child]:space-y-1.5">
      {!embedded && <PageHeader icon={Users} title="Employee Profiles" subtitle="All of your employees' information, documents and forms in one profile." showAlerts={false} compactActions className="rounded-xl p-3 sm:p-3 [&_h1]:text-xl [&_p]:mt-0.5" />}
      <RegisterInsights module="staff" compact wrapSummary />

      <Tabs defaultValue="profiles">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl border border-border/60 p-1 [&>button]:min-h-8 [&>button]:whitespace-normal [&>button]:px-2 [&>button]:text-xs [&>button>svg]:shrink-0">
          <TabsTrigger value="profiles"><Users className="mr-1.5 h-4 w-4" />Staff profiles</TabsTrigger>
          <TabsTrigger value="certifications"><ShieldCheck className="mr-1.5 h-4 w-4" />Staff certificates</TabsTrigger>
          <TabsTrigger value="recognition"><Trophy className="mr-1.5 h-4 w-4" />Leaderboard &amp; recognition</TabsTrigger>
        </TabsList>
        <TabsContent value="profiles" className="mt-2 space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card p-2 shadow-sm">
            <div className="relative min-w-0 flex-1 basis-48">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="bg-background pl-9" aria-label="Search staff by name" placeholder="Search staff by name" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" onClick={exportRegister} disabled={loading || staff.length === 0}><Download className="mr-2 h-4 w-4" />Export register</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add staff member</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>New staff member</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div className="grid gap-1.5"><Label>Full name *</Label><Input value={form.full_name} onChange={(e) => set('full_name')(e.target.value)} /></div>
                  <div className="grid gap-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} /></div>
                  <div className="grid gap-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => set('phone')(e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5"><Label>Role</Label>
                      <Select value={form.role} onValueChange={set('role')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5"><Label>Status</Label>
                      <Select value={form.status} onValueChange={set('status')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5"><Label>Position</Label><Input value={form.position} onChange={(e) => set('position')(e.target.value)} /></div>
                    <div className="grid gap-1.5"><Label>Start date</Label><Input type="date" value={form.start_date} onChange={(e) => set('start_date')(e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5"><Label>Supervisor</Label><Input value={form.supervisor} onChange={(e) => set('supervisor')(e.target.value)} /></div>
                    <div className="grid gap-1.5"><Label>Emergency contact</Label><Input value={form.emergency_contact} onChange={(e) => set('emergency_contact')(e.target.value)} /></div>
                  </div>
                  <Button onClick={save} disabled={saving || !form.full_name.trim()}>Save staff member</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {selected.size > 0 && (
            <BulkActionBar
              count={selected.size}
              label="staff selected"
              statuses={STATUSES}
              busy={busy}
              onExport={bulkExport}
              onStatus={bulkStatus}
              onDelete={bulkDelete}
              onClear={() => setSelected(new Set())}
              onSelectAll={() => setSelected(new Set(staff.map((s) => s.id)))}
            />
          )}

          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : staff.length === 0 ? (
            <Card><CardContent className="p-10 text-center text-muted-foreground">No staff members found. Add your first one above.</CardContent></Card>
          ) : (
            <div className="grid min-w-0 items-stretch gap-3 lg:grid-cols-2 2xl:grid-cols-3">
              {staff.map((s) => <StaffProfileCard key={s.id} staff={s} branding={branding} selected={selected.has(s.id)} onToggle={() => toggle(s.id)} onRemove={() => remove(s.id)} />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="certifications">
          <CertificationOverview />
        </TabsContent>
        <TabsContent value="recognition">
          <StaffRecognition />
        </TabsContent>
      </Tabs>
    </div>
  );
}