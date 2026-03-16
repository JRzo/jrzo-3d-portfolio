import { useState, useEffect } from 'react';

// Shown immediately while fetch is in-flight
const PLACEHOLDER_REPOS = [
  {
    id: 1,
    name: 'fetching-repos',
    description: 'Reaching out to GitHub API…',
    language: 'Python',
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    html_url: 'https://github.com/JRzo',
    topics: [],
    updated_at: null,
  },
  {
    id: 2,
    name: 'loading-data',
    description: 'Pulling your latest repositories…',
    language: 'JavaScript',
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    html_url: 'https://github.com/JRzo',
    topics: [],
    updated_at: null,
  },
  {
    id: 3,
    name: 'please-wait',
    description: 'Almost there — rendering scene…',
    language: 'TypeScript',
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    html_url: 'https://github.com/JRzo',
    topics: [],
    updated_at: null,
  },
];

/**
 * Fetches the three most-recently-updated public repos for `username`.
 * Falls back to placeholder data if the API is unreachable.
 */
export function useGitHub(username, perPage = 6) {
  const [repos, setRepos] = useState(PLACEHOLDER_REPOS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username || typeof username !== 'string') return;
    const controller = new AbortController();

    fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=${perPage}`,
      { signal: controller.signal }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRepos(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.warn('[useGitHub] fetch failed — using placeholder data.', err.message);
        setError(err);
        setLoading(false);
      });

    return () => controller.abort();
  }, [username]);

  return { repos, loading, error };
}
