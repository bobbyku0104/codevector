/**
 * Empty state — shown when a filter yields no products.
 * A clear, friendly dead-end beats a blank screen.
 */
export default function EmptyState({ category }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-700">No products found</p>
      <p className="mt-1 text-sm text-slate-500">
        {category ? `Nothing in “${category}” yet.` : 'There are no products to show.'}
      </p>
    </div>
  );
}
