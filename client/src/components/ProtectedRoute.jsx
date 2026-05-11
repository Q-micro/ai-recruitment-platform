/**
 * The ProtectedRoute function checks the user's role and redirects them to specific routes based on
 * their role or to the login page if not logged in.
 * @returns The `ProtectedRoute` component returns the `children` if the user is logged in and has the
 * allowed role. If the user is not logged in, it redirects to the "/login" page. If the user is logged
 * in but does not have the allowed role, it redirects based on the user's role - admin to
 * "/admin/dashboard", candidate to "/candidate/dashboard", employer to "/employer/register
 */
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRole, children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    if (user.role === "admin")
      return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "candidate")
      return <Navigate to="/candidate/dashboard" replace />;
    if (user.role === "employer")
      return <Navigate to="/employer/register" replace />;

    return <Navigate to="/login" replace />;
  }

  return children;
}
