import { z } from 'zod';

export const phoneSchema = z
	.string()
	.refine((val) => val.replace(/\D/g, '').length === 10, {
		message: 'Please enter a valid phone number',
	});
export const optionalPhoneSchema = z
	.string()
	.optional()
	.refine((val) => !val || val.replace(/\D/g, '').length === 10, {
		message: 'Please enter a valid phone number',
	});

function nationalDigits(value: string): string {
	let digits = value.replace(/\D/g, '');
	if (digits.length === 11 && digits.startsWith('1')) {
		digits = digits.slice(1);
	}
	return digits.slice(0, 10);
}

/** Mask raw input as the user types, e.g. "5125550123" -> "(512) 555-0123". */
export function maskPhone(value: string): string {
	const digits = value.replace(/\D/g, '').slice(0, 10);
	if (!digits) return '';
	if (digits.length < 4) return `(${digits}`;
	if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
	return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Format any stored value (incl. E.164 "+15125550123") for display in the mask. */
export function formatPhoneNational(value: string): string {
	return maskPhone(nationalDigits(value));
}
