/**
 * The `AuthLayout` function is a React component that renders a layout for authentication pages with a
 * background image, title, children components, and a footer.
 * @returns The `AuthLayout` component is being returned. It contains a `div` with a class name of
 * "auth-home" and a background image set to the `bg.png` file imported from "../assets/bg.png". Inside
 * this `div`, there is another `div` with a class name of "form_container" that contains the `title`,
 * `children`, and `footer` passed as props
 */
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
