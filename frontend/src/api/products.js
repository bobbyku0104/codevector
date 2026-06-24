const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

const MOCK_CATEGORIES = ['Electronics', 'Books', 'Home & Kitchen', 'Toys & Games', 'Sports & Outdoors'];

// Generate mock items for testing when backend is offline
const MOCK_PRODUCTS = [];
let mockId = 1;
const now = Date.now();
MOCK_CATEGORIES.forEach((cat) => {
  for (let i = 1; i <= 30; i++) {
    MOCK_PRODUCTS.push({
      id: `mock-id-${mockId++}`,
      uniqueId: `mock-uuid-${mockId}`,
      name: `Mock ${cat} Item #${i}`,
      category: cat,
      price: (15 + Math.random() * 200).toFixed(2),
      createdAt: new Date(now - i * 3600000 * 24).toISOString(),
      updatedAt: new Date(now - i * 3600000 * 24).toISOString(),
    });
  }
});
MOCK_PRODUCTS.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

// Fetches one keyset page of products
export async function fetchProducts({ limit = 20, cursor = null, category = null } = {}) {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  
  if (cursor) {
    const cursorStr = typeof cursor === 'object' && cursor.id && cursor.createdAt
      ? `${cursor.createdAt}_${cursor.id}`
      : cursor;
    params.set('cursor', cursorStr);
  }
  
  if (category) {
    params.set('category', category);
  }

  try {
    const res = await fetch(`${BASE}/products?${params.toString()}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
    }
    return await res.json();
  } catch (error) {
    console.warn('Backend offline, using mock products.', error);
    
    const filtered = category 
      ? MOCK_PRODUCTS.filter(p => p.category === category)
      : MOCK_PRODUCTS;

    // Simulate local cursor pagination
    let startIndex = 0;
    if (cursor) {
      const cursorStr = typeof cursor === 'object' ? `${cursor.createdAt}_${cursor.id}` : cursor;
      const parts = cursorStr.split('_');
      const lastId = parts[1];
      
      const index = filtered.findIndex(p => p.id === lastId);
      if (index !== -1) {
        startIndex = index + 1;
      }
    }

    const paginated = filtered.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < filtered.length;
    const nextItem = paginated[paginated.length - 1];

    return {
      products: paginated,
      nextCursor: hasMore && nextItem ? { id: nextItem.id, createdAt: nextItem.createdAt } : null,
      hasMore,
    };
  }
}

export async function fetchCategories() {
  try {
    const res = await fetch(`${BASE}/products/categories`);
    if (!res.ok) throw new Error('Failed to load categories');
    const { categories } = await res.json();
    return categories;
  } catch (error) {
    console.warn('Backend offline, using mock categories.', error);
    return MOCK_CATEGORIES;
  }
}
