export default function WalletLoading() {
  return (
    <div className="min-h-screen bg-surface px-6 py-8 max-w-2xl mx-auto">
      <div className="h-7 w-32 rounded bg-panel-2 animate-pulse" />
      <div className="h-36 rounded-2xl bg-panel-2 animate-pulse mt-6" />
      <div className="h-40 rounded-2xl bg-panel-2 animate-pulse mt-6" />
      <div className="space-y-3 mt-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-panel-2 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
