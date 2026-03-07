import "./dashboard.css";

export default function Topbar({ title }) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="dashboard-topbar">
      <div>
        <p className="dashboard-breadcrumb">Pages / {title}</p>
        <h1>{title}</h1>
      </div>

      <div className="dashboard-user">
        {user?.email || "User"}
      </div>
    </header>
  );
}