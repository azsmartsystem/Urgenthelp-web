export default function RequestLoading() {
  return (
    <div className="min-h-screen bg-surface px-6 py-8 max-w-lg mx-auto">
      <div className="h-8 w-8 rounded-lg bg-panel-2 animate-pulse mb-4" />
      <div className="h-6 w-40 rounded bg-panel-2 animate-pulse" />
      <div className="flex gap-1.5 mt-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full bg-panel-2 animate-pulse" />
        ))}
      </div>
      <div className="space-y-4 mt-8">
        <div className="h-14 rounded-2xl bg-panel-2 animate-pulse" />
        <div className="h-14 rounded-2xl bg-panel-2 animate-pulse" />
        <div className="h-24 rounded-2xl bg-panel-2 animate-pulse" />
      </div>
    </div>
  );
}
