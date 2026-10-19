import React from 'react';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, ShieldOff } from 'lucide-react';

export default function ParticipantApprovalToggle({ participant, onUpdate }) {
  const { isAdmin } = useRole();
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);

  if (!isAdmin || !participant) return null;
  const approved = participant.admin_approved === true;

  const toggle = async () => {
    setBusy(true);
    try {
      await base44.entities.ParticipantProfile.update(participant.id, { admin_approved: !approved });
      toast({
        title: approved ? 'Removed from staff view' : 'Approved for staff view',
        description: approved
          ? 'Support workers can no longer see this participant.'
          : 'Support workers can now see this participant.',
      });
      if (onUpdate) onUpdate();
    } catch (e) {
      toast({ title: 'Update failed', description: e.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant={approved ? 'secondary' : 'outline'} onClick={toggle} disabled={busy}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : approved
        ? <ShieldCheck className="h-4 w-4 text-green-600" />
        : <ShieldOff className="h-4 w-4" />}
      {approved ? 'Approved for staff' : 'Approve for staff'}
    </Button>
  );
}