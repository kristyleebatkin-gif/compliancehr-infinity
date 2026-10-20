import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

export default function AccountApprovalGate() {
  const { user, checkUserAuth, logout, isLoadingAuth } = useAuth();
  const blocked = ['Rejected', 'Suspended', 'Archived'].includes(user?.account_status);
  return <div className="flex min-h-screen items-center justify-center bg-background p-6">
    <section className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 text-center text-card-foreground">
      <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
      <h1 className="text-xl font-bold">{blocked ? 'Account access unavailable' : 'Awaiting management approval'}</h1>
      <p className="text-sm text-muted-foreground">{blocked ? `Your account is ${user.account_status.toLowerCase()}. Contact management to review your access.` : 'Your account must be accepted by a Provider Administrator or Management before you can enter the app. Existing non-provider accounts also require approval under the new policy.'}</p>
      <div className="flex justify-center gap-2"><Button variant="outline" disabled={isLoadingAuth} onClick={checkUserAuth}>Check approval</Button><Button onClick={() => logout()}>Sign out</Button></div>
    </section>
  </div>;
}