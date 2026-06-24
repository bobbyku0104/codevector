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
    timestamps: true, // Auto-generates createdAt and updatedAt
  }
);

// Indexes specified in the requirements:
// 1. Single index on createdAt for sorting (newest first)
productSchema.index({ createdAt: -1 });

// 2. Single index on category for filtering
productSchema.index({ category: 1 });

// Keyset pagination index optimization:
// 3. Compound index for global newest first cursor pagination
productSchema.index({ createdAt: -1, _id: -1 });

// 4. Compound index for category filtered newest first cursor pagination
productSchema.index({ category: 1, createdAt: -1, _id: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
