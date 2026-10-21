import React, { lazy } from 'react';
import { AlertTriangle, BriefcaseBusiness, CalendarClock, CalendarDays, ClipboardList, Contact, GraduationCap, Heart, IdCard, LayoutGrid, MapPin, MessagesSquare, Newspaper, Receipt, ShieldAlert, Siren, Target, ThumbsUp, UserRound } from 'lucide-react';

const KeyContacts = lazy(() => import('@/pages/KeyContacts'));
const HrHub = lazy(() => import('@/pages/HrHub'));
const IntakeCentre = lazy(() => import('@/pages/IntakeCentre'));
const VisualBoards = lazy(() => import('@/pages/VisualBoards'));
const GoalProgress = lazy(() => import('@/pages/GoalProgress'));
const Rostering = lazy(() => import('@/pages/Rostering'));
const CommunityCouncil = lazy(() => import('@/pages/CommunityCouncil'));
const ProgramsEvents = lazy(() => import('@/pages/ProgramsEvents'));
const Incidents = lazy(() => import('@/pages/Incidents'));
const Risks = lazy(() => import('@/pages/Risks'));
const EmergencyResponse = lazy(() => import('@/pages/EmergencyResponse'));
const NdisUpdates = lazy(() => import('@/pages/NdisUpdates'));
const ReceiptHub = lazy(() => import('@/pages/ReceiptHub'));
const Communications = lazy(() => import('@/pages/Communications'));
const Training = lazy(() => import('@/pages/Training'));
const Feedback = lazy(() => import('@/pages/Feedback'));
const NameTags = lazy(() => import('@/pages/NameTags'));
const ProfileCommDiary = lazy(() => import('@/components/communications/ProfileCommDiary'));
const IntakeCaseWorkflow = lazy(() => import('@/components/intake/IntakeCaseWorkflow'));
const ParticipantDocumentRegister = lazy(() => import('@/components/documents/ParticipantDocumentRegister'));

export default function OurProfileModuleList({ kind, profile, details, approvedParticipants, ourView = false }) {
  const employee = kind === 'staff';
  const props = { embedded: true, profile, profileKind: kind };
  // In 'Our' profiles Key Personnel contacts are view only.
  const contactProps = ourView ? { ...props, readOnly: true } : props;
  // In 'Our' profiles rostering is limited to the person's own shifts and
  // approved participants, and progress notes/reports live in normal profiles.
  const ourProps = ourView ? { ...props, ourView: true } : props;
  return [
    ...(details ? [{ key: 'details', label: 'Profile & Data', Icon: UserRound, content: details }] : []),
    ...(employee && approvedParticipants ? [{ key: 'participants', label: 'Approved Participant Profiles', Icon: Heart, content: approvedParticipants }] : []),
    { key: 'personnel', label: 'Key Personnel', Icon: Contact, content: <KeyContacts {...contactProps} /> },
    ...(employee ? [{ key: 'hr', label: 'HR Hub', Icon: BriefcaseBusiness, content: <HrHub {...props} /> }] : []),
    { key: 'intake', label: 'Intake Centre', Icon: ClipboardList, content: employee ? <IntakeCentre {...props} /> : <IntakeCaseWorkflow intakeType="Participant" profile={profile} profileView="documents" /> },
    { key: 'visual', label: 'Visual Boards', Icon: LayoutGrid, content: <VisualBoards {...props} /> },
    { key: 'goals', label: 'Goal Progress', Icon: Target, content: <GoalProgress {...ourProps} /> },
    ...(!employee ? [
      { key: 'progress-notes', label: 'Progress Notes', Icon: ClipboardList, content: <ParticipantDocumentRegister participant={profile} documentType="Progress Notes" /> },
      { key: 'progress-reports', label: 'Progress Reports', Icon: ClipboardList, content: <ParticipantDocumentRegister participant={profile} documentType="Progress Reports" /> },
    ] : []),
    { key: 'roster', label: 'Rostering', Icon: CalendarClock, content: <Rostering {...ourProps} /> },
    { key: 'community', label: 'Community', Icon: MapPin, content: <CommunityCouncil {...props} /> },
    { key: 'programs', label: 'Programs', Icon: CalendarDays, content: <ProgramsEvents {...props} /> },
    { key: 'incidents', label: 'Incidents', Icon: AlertTriangle, content: <Incidents {...props} /> },
    { key: 'risks', label: 'Risks', Icon: ShieldAlert, content: <Risks {...props} /> },
    { key: 'emergency', label: 'Emergency Response', Icon: Siren, content: <EmergencyResponse {...props} /> },
    { key: 'ndis', label: 'NDIS Updates', Icon: Newspaper, content: <NdisUpdates {...props} /> },
    ...(employee ? [{ key: 'receipts', label: 'Receipt Hub', Icon: Receipt, content: <ReceiptHub {...props} /> }] : []),
    { key: 'communications', label: employee ? 'Communication Centre' : 'Communication Log', Icon: MessagesSquare, content: employee ? <Communications {...props} /> : <ProfileCommDiary participant={profile} /> },
    ...(employee ? [{ key: 'training', label: 'Training Centre', Icon: GraduationCap, content: <Training {...props} /> }] : []),
    { key: 'feedback', label: 'Feedback', Icon: ThumbsUp, content: <Feedback {...props} /> },
    ...(employee ? [{ key: 'name-tag', label: 'Staff Name Tag', Icon: IdCard, content: <NameTags {...props} /> }] : []),
  ];
}