import { createApp } from './app';
import { env } from './config/env';

/**
 * Boots the API. Importing `env` above is intentional: a missing or invalid
 * JWT_SECRET/DATABASE_URL throws before anything can listen on a port.
 */
export function start(): void {
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`EMS API listening on port ${env.PORT}`);
  });
}

start();
