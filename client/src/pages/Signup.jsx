import { useState } from "react";
import { signup } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import bg from "../assets/bg.png";
import "./Auth.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await signup(name, email, password, role);
      navigate("/login");
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-home" style={{ backgroundImage: `url(${bg})` }}>
      <div className="form_container">
        <h2>Signup</h2>

        <form onSubmit={handleSignup}>
          <div className="input_box">
            <input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <i className="uil uil-user user" />
          </div>

          <div className="input_box">
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="candidate">Candidate</option>
              <option value="employer">Employer</option>
            </select>
            <i className="uil uil-briefcase role" />
          </div>

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
              placeholder="Create password"
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

          <button className="primary_btn" type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Signup Now"}
          </button>

          {err && <div className="error_text">{err}</div>}

          <div className="login_signup">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}