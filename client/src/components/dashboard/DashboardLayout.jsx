/**
 * The `DashboardLayout` function renders a dashboard page layout with a sidebar, topbar, and content
 * area in a React application.
 * @returns The `DashboardLayout` component is being returned. It consists of a structure with a
 * sidebar, topbar, and content section, where the `role`, `title`, and `children` props are passed to
 * the respective components.
 */
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./dashboard.css";

export default function DashboardLayout({ role, title, children }) {
  return (
    <div className="dashboard-page">
      <Sidebar role={role} />

      <div className="dashboard-main">
        <Topbar title={title} />

        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}
