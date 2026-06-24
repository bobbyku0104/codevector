import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import env from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import routes from './src/routes/index.js';

const app = express();

// Trust proxy for PaaS environments
app.set('trust proxy', 1);

app.use(
  cors({
    origin: env.corsOrigins,
    methods: ['GET'],
  })
);

app.use(express.json({ limit: '100kb' }));
app.use('/api', routes);

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

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
    },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

async function startServer() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down...`);
    server.close(async () => {
      await mongoose.disconnect();
      console.log('MongoDB disconnected. Process terminated.');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
