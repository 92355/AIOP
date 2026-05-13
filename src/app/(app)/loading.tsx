export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-36 rounded-2xl bg-zinc-900" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-zinc-900" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-64 rounded-2xl bg-zinc-900" />
        <div className="h-64 rounded-2xl bg-zinc-900" />
      </div>
    </div>
  );
}
