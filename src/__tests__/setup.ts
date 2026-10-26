import '@testing-library/jest-dom';

import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest';

import { server } from '@/shared/api/msw/server';

expect.extend(matchers);

// jsdom does not implement ResizeObserver; polyfill it for component tests.
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));

// MSW: intercept network calls in tests. Unhandled requests fail loudly so you
// always mock explicitly (add handlers in src/shared/api/msw/handlers.ts).
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
	cleanup();
	server.resetHandlers();
});
afterAll(() => server.close());
