/**
 * The `StatCard` function in JavaScript React renders a card component displaying a title, value, and
 * optional subtitle.
 * @returns The `StatCard` component is being returned. It renders a div with the class "stat-card"
 * containing a title, value, and optional subtitle based on the props passed to it.
 */
import "./dashboard.css";

export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="stat-card">
      <p className="stat-title">{title}</p>
      <h2 className="stat-value">{value}</h2>
      {subtitle && <p className="stat-subtitle">{subtitle}</p>}
    </div>
  );
}
