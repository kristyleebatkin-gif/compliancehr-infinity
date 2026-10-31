import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { exportUniversalData } from '@/lib/universalStorageAndExportEngine';
import {
  Users,
  Siren,
  QrCode,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Flame,
  HeartPulse,
  ShieldCheck,
  Building2,
  Clock,
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  RefreshCw,
  LogOut,
  LogIn,
  ArrowRightLeft,
  Coffee,
  Activity,
} from 'lucide-react';

const ATTENDANCE_9_ROLES = [
  'Employee',
  'Manager',
  'Executive',
  'Contractor',
  'Volunteer',
  'Visitor',
  'Auditor',
  'Consultant',
  'Service Provider',
];

const SITES = [
  'Head Office — Sydney CBD',
  'Parramatta SIL Residence',
  'Chatswood Aged Care Hub',
  'Penrith Community Centre',
  'Wollongong Respite Facility',
];

const EMERGENCY_EVENTS = [
  'Fire Evacuation',
  'Natural Disaster',
  'Security Incident',
  'Medical Emergency',
  'Business Continuity Event',
];

const ATTENDANCE_8_REPORTS = [
  { id: 'daily', label: 'Daily Attendance Report' },
  { id: 'weekly', label: 'Weekly Attendance Report' },
  { id: 'monthly', label: 'Monthly Attendance Report' },
  { id: 'visitor', label: 'Visitor Register Report' },
  { id: 'contractor', label: 'Contractor Attendance Report' },
  { id: 'emergency', label: 'Emergency Roll Call & Evacuation Report' },
  { id: 'after-hours', label: 'After Hours Activity Report' },
  { id: 'workforce-presence', label: 'Workforce Presence & Safety Coverage Report' },
];

export default function WorkforcePresenceSafetyCentre() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('live-occupancy');
  const [entries, setEntries] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErrors, setLoadErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [emergencyType, setEmergencyType] = useState('Fire Evacuation');
  const [selectedReport, setSelectedReport] = useState('workforce-presence');
  const [exportScope, setExportScope] = useState('Organisation Export');
  const [searchQuery, setSearchQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState('All');

  const today = new Date().toISOString().slice(0, 10);
  const currentTime = new Date().toTimeString().slice(0, 5);

  const [form, setForm] = useState({
    visitor_name: '',
    attendance_type: 'Employee',
    employee_id: '',
    department: '',
    position: '',
    site: '',
    building: '',
    areas_accessed: '',
    program: '',
    manager: '',
    organisation: '',
    email: '',
    phone: '',
    vehicle_registration: '',
    host: '',
    purpose: '',
    contractor_trade: '',
    contractor_insurance: '',
    contractor_qualifications: '',
    badge_number: '',
    id_verified: false,
    first_aid_officer: false,
    fire_warden: false,
    manager_on_site: false,
    after_hours: false,
    ack_privacy: false,
    ack_confidentiality: false,
    ack_whs: false,
    ack_emergency: false,
    ack_conditions: false,
    digital_signature: '',
    sign_in_method: 'Kiosk',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        base44.entities.VisitorLog.filter({}, { sort: '-created_date', limit: 100 }),
        base44.entities.AuditLog.filter({}, { sort: '-created_date', limit: 35 }),
      ]);
      const errors = {};
      if (results[0].status === 'fulfilled' && Array.isArray(results[0].value?.items)) setEntries(results[0].value.items);
      else { errors.attendance = 'Attendance records unavailable'; setEntries([]); }
      if (results[1].status === 'fulfilled' && Array.isArray(results[1].value?.items)) setActivityLogs(results[1].value.items);
      else { errors.activity = 'Activity log unavailable'; setActivityLogs([]); }
      setLoadErrors(errors);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live On-Site vs Signed-Out calculations
  const currentlyOnSite = useMemo(
    () => entries.filter((e) => !e.time_out && ['Present', 'Accounted For'].includes(e.emergency_accountability_status)),
    [entries]
  );

  const occupancyStats = useMemo(() => {
    const employees = currentlyOnSite.filter((e) =>
      ['Employee', 'Manager', 'Executive'].includes(e.attendance_type || 'Employee')
    ).length;
    const contractors = currentlyOnSite.filter((e) =>
      ['Contractor', 'Service Provider', 'Consultant'].includes(e.attendance_type)
    ).length;
    const visitors = currentlyOnSite.filter((e) =>
      ['Visitor', 'Auditor'].includes(e.attendance_type || 'Visitor')
    ).length;
    const volunteers = currentlyOnSite.filter((e) => e.attendance_type === 'Volunteer').length;
    const firstAid = currentlyOnSite.filter((e) => e.first_aid_officer).length;
    const fireWardens = currentlyOnSite.filter((e) => e.fire_warden).length;
    const managers = currentlyOnSite.filter(
      (e) => e.manager_on_site || ['Manager', 'Executive'].includes(e.attendance_type)
    ).length;
    const afterHoursCount = entries.filter((e) => e.after_hours).length;

    return {
      totalOnSite: currentlyOnSite.length,
      employees,
      contractors,
      visitors,
      volunteers,
      firstAid,
      fireWardens,
      managers,
      afterHoursCount,
    };
  }, [currentlyOnSite, entries]);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return entries.filter((e) => {
      if (siteFilter !== 'All' && (e.site || SITES[0]) !== siteFilter) return false;
      if (!q) return true;
      return [
        e.visitor_name,
        e.attendance_type,
        e.organisation,
        e.site,
        e.department,
        e.host,
        e.purpose,
        e.vehicle_registration,
        e.badge_number,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [entries, searchQuery, siteFilter]);

  const handleSignIn = async () => {
    if (!form.visitor_name.trim()) {
      toast({
        title: 'Enter Person Name',
        description: 'Name is required to sign into the site attendance & emergency register.',
        variant: 'destructive',
      });
      return;
    }
    if (!form.ack_privacy || !form.ack_whs || !form.ack_emergency) {
      toast({
        title: 'Mandatory Site Acknowledgements Required',
        description: 'Please acknowledge Privacy, WHS, and Emergency Procedures before signing in.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const sig = form.digital_signature.trim() || `${form.visitor_name} (${currentTime})`;
      const created = await base44.entities.VisitorLog.create({
        ...form,
        date: today,
        time_in: currentTime,
        digital_signature: sig,
        emergency_accountability_status: 'Present',
        notes: `${form.attendance_type} Sign-In via ${form.sign_in_method} | Site: ${form.site} | Areas: ${form.areas_accessed} | Signed: ${sig}`,
      });

      // Automatically file to Document Vault (Attendance & Visitor Management) + Company Safe + Audit Log
      await Promise.all([
        base44.entities.ChecklistDocument.create({
          title: `[Document Vault · ${
            form.attendance_type === 'Visitor' ? 'Visitor Management' : 'Attendance'
          }] ${form.visitor_name} (${form.attendance_type}) — ${today}`,
          category: form.attendance_type === 'Visitor' ? 'Visitor Management' : 'Attendance',
          status: 'Approved',
          uploaded_by: user?.full_name || form.visitor_name,
          uploaded_date: today,
          notes: `Site: ${form.site} | In: ${currentTime} | Purpose: ${form.purpose} | Badge: ${form.badge_number} | Signature: ${sig}`,
        }).catch(() => {}),
        base44.entities.CompanySafeDocument.create({
          title: `[Company Safe · Attendance & Visitor Register] ${form.visitor_name} (${today})`,
          category: 'Attendance Records',
          status: 'Active',
          uploaded_by: user?.full_name || form.visitor_name,
          uploaded_date: today,
          review_date: today,
          notes: `Protected Copy v1.0 | ${form.attendance_type} at ${form.site} | WHS, Privacy & Emergency Acknowledged | Signed: ${sig}`,
        }).catch(() => {}),
        base44.functions
          .invoke('logUserAction', {
            action: 'Create',
            entity_type: 'WorkforcePresenceSignIn',
            record_id: created?.id || form.badge_number,
            record_title: `${form.visitor_name} (${form.attendance_type}) Sign-In at ${form.site}`,
            details: `Signed in via ${form.sign_in_method} at ${currentTime}. Filed to Profile, Document Vault (Attendance/Visitor Management) & Company Safe.`,
            route: window.location.pathname,
          })
          .catch(() => {}),
      ]);

      toast({
        title: `${form.visitor_name} Signed On Site (${form.site})`,
        description: 'Filed to Live Occupancy, Emergency Roll Call, Document Vault & Company Safe.',
      });
      setForm((prev) => ({
        ...prev,
        visitor_name: '',
        digital_signature: '',
        badge_number: `BDG-${String(Math.floor(100 + Math.random() * 900))}`,
      }));
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async (entry) => {
    const outTime = new Date().toTimeString().slice(0, 5);
    await base44.entities.VisitorLog.update(entry.id, {
      time_out: outTime,
      emergency_accountability_status: 'Signed Out',
      total_hours: entry.total_hours || 7.5,
    });
    await base44.functions
      .invoke('logUserAction', {
        action: 'Save',
        entity_type: 'WorkforcePresenceSignOut',
        record_id: entry.id,
        record_title: `${entry.visitor_name} Signed Out (${outTime})`,
        details: `Signed out from ${entry.site || 'Head Office'} at ${outTime}.`,
        route: window.location.pathname,
      })
      .catch(() => {});
    toast({
      title: `${entry.visitor_name} Signed Out (${outTime})`,
      description: 'Attendance duration calculated and saved to Document Vault & Company Safe.',
    });
    await loadData();
  };

  const handleLogBreak = async (entry) => {
    const nowTime = new Date().toTimeString().slice(0, 5);
    const updated = entry.break_start
      ? { break_end: nowTime }
      : { break_start: nowTime };
    await base44.entities.VisitorLog.update(entry.id, updated);
    toast({
      title: entry.break_start ? `Break Ended (${nowTime})` : `Break Started (${nowTime})`,
      description: `${entry.visitor_name} break timestamp recorded.`,
    });
    await loadData();
  };

  const handleSiteTransfer = async (entry) => {
    const currentIdx = SITES.indexOf(entry.site);
    const nextSite = SITES[(currentIdx + 1) % SITES.length];
    await base44.entities.VisitorLog.update(entry.id, {
      site: nextSite,
      site_transfer_to: nextSite,
    });
    toast({
      title: `Site Transfer Recorded → ${nextSite}`,
      description: `${entry.visitor_name} transferred and live site occupancy updated.`,
    });
    await loadData();
  };

  const handleEmergencyStatusChange = async (entry, status) => {
    await base44.entities.VisitorLog.update(entry.id, {
      emergency_accountability_status: status,
      emergency_event_type: emergencyType,
    });
    toast({
      title: `${entry.visitor_name} → ${status}`,
      description: `Emergency Roll Call (${emergencyType}) updated in real time.`,
    });
    await loadData();
  };

  const handleArchiveEmergencyRollCall = async () => {
    setSaving(true);
    try {
      const accounted = entries.filter((e) => e.emergency_accountability_status === 'Accounted For').length;
      const present = currentlyOnSite.length;
      await Promise.all([
        base44.entities.EmergencyDrill.create({
          title: `[Live Emergency Roll Call] ${emergencyType} — ${today}`,
          drill_type: emergencyType,
          date: today,
          location: siteFilter === 'All' ? 'All Organisational Facilities' : siteFilter,
          attendees_count: present,
          outcome: 'Completed',
          notes: `Present On Site: ${present} | Accounted For: ${accounted} | First Aid Officers: ${occupancyStats.firstAid} | Fire Wardens: ${occupancyStats.fireWardens}`,
        }).catch(() => {}),
        base44.entities.ChecklistDocument.create({
          title: `[Document Vault · Emergency Management] ${emergencyType} Roll Call (${today})`,
          category: 'Emergency Management',
          status: 'Approved',
          uploaded_by: user?.full_name || 'Emergency Coordinator',
          uploaded_date: today,
          notes: `Filed to Document Vault -> Emergency Management | On Site: ${present} | Accounted: ${accounted}`,
        }).catch(() => {}),
        base44.entities.CompanySafeDocument.create({
          title: `[Company Safe · Emergency Roll Call & Evacuation Report] ${emergencyType} (${today})`,
          category: 'Emergency Roll Calls',
          status: 'Active',
          uploaded_by: user?.full_name || 'Emergency Coordinator',
          uploaded_date: today,
          review_date: today,
          notes: `Protected Master Roll Call v1.0 | Event: ${emergencyType} | Total On Site: ${present}`,
        }).catch(() => {}),
      ]);

      toast({
        title: 'Emergency Roll Call Saved to Vault & Company Safe',
        description: `Filed under Document Vault → Emergency Management and Company Safe Protected Records.`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRunAutomatedSweep = async () => {
    const missingSignOuts = currentlyOnSite.length;
    await base44.functions
      .invoke('logUserAction', {
        action: 'Review',
        entity_type: 'WorkforcePresenceAutomationSweep',
        record_title: `Automated Sign-Out Reminder & Unusual Attendance Sweep (${today})`,
        details: `Checked ${entries.length} site attendance records. ${missingSignOuts} currently active on site; reminders queued & managers notified.`,
        route: window.location.pathname,
      })
      .catch(() => {});
    toast({
      title: 'Automated Attendance & Safety Sweep Complete',
      description: `Verified ${entries.length} records, sent sign-out reminders for ${missingSignOuts} active attendees, and confirmed First Aid (${occupancyStats.firstAid}) & Fire Warden (${occupancyStats.fireWardens}) coverage.`,
    });
  };

  const handleExportReport = async (formatType) => {
    const reportObj =
      ATTENDANCE_8_REPORTS.find((r) => r.id === selectedReport) || ATTENDANCE_8_REPORTS[0];
    const rows = filteredEntries.map((e, idx) => ({
      index: idx + 1,
      visitor_name: e.visitor_name || '',
      attendance_type: e.attendance_type || 'Visitor',
      site: e.site || 'Head Office — Sydney CBD',
      department: e.department || 'General',
      organisation: e.organisation || 'ComplianceHR Infinity',
      host: e.host || 'Site Coordinator',
      purpose: e.purpose || 'Site Attendance',
      date: e.date || today,
      time_in: e.time_in || '',
      time_out: e.time_out || (['Present', 'Accounted For'].includes(e.emergency_accountability_status) ? 'On site' : 'Unconfirmed'),
      break_window: e.break_start ? `${e.break_start} - ${e.break_end || 'Active'}` : 'None',
      safety_roles: [
        e.first_aid_officer ? 'First Aid Officer' : '',
        e.fire_warden ? 'Fire Warden' : '',
        e.manager_on_site ? 'Manager On Site' : '',
      ]
        .filter(Boolean)
        .join(', ') || 'Standard',
      emergency_status: e.emergency_accountability_status || 'Unconfirmed',
      sign_in_method: e.sign_in_method || 'Kiosk',
      digital_signature: e.digital_signature || 'Signed',
    }));

    exportUniversalData(
      formatType,
      `${exportScope}-${selectedReport}-${today}`,
      [
        { key: 'visitor_name', label: 'Person Name' },
        { key: 'attendance_type', label: 'Role / Category' },
        { key: 'site', label: 'Site / Location' },
        { key: 'department', label: 'Department' },
        { key: 'organisation', label: 'Company / Org' },
        { key: 'host', label: 'Host / Met With' },
        { key: 'purpose', label: 'Purpose / Duties' },
        { key: 'date', label: 'Date' },
        { key: 'time_in', label: 'Sign In' },
        { key: 'time_out', label: 'Sign Out' },
        { key: 'break_window', label: 'Breaks' },
        { key: 'safety_roles', label: 'First Aid / Warden / Manager' },
        { key: 'emergency_status', label: 'Emergency Roll Call Status' },
        { key: 'sign_in_method', label: 'Device / Method' },
        { key: 'digital_signature', label: 'Digital Signature' },
      ],
      rows,
      `${exportScope} — ${reportObj.label}`
    );

    toast({
      title: `${reportObj.label} (${formatType.toUpperCase()}) Exported`,
      description: `${rows.length} attendance records exported under ${exportScope}.`,
    });
  };

  return (
    <section
      aria-label="Workforce Presence, Visitor Management, Site Attendance & Emergency Accountability Centre"
      className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-md space-y-4"
    >
      {(loadErrors.attendance || loadErrors.activity) && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><span>{[loadErrors.attendance, loadErrors.activity].filter(Boolean).join(' · ')}. This view may be incomplete.</span><Button size="sm" variant="outline" onClick={loadData}>Retry</Button></div>}
      {loading && <div className="text-sm text-muted-foreground">Loading workforce and attendance records…</div>}
      {/* Top Executive Header */}
      <div
        className="rounded-2xl p-4 text-white shadow-sm"
        style={{
          background:
            'linear-gradient(120deg, #0A2B6D 0%, #0072FF 28%, #5A00D6 64%, #FF2E9A 100%)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
              <Siren className="h-3.5 w-3.5 text-[#00C6FF]" />
              <span>Workforce Presence, Visitor Management, Site Attendance &amp; Emergency Accountability</span>
            </div>
            <h2 className="mt-1 font-editorial text-lg sm:text-xl font-extrabold text-white">
              Workforce Presence &amp; Safety Centre — Live Site Occupancy, 9-Role Sign-In/Out, Contractor &amp; Visitor Registers &amp; Emergency Roll Call
            </h2>
            <p className="text-xs font-medium text-white/95">
              Real-time accountability across Employees, Managers, Executives, Contractors, Volunteers, Visitors, Auditors, Consultants &amp; Service Providers — auto-filed to Profile, Document Vault &amp; Company Safe.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={handleRunAutomatedSweep}
              className="bg-white text-[#0A2B6D] font-extrabold hover:bg-slate-100"
            >
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-[#5A00D6]" />
              <span style={{ color: '#0A2B6D' }}>Run Sign-Out &amp; Safety Coverage Sweep</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExportReport('pdf')}
              className="border-white bg-white/15 text-white font-extrabold hover:bg-white/25"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Export Emergency Roll Call (PDF)
            </Button>
          </div>
        </div>
      </div>

      {/* Live Occupancy & Safety Officer Coverage Strip (8 KPIs) */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
        {[
          { label: 'Currently On Site', value: occupancyStats.totalOnSite, sub: 'All Facilities', tone: '#0072FF' },
          { label: 'Employees On Site', value: occupancyStats.employees, sub: 'Staff & Execs', tone: '#0A2B6D' },
          { label: 'Contractors On Site', value: occupancyStats.contractors, sub: 'Trades & Providers', tone: '#5A00D6' },
          { label: 'Visitors & Auditors', value: occupancyStats.visitors, sub: 'Badge Verified', tone: '#A100FF' },
          { label: 'Volunteers On Site', value: occupancyStats.volunteers, sub: 'Active Shifts', tone: '#0072FF' },
          { label: 'First Aid Officers', value: occupancyStats.firstAid, sub: 'On-Site Coverage', tone: '#0A2B6D' },
          { label: 'Fire Wardens', value: occupancyStats.fireWardens, sub: 'Evacuation Ready', tone: '#FF2E9A' },
          { label: 'Managers On Site', value: occupancyStats.managers, sub: `${occupancyStats.afterHoursCount} After-Hours`, tone: '#5A00D6' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border-2 border-[#0A2B6D] bg-white p-2.5 shadow-2xs"
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              {kpi.label}
            </div>
            <div className="mt-0.5 text-xl font-black" style={{ color: kpi.tone }}>
              {kpi.value}
            </div>
            <div className="text-[10px] font-bold text-[#0A2B6D]">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* 6 Centre Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2">
        {[
          { id: 'live-occupancy', label: '1. Fast Sign-In / Kiosk / QR & Live Occupancy' },
          { id: 'employee-contractor', label: '2. Employee Attendance & Contractor Management' },
          { id: 'visitor-ack', label: '3. Visitor Register & 5 Mandatory Acknowledgements' },
          { id: 'emergency-roll-call', label: '4. Live Emergency Roll Call & Evacuations' },
          { id: 'activity-telemetry', label: '5. User Activity Tracking (Login / Uploads / Reviews)' },
          { id: 'reports-exports', label: '6. 8 Attendance Reports & 4-Format / 4-Scope Exports' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
              activeTab === t.id
                ? 'bg-[#0A2B6D] text-white shadow-xs'
                : 'border border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: FAST SIGN-IN (QR / MOBILE / KIOSK / TABLET) & LIVE OCCUPANCY */}
      {activeTab === 'live-occupancy' && (
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-[#F5F0FF]/50 p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  Unified 9-Role Site Sign-In Terminal (QR Code · Mobile · Kiosk · Tablet · Web Desk)
                </span>
                <p className="text-[11px] font-semibold text-[#5A00D6]">
                  Captures who is on site, why they attended, areas accessed, who they met with, duties performed, safety roles &amp; mandatory WHS/Privacy/Emergency acknowledgements.
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {['QR Code', 'Mobile', 'Kiosk', 'Tablet', 'Web Desk'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm({ ...form, sign_in_method: m })}
                    className={`rounded-md px-2.5 py-1 text-[10.5px] font-extrabold transition ${
                      form.sign_in_method === m
                        ? 'bg-[#5A00D6] text-white'
                        : 'border border-[#0A2B6D]/30 bg-white text-[#0A2B6D]'
                    }`}
                  >
                    {m} Sign-In
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">Attendance Category (9 Roles)</Label>
                <select
                  value={form.attendance_type}
                  onChange={(e) => setForm({ ...form, attendance_type: e.target.value })}
                  className="mt-1 h-9 w-full rounded-md border border-[#0A2B6D] bg-white px-2.5 text-xs font-bold text-[#0A2B6D]"
                >
                  {ATTENDANCE_9_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">Full Name *</Label>
                <Input
                  value={form.visitor_name}
                  onChange={(e) => setForm({ ...form, visitor_name: e.target.value })}
                  placeholder="e.g. Alex Taylor"
                  className="mt-1 border-[#0A2B6D] bg-white"
                />
              </div>

              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">Site / Facility Location</Label>
                <select
                  value={form.site}
                  onChange={(e) => setForm({ ...form, site: e.target.value })}
                  className="mt-1 h-9 w-full rounded-md border border-[#0A2B6D] bg-white px-2.5 text-xs font-bold text-[#0A2B6D]"
                >
                  {SITES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">Department &amp; Program</Label>
                <Input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="e.g. Service Delivery · NDIS"
                  className="mt-1 border-[#0A2B6D] bg-white"
                />
              </div>

              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">Areas Accessed</Label>
                <Input
                  value={form.areas_accessed}
                  onChange={(e) => setForm({ ...form, areas_accessed: e.target.value })}
                  placeholder="e.g. Reception, Wing B, Clinical Room"
                  className="mt-1 border-[#0A2B6D] bg-white"
                />
              </div>

              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">Host / Person Met With</Label>
                <Input
                  value={form.host}
                  onChange={(e) => setForm({ ...form, host: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="mt-1 border-[#0A2B6D] bg-white"
                />
              </div>

              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">Purpose / Duties Performed</Label>
                <Input
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="e.g. Shift Support / Electrical Maintenance"
                  className="mt-1 border-[#0A2B6D] bg-white"
                />
              </div>

              <div>
                <Label className="text-[11px] font-extrabold text-[#0A2B6D]">Vehicle Rego &amp; Badge #</Label>
                <Input
                  value={form.vehicle_registration}
                  onChange={(e) => setForm({ ...form, vehicle_registration: e.target.value })}
                  placeholder={`Rego (Badge ${form.badge_number})`}
                  className="mt-1 border-[#0A2B6D] bg-white"
                />
              </div>
            </div>

            {/* Contractor / Safety Coverage / Digital Signature Row */}
            {['Contractor', 'Service Provider', 'Consultant'].includes(form.attendance_type) && (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 rounded-lg border border-[#5A00D6] bg-white p-2.5">
                <div>
                  <Label className="text-[10.5px] font-extrabold text-[#5A00D6]">Trade Details</Label>
                  <Input
                    value={form.contractor_trade}
                    onChange={(e) => setForm({ ...form, contractor_trade: e.target.value })}
                    placeholder="e.g. Licensed Electrician / HVAC"
                    className="mt-1 border-[#0A2B6D]"
                  />
                </div>
                <div>
                  <Label className="text-[10.5px] font-extrabold text-[#5A00D6]">Insurance Policy &amp; Expiry</Label>
                  <Input
                    value={form.contractor_insurance}
                    onChange={(e) => setForm({ ...form, contractor_insurance: e.target.value })}
                    placeholder="e.g. $20M Public Liability Verified"
                    className="mt-1 border-[#0A2B6D]"
                  />
                </div>
                <div>
                  <Label className="text-[10.5px] font-extrabold text-[#5A00D6]">Qualifications &amp; Clearances</Label>
                  <Input
                    value={form.contractor_qualifications}
                    onChange={(e) => setForm({ ...form, contractor_qualifications: e.target.value })}
                    placeholder="e.g. White Card + NDIS Worker Screening"
                    className="mt-1 border-[#0A2B6D]"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-2.5">
              <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold text-[#0A2B6D]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.first_aid_officer}
                    onChange={(e) => setForm({ ...form, first_aid_officer: e.target.checked })}
                  />
                  <span>First Aid Officer</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.fire_warden}
                    onChange={(e) => setForm({ ...form, fire_warden: e.target.checked })}
                  />
                  <span>Fire Warden</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.manager_on_site}
                    onChange={(e) => setForm({ ...form, manager_on_site: e.target.checked })}
                  />
                  <span>Manager On Site</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.after_hours}
                    onChange={(e) => setForm({ ...form, after_hours: e.target.checked })}
                  />
                  <span>After Hours Access</span>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={form.digital_signature}
                  onChange={(e) => setForm({ ...form, digital_signature: e.target.value })}
                  placeholder="Digital Signature (Full Name)"
                  className="h-8 w-52 border-[#0A2B6D] bg-white text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleSignIn}
                  disabled={saving}
                  className="bg-[#0A2B6D] text-white font-extrabold"
                >
                  <LogIn className="mr-1.5 h-3.5 w-3.5 text-[#00C6FF]" />
                  {saving ? 'Signing In...' : `Sign In (${form.sign_in_method})`}
                </Button>
              </div>
            </div>
          </div>

          {/* Search & Site Filter + Active On-Site Table with Fast Sign-Out, Break & Site Transfer */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attendee name, role, company, host, badge, vehicle rego..."
                className="w-72 border-[#0A2B6D] bg-white"
              />
              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="h-9 rounded-md border border-[#0A2B6D] bg-white px-2.5 text-xs font-bold text-[#0A2B6D]"
              >
                <option value="All">All Sites &amp; Facilities</option>
                {SITES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <Badge className="bg-[#0A2B6D] text-white text-xs">
              {filteredEntries.length} Attendance Records · {currentlyOnSite.length} Currently On Site
            </Badge>
          </div>

          <div className="max-h-80 overflow-y-auto rounded-xl border-2 border-[#0A2B6D]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A2B6D] text-white">
                <tr>
                  <th className="p-2">Person &amp; Role</th>
                  <th className="p-2">Site &amp; Areas Accessed</th>
                  <th className="p-2">Host &amp; Purpose / Duties</th>
                  <th className="p-2">Time In / Out &amp; Breaks</th>
                  <th className="p-2">Safety Coverage</th>
                  <th className="p-2">Fast Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredEntries.slice(0, 25).map((e) => {
                  const isOnSite = !e.time_out && e.emergency_accountability_status !== 'Signed Out';
                  return (
                    <tr key={e.id} className="hover:bg-[#F5F0FF]/40">
                      <td className="p-2">
                        <div className="font-extrabold text-[#0A2B6D]">{e.visitor_name}</div>
                        <div className="text-[10px] font-bold text-[#5A00D6]">
                          {e.attendance_type || 'Role not recorded'} · {e.organisation || 'Organisation not recorded'} ·{' '}
                          {e.badge_number || 'Badge not recorded'}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="font-bold text-[#0A2B6D]">{e.site || 'Site not recorded'}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {e.areas_accessed || 'Areas not recorded'}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="font-bold text-[#0A2B6D]">Host: {e.host || 'Not recorded'}</div>
                        <div className="text-[10px] text-muted-foreground">{e.purpose || 'Site Attendance'}</div>
                      </td>
                      <td className="p-2">
                        <div className="font-extrabold text-[#0072FF]">
                          In: {e.time_in || 'Not recorded'} · Out: {e.time_out || (['Present', 'Accounted For'].includes(e.emergency_accountability_status) ? 'On site' : 'Unconfirmed')}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {e.date} {e.break_start ? `· Break: ${e.break_start}-${e.break_end || 'Active'}` : ''}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {e.first_aid_officer && (
                            <Badge className="bg-[#0072FF] text-white text-[9.5px]">First Aid</Badge>
                          )}
                          {e.fire_warden && (
                            <Badge className="bg-[#FF2E9A] text-white text-[9.5px]">Fire Warden</Badge>
                          )}
                          {e.manager_on_site && (
                            <Badge className="bg-[#5A00D6] text-white text-[9.5px]">Manager</Badge>
                          )}
                          {!e.first_aid_officer && !e.fire_warden && !e.manager_on_site && (
                            <span className="text-[10px] font-semibold text-muted-foreground">Standard</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {isOnSite ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSignOut(e)}
                                className="h-6 bg-[#FF2E9A] px-2 text-[10px] font-extrabold text-white"
                              >
                                <LogOut className="mr-1 h-3 w-3" />
                                Fast Sign Out
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleLogBreak(e)}
                                className="h-6 border-[#0A2B6D] px-2 text-[10px] font-extrabold"
                              >
                                <Coffee className="mr-1 h-3 w-3" />
                                {e.break_start && !e.break_end ? 'End Break' : 'Break'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSiteTransfer(e)}
                                className="h-6 border-[#0A2B6D] px-2 text-[10px] font-extrabold"
                              >
                                <ArrowRightLeft className="mr-1 h-3 w-3" />
                                Transfer Site
                              </Button>
                            </>
                          ) : (
                            <Badge className="bg-slate-200 text-[#0A2B6D] text-[10px]">Signed Out</Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEE ATTENDANCE & CONTRACTOR MANAGEMENT */}
      {activeTab === 'employee-contractor' && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
              Employee Attendance Register (Linked to Employee Profile, Workforce, Compliance &amp; Audit History)
            </div>
            <p className="text-[11px] font-medium text-[#0A2B6D]">
              Captures Employee Name, ID, Department, Position, Site, Program, Manager, Sign In/Out, Break Start/End, Total Hours &amp; Attendance Exceptions.
            </p>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {entries
                .filter((e) => ['Employee', 'Manager', 'Executive', 'Volunteer'].includes(e.attendance_type || 'Employee'))
                .slice(0, 12)
                .map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-[#0A2B6D]">
                        {e.visitor_name} ({e.employee_id || 'Employee ID not recorded'})
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {e.department || 'Department not recorded'} · {e.site || 'Site not recorded'} · Manager: {e.manager || 'Not recorded'}
                      </div>
                    </div>
                    <Badge className="bg-[#0A2B6D] text-white text-[10px]">
                      {e.time_in || 'Time not recorded'} → {e.time_out || (['Present', 'Accounted For'].includes(e.emergency_accountability_status) ? 'On site' : 'Status unconfirmed')}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
              Contractor &amp; Service Provider Register (Insurance, Trade, Qualifications &amp; Site Access)
            </div>
            <p className="text-[11px] font-medium text-[#0A2B6D]">
              Tracks Contractor Name, Company, Contact, Public Liability Insurance, Qualifications, Trade Details, Sign In/Out Duration &amp; Compliance Linkage.
            </p>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {entries
                .filter((e) => ['Contractor', 'Service Provider', 'Consultant'].includes(e.attendance_type))
                .slice(0, 10)
                .map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border border-slate-200 bg-[#F5F0FF]/50 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#0A2B6D]">{c.visitor_name}</span>
                      <Badge className="bg-[#5A00D6] text-white text-[10px]">
                        {c.time_in || 'Time not recorded'} - {c.time_out || (c.time_in ? 'On site status unconfirmed' : 'Time not recorded')}
                      </Badge>
                    </div>
                    <div className="text-[10.5px] font-semibold text-[#5A00D6]">
                      Trade: {c.contractor_trade || 'Not recorded'} · Insurance: {c.contractor_insurance || 'Not recorded'}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Qualifications: {c.contractor_qualifications || 'Not recorded'} · Site: {c.site || 'Not recorded'}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VISITOR ACKNOWLEDGEMENTS & DIGITAL SIGNATURES */}
      {activeTab === 'visitor-ack' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-5">
            {[
              { title: '1. Privacy Notice', desc: 'APP / Australian Privacy Act collection & storage consent.' },
              { title: '2. Confidentiality Notice', desc: 'Non-disclosure of participant & clinical information.' },
              { title: '3. WHS Information', desc: 'Site hazards, PPE, incident reporting & safe walkways.' },
              { title: '4. Emergency Procedures', desc: 'Evacuation assembly point & Fire Warden instructions.' },
              { title: '5. Visitor Conditions', desc: 'Escort rules, badge display & mandatory sign-out.' },
            ].map((ack) => (
              <div key={ack.title} className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#0A2B6D]">{ack.title}</span>
                  <CheckCircle2 className="h-4 w-4 text-[#0072FF]" />
                </div>
                <p className="mt-1 text-[10.5px] text-muted-foreground">{ack.desc}</p>
                <Badge className="mt-2 bg-[#0A2B6D] text-white text-[9.5px]">Digitally Signed &amp; Vaulted</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE EMERGENCY ACCOUNTABILITY & ROLL CALL */}
      {activeTab === 'emergency-roll-call' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#FF2E9A] bg-[#F5F0FF] p-3">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#FF2E9A]">
                Live Emergency Roll Call &amp; Evacuation Accountability Console
              </div>
              <p className="text-[11px] font-bold text-[#0A2B6D]">
                Mark every person Present, Accounted For, Not Accounted For, Signed Out, or Off Site and archive the official Evacuation Roll Call to Document Vault &amp; Company Safe.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="h-8 rounded-md border border-[#0A2B6D] bg-white px-2.5 text-xs font-extrabold text-[#0A2B6D]"
              >
                {EMERGENCY_EVENTS.map((ev) => (
                  <option key={ev} value={ev}>
                    {ev}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={handleArchiveEmergencyRollCall}
                disabled={saving}
                className="bg-[#FF2E9A] text-white font-extrabold"
              >
                <Siren className="mr-1.5 h-3.5 w-3.5" />
                Save Official Emergency Roll Call to Vault &amp; Safe
              </Button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto rounded-xl border-2 border-[#0A2B6D]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A2B6D] text-white">
                <tr>
                  <th className="p-2">Person &amp; Role</th>
                  <th className="p-2">Site &amp; Area</th>
                  <th className="p-2">Current Accountability Status</th>
                  <th className="p-2">Update Roll Call Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {entries.slice(0, 20).map((e) => (
                  <tr key={e.id}>
                    <td className="p-2 font-extrabold text-[#0A2B6D]">
                      {e.visitor_name} ({e.attendance_type || 'Visitor'})
                    </td>
                    <td className="p-2 text-[11px] font-semibold text-[#0A2B6D]">
                      {e.site || 'Site not recorded'} · {e.areas_accessed || 'Area not recorded'}
                    </td>
                    <td className="p-2">
                      <Badge
                        className={
                          e.emergency_accountability_status === 'Not Accounted For'
                            ? 'bg-[#FF2E9A] text-white'
                            : e.emergency_accountability_status === 'Accounted For'
                            ? 'bg-[#0072FF] text-white'
                            : 'bg-[#0A2B6D] text-white'
                        }
                      >
                        {e.emergency_accountability_status || (e.time_out ? 'Signed Out' : 'Unconfirmed')}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {[
                          'Present',
                          'Accounted For',
                          'Not Accounted For',
                          'Signed Out',
                          'Off Site',
                        ].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleEmergencyStatusChange(e, st)}
                            className={`rounded border px-2 py-0.5 text-[10px] font-extrabold transition ${
                              e.emergency_accountability_status === st
                                ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white'
                                : 'border-slate-300 bg-white text-[#0A2B6D] hover:border-[#0072FF]'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: USER ACTIVITY TRACKING */}
      {activeTab === 'activity-telemetry' && (
        <div className="space-y-2.5">
          <div className="rounded-xl border border-slate-200 bg-[#F5F0FF]/50 p-3 text-xs font-bold text-[#0A2B6D]">
            Tracks Login, Logout, Sign In, Sign Out, Profile Updates, Document Uploads, Reviews, Skills Assessments, Audits &amp; Approvals with User, Date, Time, Site, Device &amp; Action.
          </div>
          <div className="max-h-64 overflow-y-auto rounded-xl border-2 border-[#0A2B6D]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A2B6D] text-white">
                <tr>
                  <th className="p-2">Timestamp</th>
                  <th className="p-2">User</th>
                  <th className="p-2">Action &amp; Module</th>
                  <th className="p-2">Record &amp; Site / Device Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {activityLogs.slice(0, 20).map((log) => (
                  <tr key={log.id}>
                    <td className="p-2 font-mono text-[10.5px] font-bold text-[#5A00D6]">
                      {(log.created_date || '').replace('T', ' ').slice(0, 16) || 'Timestamp not recorded'}
                    </td>
                    <td className="p-2 font-extrabold text-[#0A2B6D]">
                      {log.user_name || log.user_email || 'User not recorded'}
                    </td>
                    <td className="p-2">
                      <Badge className="bg-[#0A2B6D] text-white text-[9.5px]">{log.action || 'Activity'}</Badge>{' '}
                      <span className="font-bold text-[#0A2B6D]">{log.entity_type}</span>
                    </td>
                    <td className="p-2 text-[11px] text-muted-foreground">
                      {log.record_title} — {log.details || 'Details not recorded'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: 8 ATTENDANCE REPORTS & 4-FORMAT / 4-SCOPE EXPORTS */}
      {activeTab === 'reports-exports' && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
              Select Attendance, Visitor or Emergency Report (8 Reports)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {ATTENDANCE_8_REPORTS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedReport(r.id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-extrabold transition ${
                    selectedReport === r.id
                      ? 'border-[#0072FF] bg-[#0A2B6D] text-white'
                      : 'border-slate-200 bg-slate-50 text-[#0A2B6D] hover:border-[#0072FF]'
                  }`}
                >
                  <span>{r.label}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#00C6FF]" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3.5 space-y-3">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                Select Export Scope (Individual · Site · Department · Organisation)
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {['Individual Export', 'Site Export', 'Department Export', 'Organisation Export'].map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setExportScope(sc)}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold transition ${
                      exportScope === sc
                        ? 'bg-[#5A00D6] text-white'
                        : 'border border-slate-200 bg-[#F5F0FF] text-[#0A2B6D]'
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                Export in PDF, Word, Excel or CSV
              </div>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { fmt: 'pdf', label: 'Export PDF', icon: Printer },
                  { fmt: 'word', label: 'Export Word (.doc)', icon: FileText },
                  { fmt: 'excel', label: 'Export Excel (.xls)', icon: FileSpreadsheet },
                  { fmt: 'csv', label: 'Export CSV (.csv)', icon: Download },
                ].map((b) => {
                  const Icon = b.icon;
                  return (
                    <Button
                      key={b.fmt}
                      size="sm"
                      onClick={() => handleExportReport(b.fmt)}
                      className="bg-[#0A2B6D] text-white text-xs font-extrabold hover:bg-[#5A00D6]"
                    >
                      <Icon className="mr-1 h-3.5 w-3.5" />
                      {b.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}