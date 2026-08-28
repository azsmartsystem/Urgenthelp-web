export default function HelperLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="h-[65px] border-b border-line bg-panel" />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="h-3 w-24 rounded bg-panel-2 animate-pulse" />
        <div className="h-7 w-36 rounded bg-panel-2 animate-pulse mt-2" />
        <div className="h-16 rounded-2xl bg-panel-2 animate-pulse mt-6" />
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="h-20 rounded-2xl bg-panel-2 animate-pulse" />
          <div className="h-20 rounded-2xl bg-panel-2 animate-pulse" />
        </div>
        <div className="space-y-3 mt-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-panel-2 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
