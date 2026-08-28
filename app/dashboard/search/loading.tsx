export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-surface px-4 sm:px-6 py-6 max-w-2xl mx-auto">
      <div className="h-12 rounded-2xl bg-panel-2 animate-pulse" />
      <div className="flex gap-2 mt-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-24 rounded-pill bg-panel-2 animate-pulse" />
        ))}
      </div>
      <div className="space-y-3 mt-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-panel-2 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
