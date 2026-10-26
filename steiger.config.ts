import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
	...fsd.configs.recommended,
	{
		rules: {
			// The template ships intentionally empty layers (widgets/features/
			// entities) with only README guides, so silence "underused slice" noise.
			'fsd/insignificant-slice': 'off',
			'fsd/excessive-slicing': 'warn',
			// This heuristic flags idiomatic infrastructure segment names that the
			// FSD docs themselves use (shared/assets, shared/types, app/store,
			// app/providers). The slice generator (`npm run g`) enforces canonical
			// ui/api/model names by construction, and docs/STRUCTURE.md covers
			// the "group by purpose, not essence" rule for real slices.
			'fsd/segments-by-purpose': 'off',
			// The pages layer is `_pages` (underscore-prefixed) because Next.js
			// reserves `src/pages` for its legacy Pages Router. This is FSD's own
			// recommended Next.js workaround; Steiger doesn't recognize it natively,
			// so ESLint boundaries covers the pages layer instead.
			'fsd/typo-in-layer-name': 'off',
		},
	},
	{
		ignores: ['**/*.test.*', '**/*.stories.*'],
	},
]);
