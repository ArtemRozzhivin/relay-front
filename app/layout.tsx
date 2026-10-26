import '@/app/styles/globals.css';

import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { AppProvider } from '@/app/providers';

const geistSans = Geist({
	subsets: ['latin'],
	variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
	subsets: ['latin'],
	variable: '--font-geist-mono',
});

export const metadata: Metadata = {
	title: 'Next.js FSD Template',
	description: 'A Next.js starter structured with Feature-Sliced Design.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>): ReactNode {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${geistSans.variable} ${geistMono.variable}`}
		>
			<body>
				<AppProvider>{children}</AppProvider>
			</body>
		</html>
	);
}
