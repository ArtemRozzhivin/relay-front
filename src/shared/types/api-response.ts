export type ApiSuccessResponse<TData> = {
	success: true;
	message: string;
	data: TData;
	meta: Record<string, unknown>;
};

export type ApiError = {
	code: string;
	category: string;
	message: string;
	requestId: string;
	details?: Record<string, unknown>;
};

export type ApiErrorResponse = {
	success: false;
	error: ApiError;
	statusCode: number;
};
