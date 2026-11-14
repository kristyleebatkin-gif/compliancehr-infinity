import React from 'react';
import { Wallet, ShieldCheck, UserCheck, FileCheck2, Link2 } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRole } from '@/lib/useRole';
import BillingExceptionBoard from '@/components/workflows/BillingExceptionBoard';
import IncidentFollowUpGate from '@/components/workflows/IncidentFollowUpGate';
import RosterEligibilityGate from '@/components/workflows/RosterEligibilityGate';
import DocumentReleaseGate from '@/components/workflows/DocumentReleaseGate';

const BILLING_ROLES = ['admin', 'Provider Administrator', 'Finance & Accounts Officer', 'Administration'];


export default function ConnectedWorkflows() {
  const { role } = useRole();
  const canBill = BILLING_ROLES.includes(role);

  return (
    <ModuleShell
      icon={Link2}
      moduleKey="connected-workflows"
      title="Connected Workflows"
      subtitle="Review linked records and evidence gaps. Preview checks require end-to-end verification."
    >
      <p role="status" className="my-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-blue-950">
        Read-only preview. New invoice, corrective-action, acknowledgement and revision actions are disabled pending identity, transaction and version verification. Existing module workflows remain available.
      </p>
      <Tabs defaultValue={canBill ? 'billing' : 'incident'} className="mt-1">
        <TabsList className="flex w-full flex-wrap gap-1">
          {canBill && (
            <TabsTrigger value="billing" className="gap-1">
              <Wallet className="h-3.5 w-3.5" /> Billing exceptions
            </TabsTrigger>
          )}
          <TabsTrigger value="incident" className="gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Incident follow-up
          </TabsTrigger>
          <TabsTrigger value="eligibility" className="gap-1">
            <UserCheck className="h-3.5 w-3.5" /> Shift eligibility
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1">
            <FileCheck2 className="h-3.5 w-3.5" /> Document release
          </TabsTrigger>
        </TabsList>

        {canBill && (
          <TabsContent value="billing" className="mt-3">
            <BillingExceptionBoard canBill={false} />
          </TabsContent>
        )}
        <TabsContent value="incident" className="mt-3">
          <IncidentFollowUpGate canAct={false} />
        </TabsContent>
        <TabsContent value="eligibility" className="mt-3">
          <RosterEligibilityGate />
        </TabsContent>
        <TabsContent value="documents" className="mt-3">
          <DocumentReleaseGate canGovern={false} />
        </TabsContent>
      </Tabs>
    </ModuleShell>
  );
}