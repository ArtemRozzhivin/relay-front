import jsonPlugin from '@eslint/json';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import eslintConfigPrettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

const eslintConfig = [
	{
		ignores: [
			'node_modules/',
			'.next/**',
			'build/',
			'dist/',
			'out/',
			'public/',
			'coverage/',
			'.claude/**',
			'cypress.config.ts',
		],
	},
	...nextCoreWebVitals,
	eslintConfigPrettier,
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs'],
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			'unused-imports': unusedImports,
			'simple-import-sort': simpleImportSort,
			json: jsonPlugin,
			prettier: eslintPluginPrettierRecommended,
		},
		rules: {
			semi: ['error', 'always'],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'no-console':
				process.env.NODE_ENV === 'production'
					? ['warn', { allow: ['warn', 'error'] }]
					: 'off',
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',
			// Import order follows the FSD layer hierarchy (top → bottom).
			'simple-import-sort/imports': [
				'error',
				{
					groups: [
						['^\\u0000'],
						['^react', '^next', '^@?\\w'],
						['^@/app(/.*)?$'],
						['^@/_pages(/.*)?$'],
						['^@/widgets(/.*)?$'],
						['^@/features(/.*)?$'],
						['^@/entities(/.*)?$'],
						['^@/shared(/.*)?$'],
						['^@/'],
						['^\\.'],
						['^.+\\.(module.css|module.scss)$'],
						['^.+\\.(gif|png|svg|jpg)$'],
					],
				},
			],
			'@typescript-eslint/no-unused-vars': 'off',
			'unused-imports/no-unused-imports': ['warn'],
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			// Catch circular dependencies (e.g. the barrel-import trap).
			'import/no-cycle': ['error', { ignoreExternal: true }],
		},
	},
	// Feature-Sliced Design import boundaries (complements Steiger; also covers
	// the `pages` layer). Downward-only imports + public-API-only entry points.
	{
		files: ['src/**/*.{ts,tsx}'],
		ignores: ['**/*.test.*', '**/*.spec.*', 'src/__tests__/**'],
		plugins: { boundaries },
		settings: {
			'import/resolver': {
				typescript: { project: './tsconfig.json' },
			},
			'boundaries/include': [
				'src/app/**',
				'src/_pages/**',
				'src/widgets/**',
				'src/features/**',
				'src/entities/**',
				'src/shared/**',
			],
			'boundaries/elements': [
				{ type: 'app', pattern: 'src/app', mode: 'folder' },
				{ type: 'pages', pattern: 'src/_pages/*', mode: 'folder' },
				{ type: 'widgets', pattern: 'src/widgets/*', mode: 'folder' },
				{ type: 'features', pattern: 'src/features/*', mode: 'folder' },
				{ type: 'entities', pattern: 'src/entities/*', mode: 'folder' },
				{ type: 'shared', pattern: 'src/shared', mode: 'folder' },
			],
		},
		rules: {
			'boundaries/element-types': [
				'error',
				{
					default: 'disallow',
					rules: [
						{
							from: 'app',
							allow: ['pages', 'widgets', 'features', 'entities', 'shared'],
						},
						{
							from: 'pages',
							allow: ['widgets', 'features', 'entities', 'shared'],
						},
						{ from: 'widgets', allow: ['features', 'entities', 'shared'] },
						{ from: 'features', allow: ['entities', 'shared'] },
						{ from: 'entities', allow: ['shared'] },
						{ from: 'shared', allow: ['shared'] },
					],
				},
			],
			'boundaries/entry-point': [
				'error',
				{
					default: 'disallow',
					rules: [
						{ target: ['pages', 'widgets', 'features'], allow: 'index.ts' },
						{ target: ['entities'], allow: ['index.ts', '@x/*.ts'] },
						{ target: ['app', 'shared'], allow: '**' },
					],
				},
			],
		},
	},
	{
		// Config files legitimately use anonymous default exports.
		files: [
			'*.config.{js,mjs,ts}',
			'plopfile.mjs',
			'commitlint.config.mjs',
			'steiger.config.ts',
		],
		rules: {
			'import/no-anonymous-default-export': 'off',
		},
	},
];

export default eslintConfig;
