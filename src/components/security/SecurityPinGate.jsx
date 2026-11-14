import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import useWorkspacePin from '@/components/security/useWorkspacePin';
import SecurityPinShell from '@/components/security/SecurityPinShell';
import SecurityPinSetup from '@/components/security/SecurityPinSetup';
import SecurityPinUnlock from '@/components/security/SecurityPinUnlock';
import SecurityPinDialog from '@/components/security/SecurityPinDialog';

const formatDate = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function SecurityPinGate({ workspace, title, subtitle, children }) {
  const pin = useWorkspacePin(workspace);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (pin.loading) {
    return (
      <SecurityPinShell title={title} subtitle={subtitle}>
        <div className="flex items-center gap-2.5 rounded-2xl border border-header-foreground/20 bg-workspace-navy/40 p-5 text-header-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-xs font-bold">Checking dashboard security…</p>
        </div>
      </SecurityPinShell>
    );
  }

  if (!pin.record) {
    return (
      <SecurityPinShell title={title} subtitle={subtitle}>
        <SecurityPinSetup
          workspaceLabel={title}
          busy={pin.busy}
          error={pin.error}
          notice={pin.notice}
          onCreate={pin.create}
        />
      </SecurityPinShell>
    );
  }

  if (!pin.unlocked) {
    return (
      <SecurityPinShell title={title} subtitle={subtitle}>
        <SecurityPinUnlock
          workspaceLabel={title}
          busy={pin.busy}
          error={pin.error}
          notice={pin.notice}
          lockedUntil={pin.lockedUntil}
          lastChanged={formatDate(pin.record.last_changed_at)}
          attemptsLeft={pin.attemptsLeft}
          resetSentTo={pin.resetSentTo}
          onUnlock={pin.unlock}
          onRequestReset={pin.requestReset}
          onConfirmReset={pin.confirmReset}
        />
      </SecurityPinShell>
    );
  }

  const openSecurityPin = () => {
    pin.clearMessages();
    setSettingsOpen(true);
  };

  return (
    <>
      {typeof children === 'function' ? children({ openSecurityPin }) : children}
      <SecurityPinDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        pin={pin}
        workspaceLabel={title}
      />
    </>
  );
}