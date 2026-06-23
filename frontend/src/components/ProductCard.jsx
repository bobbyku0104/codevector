const priceFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export default function ProductCard({ product }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium text-slate-900 line-clamp-2">{product.name}</h3>
          <span className="shrink-0 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
            {priceFmt.format(Number(product.price))}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600 font-medium">{product.category}</span>
          <time dateTime={product.createdAt}>{dateFmt.format(new Date(product.createdAt))}</time>
        </div>
      </div>
      <div className="mt-3 border-t border-slate-100 pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>ID: {product._id || product.id}</span>
        <span>UID: {product.uniqueId}</span>
      </div>
    </div>
  );
}
