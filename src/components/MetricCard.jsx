export default function MetricCard({ label, value, change, tone = 'ink', icon: Icon }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>
        {Icon ? <Icon size={17} /> : <span>•</span>}
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {change ? (
        <div className="metric-change up">
          ↑ {change} <span>vs last month</span>
        </div>
      ) : null}
    </div>
  );
}