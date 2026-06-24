import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import Product from '../src/models/product.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codevector';
const TOTAL_PRODUCTS = 200_000;
const BATCH_SIZE = 1000;
const CATEGORIES = ['Electronics', 'Books', 'Home & Kitchen', 'Toys & Games', 'Sports & Outdoors', 'Fashion', 'Beauty & Personal Care', 'Automotive', 'Home Improvement', 'Grocery'];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    console.log('Clearing old products...');
    await Product.deleteMany({});
    console.log('Cleared old products.');

    console.log(`Generating ${TOTAL_PRODUCTS} products in batches of ${BATCH_SIZE}...`);

    let insertedCount = 0;
    const startTime = Date.now();

    for (let i = 0; i < TOTAL_PRODUCTS / BATCH_SIZE; i++) {
      const productsBatch = [];

      for (let j = 0; j < BATCH_SIZE; j++) {
        const createdAt = faker.date.recent({ days: 30 });
        const updatedAt = new Date(createdAt.getTime() + faker.number.int({ min: 0, max: 24 * 60 * 60 * 1000 }));

        productsBatch.push({
          uniqueId: faker.string.uuid(),
          name: faker.commerce.productName(),
          category: faker.helpers.arrayElement(CATEGORIES),
          price: parseFloat(faker.commerce.price({ min: 5, max: 2000, dec: 2 })),
          createdAt,
          updatedAt,
        });
      }

      await Product.insertMany(productsBatch);
      insertedCount += BATCH_SIZE;

      if (insertedCount % 10_000 === 0) {
        console.log(`Seeded ${insertedCount} / ${TOTAL_PRODUCTS} products...`);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Seeding finished in ${duration} seconds!`);
    console.log(`Total seeded: ${insertedCount}`);

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

seedDatabase();
