const DEFAULT_TTL_MS = 10 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 5000;

function getSessionCache(key) {
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    const { ts, data } = JSON.parse(cached);
    if (!Array.isArray(data)) return null;
    if (Date.now() - ts > DEFAULT_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function setSessionCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // ignore storage errors
  }
}

export async function fetchGitHubRepos(username, perPage, { signal } = {}) {
  const cacheKey = `gh:${username}:${perPage}`;
  const cached = getSessionCache(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=${perPage}`,
      { signal: controller.signal }
    );
    if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      setSessionCache(cacheKey, data);
    }
    return Array.isArray(data) ? data : [];
  } finally {
    clearTimeout(timeout);
  }
}
