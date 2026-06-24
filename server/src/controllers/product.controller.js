import mongoose from 'mongoose';
import Product from '../models/product.model.js';

export async function listProducts(req, res) {
  try {
    const { category, cursor } = req.query;
    
    // Max limit is 100 to prevent database overload
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const query = {};

    if (category) {
      query.category = category;
    }

    // Cursor format: "createdAtTimestamp_objectId"
    if (cursor) {
      const parts = cursor.split('_');
      if (parts.length === 2) {
        const lastCreatedAt = new Date(parts[0]);
        const lastId = parts[1];

        if (!isNaN(lastCreatedAt.getTime()) && mongoose.Types.ObjectId.isValid(lastId)) {
          // Get items older than the last one, or same age but smaller ObjectId
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

    // Fetch limit + 1 items so we know if there is a next page
    const products = await Product.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1);

    const hasMore = products.length > limit;
    
    // Remove the extra item used for checking hasMore
    const paginatedProducts = hasMore ? products.slice(0, limit) : products;

    let nextCursor = null;
    if (hasMore && paginatedProducts.length > 0) {
      const lastItem = paginatedProducts[paginatedProducts.length - 1];
      nextCursor = {
        id: lastItem._id.toString(),
        createdAt: lastItem.createdAt.toISOString()
      };
    }

    return res.status(200).json({
      products: paginatedProducts,
      nextCursor,
      hasMore
    });

  } catch (error) {
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
    // Get unique categories from indexed field
    const categories = await Product.distinct('category');
    return res.status(200).json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      error: {
        message: 'Internal server error while fetching categories',
        details: error.message
      }
    });
  }
}
