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

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const data = await login(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "candidate") {
        navigate("/candidate");
      } else if (data.user.role === "employer") {
        navigate("/employer");
      } else if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        setErr("Unknown user role");
        navigate("/login");
      }
    } catch (error) {
      setErr(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
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
              title={showPw ? "Hide password" : "Show password"}
            />
          </div>

          <div className="option_field">
            <span className="checkbox">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </span>

            <a href="#" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>
          </div>

          <button className="primary_btn" type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Login Now"}
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