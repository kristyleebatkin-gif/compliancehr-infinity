import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import {
  ShieldCheck,
  Wifi,
  Lock,
  Smartphone,
  Laptop,
  Globe,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  Edit3,
  Zap,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import AuditorLinkGeneratorCard from '@/components/remoteAccess/AuditorLinkGeneratorCard';

const ACCESS_MODES = [
  'Zero-Trust Cloud (No VPN)',
  'Identity-Aware Proxy',
  'Managed VPN Tunnel',
  'Auditor Scoped Link',
  'Mobile Field Access',
];

const DEVICE_TYPES = [
  'Desktop / Laptop',
  'iOS / Android Mobile',
  'Tablet / Kiosk',
  'External Auditor Workstation',
];

const STATUS_OPTIONS = [
  'Active',
  'Trusted',
  'Pending Approval',
  'Revoked',
  'Expired',
];

const EMPTY_FORM = {
  title: '',
  access_mode: 'Zero-Trust Cloud (No VPN)',
  user_name: '',
  user_role: 'Employee',
  device_type: 'Desktop / Laptop',
  location_region: 'Australia (All Regions)',
  mfa_verified: true,
  encryption_standard: 'TLS 1.3 + AES-256 Zero-Trust',
  ip_allowlist_rule: 'Dynamic Identity-Verified (No VPN Required)',
  status: 'Active',
  session_expiry: '2027-06-30',
  notes: '',
};

export default function RemoteAccessVpnHub() {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    zeroTrust: 0,
    revoked: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const query = {};
    if (statusFilter !== 'ALL') query.status = statusFilter;
    if (modeFilter !== 'ALL') query.access_mode = modeFilter;
    if (searchTerm.trim()) {
      query.$or = [
        { title: { $regex: searchTerm.trim() } },
        { user_name: { $regex: searchTerm.trim() } },
        { location_region: { $regex: searchTerm.trim() } },
      ];
    }

    const [pageRes, totalCount, activeCount, ztCount, revokedCount] = await Promise.all([
      base44.entities.RemoteAccessSession.filter(query, { sort: '-created_date', limit: 50 }),
      base44.entities.RemoteAccessSession.count({}),
      base44.entities.RemoteAccessSession.count({ status: { $in: ['Active', 'Trusted'] } }),
      base44.entities.RemoteAccessSession.count({ access_mode: 'Zero-Trust Cloud (No VPN)' }),
      base44.entities.RemoteAccessSession.count({ status: 'Revoked' }),
    ]);

    const list = Array.isArray(pageRes) ? pageRes : pageRes?.items || [];
    setRecords(list);
    setCounts({
      total: Number(totalCount) || 0,
      active: Number(activeCount) || 0,
      zeroTrust: Number(ztCount) || 0,
      revoked: Number(revokedCount) || 0,
    });
    setLoading(false);
  }, [statusFilter, modeFilter, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title || '',
      access_mode: item.access_mode || 'Zero-Trust Cloud (No VPN)',
      user_name: item.user_name || '',
      user_role: item.user_role || 'Employee',
      device_type: item.device_type || 'Desktop / Laptop',
      location_region: item.location_region || '',
      mfa_verified: item.mfa_verified !== false,
      encryption_standard: item.encryption_standard || 'TLS 1.3 + AES-256 Zero-Trust',
      ip_allowlist_rule: item.ip_allowlist_rule || '',
      status: item.status || 'Active',
      session_expiry: item.session_expiry || '',
      notes: item.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    if (editingItem?.id) {
      await base44.entities.RemoteAccessSession.update(editingItem.id, form);
      toast({
        title: 'Remote Access Policy Updated',
        description: `${form.title} has been updated.`,
      });
    } else {
      await base44.entities.RemoteAccessSession.create(form);
      toast({
        title: 'Remote Access Policy Recorded',
        description: `${form.title} has been added to the access policy register.`,
      });
    }
    setSaving(false);
    setDialogOpen(false);
    loadData();
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'Revoked' ? 'Active' : 'Revoked';
    await base44.entities.RemoteAccessSession.update(item.id, { status: nextStatus });
    toast({
      title: nextStatus === 'Revoked' ? 'Access Revoked Instantly' : 'Remote Access Restored',
      description: `${item.title} is now marked ${nextStatus}.`,
    });
    loadData();
  };

  const handleDelete = async (item) => {
    await base44.entities.RemoteAccessSession.delete(item.id);
    toast({
      title: 'Endpoint Removed',
      description: `${item.title} was removed from the register.`,
    });
    loadData();
  };

  // This hub is a policy register only. It is not connected to a VPN or gateway,
  // so it must never report a live connection test as passed.
  const handleTestTunnel = (item) => {
    toast({
      title: 'No live connection test available',
      description: `${item.title} is a recorded access policy. This hub is not connected to a VPN or security gateway, so the connection has not been tested.`,
    });
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 text-white">
      {/* Top Hero Command Deck */}
      <div
        className="rounded-2xl p-[2px] shadow-xl"
        style={{
          background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 40%, #A855F7 70%, #FF2E9A 100%)',
        }}
      >
        <div className="rounded-[14px] bg-workspace-navy p-4 sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00C6FF] bg-workspace-navy px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                <Wifi className="h-3.5 w-3.5 text-[#00C6FF]" />
                <span>Zero-Trust Cloud &amp; VPN Security Hub</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
                Remote Access Without the Headaches
              </h1>
              <p className="max-w-3xl text-xs sm:text-sm font-semibold text-slate-300">
                Record and review your remote-access and VPN rules: who may connect, how, and with what
                MFA and encryption requirements.
              </p>
              <p className="max-w-3xl rounded-lg border border-[#FF2E9A]/60 px-3 py-1.5 text-[11px] font-bold text-white">
                Policy register only: this hub is not connected to a VPN or security gateway. Encryption and MFA values
                below are the requirements you have recorded, not live test results.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={openCreate}
                className="h-9 rounded-lg border border-white/25 px-4 text-xs font-extrabold text-workspace-navy shadow-[0_0_14px_rgba(0,198,255,0.6)]"
                style={{ backgroundColor: '#00C6FF' }}
              >
                <Plus className="mr-1.5 h-4 w-4 text-workspace-navy" />
                Add Remote Access / VPN Rule
              </Button>
              <Button
                onClick={loadData}
                className="h-9 rounded-lg border border-[#00C6FF]/50 px-3.5 text-xs font-extrabold text-white"
                style={{ backgroundColor: '#0072FF' }}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-[#00C6FF]" />
                Refresh
              </Button>
            </div>
          </div>

          {/* 4 Pillar Benefits Strip */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#00C6FF]/50 bg-workspace-navy p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase text-[#00C6FF]">
                  Active Endpoints &amp; Policies
                </span>
                <ShieldCheck className="h-4 w-4 text-[#00C6FF]" />
              </div>
              <div className="mt-1 text-2xl font-black text-white">{counts.active}</div>
              <div className="mt-0.5 text-[11px] font-semibold text-slate-300">
                of {counts.total} configured access rules
              </div>
            </div>

            <div className="rounded-xl border border-[#A855F7]/50 bg-workspace-navy p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase text-[#A855F7]">
                  VPN-Free Zero-Trust
                </span>
                <Zap className="h-4 w-4 text-[#00C6FF]" />
              </div>
              <div className="mt-1 text-2xl font-black text-white">{counts.zeroTrust}</div>
              <div className="mt-0.5 text-[11px] font-semibold text-slate-300">
                Direct browser sessions (no VPN client needed)
              </div>
            </div>

            <div className="rounded-xl border border-[#0072FF]/60 bg-workspace-navy p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase text-[#38BDF8]">
                  Encryption &amp; MFA Requirement
                </span>
                <KeyRound className="h-4 w-4 text-[#00C6FF]" />
              </div>
              <div className="mt-1 text-2xl font-black text-white">TLS 1.3</div>
              <div className="mt-0.5 text-[11px] font-semibold text-slate-300">
                Default policy requirement (not a live test)
              </div>
            </div>

            <div className="rounded-xl border border-[#FF2E9A]/60 bg-workspace-navy p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase text-[#FF2E9A]">
                  Revoked / Blocked Sessions
                </span>
                <Lock className="h-4 w-4 text-[#00C6FF]" />
              </div>
              <div className="mt-1 text-2xl font-black text-white">{counts.revoked}</div>
              <div className="mt-0.5 text-[11px] font-semibold text-slate-300">
                1-click instant session kill-switch
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* One-Click Auditor Link Generator */}
      <AuditorLinkGeneratorCard onCreated={loadData} />

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-2.5 rounded-xl border border-[#00C6FF]/40 bg-workspace-navy p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#00C6FF]" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search endpoints, staff, regions, or VPN gateway rules..."
            className="h-9 border-[#0072FF]/60 bg-workspace-navy pl-9 text-xs font-semibold text-white placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="h-9 rounded-lg border border-[#00C6FF]/60 bg-workspace-navy px-3 text-xs font-extrabold text-white"
          >
            <option value="ALL">All Access Modes</option>
            {ACCESS_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-[#FF2E9A]/60 bg-workspace-navy px-3 text-xs font-extrabold text-white"
          >
            <option value="ALL">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Endpoints & VPN Rules List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="rounded-xl border border-[#00C6FF]/30 bg-workspace-navy p-8 text-center text-sm font-bold text-[#00C6FF]">
            Loading Remote Access &amp; VPN Security policies...
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-xl border border-[#00C6FF]/30 bg-workspace-navy p-8 text-center space-y-3">
            <p className="text-sm font-extrabold text-white">
              No remote access or VPN rules match your current filter.
            </p>
            <Button
              onClick={openCreate}
              className="text-workspace-navy font-extrabold"
              style={{ backgroundColor: '#00C6FF' }}
            >
              <Plus className="mr-1.5 h-4 w-4 text-workspace-navy" />
              Create First Remote Access Rule
            </Button>
          </div>
        ) : (
          records.map((item, idx) => {
            const ledColors = ['#A855F7', '#FF2E9A', '#0072FF'];
            const led = ledColors[idx % ledColors.length];
            const isRevoked = item.status === 'Revoked' || item.status === 'Expired';
            const DeviceIcon =
              item.device_type === 'iOS / Android Mobile'
                ? Smartphone
                : item.device_type === 'External Auditor Workstation'
                  ? Globe
                  : Laptop;

            return (
              <div
                key={item.id}
                className="rounded-xl p-[1.5px] transition-all"
                style={{
                  background:
                    'linear-gradient(120deg, #00C6FF 0%, #0072FF 45%, #FF2E9A 100%)',
                }}
              >
                <div className="flex flex-col justify-between gap-3 rounded-[10.5px] bg-workspace-navy p-4 lg:flex-row lg:items-center">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-workspace-navy"
                      style={{
                        border: '1.5px solid #00C6FF',
                        boxShadow: '0 0 8px rgba(0,198,255,0.45)',
                      }}
                    >
                      <DeviceIcon className="h-5 w-5 text-[#00C6FF]" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-white">
                          {item.title}
                        </span>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full bg-workspace-navy px-2.5 py-0.5 text-[10px] font-black uppercase"
                          style={{
                            border: `1px solid ${led}`,
                            color: '#FFFFFF',
                            boxShadow: `0 0 8px ${led}55`,
                          }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: led,
                              boxShadow: `0 0 6px 1px ${led}`,
                            }}
                          />
                          {item.access_mode}
                        </span>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase"
                          style={{
                            backgroundColor: isRevoked ? '#FF2E9A' : '#00C6FF',
                            color: isRevoked ? '#FFFFFF' : '#0A2B6D',
                          }}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-300">
                        <span>
                          <strong className="text-[#00C6FF]">User/Group:</strong>{' '}
                          {item.user_name || 'All Authorised Staff'} ({item.user_role || 'All Roles'})
                        </span>
                        <span>
                          <strong className="text-[#00C6FF]">Region:</strong>{' '}
                          {item.location_region || 'Australia'}
                        </span>
                        <span>
                          <strong className="text-[#00C6FF]">Gateway Rule:</strong>{' '}
                          {item.ip_allowlist_rule || 'Dynamic Identity-Verified'}
                        </span>
                        <span>
                          <strong className="text-[#00C6FF]">MFA:</strong>{' '}
                          {item.mfa_verified !== false ? 'Required by policy' : 'Optional'}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="text-xs font-medium text-[#FF2E9A]">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTestTunnel(item)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#00C6FF] bg-workspace-navy px-3 text-[11px] font-extrabold text-[#00C6FF] transition hover:bg-workspace-navy"
                    >
                      <Wifi className="h-3.5 w-3.5 text-[#00C6FF]" />
                      <span>Connection test</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg px-3 text-[11px] font-extrabold text-white transition hover:opacity-90"
                      style={{ backgroundColor: '#0072FF' }}
                    >
                      <Edit3 className="h-3.5 w-3.5 text-[#00C6FF]" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg px-3 text-[11px] font-extrabold transition hover:opacity-90"
                      style={{
                        backgroundColor: isRevoked ? '#00C6FF' : '#FF2E9A',
                        color: isRevoked ? '#0A2B6D' : '#FFFFFF',
                      }}
                    >
                      {isRevoked ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Restore</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Revoke</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      aria-label="Delete policy"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#FF2E9A]/60 bg-workspace-navy text-[#FF2E9A] transition hover:bg-[#FF2E9A] hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg border-2 border-[#00C6FF] bg-workspace-navy text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-[#00C6FF]">
              {editingItem ? 'Edit Remote Access / VPN Rule' : 'New Remote Access / VPN Rule'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div>
              <label className="mb-1 block font-extrabold text-[#00C6FF]">
                Endpoint or Policy Name *
              </label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Frontline Support Worker Zero-Trust Mobile Access"
                className="border-[#0072FF] bg-workspace-navy text-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-extrabold text-[#00C6FF]">
                  Access Mode
                </label>
                <select
                  value={form.access_mode}
                  onChange={(e) => setForm({ ...form, access_mode: e.target.value })}
                  className="h-9 w-full rounded-md border border-[#0072FF] bg-workspace-navy px-2.5 font-bold text-white"
                >
                  {ACCESS_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-extrabold text-[#00C6FF]">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="h-9 w-full rounded-md border border-[#0072FF] bg-workspace-navy px-2.5 font-bold text-white"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-extrabold text-[#00C6FF]">
                  Assigned User / Group
                </label>
                <Input
                  value={form.user_name}
                  onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                  placeholder="e.g., Community Support Team"
                  className="border-[#0072FF] bg-workspace-navy text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-extrabold text-[#00C6FF]">
                  Device Type
                </label>
                <select
                  value={form.device_type}
                  onChange={(e) => setForm({ ...form, device_type: e.target.value })}
                  className="h-9 w-full rounded-md border border-[#0072FF] bg-workspace-navy px-2.5 font-bold text-white"
                >
                  {DEVICE_TYPES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-extrabold text-[#00C6FF]">
                  Location / Region
                </label>
                <Input
                  value={form.location_region}
                  onChange={(e) => setForm({ ...form, location_region: e.target.value })}
                  placeholder="e.g., Brisbane & Regional QLD"
                  className="border-[#0072FF] bg-workspace-navy text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-extrabold text-[#00C6FF]">
                  Gateway / IP Allowlist Rule
                </label>
                <Input
                  value={form.ip_allowlist_rule}
                  onChange={(e) => setForm({ ...form, ip_allowlist_rule: e.target.value })}
                  placeholder="Dynamic Identity-Verified (No VPN Required)"
                  className="border-[#0072FF] bg-workspace-navy text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-extrabold text-[#00C6FF]">
                Security &amp; Access Notes
              </label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Zero-trust browser tunnel — no client VPN software required."
                className="border-[#0072FF] bg-workspace-navy text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="font-extrabold text-white"
                style={{ backgroundColor: '#FF2E9A' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="font-extrabold text-workspace-navy"
                style={{ backgroundColor: '#00C6FF' }}
              >
                {saving ? 'Saving...' : 'Save Access Rule'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}