import type { RequestHandler } from 'msw';

/**
 * MSW request handlers — reused by tests (see `src/__tests__/setup.ts`) and,
 * optionally, a browser mock worker. Add one per endpoint, e.g.:
 *
 *   import { http, HttpResponse } from 'msw';
 *   export const handlers: RequestHandler[] = [
 *     http.get('/api/users/me', () => HttpResponse.json({ id: 1, name: 'Ada' })),
 *   ];
 */
export const handlers: RequestHandler[] = [];
