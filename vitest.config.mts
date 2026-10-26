import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [tsconfigPaths(), react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/__tests__/setup.ts',
		exclude: [...configDefaults.exclude, '.claude/worktrees/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['src/**/*.{ts,tsx}'],
			exclude: [
				'src/**/*.{test,spec}.*',
				'src/**/index.ts',
				'src/**/*.d.ts',
				'src/__tests__/**',
				'src/shared/ui/**',
			],
			// Raise these as your test suite grows (e.g. 70 / 70 / 70 / 70).
			thresholds: { statements: 0, branches: 0, functions: 0, lines: 0 },
		},
	},
});
