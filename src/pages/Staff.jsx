import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Search, Trash2, UserRound, Users, ShieldCheck, Trophy, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import CertificationOverview from '@/components/staff/CertificationOverview';
import StaffRecognition from '@/components/staff/StaffRecognition';
import StaffBadgePreview from '@/components/safe/StaffBadgePreview';
import { getCompanyBranding } from '@/lib/companyBranding';

const generateEmployeeNumber = () => `EMP${Math.floor(100000 + Math.random() * 900000)}`;

const ROLES = ['Support Worker', 'Team Leader', 'Compliance Manager', 'Administration', 'Management'];
const STATUSES = ['Active', 'On Leave', 'Inactive'];


export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const branding = getCompanyBranding();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', position: '', role: 'Support Worker', status: 'Active', start_date: '', supervisor: '', emergency_contact: '' });

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

  const exportRegister = async () => {
    const rows = await fetchAllRecords(base44.entities.StaffProfile, {}, 'full_name');
    downloadCsv('Staff-Register.csv', [
      { key: 'full_name', label: 'Full Name' }, { key: 'employee_number', label: 'Employee Number' },
      { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' },
      { key: 'position', label: 'Position' }, { key: 'role', label: 'Role' },
      { key: 'app_role', label: 'App Role (Permissions)' }, { key: 'status', label: 'Status' },
      { key: 'start_date', label: 'Start Date' }, { key: 'supervisor', label: 'Supervisor' },
      { key: 'emergency_contact', label: 'Emergency Contact' }, { key: 'emergency_contact_phone', label: 'Emergency Contact Phone' },
      { key: 'notes', label: 'Notes' },
    ], rows);
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={Users} title="Employee Profiles" subtitle="All of your employees' information, documents and forms in one profile." showAlerts={false} />

      <RegisterInsights module="staff" />
      <Tabs defaultValue="profiles">
        <TabsList>
          <TabsTrigger value="profiles"><Users className="mr-1.5 h-4 w-4" />Staff profiles</TabsTrigger>
          <TabsTrigger value="certifications"><ShieldCheck className="mr-1.5 h-4 w-4" />Staff certificates</TabsTrigger>
          <TabsTrigger value="recognition"><Trophy className="mr-1.5 h-4 w-4" />Leaderboard &amp; recognition</TabsTrigger>
        </TabsList>
        <TabsContent value="profiles" className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
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

          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search staff by name" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
          ) : staff.length === 0 ? (
            <Card><CardContent className="p-10 text-center text-muted-foreground">No staff members found. Add your first one above.</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {staff.map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{s.full_name}</p>
                        <p className="text-sm text-muted-foreground">{s.position || s.role}{s.employee_number ? ` · ${s.employee_number}` : ''}</p>
                      </div>
                      <Badge className={statusTone(s.status)}>{s.status}</Badge>
                    </div>
                    <div className="mt-3"><StaffBadgePreview branding={branding} staff={s} /></div>
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {s.email && <p>{s.email}</p>}
                      {s.phone && <p>{s.phone}</p>}
                      <p>Role: {s.role}</p>
                    </div>
                    <div className="mt-3 flex justify-end gap-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/staff/${s.id}`}><UserRound className="h-4 w-4" />Open profile</Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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