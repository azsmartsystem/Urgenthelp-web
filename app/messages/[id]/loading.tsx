export default function ConversationLoading() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="h-[65px] border-b border-line bg-panel flex items-center px-6 gap-3">
        <div className="w-8 h-8 rounded-lg bg-panel-2 animate-pulse" />
        <div className="h-4 w-32 rounded bg-panel-2 animate-pulse" />
      </div>
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-3">
        <div className="h-10 w-2/3 rounded-2xl bg-panel-2 animate-pulse" />
        <div className="h-10 w-1/2 rounded-2xl bg-panel-2 animate-pulse ml-auto" />
        <div className="h-10 w-3/5 rounded-2xl bg-panel-2 animate-pulse" />
      </div>
    </div>
  );
}
