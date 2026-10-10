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
import Intake from '@/pages/Intake';
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
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/compliance" element={<ComplianceHub />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/training" element={<Training />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/risks" element={<Risks />} />
          <Route path="/shifts" element={<ShiftScheduling />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/checklists" element={<Checklists />} />
          <Route path="/assets" element={<AssetManagement />} />
          <Route path="/invoicing" element={<InvoicingCentre />} />
          <Route path="/meetings" element={<MeetingCentre />} />
          <Route path="/emergency-response" element={<EmergencyResponse />} />
          <Route path="/programs" element={<ProgramsEvents />} />
          <Route path="/communications" element={<Communications />} />
          <Route path="/audit" element={<AuditCentre />} />
          <Route path="/intake" element={<Intake />} />
          <Route path="/goals" element={<GoalProgress />} />
          <Route path="/quality" element={<QualityImprovement />} />
          <Route path="/surveys" element={<Surveys />} />
          <Route path="/contacts" element={<KeyContacts />} />
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/roster" element={<Rostering />} />
          <Route path="/visual-boards" element={<VisualBoards />} />
          <Route path="/company-safe" element={<CompanySafe />} />
          <Route path="/equipment-manuals" element={<EquipmentManuals />} />
          <Route path="/insurance" element={<InsuranceFinance />} />
          <Route path="/receipts" element={<ReceiptHub />} />
          <Route path="/data-control" element={<DataControl />} />
          <Route path="/github" element={<GitHubActivity />} />
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