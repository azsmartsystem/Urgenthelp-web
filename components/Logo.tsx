// Brand mark — "Urgent Help". Rebranded per client instruction from the
// approved ALLinHELP visual system: same navy/blue/cyan mark treatment,
// new wordmark.
export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 font-extrabold text-ink text-[17px] tracking-tight ${className}`}>
      <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-brand to-ai flex items-center justify-center text-white font-black text-sm shadow-[0_6px_16px_-4px_rgba(37,99,235,0.55)]">
        UH
      </div>
      Urgent Help
    </div>
  );
}
