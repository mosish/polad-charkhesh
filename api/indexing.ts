// Public launch requires a deliberate owner decision; NODE_ENV never opens it.
export const indexingEnabled = process.env.ENABLE_SEARCH_INDEXING === 'true';
