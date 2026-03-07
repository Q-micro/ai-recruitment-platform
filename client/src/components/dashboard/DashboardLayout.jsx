import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./dashboard.css";

export default function DashboardLayout({ role, title, children }) {
  return (
    <div className="dashboard-page">
      <Sidebar role={role} />

      <div className="dashboard-main">
        <Topbar title={title} />

        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}