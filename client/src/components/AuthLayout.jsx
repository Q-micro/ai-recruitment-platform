import bg from "../assets/bg.png";
import "../pages/Auth.css";

export default function AuthLayout({ title, children, footer }) {
  return (
    <div className="auth-home" style={{ backgroundImage: `url(${bg})` }}>
      <div className="form_container">
        <h2>{title}</h2>
        {children}
        {footer}
      </div>
    </div>
  );
}