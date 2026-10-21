import { base44 } from '@/api/base44Client';
import { preparePersonalProfileAccess } from '@/lib/personalProfileAccess';

export default async function loadPersonalProfile(user) {
  if (!user?.id || !user.email) {
    throw new Error('Your account could not be loaded. Please sign in again.');
  }
  // The server resolves these links exclusively from the signed-in account.
  const { staffId, participantId } = await preparePersonalProfileAccess();
  const participant = user.role === 'Participant';
  const primaryId = participant ? participantId : staffId;
  const entity = participant ? base44.entities.ParticipantProfile : base44.entities.StaffProfile;
  const [prof, pProf] = await Promise.all([
    primaryId ? entity.get(primaryId) : Promise.resolve(null),
    !participant && participantId ? base44.entities.ParticipantProfile.get(participantId) : Promise.resolve(null),
  ]);
  return { user, prof, pProf };
}