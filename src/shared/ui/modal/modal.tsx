'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { cn } from '@/shared/lib';

import { Button } from '../button';
import { MODAL_SIZE_CLASSES } from './constants';
import type { ModalSize } from './types';

export interface ModalProps {
	open: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	className?: string;
	size?: ModalSize;
	align?: 'center' | 'left';
	hideHeader?: boolean;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
	(
		{
			open,
			onClose,
			title,
			description,
			children,
			footer,
			className,
			size,
			align = 'center',
			hideHeader = false,
		},
		ref,
	) => {
		const sizeClassName = size
			? MODAL_SIZE_CLASSES[size]
			: MODAL_SIZE_CLASSES.md;

		return (
			<DialogPrimitive.Root
				open={open}
				onOpenChange={(isOpen) => {
					if (!isOpen) onClose();
				}}
			>
				<DialogPrimitive.Portal>
					<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
					<DialogPrimitive.Content
						ref={ref}
						className={cn(
							'fixed top-[50%] left-[50%] z-50 grid w-full max-h-[min(90vh,900px)] translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto border border-border-subtle bg-background p-0 text-foreground shadow-lg outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl',
							sizeClassName,
							className,
						)}
					>
						{hideHeader ? (
							<>
								<DialogPrimitive.Title asChild>
									<span className="sr-only">{title}</span>
								</DialogPrimitive.Title>
								{description ? (
									<DialogPrimitive.Description asChild>
										<span className="sr-only">{description}</span>
									</DialogPrimitive.Description>
								) : null}
								<DialogPrimitive.Close asChild>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="absolute top-3 right-3 z-10 shrink-0"
										aria-label="Close"
									>
										<X size={20} />
									</Button>
								</DialogPrimitive.Close>
								<div className="p-6">{children}</div>
							</>
						) : (
							<>
								<div className="flex items-start justify-between gap-3 p-4">
									<div className="min-w-0 flex-1">
										<DialogPrimitive.Title asChild>
											<h2
												className={cn(
													'pb-2 text-2xl font-semibold text-foreground',
													align === 'center' ? 'text-center' : 'text-left',
												)}
											>
												{title}
											</h2>
										</DialogPrimitive.Title>
										{description ? (
											<DialogPrimitive.Description asChild>
												<p
													className={cn(
														'max-w-lg text-base font-medium text-muted-foreground',
														align === 'center'
															? 'mx-auto text-center'
															: 'text-left',
													)}
												>
													{description}
												</p>
											</DialogPrimitive.Description>
										) : null}
									</div>
									<DialogPrimitive.Close asChild>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="shrink-0"
											aria-label="Close"
										>
											<X size={20} />
										</Button>
									</DialogPrimitive.Close>
								</div>

								<div className="px-6 pt-0 pb-6">{children}</div>

								{footer ? (
									<div className="flex w-full min-w-0 items-center justify-end gap-3 p-4">
										{footer}
									</div>
								) : null}
							</>
						)}
					</DialogPrimitive.Content>
				</DialogPrimitive.Portal>
			</DialogPrimitive.Root>
		);
	},
);
Modal.displayName = 'Modal';

export { Modal };
