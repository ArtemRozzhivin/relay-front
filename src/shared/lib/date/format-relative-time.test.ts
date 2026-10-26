import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatRelativeTime } from './format-relative-time';

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/** ISO string for `ms` milliseconds before the (faked) current time. */
const ago = (ms: number): string => new Date(Date.now() - ms).toISOString();
/** ISO string for `ms` milliseconds after the (faked) current time. */
const ahead = (ms: number): string => new Date(Date.now() + ms).toISOString();

describe('formatRelativeTime', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-06-29T12:00:00.000Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('WHEN the moment is within 45 seconds', () => {
		it('SHOULD return "just now"', () => {
			expect(formatRelativeTime(ago(0))).toBe('just now');
			expect(formatRelativeTime(ago(30 * SEC))).toBe('just now');
		});
	});

	describe('WHEN the moment is seconds / minutes ago', () => {
		it('SHOULD format seconds and minutes', () => {
			expect(formatRelativeTime(ago(50 * SEC))).toBe('50 seconds ago');
			expect(formatRelativeTime(ago(MIN))).toBe('1 minute ago');
			expect(formatRelativeTime(ago(5 * MIN))).toBe('5 minutes ago');
		});
	});

	describe('WHEN the moment is hours ago', () => {
		it('SHOULD format hours', () => {
			expect(formatRelativeTime(ago(HOUR))).toBe('1 hour ago');
			expect(formatRelativeTime(ago(3 * HOUR))).toBe('3 hours ago');
		});
	});

	describe('WHEN the moment is days / weeks / months / years ago', () => {
		it('SHOULD use natural language for the -1 boundaries', () => {
			expect(formatRelativeTime(ago(DAY))).toBe('yesterday');
			expect(formatRelativeTime(ago(WEEK))).toBe('last week');
			expect(formatRelativeTime(ago(35 * DAY))).toBe('last month');
			expect(formatRelativeTime(ago(400 * DAY))).toBe('last year');
		});

		it('SHOULD format larger spans with a count', () => {
			expect(formatRelativeTime(ago(3 * DAY))).toBe('3 days ago');
			expect(formatRelativeTime(ago(2 * WEEK))).toBe('2 weeks ago');
			expect(formatRelativeTime(ago(1100 * DAY))).toBe('3 years ago');
		});
	});

	describe('WHEN the moment is in the future', () => {
		it('SHOULD format a forward-looking label', () => {
			expect(formatRelativeTime(ahead(5 * MIN))).toBe('in 5 minutes');
		});
	});

	describe('WHEN the input is not a valid date', () => {
		it('SHOULD return an empty string instead of throwing', () => {
			expect(formatRelativeTime('not-a-date')).toBe('');
		});
	});
});
