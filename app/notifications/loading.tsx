export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-surface px-6 py-8 max-w-2xl mx-auto">
      <div className="h-7 w-40 rounded bg-panel-2 animate-pulse mb-5" />
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-2xl bg-panel-2 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
