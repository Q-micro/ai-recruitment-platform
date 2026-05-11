/**
 * The Login component in this React application handles user authentication, including form inputs for
 * email and password, login button functionality, Google login integration, error handling, and
 * navigation based on user role.
 */

import { useState } from "react";
import { login } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import bg from "../assets/bg.png";
import whiteLogo from "../assets/whitelogo.png";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function goByRole(role) {
    if (role === "candidate") navigate("/candidate");
    else if (role === "employer") navigate("/employer");
    else if (role === "admin") navigate("/admin");
    else setErr("Unknown user role");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const data = await login(cleanEmail, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      goByRole(data.user.role);
    } catch (error) {
      setErr(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = "http://localhost:3001/auth/google";
  }

  return (
    <div className="auth-home" style={{ backgroundImage: `url(${bg})` }}>
      <div className="form_container">
        <img className="auth-logo" src={whiteLogo} alt="Company logo" />
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <div className="input_box">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <i className="uil uil-envelope-alt email" />
          </div>

          <div className="input_box">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i className="uil uil-lock password" />
            <i
              className={`uil ${showPw ? "uil-eye" : "uil-eye-slash"} pw_hide`}
              onClick={() => setShowPw((v) => !v)}
            />
          </div>

          <button className="primary_btn" type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Login Now"}
          </button>

          <button
            className="primary_btn google_btn"
            type="button"
            onClick={handleGoogleLogin}
          >
            <span className="google_icon">
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.2C29.3 35.1 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.5l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
                />
              </svg>
            </span>
            Continue with Google
          </button>

          {err && <div className="error_text">{err}</div>}

          <div className="login_signup">
            Don&apos;t have an account? <Link to="/signup">Signup</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
