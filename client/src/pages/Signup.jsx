/**
 * The Signup component in this React application handles user registration by capturing and validating
 * user input before sending it to the backend for signup.
 */
import { useState } from "react";
import { signup } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import bg from "../assets/bg.png";
import "./Auth.css";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    role: "candidate",
    email: "",
    password: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSignup(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const cleanName = form.name.trim();
      const cleanEmail = form.email.trim().toLowerCase();
      const cleanPassword = form.password;

      if (!cleanName) return setErr("Name is required");
      if (!cleanEmail) return setErr("Email is required");
      if (!cleanPassword) return setErr("Password is required");
      if (cleanPassword.length < 8)
        return setErr("Password must be at least 8 characters");

      const hasLetter = /[a-zA-Z]/.test(cleanPassword);
      const hasNumber = /\d/.test(cleanPassword);

      if (!hasLetter || !hasNumber) {
        return setErr(
          "Password must include at least one letter and one number",
        );
      }

      const payload = {
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role: form.role,
      };

      await signup(payload);
      navigate("/login");
    } catch (error) {
      setErr(error?.response?.data?.error || error?.message || "Signup failed");
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
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <i className="uil uil-user user" />
          </div>

          <div className="input_box">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="candidate">Candidate / Job seeker</option>
              <option value="employer">Employer</option>
            </select>
            <i className="uil uil-briefcase role" />
          </div>

          <div className="input_box">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <i className="uil uil-envelope-alt email" />
          </div>

          <div className="input_box">
            <input
              type={showPw ? "text" : "password"}
              name="password"
              placeholder="Create password"
              value={form.password}
              onChange={handleChange}
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
            {loading ? "Please wait..." : "Create Account"}
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
