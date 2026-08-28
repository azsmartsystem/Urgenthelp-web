export default function HelperProfileLoading() {
  return (
    <div className="min-h-screen bg-surface px-4 sm:px-6 py-6 max-w-2xl mx-auto">
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 rounded-2xl bg-panel-2 animate-pulse shrink-0" />
        <div className="flex-1">
          <div className="h-6 w-40 rounded bg-panel-2 animate-pulse" />
          <div className="h-4 w-28 rounded bg-panel-2 animate-pulse mt-2" />
          <div className="h-6 w-32 rounded-pill bg-panel-2 animate-pulse mt-3" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-panel-2 animate-pulse" />
        ))}
      </div>
      <div className="h-24 rounded-2xl bg-panel-2 animate-pulse mt-6" />
      <div className="h-14 rounded-2xl bg-panel-2 animate-pulse mt-8" />
    </div>
  );
}
