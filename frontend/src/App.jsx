import { useCallback, useEffect, useState } from 'react';
import { fetchProducts, fetchCategories } from './api/products.js';
import ProductCard from './components/ProductCard.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import ProductSkeleton from './components/ProductSkeleton.jsx';
import EmptyState from './components/EmptyState.jsx';

const PAGE_SIZE = 20;

export default function App() {
  const [products, setProducts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  // Load categories on mount
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Fetch products page. If reset is true, start over (e.g., when category changes)
  const loadPage = useCallback(
    async (reset = false) => {
      if (loading) return;
      setLoading(true);
      setError(null);

      const targetCursor = reset ? null : cursor;

      try {
        const data = await fetchProducts({
          limit: PAGE_SIZE,
          cursor: targetCursor,
          category: category || null,
        });

        setProducts((prev) => (reset ? data.products : [...prev, ...data.products]));
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [loading, cursor, category]
  );

  // Load initial page and reload when category changes
  useEffect(() => {
    setProducts([]);
    setCursor(null);
    setHasMore(true);
    setInitialLoading(true);
    
    let isMounted = true;
    const fetchInitial = async () => {
      try {
        const data = await fetchProducts({
          limit: PAGE_SIZE,
          cursor: null,
          category: category || null,
        });
        if (isMounted) {
          setProducts(data.products);
          setCursor(data.nextCursor);
          setHasMore(data.hasMore);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Something went wrong');
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    };
    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, [category]);

  const isEmpty = !initialLoading && products.length === 0 && !error;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950">CodeVector Product Catalog</h1>
            <p className="text-xs text-slate-500 mt-0.5">Showing newest products first using cursor pagination</p>
          </div>
          <div>
            <CategoryFilter categories={categories} value={category} onChange={setCategory} />
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Skeletons on initial load */}
          {initialLoading && <ProductSkeleton count={12} />}

          {/* Product cards */}
          {!initialLoading && products.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}

          {/* Skeletons when fetching more */}
          {!initialLoading && loading && <ProductSkeleton count={4} />}
        </div>

        {/* Empty State */}
        {isEmpty && <EmptyState category={category} />}

        {/* Load More Button Section */}
        {hasMore && !initialLoading && (
          <div className="mt-12 text-center">
            <button
              onClick={() => loadPage(false)}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow transition-all hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Load More Products'}
            </button>
          </div>
        )}

        {/* Footer/End of feed message */}
        {!hasMore && products.length > 0 && (
          <p className="mt-12 text-center text-sm font-medium text-slate-400">
            No more products to display. You have caught up!
          </p>
        )}
      </main>
    </div>
  );
}
