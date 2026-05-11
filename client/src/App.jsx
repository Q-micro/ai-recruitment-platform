// This is the main application component for a React application. It sets up routing for different pages and components based on user roles (candidate, employer, admin). It uses React Router for navigation and HeroUI for styling. The component also includes protected routes to ensure that only authorized users can access certain pages.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";

import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import CandidateProfile from "./pages/candidate/CandidateProfile";
import CandidateJobs from "./pages/candidate/CandidateJobs";
import CandidateApplications from "./pages/candidate/CandidateApplications";
import CandidateCareerServices from "./pages/candidate/CandidateCareerServices";
import CandidateNotifications from "./pages/candidate/CandidateNotifications";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCandidates from "./pages/admin/AdminCandidates.jsx";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminSales from "./pages/admin/AdminSales";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPlacholder from "./components/AdminPlaceholder";
import AdminAtsCvGenerator from "./pages/admin/AdminAtsCvGenerator.jsx";

import EmployerLayout from "./components/EmployerLayout";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import EmployerJobs from "./pages/employer/EmployerJobs";
import EmployerCreateJob from "./pages/employer/EmployerCreateJob";
import EmployerApplications from "./pages/employer/EmployerApplications";
import EmployerRegister from "./pages/employer/EmployerRegister";

import ProtectedRoute from "./components/ProtectedRoute";
import GoogleSuccess from "./pages/GoogleSuccess";

/* This code snippet defines the main application component for a React application. It sets up routing
for different pages and components based on user roles (candidate, employer, admin) using React
Router for navigation and HeroUI for styling. */

function App() {
  return (
    <HeroUIProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/jobs" element={<Jobs />} />
          <Route path="/auth/google/success" element={<GoogleSuccess />} />

          <Route
            path="/candidate"
            element={
              <ProtectedRoute allowedRole="candidate">
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute allowedRole="candidate">
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/profile"
            element={
              <ProtectedRoute allowedRole="candidate">
                <CandidateProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/jobs"
            element={
              <ProtectedRoute allowedRole="candidate">
                <CandidateJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/applications"
            element={
              <ProtectedRoute allowedRole="candidate">
                <CandidateApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/career-services"
            element={
              <ProtectedRoute allowedRole="candidate">
                <CandidateCareerServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/notifications"
            element={
              <ProtectedRoute allowedRole="candidate">
                <CandidateNotifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer"
            element={
              <ProtectedRoute allowedRole="employer">
                <EmployerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="register" replace />} />
            <Route path="dashboard" element={<EmployerDashboard />} />
            <Route path="jobs" element={<EmployerJobs />} />
            <Route path="jobs/create" element={<EmployerCreateJob />} />
            <Route path="applications" element={<EmployerApplications />} />
            <Route path="register" element={<EmployerRegister />} />
            <Route path="settings" element={<div>Settings Page</div>} />
          </Route>

          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/candidates"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminCandidates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/companies"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminCompanies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sales"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminSales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/placeholder"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminPlacholder title="Placeholder Page" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/ats-cv-generator"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminAtsCvGenerator />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </HeroUIProvider>
  );
}

export default App;
