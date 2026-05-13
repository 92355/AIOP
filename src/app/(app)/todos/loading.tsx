export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-xl bg-zinc-900" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-20 rounded-2xl bg-zinc-900" />
      ))}
    </div>
  );
}
