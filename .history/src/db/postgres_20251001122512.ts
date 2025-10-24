// Frontend-safe stub for database querying.
// Real queries should be performed via the backend API (e.g., fetch('/api/...')).

export interface QueryResult<Row = unknown> {
	rows: Row[];
}

export async function query<Row = unknown>(/* sql: string, params?: unknown[] */): Promise<QueryResult<Row>> {
	// Intentionally not implemented in the browser.
	if (import.meta.env.DEV) {
		console.warn('[postgres.ts] query() called in frontend – returning empty result. Perform queries via backend API.');
	}
	return { rows: [] };
}

export default { query };