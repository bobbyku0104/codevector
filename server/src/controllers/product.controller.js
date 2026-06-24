import mongoose from 'mongoose';
import Product from '../models/product.model.js';

/**
 * Explanation of why Cursor Pagination is better than Skip/Limit (Offset Pagination):
 * 
 * 1. Performance at Scale (O(1) vs O(N)):
 *    Offset pagination (using .skip(offset).limit(limit)) forces MongoDB to read and discard all 
 *    records up to the offset count. For offset = 150,000, the database has to scan 150,000 documents, 
 *    causing response times to degrade drastically (O(N)).
 *    Cursor pagination uses indexed values (createdAt and _id) to jump directly to the next set of rows (O(1)).
 * 
 * 2. Accuracy under Concurrent Updates (Drift Prevention):
 *    If new products are inserted while a user is paginating:
 *    - With Offset: The items shift down, causing the user to see duplicate products on the next page.
 *    - With Cursor: The cursor points to the exact point in the timeline. Newly inserted items appear 
 *      "behind" the cursor, guaranteeing that no items are skipped or duplicated.
 */

export async function listProducts(req, res) {
  try {
    const { category, cursor } = req.query;
    
    // Parse and sanitize limit (max 100 to prevent DOS / resource exhaustion)
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const query = {};

    // 1. Apply category filtering if requested
    if (category) {
      query.category = category;
    }

    // 2. Apply cursor boundaries for pagination
    if (cursor) {
      const parts = cursor.split('_');
      if (parts.length === 2) {
        const lastCreatedAt = new Date(parts[0]);
        const lastId = parts[1];

        // Ensure variables are valid types before querying
        if (!isNaN(lastCreatedAt.getTime()) && mongoose.Types.ObjectId.isValid(lastId)) {
          query.$or = [
            { createdAt: { $lt: lastCreatedAt } },
            {
              createdAt: lastCreatedAt,
              _id: { $lt: new mongoose.Types.ObjectId(lastId) }
            }
          ];
        }
      }
    }

    // Fetch limit + 1 products to determine if there is a next page (hasMore)
    const products = await Product.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1);

    const hasMore = products.length > limit;
    
    // Slice off the extra document used for the hasMore check
    const paginatedProducts = hasMore ? products.slice(0, limit) : products;

    // Generate the next cursor from the last item on the page
    let nextCursor = null;
    if (hasMore && paginatedProducts.length > 0) {
      const lastItem = paginatedProducts[paginatedProducts.length - 1];
      nextCursor = {
        id: lastItem._id.toString(),
        createdAt: lastItem.createdAt.toISOString()
      };
    }

    // Return response in the exact format required
    return res.status(200).json({
      products: paginatedProducts,
      nextCursor,
      hasMore
    });

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching products:', error);
    return res.status(500).json({
      error: {
        message: 'Internal server error while fetching products',
        details: error.message
      }
    });
  }
}

export async function listCategories(req, res) {
  try {
    // Get distinct categories directly from the indexed field
    const categories = await Product.distinct('category');
    return res.status(200).json({ categories });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      error: {
        message: 'Internal server error while fetching categories',
        details: error.message
      }
    });
  }
}
