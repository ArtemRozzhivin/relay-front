import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

/* ── helpers ─────────────────────────────────────────────────────────────── */

const toCamel = (s) =>
	String(s)
		.replace(/[-_/](\w)/g, (_, c) => c.toUpperCase())
		.replace(/^\w/, (c) => c.toLowerCase());
const toPascal = (s) => {
	const c = toCamel(s);
	return c.charAt(0).toUpperCase() + c.slice(1);
};
const isKebab = (s) => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(String(s));
const kebabValidate = (v) => isKebab(v) || 'Use kebab-case, e.g. my-slice';
const entityExists = (v) => {
	if (!isKebab(v)) return 'Use kebab-case';
	if (!existsSync(`src/entities/${v}`)) {
		return `No entity "${v}" in src/entities — create it first (npm run g → entity)`;
	}
	return true;
};

/* Inject an RTK Query endpoint + its hook export into an entity's api file. */
function injectEndpoint(content, { entity, name, kind }) {
	const camelName = toCamel(name);
	const pascalName = toPascal(name);
	const apiVar = `${toCamel(entity)}Api`;
	const method = kind === 'query' ? 'GET' : 'POST';
	const hook =
		kind === 'query' ? `use${pascalName}Query` : `use${pascalName}Mutation`;

	if (!/from '@\/shared\/config'/.test(content)) {
		content = content.replace(
			"import { api } from '@/shared/api';",
			"import { api } from '@/shared/api';\nimport { HTTP_METHODS } from '@/shared/config';",
		);
	}
	content = content.replace('endpoints: () => ({', 'endpoints: (build) => ({');
	content = content.replace(
		'// plop:endpoint',
		`${camelName}: build.${kind}<unknown, void>({\n` +
			`\t\t\tquery: () => ({ url: '', method: HTTP_METHODS.${method} }),\n` +
			`\t\t}),\n\t\t// plop:endpoint`,
	);
	content = content.replace(
		'// plop:hook',
		`export const { ${hook} } = ${apiVar};\n// plop:hook`,
	);
	return content;
}

/* Register a feature reducer in the root reducer. */
function registerReducer(content, { name }) {
	const camel = toCamel(name);
	const importLine = `import { ${camel}Reducer } from '@/features/${name}';`;
	if (!content.includes(importLine)) {
		content = content.replace(
			"import { combineReducers } from '@reduxjs/toolkit';",
			`import { combineReducers } from '@reduxjs/toolkit';\n\n${importLine}`,
		);
	}
	content = content.replace(
		'// plop:reducer',
		`${camel}: ${camel}Reducer,\n\t// plop:reducer`,
	);
	return content;
}

/* ── plopfile ────────────────────────────────────────────────────────────── */

export default function (plop) {
	plop.setHelper('basename', (p) => String(p).split('/').pop());

	// Run eslint --fix + prettier on generated/modified paths so output is clean.
	plop.setActionType('fix', (answers, config, plopApi) => {
		const targets = config.paths
			.map((p) => `"${plopApi.renderString(p, answers)}"`)
			.join(' ');
		try {
			execSync(`npx eslint --fix ${targets}`, { stdio: 'ignore' });
		} catch {
			/* non-fatal — the next lint run surfaces any remaining issues */
		}
		try {
			execSync(`npx prettier --write ${targets}`, { stdio: 'ignore' });
		} catch {
			/* ignore */
		}
		return `fixed ${targets}`;
	});

	/* entity ──────────────────────────────────────────────────────────────── */
	plop.setGenerator('entity', {
		description: 'entity slice (ui + api + model)',
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: 'Entity name (kebab-case):',
				validate: kebabValidate,
			},
		],
		actions: () => {
			const base = 'src/entities/{{kebabCase name}}';
			return [
				{
					type: 'add',
					path: `${base}/index.ts`,
					templateFile: 'plop/templates/entity/index.ts.hbs',
				},
				{
					type: 'add',
					path: `${base}/api/index.ts`,
					templateFile: 'plop/templates/entity/api/index.ts.hbs',
				},
				{
					type: 'add',
					path: `${base}/api/{{kebabCase name}}.ts`,
					templateFile: 'plop/templates/entity/api/entity.ts.hbs',
				},
				{
					type: 'add',
					path: `${base}/model/index.ts`,
					templateFile: 'plop/templates/entity/model/index.ts.hbs',
				},
				{
					type: 'add',
					path: `${base}/model/{{kebabCase name}}.ts`,
					templateFile: 'plop/templates/entity/model/entity.ts.hbs',
				},
				{
					type: 'add',
					path: `${base}/ui/index.ts`,
					templateFile: 'plop/templates/entity/ui/index.ts.hbs',
				},
			];
		},
	});

	/* feature ─────────────────────────────────────────────────────────────── */
	plop.setGenerator('feature', {
		description: 'feature slice (ui + model)',
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: 'Feature name (kebab-case):',
				validate: kebabValidate,
			},
			{
				type: 'confirm',
				name: 'isForm',
				message: 'Form feature (react-hook-form + zod)?',
				default: false,
			},
		],
		actions: (data) => {
			const base = 'src/features/{{kebabCase name}}';
			const actions = [
				{
					type: 'add',
					path: `${base}/index.ts`,
					templateFile: 'plop/templates/feature/index.ts.hbs',
				},
			];
			if (data.isForm) {
				actions.push(
					{
						type: 'add',
						path: `${base}/ui/index.ts`,
						templateFile: 'plop/templates/feature/ui/form-index.ts.hbs',
					},
					{
						type: 'add',
						path: `${base}/ui/{{kebabCase name}}-form.tsx`,
						templateFile: 'plop/templates/feature/ui/form.tsx.hbs',
					},
					{
						type: 'add',
						path: `${base}/model/index.ts`,
						templateFile: 'plop/templates/feature/model/form-index.ts.hbs',
					},
					{
						type: 'add',
						path: `${base}/model/{{kebabCase name}}.schema.ts`,
						templateFile: 'plop/templates/feature/model/schema.ts.hbs',
					},
					{
						type: 'add',
						path: `${base}/model/use-{{kebabCase name}}-form.ts`,
						templateFile: 'plop/templates/feature/model/use-form.ts.hbs',
					},
				);
			} else {
				actions.push(
					{
						type: 'add',
						path: `${base}/ui/index.ts`,
						templateFile: 'plop/templates/feature/ui/index.ts.hbs',
					},
					{
						type: 'add',
						path: `${base}/ui/{{kebabCase name}}.tsx`,
						templateFile: 'plop/templates/feature/ui/component.tsx.hbs',
					},
					{
						type: 'add',
						path: `${base}/model/index.ts`,
						templateFile: 'plop/templates/feature/model/index.ts.hbs',
					},
				);
			}
			return actions;
		},
	});

	/* widget ──────────────────────────────────────────────────────────────── */
	plop.setGenerator('widget', {
		description: 'widget slice (ui)',
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: 'Widget name (kebab-case):',
				validate: kebabValidate,
			},
		],
		actions: () => {
			const base = 'src/widgets/{{kebabCase name}}';
			return [
				{
					type: 'add',
					path: `${base}/index.ts`,
					templateFile: 'plop/templates/widget/index.ts.hbs',
				},
				{
					type: 'add',
					path: `${base}/ui/index.ts`,
					templateFile: 'plop/templates/widget/ui/index.ts.hbs',
				},
				{
					type: 'add',
					path: `${base}/ui/{{kebabCase name}}.tsx`,
					templateFile: 'plop/templates/widget/ui/component.tsx.hbs',
				},
			];
		},
	});

	/* page ────────────────────────────────────────────────────────────────── */
	plop.setGenerator('page', {
		description: 'page slice (ui)',
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: 'Page name (kebab-case):',
				validate: kebabValidate,
			},
		],
		actions: () => {
			const base = 'src/_pages/{{kebabCase name}}';
			return [
				{
					type: 'add',
					path: `${base}/index.ts`,
					templateFile: 'plop/templates/page/index.ts.hbs',
				},
				{
					type: 'add',
					path: `${base}/ui/{{kebabCase name}}.tsx`,
					templateFile: 'plop/templates/page/ui/page.tsx.hbs',
				},
				{
					type: 'add',
					path: 'app/{{kebabCase name}}/page.tsx',
					templateFile: 'plop/templates/page/app-route.tsx.hbs',
				},
				{ type: 'fix', paths: [base, 'app/{{kebabCase name}}'] },
			];
		},
	});

	/* shared-ui ───────────────────────────────────────────────────────────── */
	plop.setGenerator('shared-ui', {
		description: 'shared UI-kit component',
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: 'Component name (kebab-case):',
				validate: kebabValidate,
			},
		],
		actions: () => [
			{
				type: 'add',
				path: 'src/shared/ui/{{kebabCase name}}/index.ts',
				templateFile: 'plop/templates/shared-ui/index.ts.hbs',
			},
			{
				type: 'add',
				path: 'src/shared/ui/{{kebabCase name}}/{{kebabCase name}}.tsx',
				templateFile: 'plop/templates/shared-ui/component.tsx.hbs',
			},
			{
				type: 'append',
				path: 'src/shared/ui/index.ts',
				pattern: /\/\/ plop:component/,
				unique: true,
				template: "export * from './{{kebabCase name}}';",
			},
		],
	});

	/* hook ────────────────────────────────────────────────────────────────── */
	plop.setGenerator('hook', {
		description: 'shared client hook (shared/lib/hooks)',
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: 'Hook name without "use" (kebab-case, e.g. media-query):',
				validate: kebabValidate,
			},
		],
		actions: () => [
			{
				type: 'add',
				path: 'src/shared/lib/hooks/use-{{kebabCase name}}.ts',
				templateFile: 'plop/templates/hook/use-hook.ts.hbs',
			},
			{
				type: 'append',
				path: 'src/shared/lib/hooks/index.ts',
				pattern: /\/\/ plop:hook/,
				unique: true,
				template: "export * from './use-{{kebabCase name}}';",
			},
		],
	});

	/* @x cross-import ─────────────────────────────────────────────────────── */
	plop.setGenerator('x', {
		description: 'entity @x cross-import API',
		prompts: [
			{
				type: 'input',
				name: 'producer',
				message: 'Producer entity (kebab-case, must exist):',
				validate: entityExists,
			},
			{
				type: 'input',
				name: 'consumer',
				message: 'Consumer entity name (kebab-case):',
				validate: kebabValidate,
			},
		],
		actions: () => [
			{
				type: 'add',
				path: 'src/entities/{{kebabCase producer}}/@x/{{kebabCase consumer}}.ts',
				templateFile: 'plop/templates/x/x.ts.hbs',
			},
		],
	});

	/* endpoint ────────────────────────────────────────────────────────────── */
	plop.setGenerator('endpoint', {
		description: 'add an RTK Query endpoint + consumer hook to an entity',
		prompts: [
			{
				type: 'input',
				name: 'entity',
				message: 'Entity (kebab-case, must exist):',
				validate: entityExists,
			},
			{
				type: 'input',
				name: 'name',
				message: 'Endpoint name (kebab-case, e.g. get-user):',
				validate: kebabValidate,
			},
			{
				type: 'list',
				name: 'kind',
				message: 'Kind:',
				choices: ['query', 'mutation'],
				default: 'query',
			},
		],
		actions: (data) => {
			const base = 'src/entities/{{kebabCase entity}}';
			const hookTemplate =
				data.kind === 'query'
					? 'plop/templates/endpoint/use-query.ts.hbs'
					: 'plop/templates/endpoint/use-mutation.ts.hbs';
			return [
				{
					type: 'modify',
					path: `${base}/api/{{kebabCase entity}}.ts`,
					transform: (content) => injectEndpoint(content, data),
				},
				{
					type: 'add',
					path: `${base}/model/use-{{kebabCase name}}.ts`,
					templateFile: hookTemplate,
				},
				{
					type: 'modify',
					path: `${base}/model/index.ts`,
					pattern: /\/\/ plop:model/,
					template: "export * from './use-{{kebabCase name}}';\n// plop:model",
				},
				{ type: 'fix', paths: [base] },
			];
		},
	});

	/* redux-slice ─────────────────────────────────────────────────────────── */
	plop.setGenerator('redux-slice', {
		description: 'Redux slice in a feature + auto-register the reducer',
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: 'Feature/slice name (kebab-case):',
				validate: kebabValidate,
			},
		],
		actions: () => {
			const base = 'src/features/{{kebabCase name}}';
			return [
				{
					type: 'add',
					path: `${base}/index.ts`,
					templateFile: 'plop/templates/redux-slice/index.ts.hbs',
				},
				{
					type: 'add',
					path: `${base}/model/index.ts`,
					templateFile: 'plop/templates/redux-slice/model-index.ts.hbs',
				},
				{
					type: 'add',
					path: `${base}/model/{{kebabCase name}}.slice.ts`,
					templateFile: 'plop/templates/redux-slice/slice.ts.hbs',
				},
				{
					type: 'modify',
					path: 'src/app/store/root-reducer.ts',
					transform: (content, data) => registerReducer(content, data),
				},
				{ type: 'fix', paths: [base, 'src/app/store/root-reducer.ts'] },
			];
		},
	});

	/* test ────────────────────────────────────────────────────────────────── */
	plop.setGenerator('test', {
		description: 'colocated component test (renderWithProviders)',
		prompts: [
			{
				type: 'input',
				name: 'path',
				message:
					'Component path under src (no ext, e.g. shared/ui/button/button):',
			},
			{
				type: 'input',
				name: 'export',
				message: 'Exported component name (e.g. Button):',
			},
		],
		actions: () => [
			{
				type: 'add',
				path: 'src/{{path}}.test.tsx',
				templateFile: 'plop/templates/test/test.tsx.hbs',
			},
		],
	});
}
