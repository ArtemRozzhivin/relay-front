import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

// Validate environment variables at build time.
import { env } from './src/shared/config/env';

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
	turbopack: {
		rules: {
			'*.svg': {
				loaders: ['@svgr/webpack'],
				as: '*.js',
			},
		},
	},
	images: {
		remotePatterns: env.NEXT_PUBLIC_MEDIA_HOST
			? [
					{
						protocol: 'https',
						hostname: env.NEXT_PUBLIC_MEDIA_HOST,
					},
				]
			: [],
	},
	webpack(config) {
		const fileLoaderRule = config.module.rules.find(
			(rule: { test?: RegExp }) =>
				rule.test instanceof RegExp && rule.test.test('.svg'),
		);
		const fileLoaderRuleAsObject = fileLoaderRule as {
			issuer?: { and?: RegExp[] };
			resourceQuery?: { not?: RegExp[] };
			exclude?: RegExp;
		};
		const resourceQueryNot = fileLoaderRuleAsObject.resourceQuery?.not ?? [];

		config.module.rules.push(
			{
				...fileLoaderRuleAsObject,
				test: /\.svg$/i,
				resourceQuery: /url/,
			},
			{
				test: /\.svg$/i,
				issuer: fileLoaderRuleAsObject.issuer,
				resourceQuery: { not: [...resourceQueryNot, /url/] },
				use: ['@svgr/webpack'],
			},
		);

		fileLoaderRuleAsObject.exclude = /\.svg$/i;

		return config;
	},
};

export default withBundleAnalyzer(nextConfig);
