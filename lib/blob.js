// Vercel Blob's server-side put() call authenticates via BLOB_READ_WRITE_TOKEN, which Vercel
// injects automatically once a Blob store is connected to the project (Storage tab → Create
// Database → Blob). This flag lets routes and the admin UI detect — and clearly explain — the
// case where that connection hasn't been made yet, the same way lib/kv.js does for Redis.
export const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
