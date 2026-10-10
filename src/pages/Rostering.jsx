import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarRange, ChevronLeft, ChevronRight, CalendarClock, UserX, ClipboardCheck, CalendarPlus } from 'lucide-react';
import { addDays, startOfWeek, endOfWeek, format } from 'date-fns';
import RosterBoard from '@/components/rostering/RosterBoard';
import ShiftForm from '@/components/rostering/ShiftForm';
import ShiftList from '@/components/rostering/ShiftList';
import ApprovalsPanel from '@/components/rostering/ApprovalsPanel';
import AvailabilityPanel, { AvailabilityFormDialog } from '@/components/rostering/AvailabilityPanel';
import FillShiftDialog from '@/components/rostering/FillShiftDialog';
import { expandRecurrence } from '@/lib/rostering';

const StatCard = ({ icon: Icon, label, value, tone }) => (
  <Card>
    <CardContent className="flex items-center gap-3 p-4">
      <div className={`rounded-lg p-2 ${tone}`}><Icon className="h-5 w-5" /></div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
);

export default function Rostering() {
  const [tab, setTab] = useState('roster');
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [staff, setStaff] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [boardShifts, setBoardShifts] = useState([]);
  const [listShifts, setListShifts] = useState([]);
  const [listRange, setListRange] = useState({ from: format(addDays(new Date(), -30), 'yyyy-MM-dd'), to: format(addDays(new Date(), 90), 'yyyy-MM-dd') });
  const [approvalShifts, setApprovalShifts] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [fillShift, setFillShift] = useState(null);
  const [fillData, setFillData] = useState({ shifts: [], availability: [] });
  const [availOpen, setAvailOpen] = useState(false);
  const [availForm, setAvailForm] = useState({ staff_name: '', type: 'Unavailable', date: '', start_time: '', end_time: '', all_day: false, notes: '' });

  const [stats, setStats] = useState({ week: 0, unfilled: 0, pending: 0 });

  const loadStats = useCallback(async () => {
    const mon = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const sun = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const in14 = format(addDays(new Date(), 14), 'yyyy-MM-dd');
    const [week, unfilled, pending] = await Promise.all([
      base44.entities.Shift.count({ date: { $gte: mon, $lte: sun } }),
      base44.entities.Shift.count({ date: { $gte: format(new Date(), 'yyyy-MM-dd'), $lte: in14 }, employee_name: null }),
      base44.entities.Shift.count({ approval_status: 'Pending Approval' }),
    ]);
    setStats({ week, unfilled, pending });
  }, []);

  const loadBoard = useCallback(async (start) => {
    setLoading(true);
    try {
      const page = await base44.entities.Shift.filter({
        date: { $gte: format(start, 'yyyy-MM-dd'), $lte: format(endOfWeek(start, { weekStartsOn: 1 }), 'yyyy-MM-dd') },
      }, { sort: 'date', limit: 200 });
      setBoardShifts(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadList = useCallback(async (range) => {
    setLoading(true);
    try {
      const page = await base44.entities.Shift.filter({ date: { $gte: range.from, $lte: range.to } }, { sort: '-date', limit: 200 });
      setListShifts(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Shift.filter({ approval_status: 'Pending Approval' }, { sort: '-date', limit: 100 });
      setApprovalShifts(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      base44.entities.StaffProfile.filter({ status: 'Active' }, { sort: 'full_name', limit: 100, fields: ['full_name'] }),
      base44.entities.ParticipantProfile.filter({ status: 'Active' }, { sort: 'full_name', limit: 100, fields: ['full_name'] }),
      loadStats(),
    ]).then(([s, p]) => {
      setStaff(s.items.map((i) => i.full_name));
      setParticipants(p.items.map((i) => i.full_name));
    });
  }, [loadStats]);

  useEffect(() => {
    if (tab === 'roster') loadBoard(weekStart);
    else if (tab === 'shifts') loadList(listRange);
    else if (tab === 'approvals') loadApprovals();
  }, [tab, weekStart, listRange, loadBoard, loadList, loadApprovals]);

  const refresh = () => { loadStats(); if (tab === 'roster') return loadBoard(weekStart); if (tab === 'shifts') return loadList(listRange); return loadApprovals(); };

  const openNew = (date) => { setEditingShift(null); setFormOpen(true); if (date) setPrefillDate(date); };
  const [prefillDate, setPrefillDate] = useState(null);

  const openEdit = (shift) => { setEditingShift(shift); setFormOpen(true); };

  const saveShift = async (data) => {
    setSaving(true);
    try {
      if (editingShift) {
        const { repeat_rule, repeat_until, ...fields } = data;
        await base44.entities.Shift.update(editingShift.id, fields);
      } else {
        const dates = expandRecurrence(data, data.repeat_rule, data.repeat_until);
        const base = { ...data, repeat_rule: data.repeat_rule, repeat_until: data.repeat_rule !== 'none' ? data.repeat_until : undefined };
        await base44.entities.Shift.bulkCreate(dates.map((d) => ({ ...base, date: d })));
      }
      setFormOpen(false);
      setPrefillDate(null);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const deleteShift = async (shift) => {
    await base44.entities.Shift.delete(shift.id);
    await refresh();
  };

  const advance = async (shift) => {
    const now = new Date().toISOString();
    if (shift.status === 'Scheduled') {
      await base44.entities.Shift.update(shift.id, { status: 'In Progress', clock_in: now });
    } else if (shift.status === 'In Progress') {
      await base44.entities.Shift.update(shift.id, { status: 'Completed', clock_out: now, approval_status: 'Pending Approval' });
    }
    await refresh();
  };

  const openFill = async (shift) => {
    const from = shift.date;
    const [dayShifts, availability] = await Promise.all([
      base44.entities.Shift.filter({ date: from }, { sort: 'start_time', limit: 100 }),
      base44.entities.StaffAvailability.filter({}, { sort: '-date', limit: 200 }),
    ]);
    setFillData({ shifts: dayShifts.items, availability: availability.items });
    setFillShift(shift);
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      await base44.entities.StaffAvailability.create({
        staff_name: availForm.staff_name,
        type: availForm.type,
        date: availForm.date,
        start_time: availForm.all_day ? undefined : (availForm.start_time || undefined),
        end_time: availForm.all_day ? undefined : (availForm.end_time || undefined),
        all_day: availForm.all_day,
        notes: availForm.notes || undefined,
      });
      setAvailForm({ staff_name: '', type: 'Unavailable', date: '', start_time: '', end_time: '', all_day: false, notes: '' });
      setAvailOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CalendarRange}
        title="Rostering"
        subtitle="Roster board, shift register, timesheet approvals and staff availability."
        action={
          <div className="flex items-center gap-2">
            {tab === 'roster' && (
              <>
                <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-sm font-medium">{format(weekStart, 'd MMM')} – {format(addDays(weekStart, 6), 'd MMM yyyy')}</span>
                <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight className="h-4 w-4" /></Button>
              </>
            )}
            {tab === 'shifts' && (
              <div className="flex items-center gap-2">
                <Input type="date" value={listRange.from} onChange={(e) => setListRange({ ...listRange, from: e.target.value })} className="w-36" />
                <span className="text-sm text-muted-foreground">to</span>
                <Input type="date" value={listRange.to} onChange={(e) => setListRange({ ...listRange, to: e.target.value })} className="w-36" />
              </div>
            )}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={CalendarClock} label="Shifts this week" value={stats.week} tone="bg-brand/10 text-brand" />
        <StatCard icon={UserX} label="Unfilled (next 14 days)" value={stats.unfilled} tone="bg-warning/10 text-warning" />
        <StatCard icon={ClipboardCheck} label="Awaiting approval" value={stats.pending} tone="bg-teal/10 text-teal" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="roster"><CalendarRange className="mr-1.5 h-4 w-4" /> Roster board</TabsTrigger>
          <TabsTrigger value="shifts"><CalendarClock className="mr-1.5 h-4 w-4" /> Shift register</TabsTrigger>
          <TabsTrigger value="approvals"><ClipboardCheck className="mr-1.5 h-4 w-4" /> Approvals</TabsTrigger>
          <TabsTrigger value="availability"><CalendarPlus className="mr-1.5 h-4 w-4" /> Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openNew()}><PlusIcon /> Schedule shift</Button>
          </div>
          {loading ? (
            <Loading />
          ) : (
            <RosterBoard weekStart={weekStart} shifts={boardShifts} onAdd={(date) => { setEditingShift(null); setPrefillDate(date); setFormOpen(true); }} onEdit={openEdit} />
          )}
        </TabsContent>

        <TabsContent value="shifts" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openNew()}><PlusIcon /> Schedule shift</Button>
          </div>
          {loading ? (
            <Loading />
          ) : (
            <ShiftList shifts={listShifts} onEdit={openEdit} onDelete={deleteShift} onAdvance={advance} />
          )}
        </TabsContent>

        <TabsContent value="approvals" className="mt-4">
          {loading ? <Loading /> : <ApprovalsPanel shifts={approvalShifts} onChanged={refresh} />}
        </TabsContent>

        <TabsContent value="availability" className="mt-4">
          <AvailabilityPanel staff={staff} />
        </TabsContent>
      </Tabs>

      <ShiftForm open={formOpen} onOpenChange={setFormOpen} shift={editingShift} prefillDate={prefillDate} onSave={saveShift} saving={saving} />

      <FillShiftDialog
        open={Boolean(fillShift)}
        onOpenChange={(o) => { if (!o) setFillShift(null); }}
        shift={fillShift || {}}
        shifts={fillData.shifts}
        availability={fillData.availability}
        staff={staff}
        onFilled={refresh}
      />

      <AvailabilityFormDialog open={availOpen} onOpenChange={setAvailOpen} form={availForm} setForm={setAvailForm} onSave={saveAvailability} saving={saving} staff={staff} />
    </div>
  );
}

const PlusIcon = () => <CalendarClock className="mr-2 h-4 w-4" />;
const Loading = () => <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;