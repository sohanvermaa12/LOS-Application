export default function MetricCard({ label, value, change, tone }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}><span>•</span></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-change up">↑ {change} <span>vs last month</span></div></div>;
}