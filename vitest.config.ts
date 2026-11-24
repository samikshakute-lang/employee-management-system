import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // The suite may start without test files while modules are scaffolded;
    // this keeps `npm test` green in that state without hiding real failures.
    passWithNoTests: true,
    env: {
      DATABASE_URL: ':memory:',
      JWT_SECRET: 'test-only-jwt-secret-value-32-chars-min',
      BCRYPT_ROUNDS: '4',
    },
  },
});
