import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import env from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import routes from './src/routes/index.js';

const app = express();

// Trust proxy for PaaS environments (such as Render)
app.set('trust proxy', 1);

// Enable CORS for frontend requests
app.use(
  cors({
    origin: env.corsOrigins,
    methods: ['GET'],
  })
);

// Standard body parser middleware
app.use(express.json({ limit: '100kb' }));

// Mount product and category routes under /api
app.use('/api', routes);

// Base route info page
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CodeVector Product API',
    endpoints: {
      products: '/api/products',
      categories: '/api/products/categories',
      health: '/api/health',
    },
  });
});

// Custom 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
    },
  });
});

// Global central error handler middleware
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

// Boot the database and start listening
async function startServer() {
  // Initialize MongoDB connection
  await connectDB();

  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  // Graceful shutdown handler
  const shutdown = async (signal) => {
    // eslint-disable-next-line no-console
    console.log(`\n${signal} received. Draining connections and shutting down...`);
    server.close(async () => {
      await mongoose.disconnect();
      // eslint-disable-next-line no-console
      console.log('MongoDB disconnected. Process terminated.');
      process.exit(0);
    });
    // Failsafe exit after 10s if connections fail to drain
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));
}

startServer().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error:', err);
  process.exit(1);
});
