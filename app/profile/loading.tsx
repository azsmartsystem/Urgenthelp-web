export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-surface px-6 py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-panel-2 animate-pulse" />
        <div className="h-6 w-32 rounded bg-panel-2 animate-pulse" />
      </div>
      <div className="space-y-4 mt-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-panel-2 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
