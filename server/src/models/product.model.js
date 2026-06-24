import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Sorting index
productSchema.index({ createdAt: -1 });

// Filtering index
productSchema.index({ category: 1 });

// Keyset pagination optimized compound indexes
productSchema.index({ createdAt: -1, _id: -1 });
productSchema.index({ category: 1, createdAt: -1, _id: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
