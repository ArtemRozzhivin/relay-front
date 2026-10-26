export * from './utils';
export * from './validation';
export * from './rtk';
export * from './date';
export * from './format-number';
export * from './get-initials';
// React hooks are client-only — import them from '@/shared/lib/hooks' directly
// so this barrel stays server-safe (usable from Server Components).
