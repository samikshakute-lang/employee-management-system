import express, { type Express } from 'express';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';

/**
 * Builds the Express application without binding a port, so tests can drive it
 * directly with supertest and the entrypoint stays a thin listen() wrapper.
 */
export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', usersRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
