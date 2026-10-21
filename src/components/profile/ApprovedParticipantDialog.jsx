import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ParticipantReadOnlyDetails from '@/components/profile/ParticipantReadOnlyDetails';

export default function ApprovedParticipantDialog({ participantId, onClose }) {
  const { data, isPending, error } = useQuery({
    queryKey: ['approved-participant-detail', participantId],
    queryFn: async () => {
      const page = await base44.entities.ParticipantProfile.filter({ id: participantId, admin_approved: true }, { limit: 1 });
      return page.items[0] || null;
    },
    enabled: Boolean(participantId),
  });
  return <Dialog open={Boolean(participantId)} onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader><DialogTitle>{data?.full_name || 'Approved participant'}</DialogTitle><DialogDescription>Shared organisation-wide with employees. View-only access.</DialogDescription></DialogHeader>
      {isPending ? <p role="status">Loading participant...</p> : error ? <p role="alert" className="text-danger">{error.message}</p> : data ? <ParticipantReadOnlyDetails participant={data} /> : <p>This participant is no longer approved or available.</p>}
    </DialogContent>
  </Dialog>;
}