export default function Loading() {
  return (
    <main className="skeleton-page" aria-busy="true" aria-label="Loading page">
      <section className="skeleton-hero">
        <div className="skeleton-stack">
          <div className="skeleton-line skeleton-line-sm" />
          <div className="skeleton-line skeleton-line-xl" />
          <div className="skeleton-line skeleton-line-lg" />
          <div className="skeleton-row">
            <div className="skeleton-button" />
            <div className="skeleton-button" />
          </div>
        </div>
        <div className="skeleton-card">
          <div className="skeleton-line skeleton-line-md" />
          <div className="skeleton-field" />
          <div className="skeleton-field" />
          <div className="skeleton-field tall" />
        </div>
      </section>
      <section className="skeleton-section">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="skeleton-card compact" key={index}>
            <div className="skeleton-line skeleton-line-md" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line-sm" />
          </div>
        ))}
      </section>
    </main>
  );
}
