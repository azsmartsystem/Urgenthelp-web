// Shown automatically by Next.js while the dashboard page's Supabase
// queries are still resolving.
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="h-[65px] border-b border-line bg-panel" />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="h-3 w-28 rounded bg-panel-2 animate-pulse" />
        <div className="h-7 w-40 rounded bg-panel-2 animate-pulse mt-2" />
        <div className="h-14 rounded-2xl bg-panel-2 animate-pulse mt-6" />
        <div className="h-20 rounded-2xl bg-panel-2 animate-pulse mt-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-panel-2 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
