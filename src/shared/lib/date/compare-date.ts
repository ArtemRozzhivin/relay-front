export function compareISOStringDate(date1: string, date2: string): number {
	return date1 < date2 ? -1 : date1 > date2 ? 1 : 0;
}
