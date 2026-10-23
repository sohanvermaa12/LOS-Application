export default function PageHeader({ eyebrow, title, description, action, marquee = false, className = "" }) {
  const marqueeText = description;

  return (
    <div className={`page-header${className ? ` ${className}` : ""}`}>
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {!marquee && <p>{description}</p>}
        {marquee && (
          <div className="page-header-marquee" role="note" aria-label={marqueeText}>
            <div className="page-header-marquee-window" aria-hidden="true">
              <div className="page-header-marquee-track">
                <span>{marqueeText}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {action}
    </div>
  );
}