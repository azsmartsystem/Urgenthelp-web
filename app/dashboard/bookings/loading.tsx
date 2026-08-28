export default function BookingsLoading() {
  return (
    <div className="min-h-screen bg-surface px-6 py-8 max-w-2xl mx-auto">
      <div className="h-7 w-36 rounded bg-panel-2 animate-pulse mb-5" />
      <div className="flex gap-2 mb-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-20 rounded-pill bg-panel-2 animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-panel-2 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
