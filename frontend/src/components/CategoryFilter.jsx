export default function CategoryFilter({ categories, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="category-select" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Filter by Category
      </label>
      <select
        id="category-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
