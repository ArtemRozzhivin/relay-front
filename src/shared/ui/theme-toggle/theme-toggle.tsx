'use client';

import { type JSX, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

import { Button } from '../button';

/**
 * Light/dark theme switch. Reads/writes the theme via next-themes and stays
 * hydration-safe by rendering a stable icon until mounted.
 */
export function ThemeToggle(): JSX.Element {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// eslint-disable-next-line react-hooks/set-state-in-effect
	useEffect(() => setMounted(true), []);

	const isDark = mounted && resolvedTheme === 'dark';

	return (
		<Button
			type="button"
			variant="outline"
			color="secondary"
			size="icon"
			aria-label="Toggle theme"
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
		>
			{isDark ? <Moon /> : <Sun />}
		</Button>
	);
}
