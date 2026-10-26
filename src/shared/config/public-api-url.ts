import { env } from './env';

export function getPublicApiBaseUrl(): string {
	const raw = env.NEXT_PUBLIC_API_URL;
	if (!raw) {
		return '';
	}
	return raw.trim().replace(/\/+$/, '');
}
