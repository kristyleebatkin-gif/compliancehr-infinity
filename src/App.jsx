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
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import GitHubActivity from '@/pages/GitHubActivity';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Staff from '@/pages/Staff';
import ComplianceHub from '@/pages/ComplianceHub';
import Documents from '@/pages/Documents';
import Training from '@/pages/Training';
import Tasks from '@/pages/Tasks';
import Incidents from '@/pages/Incidents';
import IncidentDetail from '@/pages/IncidentDetail';
import IncidentForm from '@/pages/IncidentForm';
import Certificates from '@/pages/Certificates';
import Participants from '@/pages/Participants';
import Risks from '@/pages/Risks';
import ShiftScheduling from '@/pages/ShiftScheduling';
import Feedback from '@/pages/Feedback';
import Checklists from '@/pages/Checklists';
import AssetManagement from '@/pages/AssetManagement';
import InvoicingCentre from '@/pages/InvoicingCentre';
import MeetingCentre from '@/pages/MeetingCentre';
import EmergencyResponse from '@/pages/EmergencyResponse';
import ProgramsEvents from '@/pages/ProgramsEvents';
import Communications from '@/pages/Communications';
import AuditCentre from '@/pages/AuditCentre';
import IntakeCentre from '@/pages/IntakeCentre';
import ParticipantIntake from '@/pages/ParticipantIntake';
import EmployeeIntake from '@/pages/EmployeeIntake';
import GoalProgress from '@/pages/GoalProgress';
import QualityImprovement from '@/pages/QualityImprovement';
import Surveys from '@/pages/Surveys';
import KeyContacts from '@/pages/KeyContacts';
import Volunteers from '@/pages/Volunteers';
import Rostering from '@/pages/Rostering';
import VisualBoards from '@/pages/VisualBoards';
import CompanySafe from '@/pages/CompanySafe';
import EquipmentManuals from '@/pages/EquipmentManuals';
import InsuranceFinance from '@/pages/InsuranceFinance';
import ReceiptHub from '@/pages/ReceiptHub';
import DataControl from '@/pages/DataControl';
import Landing from '@/pages/Landing';
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

  // Handle authentication errors
  if (authError) {
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
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/staff" element={<RoleGate navKey="staff"><Staff /></RoleGate>} />
          <Route path="/compliance" element={<RoleGate navKey="compliance"><ComplianceHub /></RoleGate>} />
          <Route path="/documents" element={<RoleGate navKey="documents"><Documents /></RoleGate>} />
          <Route path="/training" element={<RoleGate navKey="training"><Training /></RoleGate>} />
          <Route path="/tasks" element={<RoleGate navKey="tasks"><Tasks /></RoleGate>} />
          <Route path="/incidents" element={<RoleGate navKey="incidents"><Incidents /></RoleGate>} />
          <Route path="/incidents/new" element={<RoleGate navKey="incidents"><IncidentForm /></RoleGate>} />
          <Route path="/incidents/:id" element={<RoleGate navKey="incidents"><IncidentDetail /></RoleGate>} />
          <Route path="/incidents/:id/edit" element={<RoleGate navKey="incidents"><IncidentForm /></RoleGate>} />
          <Route path="/certificates" element={<RoleGate navKey="certificates"><Certificates /></RoleGate>} />
          <Route path="/participants" element={<RoleGate navKey="participants"><Participants /></RoleGate>} />
          <Route path="/risks" element={<RoleGate navKey="risks"><Risks /></RoleGate>} />
          <Route path="/shifts" element={<RoleGate navKey="shifts"><ShiftScheduling /></RoleGate>} />
          <Route path="/feedback" element={<RoleGate navKey="feedback"><Feedback /></RoleGate>} />
          <Route path="/checklists" element={<RoleGate navKey="checklists"><Checklists /></RoleGate>} />
          <Route path="/assets" element={<RoleGate navKey="assets"><AssetManagement /></RoleGate>} />
          <Route path="/invoicing" element={<RoleGate navKey="invoicing"><InvoicingCentre /></RoleGate>} />
          <Route path="/meetings" element={<RoleGate navKey="meetings"><MeetingCentre /></RoleGate>} />
          <Route path="/emergency-response" element={<RoleGate navKey="emergency-response"><EmergencyResponse /></RoleGate>} />
          <Route path="/programs" element={<RoleGate navKey="programs"><ProgramsEvents /></RoleGate>} />
          <Route path="/communications" element={<RoleGate navKey="communications"><Communications /></RoleGate>} />
          <Route path="/audit" element={<RoleGate navKey="audit-log"><AuditCentre /></RoleGate>} />
          <Route path="/intake" element={<RoleGate navKey="intake"><IntakeCentre /></RoleGate>} />
          <Route path="/intake/participant" element={<RoleGate navKey="intake"><ParticipantIntake /></RoleGate>} />
          <Route path="/intake/employee" element={<RoleGate navKey="intake"><EmployeeIntake /></RoleGate>} />
          <Route path="/goals" element={<RoleGate navKey="goals"><GoalProgress /></RoleGate>} />
          <Route path="/quality" element={<RoleGate navKey="quality"><QualityImprovement /></RoleGate>} />
          <Route path="/surveys" element={<RoleGate navKey="surveys"><Surveys /></RoleGate>} />
          <Route path="/contacts" element={<RoleGate navKey="key-contacts"><KeyContacts /></RoleGate>} />
          <Route path="/volunteers" element={<RoleGate navKey="volunteering-placements"><Volunteers /></RoleGate>} />
          <Route path="/roster" element={<RoleGate navKey="rostering"><Rostering /></RoleGate>} />
          <Route path="/visual-boards" element={<RoleGate navKey="visual-boards"><VisualBoards /></RoleGate>} />
          <Route path="/company-safe" element={<RoleGate navKey="company-safe"><CompanySafe /></RoleGate>} />
          <Route path="/equipment-manuals" element={<RoleGate navKey="equipment-manuals"><EquipmentManuals /></RoleGate>} />
          <Route path="/insurance" element={<RoleGate navKey="insurance-finance"><InsuranceFinance /></RoleGate>} />
          <Route path="/receipts" element={<RoleGate navKey="receipts"><ReceiptHub /></RoleGate>} />
          <Route path="/data-control" element={<RoleGate navKey="data-control"><DataControl /></RoleGate>} />
          <Route path="/github" element={<GitHubActivity />} />
          {/* Original app paths — aliases kept so original links keep working */}
          <Route path="/key-contacts" element={<RoleGate navKey="key-contacts"><KeyContacts /></RoleGate>} />
          <Route path="/insurance-finance" element={<RoleGate navKey="insurance-finance"><InsuranceFinance /></RoleGate>} />
          <Route path="/volunteering-placements" element={<RoleGate navKey="volunteering-placements"><Volunteers /></RoleGate>} />
          <Route path="/rostering" element={<RoleGate navKey="rostering"><Rostering /></RoleGate>} />
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