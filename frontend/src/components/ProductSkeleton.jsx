/**
 * Loading skeleton — shown while a page is in flight.
 * Mirrors the ProductCard layout so the grid doesn't jump when real data
 * arrives (no layout shift). Pure CSS pulse via Tailwind's animate-pulse.
 */
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-14 animate-pulse rounded-full bg-slate-200" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default function ProductSkeleton({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}
