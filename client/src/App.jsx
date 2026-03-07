import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployerDashboard from "./pages/employer/EmployerDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* app opens on login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* dashboards */}
        <Route path="/candidate" element={<CandidateDashboard />} />
        <Route path="/employer" element={<EmployerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* optional jobs page */}
        <Route path="/jobs" element={<Jobs />} />

        {/* anything unknown goes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;