/**
 * Request Optimization Utilities
 * - Request deduplication
 * - Request batching
 * - Response caching
 */

// Request deduplication - prevent duplicate concurrent requests
const pendingRequests = new Map();

/**
 * Deduplicate requests - if the same request is made multiple times concurrently,
 * only execute it once and return the same promise for all callers
 */
export const deduplicateRequest = (key, requestFn) => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = requestFn()
    .then(result => {
      // Keep in cache for 100ms to catch rapid duplicate requests
      setTimeout(() => {
        pendingRequests.delete(key);
      }, 100);
      return result;
    })
    .catch(error => {
      // Remove immediately on error
      pendingRequests.delete(key);
      throw error;
    });

  pendingRequests.set(key, promise);
  return promise;
};

// Request batching - batch multiple requests into one
const batchQueue = [];
let batchTimer = null;
const BATCH_DELAY = 50; // 50ms batching window

export const batchRequest = (requestFn) => {
  return new Promise((resolve, reject) => {
    batchQueue.push({ requestFn, resolve, reject });

    if (!batchTimer) {
      batchTimer = setTimeout(() => {
        const queue = [...batchQueue];
        batchQueue.length = 0;
        batchTimer = null;

        // Execute all requests in parallel
        Promise.all(queue.map(item => item.requestFn()))
          .then(results => {
            queue.forEach((item, index) => item.resolve(results[index]));
          })
          .catch(error => {
            queue.forEach(item => item.reject(error));
          });
      }, BATCH_DELAY);
    }
  });
};

// Response cache with TTL
const responseCache = new Map();
const CACHE_TTL = 60000; // 1 minute default

export const getCachedResponse = (key) => {
  const cached = responseCache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    responseCache.delete(key);
    return null;
  }

  return cached.data;
};

export const setCachedResponse = (key, data, ttl = CACHE_TTL) => {
  responseCache.set(key, {
    data,
    expiresAt: Date.now() + ttl
  });
};

export const clearCache = (pattern = null) => {
  if (!pattern) {
    responseCache.clear();
    return;
  }

  for (const key of responseCache.keys()) {
    if (key.includes(pattern)) {
      responseCache.delete(key);
    }
  }
};

