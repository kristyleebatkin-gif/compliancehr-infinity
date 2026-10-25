import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { isOpenAccessWindowActive } from '@/lib/roles';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';

import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import OperationsCentre from '@/pages/OperationsCentre';
import LegacyProfileRedirect from '@/components/profile/LegacyProfileRedirect';
import ComplianceHub from '@/pages/ComplianceHub';
import AuditorsPortal from '@/pages/AuditorsPortal';
import DailyBriefing from '@/pages/DailyBriefing';
import Documents from '@/pages/Documents';
import Training from '@/pages/Training';
import Tasks from '@/pages/Tasks';
import SharedTodoDashboard from '@/pages/SharedTodoDashboard';
import Incidents from '@/pages/Incidents';
import IncidentDetail from '@/pages/IncidentDetail';
import IncidentForm from '@/pages/IncidentForm';
import IncidentAnalytics from '@/pages/IncidentAnalytics';
import StaffIncidentPortal from '@/pages/StaffIncidentPortal';
import RiskSubmitPortal from '@/pages/RiskSubmitPortal';
import IssueSubmitPortal from '@/pages/IssueSubmitPortal';
import FeedbackSubmitPortal from '@/pages/FeedbackSubmitPortal';
import Certificates from '@/pages/Certificates';
import Risks from '@/pages/Risks';

import Feedback from '@/pages/Feedback';
import Checklists from '@/pages/Checklists';
import AssetManagement from '@/pages/AssetManagement';
import InvoicingCentre from '@/pages/InvoicingCentre';
import MeetingCentre from '@/pages/MeetingCentre';
import EmergencyResponse from '@/pages/EmergencyResponse';
import ProgramsEvents from '@/pages/ProgramsEvents';
import Communications from '@/pages/Communications';
import IntakeCentre from '@/pages/IntakeCentre';
import ParticipantIntake from '@/pages/ParticipantIntake';
import EmployeeIntake from '@/pages/EmployeeIntake';
import GoalProgress from '@/pages/GoalProgress';
import QualityImprovement from '@/pages/QualityImprovement';
import ReviewDueBoard from '@/pages/ReviewDueBoard';
import KeyContacts from '@/pages/KeyContacts';
import Volunteers from '@/pages/Volunteers';
import Rostering from '@/pages/Rostering';

import VisualBoards from '@/pages/VisualBoards';
import CompanySafe from '@/pages/CompanySafe';
import EquipmentMsds from '@/pages/EquipmentMsds';
import CommunityCouncil from '@/pages/CommunityCouncil';
import ReferralSupport from '@/pages/ReferralSupport';
import NdisProviderPortal from '@/pages/NdisProviderPortal';
import NdisUpdates from '@/pages/NdisUpdates';
import QuoteCentre from '@/pages/QuoteCentre';
import ReceiptHub from '@/pages/ReceiptHub';
import HelpCentre from '@/pages/HelpCentre';
import Notifications from '@/pages/Notifications';
import UserGuides from '@/pages/UserGuides';
import Assistant from '@/pages/Assistant';
import AnalyticsHub from '@/pages/AnalyticsHub';
import HrHub from '@/pages/HrHub';
import CrmHub from '@/pages/CrmHub';
import ProcurementHub from '@/pages/ProcurementHub';
import ProjectsHub from '@/pages/ProjectsHub';
import SuggestionsHub from '@/pages/SuggestionsHub';

import UsersPermissionsHub from '@/pages/UsersPermissionsHub';
import MyProfile from '@/pages/MyProfile';
import MyPayrollPage from '@/pages/MyPayrollPage';
import OurEmployeeProfiles from '@/pages/OurEmployeeProfiles';
import OurParticipantProfiles from '@/pages/OurParticipantProfiles';
import OurEmployeeDetail from '@/pages/OurEmployeeDetail';
import OurParticipantDetail from '@/pages/OurParticipantDetail';
import Landing from '@/pages/Landing';
import PublicComplaint from '@/pages/PublicComplaint';
import PublicVolunteer from '@/pages/PublicVolunteer';
import RoleGate from '@/components/RoleGate';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors (bypassed during the 90-minute open-access window)
  if (authError && !isOpenAccessWindowActive()) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/report-complaint" element={<PublicComplaint />} />
      <Route path="/volunteer-apply" element={<PublicVolunteer />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth/consent" element={<OAuthConsent />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/operations-centre" element={<RoleGate navKey="operations-centre"><OperationsCentre /></RoleGate>} />
          <Route path="/my-work" element={<Navigate to="/my-profile?tab=work" replace />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/my-payroll" element={<MyPayrollPage />} />
          <Route path="/our-employees" element={<RoleGate navKey="our-staff"><OurEmployeeProfiles /></RoleGate>} />
          <Route path="/our-employees/:id" element={<RoleGate navKey="our-staff"><OurEmployeeDetail /></RoleGate>} />
          <Route path="/our-participants" element={<RoleGate navKey="our-participants"><OurParticipantProfiles /></RoleGate>} />
          <Route path="/our-participants/:id" element={<RoleGate navKey="our-participants"><OurParticipantDetail /></RoleGate>} />
          <Route path="/my-documents" element={<Navigate to="/my-profile?tab=documents" replace />} />
          <Route path="/name-tags" element={<Navigate to="/my-profile?tab=name-tags" replace />} />
          <Route path="/staff" element={<LegacyProfileRedirect kind="staff" />} />
          <Route path="/staff/:id" element={<LegacyProfileRedirect kind="staff" />} />
          <Route path="/compliance" element={<RoleGate navKey="compliance"><ComplianceHub /></RoleGate>} />
          <Route path="/auditor-portal" element={<RoleGate navKey="auditor-portal"><AuditorsPortal /></RoleGate>} />
          <Route path="/briefing" element={<RoleGate navKey="daily-briefing"><DailyBriefing /></RoleGate>} />
          <Route path="/documents" element={<RoleGate navKey="documents"><Documents /></RoleGate>} />
          <Route path="/training" element={<RoleGate navKey="training"><Training /></RoleGate>} />
          <Route path="/tasks" element={<RoleGate navKey="tasks"><Tasks /></RoleGate>} />
          <Route path="/shared-to-do" element={<RoleGate navKey="tasks"><SharedTodoDashboard /></RoleGate>} />
          <Route path="/incidents" element={<RoleGate navKey="incidents"><Incidents /></RoleGate>} />
          <Route path="/incidents/submit" element={<RoleGate navKey="incidents"><StaffIncidentPortal /></RoleGate>} />
          <Route path="/risks/submit" element={<RoleGate navKey="risks"><RiskSubmitPortal /></RoleGate>} />
          <Route path="/issues/submit" element={<RoleGate navKey="risks"><IssueSubmitPortal /></RoleGate>} />
          <Route path="/feedback/submit" element={<RoleGate navKey="risks"><FeedbackSubmitPortal /></RoleGate>} />
          <Route path="/incidents/new" element={<RoleGate navKey="incidents"><IncidentForm /></RoleGate>} />
          <Route path="/incident-analytics" element={<RoleGate navKey="incident-analytics"><IncidentAnalytics /></RoleGate>} />
          <Route path="/staff-progress" element={<RoleGate navKey="staff-progress"><LegacyProfileRedirect kind="staff" progress /></RoleGate>} />
          <Route path="/incidents/:id" element={<RoleGate navKey="incidents"><IncidentDetail /></RoleGate>} />
          <Route path="/incidents/:id/edit" element={<RoleGate navKey="incidents"><IncidentForm /></RoleGate>} />
          <Route path="/certificates" element={<RoleGate navKey="certificates"><Certificates /></RoleGate>} />
          <Route path="/participants" element={<LegacyProfileRedirect kind="participant" />} />
          <Route path="/participants/:id" element={<LegacyProfileRedirect kind="participant" />} />
          <Route path="/risks" element={<RoleGate navKey="risks"><Risks /></RoleGate>} />

          <Route path="/feedback" element={<RoleGate navKey="feedback"><Feedback /></RoleGate>} />
          <Route path="/checklists" element={<RoleGate navKey="checklists"><Checklists /></RoleGate>} />
          <Route path="/assets" element={<RoleGate navKey="assets"><AssetManagement /></RoleGate>} />
          <Route path="/invoicing" element={<RoleGate navKey="invoicing"><InvoicingCentre /></RoleGate>} />
          <Route path="/meetings" element={<RoleGate navKey="meetings"><MeetingCentre /></RoleGate>} />
          <Route path="/emergency-response" element={<RoleGate navKey="emergency-response"><EmergencyResponse /></RoleGate>} />
          <Route path="/programs" element={<RoleGate navKey="programs"><ProgramsEvents /></RoleGate>} />
          <Route path="/communications" element={<RoleGate navKey="communications"><Communications /></RoleGate>} />
          <Route path="/audit" element={<RoleGate navKey="audit-log"><Navigate to="/compliance" replace /></RoleGate>} />
          <Route path="/intake" element={<RoleGate navKey="intake"><IntakeCentre /></RoleGate>} />
          <Route path="/intake/participant" element={<RoleGate navKey="intake"><ParticipantIntake /></RoleGate>} />
          <Route path="/intake/employee" element={<RoleGate navKey="intake"><EmployeeIntake /></RoleGate>} />
          <Route path="/goals" element={<RoleGate navKey="goals"><GoalProgress /></RoleGate>} />
          <Route path="/quality" element={<RoleGate navKey="quality"><QualityImprovement /></RoleGate>} />
          <Route path="/review-due" element={<ReviewDueBoard />} />
          <Route path="/contacts" element={<RoleGate navKey="key-contacts"><KeyContacts /></RoleGate>} />
          <Route path="/volunteers" element={<RoleGate navKey="volunteering-placements"><Volunteers /></RoleGate>} />
          <Route path="/roster" element={<RoleGate navKey="rostering"><Rostering /></RoleGate>} />
          <Route path="/visual-boards" element={<RoleGate navKey="visual-boards"><VisualBoards /></RoleGate>} />
          <Route path="/company-safe" element={<RoleGate navKey="company-safe"><CompanySafe /></RoleGate>} />
          <Route path="/equipment-manuals" element={<RoleGate navKey="equipment-manuals"><EquipmentMsds /></RoleGate>} />
          <Route path="/msds" element={<Navigate to="/equipment-manuals" replace />} />
          <Route path="/community-council" element={<RoleGate navKey="community-council"><CommunityCouncil /></RoleGate>} />
          <Route path="/referrals" element={<RoleGate navKey="community-referral"><ReferralSupport /></RoleGate>} />
          <Route path="/ndis-portal" element={<RoleGate navKey="ndis-provider"><NdisProviderPortal /></RoleGate>} />
          <Route path="/ndis-updates" element={<RoleGate navKey="ndis-news"><NdisUpdates /></RoleGate>} />
          <Route path="/quotes" element={<RoleGate navKey="quotes"><QuoteCentre /></RoleGate>} />
          <Route path="/receipts" element={<RoleGate navKey="receipts"><ReceiptHub /></RoleGate>} />
          <Route path="/data-control" element={<Navigate to="/documents" replace />} />
          <Route path="/users" element={<RoleGate navKey="users"><UsersPermissionsHub /></RoleGate>} />
          <Route path="/help" element={<HelpCentre />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/user-guides" element={<RoleGate navKey="user-guides"><UserGuides /></RoleGate>} />
          <Route path="/manual" element={<RoleGate navKey="user-guides"><UserGuides /></RoleGate>} />
          <Route path="/assistant" element={<RoleGate navKey="assistant"><Assistant /></RoleGate>} />
          <Route path="/analytics" element={<RoleGate navKey="analytics"><AnalyticsHub /></RoleGate>} />
          <Route path="/hr" element={<RoleGate navKey="human-resources"><HrHub /></RoleGate>} />
          <Route path="/crm" element={<RoleGate navKey="crm"><CrmHub /></RoleGate>} />
          <Route path="/procurement" element={<RoleGate navKey="procurement"><ProcurementHub /></RoleGate>} />
          <Route path="/projects" element={<RoleGate navKey="projects"><ProjectsHub /></RoleGate>} />
          <Route path="/suggestions" element={<RoleGate navKey="suggestions-hub"><SuggestionsHub /></RoleGate>} />
          {/* Original app paths — aliases kept so original links keep working */}
          <Route path="/key-contacts" element={<RoleGate navKey="key-contacts"><KeyContacts /></RoleGate>} />
          <Route path="/insurance" element={<RoleGate navKey="quotes"><QuoteCentre /></RoleGate>} />
          <Route path="/insurance-finance" element={<RoleGate navKey="quotes"><QuoteCentre /></RoleGate>} />
          <Route path="/volunteering-placements" element={<RoleGate navKey="volunteering-placements"><Volunteers /></RoleGate>} />
          <Route path="/rostering" element={<RoleGate navKey="rostering"><Rostering /></RoleGate>} />
          <Route path="/shifts" element={<RoleGate navKey="rostering"><Rostering /></RoleGate>} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App