/* This code snippet is a React component named `GoogleSuccess`. It is designed to handle the
successful authentication flow after a user logs in with Google. Here's a breakdown of what the code
does: */
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleSuccess() {
  const navigate = useNavigate();
  const hasRun = useRef(false); // prevents double execution

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    try {
      const params = new URLSearchParams(window.location.search);

      const token = params.get("token");
      const userRaw = params.get("user");

      console.log("GOOGLE TOKEN:", token);
      console.log("GOOGLE USER RAW:", userRaw);

      if (!token || !userRaw) {
        navigate("/login", { replace: true });
        return;
      }

      const user = JSON.parse(decodeURIComponent(userRaw));

      // Save auth
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect by role
      if (user.role === "candidate") {
        navigate("/candidate", { replace: true });
        return;
      }

      if (user.role === "employer") {
        navigate("/employer", { replace: true });
        return;
      }

      if (user.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }

      // fallback
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("GoogleSuccess error:", err);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h3>Signing you in...</h3>
    </div>
  );
}
