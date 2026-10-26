'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
		};
	}

	static getDerivedStateFromError(error: Error): State {
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
	}

	render(): ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}
			return (
				<div className="flex min-h-screen items-center justify-center bg-gray-50">
					<div className="max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
							<svg
								className="h-8 w-8 text-red-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
						<h1 className="mb-2 text-2xl font-bold text-gray-900">
							Something went wrong
						</h1>
						<p className="mb-6 text-gray-600">
							An error occurred. Please try refreshing the page.
						</p>
						{process.env.NODE_ENV === 'development' && this.state.error && (
							<details className="mb-4 rounded bg-gray-100 p-4 text-left">
								<summary className="cursor-pointer font-semibold text-gray-700">
									Error details
								</summary>
								<pre className="mt-2 overflow-auto text-xs text-red-600">
									{this.state.error.toString()}
								</pre>
							</details>
						)}
						<button
							onClick={() => window.location.reload()}
							className="rounded-lg bg-primary-500 px-6 py-3 text-white transition-colors hover:bg-primary-600"
						>
							Reload page
						</button>
					</div>
				</div>
			);
		}
		return this.props.children;
	}
}
