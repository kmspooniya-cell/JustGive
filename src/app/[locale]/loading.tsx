export default function Loading() {
  return (
    <main className="page-main loading-shell" aria-busy="true" aria-label="Loading page">
      <div className="skeleton-line large" />
      <div className="skeleton-line loading-copy" />
      <div className="skeleton-line loading-copy short" />
      <div className="skeleton-block" />
    </main>
  );
}
