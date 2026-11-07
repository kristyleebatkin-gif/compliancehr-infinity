import React, { lazy } from 'react';
import { AlertTriangle, BriefcaseBusiness, CalendarClock, CalendarDays, ClipboardList, Contact, FolderCheck, GraduationCap, Heart, IdCard, LayoutGrid, MapPin, MessagesSquare, Newspaper, Receipt, ShieldAlert, Siren, Target, ThumbsUp, UserRound } from 'lucide-react';
import KeyContacts from '@/pages/KeyContacts';
import HrHub from '@/pages/HrHub';
import IntakeCentre from '@/pages/IntakeCentre';
import VisualBoards from '@/pages/VisualBoards';
import GoalProgress from '@/pages/GoalProgress';
import Rostering from '@/pages/Rostering';
import CommunityCouncil from '@/pages/CommunityCouncil';
import ProgramsEvents from '@/pages/ProgramsEvents';
import Incidents from '@/pages/Incidents';
import Risks from '@/pages/Risks';
import EmergencyResponse from '@/pages/EmergencyResponse';
import NdisUpdates from '@/pages/NdisUpdates';
import ReceiptHub from '@/pages/ReceiptHub';
import Communications from '@/pages/Communications';
import Training from '@/pages/Training';
import Feedback from '@/pages/Feedback';
import DocumentationChecklist from '@/components/profile/DocumentationChecklist';
import ProfileCommDiary from '@/components/communications/ProfileCommDiary';
import ProfileTodoList from '@/components/communications/ProfileTodoList';
import IntakeCaseWorkflow from '@/components/intake/IntakeCaseWorkflow';
import ParticipantDocumentRegister from '@/components/documents/ParticipantDocumentRegister';

const NameTags = lazy(() => import('@/pages/NameTags'));

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
    {
      key: 'communications',
      label: 'Communications & Diary',
      Icon: MessagesSquare,
      content: employee ? (
        <Communications {...props} />
      ) : (
        <div className="space-y-4">
          <ProfileCommDiary participant={profile} />
          <Communications {...props} />
        </div>
      ),
    },
    { key: 'feedback', label: 'Feedback & Surveys', Icon: ThumbsUp, content: <Feedback {...props} /> },
    { key: 'visual', label: 'Visual & Communication Boards', Icon: LayoutGrid, content: <VisualBoards {...props} /> },
    { key: 'ndis', label: 'NDIS Updates', Icon: Newspaper, content: <NdisUpdates {...props} /> },
    { key: 'goals', label: 'Goal Progress', Icon: Target, content: <GoalProgress {...ourProps} /> },
    { key: 'tasks', label: 'Tasks & To-Do', Icon: ClipboardList, content: <ProfileTodoList person={profile} /> },
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
    ...(employee ? [{ key: 'receipts', label: 'Receipt Hub', Icon: Receipt, content: <ReceiptHub {...props} /> }] : []),
    ...(employee ? [{ key: 'training', label: 'Training Centre', Icon: GraduationCap, content: <Training {...props} /> }] : []),
    ...(employee ? [{ key: 'name-tag', label: 'Staff Name Tag', Icon: IdCard, content: <NameTags {...props} /> }] : []),
    { key: 'documentation', label: 'Documentation', Icon: FolderCheck, content: <DocumentationChecklist kind={kind} profile={profile} /> },
  ];
}