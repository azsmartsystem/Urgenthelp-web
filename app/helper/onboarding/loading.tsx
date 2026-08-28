export default function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="card p-8 max-w-sm w-full">
        <div className="h-6 w-32 rounded bg-panel-2 animate-pulse mb-6" />
        <div className="space-y-3">
          <div className="h-12 rounded-xl bg-panel-2 animate-pulse" />
          <div className="h-12 rounded-xl bg-panel-2 animate-pulse" />
          <div className="h-24 rounded-xl bg-panel-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
