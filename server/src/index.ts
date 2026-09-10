import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import router from './routes/index.js';
import { requestLogger } from './middleware/logger.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';
import { logger } from './utils/logger.js';
import { join as pathJoin } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res): void => {
  res.status(200).json({
    success: true,
    data: { status: 'ok' },
    error: null,
  });
});

// Temporary route used by automated tests to verify the error handler.
// Leave this in place until the project is accepted.
app.get('/test-error', (_req, _res): void => {
  throw new Error('Test error');
});

app.use('/api', router);

// In production (e.g. Render), serve the built client from the same origin so /api keeps working.
if (process.env.NODE_ENV === 'production' && process.env.SERVE_CLIENT === 'true') {
  const clientDist = pathJoin(fileURLToPath(new URL('.', import.meta.url)), '../../client/dist');
  app.use(express.static(clientDist));
  app.get('/{*path}', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health' || req.path === '/test-error') {
      return next();
    }
    res.sendFile(pathJoin(clientDist, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

// 404 handler — catches any request that didn't match a route
app.use(notFoundHandler);

// Centralized error handler — must be last
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    logger.info('MongoDB connected');
    app.listen(port, () => logger.info(`Server running on port ${port}`));
  })
  .catch((err) => {
    logger.error('Connection error', { error: err instanceof Error ? err.message : err });
  });
