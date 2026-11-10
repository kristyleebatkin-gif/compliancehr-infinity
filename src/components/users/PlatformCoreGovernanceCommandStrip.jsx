import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  UserCheck,
  AlertTriangle,
  Download,
  Plus,
  Search,
  Lock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';
import { logUserAction } from '@/lib/actionLog';

const STATUS_BADGE_STYLES = {
  Active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Invited: 'bg-blue-50 text-blue-800 border-blue-200',
  Provisioning: 'bg-amber-50 text-amber-800 border-amber-200',
  Suspended: 'bg-red-50 text-red-800 border-red-200',
  Ended: 'bg-slate-100 text-slate-700 border-slate-300',
  Archived: 'bg-slate-100 text-slate-700 border-slate-300',
};

export function computePlatformCoreMetrics(tenants = [], memberships = []) {
  const activeTenants = tenants.filter((t) => (t.status || 'Active') === 'Active').length;
  const activeMembers = memberships.filter((m) => m.status === 'Active').length;
  const pendingInvites = memberships.filter((m) => m.status === 'Invited').length;
  const suspendedCount =
    memberships.filter((m) => m.status === 'Suspended').length +
    tenants.filter((t) => t.status === 'Suspended').length;
  const mfaEnforcedCount = memberships.filter((m) => m.mfa_enforced !== false).length;
  const mfaRate = memberships.length
    ? Math.round((mfaEnforcedCount / memberships.length) * 100)
    : 100;

  return {
    activeTenants,
    activeMembers,
    pendingInvites,
    suspendedCount,
    mfaRate,
    totalMemberships: memberships.length,
  };
}

export default function PlatformCoreGovernanceCommandStrip() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const activeOrgId =
    user?.organisation_id ||
    user?.tenant_id ||
    user?.data?.organisation_id ||
    user?.data?.tenant_id ||
    'org-primary';

  const { data: tenants = [], isLoading: loadingTenants } = useQuery({
    queryKey: ['platform-core-tenants', activeOrgId],
    queryFn: async () => {
      const res = await base44.entities.Tenant.list('-created_date', 50);
      return Array.isArray(res) ? res : res?.items || [];
    },
  });

  const { data: memberships = [], isLoading: loadingMemberships } = useQuery({
    queryKey: ['platform-core-memberships', activeOrgId],
    queryFn: async () => {
      const res = await base44.entities.TenantMembership.list('-created_date', 100);
      return Array.isArray(res) ? res : res?.items || [];
    },
  });

  const transitionMutation = useMutation({
    mutationFn: async ({ membership, nextStatus }) => {
      const updated = await base44.entities.TenantMembership.update(membership.id, {
        status: nextStatus,
        organisation_id: membership.organisation_id || activeOrgId,
        tenant_id: membership.tenant_id || activeOrgId,
      });
      await logUserAction(`Status changed to ${nextStatus}`, 'TenantMembership', {
        record_id: membership.id,
        record_title: membership.user_email || membership.user_id,
        previous_value: membership.status,
        new_value: nextStatus,
        module: 'Platform Core',
        details: `Transitioned inside organisation ${membership.organisation_id || activeOrgId}`,
      });
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-core-memberships'] });
      setSelectedMembership(null);
    },
  });

  const createMembershipMutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        organisation_id: activeOrgId,
        tenant_id: activeOrgId,
        user_id: formData.user_id.trim(),
        user_email: formData.user_email.trim(),
        membership_role: formData.membership_role,
        status: 'Invited',
        mfa_enforced: true,
        starts_on: new Date().toISOString().slice(0, 10),
        invited_by_user_id: user?.id || 'admin',
        notes: formData.notes || '',
      };
      const created = await base44.entities.TenantMembership.create(payload);
      await logUserAction('Create', 'TenantMembership', {
        record_id: created?.id || '',
        record_title: payload.user_email,
        new_value: payload.membership_role,
        module: 'Platform Core',
        details: `Assigned role ${payload.membership_role} in organisation ${activeOrgId}`,
      });
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-core-memberships'] });
      setShowInviteForm(false);
    },
  });

  const metrics = useMemo(
    () => computePlatformCoreMetrics(tenants, memberships),
    [tenants, memberships]
  );

  const filteredMemberships = useMemo(() => {
    const q = search.trim().toLowerCase();
    return memberships.filter((m) => {
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(m.user_email || '').toLowerCase().includes(q) ||
        String(m.user_id || '').toLowerCase().includes(q) ||
        String(m.membership_role || '').toLowerCase().includes(q) ||
        String(m.organisation_id || '').toLowerCase().includes(q)
      );
    });
  }, [memberships, search, statusFilter]);

  const handleExportCsv = () => {
    const rows = filteredMemberships.map((m) => ({
      organisation_id: m.organisation_id || activeOrgId,
      tenant_id: m.tenant_id || activeOrgId,
      user_id: m.user_id || '',
      user_email: m.user_email || '',
      membership_role: m.membership_role || '',
      status: m.status || '',
      mfa_enforced: m.mfa_enforced !== false ? 'Yes' : 'No',
      starts_on: m.starts_on || '',
      ends_on: m.ends_on || '',
    }));
    downloadCsv('platform-core-tenant-memberships.csv', rows);
  };

  return (
    <section
      aria-label="Platform Core Multi-Tenant Governance Command Grid"
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-panel"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A2B6D] text-white">
            <Building2 className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#0A2B6D]">
                Platform Core — Organisation &amp; Tenant Governance
              </h2>
              <Badge variant="outline" className="border-slate-300 bg-slate-50 text-xs font-bold text-[#0A2B6D]">
                Scope: {activeOrgId}
              </Badge>
            </div>
            <p className="text-xs text-slate-600">
              Row-level isolation, MFA enforcement, and statutory membership lifecycle controls.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="min-h-10 border-slate-300 text-xs font-bold text-[#0A2B6D]"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export Governance Matrix (CSV)
          </Button>
          <Button
            size="sm"
            onClick={() => setShowInviteForm((prev) => !prev)}
            className="min-h-10 bg-[#0A2B6D] text-xs font-bold text-white hover:bg-[#0072FF]"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Assign Organisation Membership
          </Button>
        </div>
      </div>

      {/* Row 1: Executive KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Active Organisations
            </span>
            <Building2 className="h-4 w-4 text-[#0072FF]" />
          </div>
          <div className="mt-1.5 text-2xl font-extrabold text-[#0A2B6D]">
            {loadingTenants ? '…' : metrics.activeTenants}
          </div>
          <p className="mt-0.5 text-xs text-slate-600">
            Scoped via <code className="font-mono text-xs">organisation_id</code> RLS
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Active Org Memberships
            </span>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-1.5 text-2xl font-extrabold text-[#0A2B6D]">
            {loadingMemberships ? '…' : metrics.activeMembers}
          </div>
          <p className="mt-0.5 text-xs text-emerald-700 font-semibold">
            {metrics.pendingInvites} pending invitation(s)
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              MFA Enforcement Rate
            </span>
            <Lock className="h-4 w-4 text-[#0A2B6D]" />
          </div>
          <div className="mt-1.5 text-2xl font-extrabold text-[#0A2B6D]">
            {metrics.mfaRate}%
          </div>
          <p className="mt-0.5 text-xs text-slate-600">
            Essential Eight maturity baseline
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Suspended / Attention Queue
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-1.5 text-2xl font-extrabold text-[#0A2B6D]">
            {metrics.suspendedCount}
          </div>
          <p className="mt-0.5 text-xs text-slate-600">
            Immediate access revocation enforced
          </p>
        </div>
      </div>

      {/* Optional Add Membership Form */}
      {showInviteForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            createMembershipMutation.mutate({
              user_id: String(fd.get('user_id') || ''),
              user_email: String(fd.get('user_email') || ''),
              membership_role: String(fd.get('membership_role') || 'Support Worker'),
              notes: String(fd.get('notes') || ''),
            });
          }}
          className="grid grid-cols-1 gap-3 rounded-xl border border-sky-200 bg-sky-50/50 p-4 sm:grid-cols-4"
        >
          <div>
            <label htmlFor="pm-user-id" className="block text-xs font-bold text-[#0A2B6D]">
              User ID *
            </label>
            <Input
              id="pm-user-id"
              name="user_id"
              required
              placeholder="usr_..."
              className="mt-1 h-10 bg-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="pm-user-email" className="block text-xs font-bold text-[#0A2B6D]">
              User Email *
            </label>
            <Input
              id="pm-user-email"
              name="user_email"
              type="email"
              required
              placeholder="staff@provider.org.au"
              className="mt-1 h-10 bg-white text-sm"
            />
          </div>
          <div>
            <label htmlFor="pm-role" className="block text-xs font-bold text-[#0A2B6D]">
              Organisation Role *
            </label>
            <select
              id="pm-role"
              name="membership_role"
              defaultValue="Support Worker"
              className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-[#0A2B6D]"
            >
              <option value="Provider Administrator">Provider Administrator</option>
              <option value="Compliance Manager">Compliance Manager</option>
              <option value="Human Resources Manager">Human Resources Manager</option>
              <option value="Finance & Accounts Officer">Finance &amp; Accounts Officer</option>
              <option value="Quality & Improvement Manager">Quality &amp; Improvement Manager</option>
              <option value="Rostering Coordinator">Rostering Coordinator</option>
              <option value="Team Leader">Team Leader</option>
              <option value="Support Worker">Support Worker</option>
              <option value="Auditor">Auditor</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button
              type="submit"
              disabled={createMembershipMutation.isPending}
              className="min-h-10 bg-[#0A2B6D] text-xs font-bold text-white hover:bg-[#0072FF]"
            >
              {createMembershipMutation.isPending ? 'Saving…' : 'Save Membership'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowInviteForm(false)}
              className="min-h-10 text-xs"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Row 2 & 3: Filter Bar + High-Density TenantMembership Register */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            aria-label="Search organisation memberships"
            placeholder="Search by email, user ID, role, or org ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter memberships by status">
          {['ALL', 'Active', 'Invited', 'Suspended', 'Ended'].map((st) => (
            <Button
              key={st}
              type="button"
              size="sm"
              variant={statusFilter === st ? 'default' : 'outline'}
              onClick={() => setStatusFilter(st)}
              className="min-h-9 text-xs font-bold"
            >
              {st === 'ALL' ? 'All Statuses' : st}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
              <th className="py-2.5 px-3.5">Member</th>
              <th className="py-2.5 px-3.5">Organisation ID</th>
              <th className="py-2.5 px-3.5">Assigned Role</th>
              <th className="py-2.5 px-3.5">MFA</th>
              <th className="py-2.5 px-3.5">Lifecycle Status</th>
              <th className="py-2.5 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredMemberships.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-slate-600">
                  No organisation memberships match the current filter. Use “Assign Organisation Membership” above to provision scoped access.
                </td>
              </tr>
            ) : (
              filteredMemberships.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3.5 font-semibold text-[#0A2B6D]">
                    <div>{m.user_email || m.user_id}</div>
                    <div className="text-xs font-normal text-slate-500">ID: {m.user_id}</div>
                  </td>
                  <td className="py-2.5 px-3.5 font-mono text-xs text-slate-700">
                    {m.organisation_id || m.tenant_id || activeOrgId}
                  </td>
                  <td className="py-2.5 px-3.5 text-sm text-slate-800">{m.membership_role}</td>
                  <td className="py-2.5 px-3.5">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {m.mfa_enforced !== false ? 'Enforced' : 'Optional'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold ${
                        STATUS_BADGE_STYLES[m.status] || STATUS_BADGE_STYLES.Active
                      }`}
                    >
                      {m.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMembership(m)}
                      className="min-h-9 text-xs font-bold text-[#0A2B6D]"
                    >
                      Inspect / Transition
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-Over Detail & Lifecycle Transition Drawer */}
      {selectedMembership && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Membership Governance Detail Drawer"
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs"
        >
          <div className="flex h-full w-full max-w-md flex-col justify-between border-l border-slate-200 bg-white p-5 shadow-2xl">
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#0A2B6D]">
                    Membership Governance Record
                  </h3>
                  <p className="text-xs text-slate-600">
                    Audited status transitions &amp; tenant isolation metadata
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Close membership drawer"
                  onClick={() => setSelectedMembership(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <dl className="grid grid-cols-1 gap-3 text-sm">
                <div className="rounded-lg border border-slate-200 p-3">
                  <dt className="text-xs font-bold uppercase text-slate-500">Member Email / ID</dt>
                  <dd className="mt-0.5 font-bold text-[#0A2B6D]">
                    {selectedMembership.user_email || selectedMembership.user_id}
                  </dd>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <dt className="text-xs font-bold uppercase text-slate-500">Organisation Scope</dt>
                  <dd className="mt-0.5 font-mono text-xs font-bold text-slate-800">
                    {selectedMembership.organisation_id || selectedMembership.tenant_id || activeOrgId}
                  </dd>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <dt className="text-xs font-bold uppercase text-slate-500">Assigned Role</dt>
                  <dd className="mt-0.5 font-semibold text-slate-800">
                    {selectedMembership.membership_role}
                  </dd>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <dt className="text-xs font-bold uppercase text-slate-500">Lifecycle Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold ${
                        STATUS_BADGE_STYLES[selectedMembership.status] || STATUS_BADGE_STYLES.Active
                      }`}
                    >
                      {selectedMembership.status}
                    </span>
                  </dd>
                </div>
              </dl>

              <div className="space-y-2 border-t border-slate-200 pt-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
                  Audited Lifecycle Transitions
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Active', 'Suspended', 'Ended'].map((nextStatus) => (
                    <Button
                      key={nextStatus}
                      size="sm"
                      variant={selectedMembership.status === nextStatus ? 'default' : 'outline'}
                      disabled={
                        selectedMembership.status === nextStatus || transitionMutation.isPending
                      }
                      onClick={() =>
                        transitionMutation.mutate({
                          membership: selectedMembership,
                          nextStatus,
                        })
                      }
                      className="min-h-9 text-xs font-bold"
                    >
                      Mark {nextStatus}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 text-right">
              <Button
                variant="outline"
                onClick={() => setSelectedMembership(null)}
                className="min-h-10 text-xs font-bold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}