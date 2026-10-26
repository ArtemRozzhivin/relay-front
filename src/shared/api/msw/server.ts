import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/**
 * MSW server for Node / Vitest. It is started, reset, and closed in
 * `src/__tests__/setup.ts`, so every test runs against your mocked API.
 */
export const server = setupServer(...handlers);
