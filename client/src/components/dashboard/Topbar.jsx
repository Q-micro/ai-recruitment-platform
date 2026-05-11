/**
 * The Topbar component in a React application displays the page title and user email or "User" if no
 * user is logged in.
 * @returns The Topbar component is being returned. It consists of a header element with two div
 * elements inside. The first div contains a paragraph with the class "dashboard-breadcrumb" and an h1
 * element displaying the title prop passed to the component. The second div contains a paragraph
 * displaying the user's email if available from local storage, or "User" if not.
 */
import "./dashboard.css";

export default function Topbar({ title }) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="dashboard-topbar">
      <div>
        <p className="dashboard-breadcrumb">Pages / {title}</p>
        <h1>{title}</h1>
      </div>

      <div className="dashboard-user">{user?.email || "User"}</div>
    </header>
  );
}
