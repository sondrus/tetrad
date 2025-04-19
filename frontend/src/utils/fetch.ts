import { useDbStore } from '@/stores/dbStore';

interface FetcherRequestInitJsonBody {
	json?: object;
}

interface FetcherResponsePromise {
	ok: boolean,
	json: object,
	type: ResponseType | null,
	status: number | null,
	headers: Headers | null,
	message: string | null
}

async function fetcher(
	url: string,
	params: RequestInit & FetcherRequestInitJsonBody
): Promise<FetcherResponsePromise> {
	// Convert json to body if json exists
	if ('json' in params) {
		params.body = JSON.stringify(params.json);
		delete params.json;
	}

	// Set content-type
	params.headers = {
		...params.headers,
		'Content-Type': 'application/json',
	};

	try {
		const response = await fetch(url, params as RequestInit);

		const data = await response.json().catch(() => null);

		if (!response.ok) {
			return {
				ok: false,
				json: data,
				type: response.type,
				status: response.status,
				headers: response.headers,
				message: `HTTP Error: ${response.status} ${response.statusText}`,
			};
		}

		// Collect database info from last request
		useDbStore().parseHeaders(response.headers)

		return {
			ok: true,
			json: data,
			type: response.type,
			status: response.status,
			headers: response.headers,
			message: null,
		};
	} catch (error: unknown) {
		let message = 'Unknown error';

		if (error instanceof Error) {
			message = error.message;
		} else if (typeof error === 'string') {
			message = error;
		}

		return {
			ok: false,
			json: {},
			type: null,
			status: null,
			headers: null,
			message: message,
		};
	}
}

export type { FetcherRequestInitJsonBody, FetcherResponsePromise }

export { fetcher }
