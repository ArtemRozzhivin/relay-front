const relativeTimeFormatter = new Intl.RelativeTimeFormat('en-US', {
	numeric: 'auto',
});

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
	{ amount: 60, unit: 'second' },
	{ amount: 60, unit: 'minute' },
	{ amount: 24, unit: 'hour' },
	{ amount: 7, unit: 'day' },
	{ amount: 4.34524, unit: 'week' },
	{ amount: 12, unit: 'month' },
	{ amount: Number.POSITIVE_INFINITY, unit: 'year' },
];

/** Human "time ago" label, e.g. "just now", "5 minutes ago", "2 days ago". */
export function formatRelativeTime(iso: string): string {
	const timestamp = new Date(iso).getTime();
	if (Number.isNaN(timestamp)) {
		return '';
	}

	let duration = (timestamp - Date.now()) / 1000;

	if (Math.abs(duration) < 45) {
		return 'just now';
	}

	for (const division of DIVISIONS) {
		if (Math.abs(duration) < division.amount) {
			return relativeTimeFormatter.format(Math.round(duration), division.unit);
		}
		duration /= division.amount;
	}

	return relativeTimeFormatter.format(Math.round(duration), 'year');
}
