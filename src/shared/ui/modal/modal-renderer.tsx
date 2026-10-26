'use client';

import * as React from 'react';

import { Modal } from './modal';
import { useModal } from './modal-context';

export function ModalRenderer(): React.JSX.Element {
	const { modals, closeModal } = useModal();

	return (
		<>
			{modals.map((modal) => (
				<Modal
					key={modal.id}
					open
					onClose={() => closeModal(modal.id)}
					title={modal.title}
					description={modal.description}
					className={modal.className}
					size={modal.size}
					align={modal.align}
					hideHeader={modal.hideHeader}
					footer={modal.footer}
				>
					{modal.children}
				</Modal>
			))}
		</>
	);
}
