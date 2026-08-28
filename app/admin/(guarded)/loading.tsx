// Applies automatically to every page under app/admin/(guarded)/ — Next.js
// renders this as the Suspense fallback for whichever admin page is
// loading, while the sidebar (in layout.tsx, outside this boundary) stays
// mounted and interactive. One shared skeleton rather than 13 near-
// identical ones, since almost every admin page is a heading + a table.
export default function AdminLoading() {
  return (
    <div>
      <div className="h-7 w-48 rounded bg-panel-2 animate-pulse mb-6" />
      <div className="card overflow-hidden">
        <div className="h-10 bg-surface border-b border-line" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 border-t border-line flex items-center px-4 gap-4">
            <div className="h-3 w-24 rounded bg-panel-2 animate-pulse" />
            <div className="h-3 w-32 rounded bg-panel-2 animate-pulse" />
            <div className="h-3 w-16 rounded bg-panel-2 animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
