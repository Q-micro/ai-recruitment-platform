/* This code snippet is a React component named `Sidebar` that renders a sidebar navigation menu based
on the user's role. Here's a breakdown of what the code does: */
import { NavLink } from "react-router-dom";
import "./dashboard.css";

export default function Sidebar({ role }) {
  const adminLinks = [
    { to: "/admin", label: "Dashboard" },
    { to: "/jobs", label: "Jobs" },
  ];

  const employerLinks = [
    { to: "/employer", label: "Dashboard" },
    { to: "/employer/create-job", label: "Create Job" },
    { to: "/employer/applications", label: "Applications" },
  ];

  const links = role === "admin" ? adminLinks : employerLinks;

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-logo">HireHub</div>

      <nav className="dashboard-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? "dashboard-link active" : "dashboard-link"
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
