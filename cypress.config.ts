import { defineConfig } from 'cypress';

export default defineConfig({
	projectId: 'eh4zb7',
	e2e: {
		baseUrl: 'http://localhost:3000',
		setupNodeEvents(on, config) {},
	},
});
